import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
// Node.js 24 includes SQLite, avoiding native bindings and node-gyp on Windows.
export const db = new DatabaseSync(join(dir, "finpilot.db"));
db.exec("PRAGMA foreign_keys = ON");

export function transaction(work) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, business_id INTEGER, owner_name TEXT NOT NULL, mobile TEXT NOT NULL UNIQUE, email TEXT UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS businesses (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, industry TEXT DEFAULT 'Furniture & Interiors', currency TEXT DEFAULT 'INR', bank_balance REAL NOT NULL DEFAULT 0, owner TEXT, gstin TEXT, since TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, business_id INTEGER NOT NULL, customer TEXT NOT NULL, amount REAL NOT NULL, issue_date TEXT, due_date TEXT, status TEXT NOT NULL, paid_date TEXT, days_overdue INTEGER DEFAULT 0, risk TEXT DEFAULT 'LOW', payment_delay_days INTEGER, payment_history TEXT DEFAULT '[]', FOREIGN KEY(business_id) REFERENCES businesses(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, business_id INTEGER NOT NULL, date TEXT, merchant TEXT NOT NULL, category TEXT, amount REAL NOT NULL, description TEXT, recurring INTEGER DEFAULT 0, risk TEXT DEFAULT 'LOW', FOREIGN KEY(business_id) REFERENCES businesses(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, business_id INTEGER NOT NULL, name TEXT NOT NULL, amount REAL NOT NULL, billing_cycle TEXT, last_used TEXT, status TEXT, risk TEXT, description TEXT, potential_saving REAL DEFAULT 0, FOREIGN KEY(business_id) REFERENCES businesses(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS invoice_payment_history (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_id TEXT NOT NULL, amount REAL, days_late INTEGER, paid_at TEXT, FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS import_batches (id TEXT PRIMARY KEY, business_id INTEGER NOT NULL, filename TEXT, data_type TEXT, count INTEGER, imported_at TEXT, FOREIGN KEY(business_id) REFERENCES businesses(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS bank_connections (id INTEGER PRIMARY KEY AUTOINCREMENT, business_id INTEGER NOT NULL UNIQUE, bank_name TEXT, account_masked TEXT, account_type TEXT, balance REAL, connected_at TEXT, status TEXT DEFAULT 'connected', tx_count INTEGER DEFAULT 0, tx_volume REAL DEFAULT 0, FOREIGN KEY(business_id) REFERENCES businesses(id) ON DELETE CASCADE);
  `);
}

export function seedDemo() {
  if (db.prepare("SELECT id FROM businesses WHERE name = ?").get("Sri Lakshmi Furnitures")) return;
  const root = join(dir, "..");
  const read = (name) => JSON.parse(readFileSync(join(root, "data", name), "utf8"));
  const business = read("business.json"); const invoices = read("invoices.json"); const expenses = read("expenses.json"); const subscriptions = read("subscriptions.json");
  transaction(() => {
    const result = db.prepare("INSERT INTO businesses (name,industry,currency,bank_balance,owner,gstin,since) VALUES (@name,@industry,@currency,@bankBalance,@owner,@gstin,@since)").run(business);
    const businessId = result.lastInsertRowid;
    const inv = db.prepare("INSERT INTO invoices VALUES (@id,@businessId,@customer,@amount,@issueDate,@dueDate,@status,@paidDate,@daysOverdue,@risk,@paymentDelayDays,@paymentHistory)");
    invoices.forEach((x) => inv.run({ ...x, businessId, paymentHistory: JSON.stringify(x.paymentHistory || []), paymentDelayDays: x.paymentDelayDays ?? null }));
    const exp = db.prepare("INSERT INTO expenses VALUES (@id,@businessId,@date,@merchant,@category,@amount,@description,@recurring,@risk)");
    expenses.forEach((x) => exp.run({ ...x, businessId, recurring: x.recurring ? 1 : 0 }));
    const sub = db.prepare("INSERT INTO subscriptions VALUES (@id,@businessId,@name,@amount,@billingCycle,@lastUsed,@status,@risk,@description,@potentialSaving)");
    subscriptions.forEach((x) => sub.run({ ...x, businessId }));
  });
}

export function demoBusinessId() { return db.prepare("SELECT id FROM businesses WHERE name = ?").get("Sri Lakshmi Furnitures").id; }
