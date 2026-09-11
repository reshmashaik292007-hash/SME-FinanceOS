Add a complete "Connect Bank Account" flow to SME FinanceOS — CashPulse.

The purpose is to allow a business owner to securely connect a bank account and, with explicit consent, import financial transaction data into CashPulse.

IMPORTANT:
Do not ask the user for:
- Internet banking password
- UPI PIN
- Debit card PIN
- ATM PIN
- Bank login credentials

Use an Account Aggregator-style consent journey.

For the hackathon prototype, use a realistic MOCK bank/AA connection flow. Structure the UI so a real Account Aggregator integration can be connected later.

==================================================
1. CONNECT BANK ACCOUNT
==================================================

Add a primary option:

+ Add Bank Account

When clicked, open:

CONNECT YOUR BANK ACCOUNT

Subtitle:

"Securely bring your business transactions into CashPulse."

Show:

Select your bank

A dropdown/select component.

==================================================
2. BANK DROPDOWN
==================================================

When clicked, show a searchable dropdown containing major Indian banks:

State Bank of India (SBI)
HDFC Bank
ICICI Bank
Axis Bank
Kotak Mahindra Bank
Punjab National Bank (PNB)
Bank of Baroda
Canara Bank
Union Bank of India
IndusInd Bank
IDBI Bank
Yes Bank

Each bank should have:
- bank name
- simple bank icon/logo placeholder
- selection state

Do not use fake unsupported claims about live connectivity.

After selecting a bank:

[ Continue ]

==================================================
3. MOBILE NUMBER
==================================================

Next screen:

VERIFY YOUR MOBILE NUMBER

Subtitle:

"Enter the mobile number registered with your bank account."

Field:

+91
[ Enter mobile number ]

Button:

Send OTP →

Validation:

- exactly 10 digits
- Indian mobile number format
- required field

IMPORTANT:

Explain:

"We'll use this number to discover accounts linked to your bank."

==================================================
4. OTP SCREEN
==================================================

After Send OTP:

VERIFY YOUR NUMBER

"We've sent a 6-digit OTP to +91 XXXXX XXXXX."

Six OTP input boxes.

Button:

Verify OTP →

Secondary:

Resend OTP

Timer:

Resend in 30s

For the hackathon prototype, use a mock OTP such as:

123456

Clearly indicate:

"Demo OTP: 123456"

ONLY in demo mode.

Never display this behavior in a real production integration.

==================================================
5. ACCOUNT DISCOVERY
==================================================

After successful OTP:

Finding your accounts...

Show animated loading state.

Text:

"Looking for bank accounts linked to this mobile number."

Then display:

ACCOUNTS FOUND

Example:

State Bank of India

Current Account
•••• 4821

₹4,80,000

[ Select ]

If multiple accounts:

☐ Current Account ••••4821
☐ Savings Account ••••7612

Allow the user to select one or more eligible accounts.

Button:

Continue →

==================================================
6. IMPORTANT CONSENT SCREEN
==================================================

Before any transaction data is fetched, show a dedicated consent screen.

Title:

YOUR CONSENT

Subtitle:

"CashPulse is requesting access to your financial information."

Show clearly:

REQUESTING:

✓ Account balance
✓ Transaction history
✓ Transaction dates
✓ Transaction descriptions
✓ Credits and debits

PURPOSE:

"To calculate your CashPulse score, understand cash flow, identify spending patterns and provide financial insights."

DATA PERIOD:

Last 6 months

FREQUENCY:

One-time access

DATA USER:

SME FinanceOS — CashPulse

Add:

"Your data will only be used for the purpose you approve."

Buttons:

[ Allow & Continue ]

[ Decline ]

Make Decline equally visible but secondary.

==================================================
7. CONSENT LANGUAGE
==================================================

Use simple language.

Instead of:

"Grant financial information access"

Say:

"Allow CashPulse to read your transactions?"

Explain:

"This helps us understand your cash flow, expenses and customer payments."

Add:

"You can stop sharing access later."

The user must actively click:

Allow & Continue

Never automatically assume consent.

==================================================
8. FETCH TRANSACTIONS
==================================================

After consent:

IMPORTING YOUR TRANSACTIONS...

Show an animated progress state:

Connecting securely ✓

Verifying account ✓

Fetching transactions...

Organizing transactions...

Calculating your CashPulse...

Then:

✓ Transactions imported

Example:

248 transactions
₹18.42L total transaction volume

Button:

View transactions →

==================================================
9. TRANSACTION IMPORT
==================================================

Normalize imported bank transactions into:

Date
Description
Amount
Type
Category
Account
Source

Types:

Credit
Debit

Categories can be automatically classified:

Sales
Customer Payment
Supplies
Rent
Payroll
Utilities
Software
Marketing
Travel
Other

Show:

"AI categorized your transactions."

Allow the user to edit categories.

==================================================
10. UPDATE CASHPULSE
==================================================

After successful import:

Automatically recalculate:

Cash balance
Overdue invoices
Upcoming expenses
Spending trend
Profitability
CashPulse score

Example:

Before:

78 / 100

After importing real transaction data:

74 / 100

Show:

YOUR CASH PULSE HAS BEEN UPDATED

74 / 100

"Your score changed after we analyzed your latest transactions."

Button:

View my financial health →

==================================================
11. AI FINANCE TEAM
==================================================

After bank connection, make the imported transactions available to:

Forecasting Agent
Collections Agent
Risk Agent
Advisor Agent

Forecasting Agent uses:
bank transactions + invoices + expenses

Risk Agent uses:
transaction history + expenses + subscriptions

Advisor Agent uses:
all current financial information

Never use only the original demo data after the user connects a bank account.

==================================================
12. VOICE ASSISTANT
==================================================

The connected bank data must also become available to the AI CFO voice assistant.

Examples:

English:

"How much money came into my account this month?"

Telugu:

"ఈ నెల నా అకౌంట్‌లోకి ఎంత డబ్బు వచ్చింది?"

Hindi:

"इस महीने मेरे अकाउंट में कितना पैसा आया?"

The AI must answer using the currently connected/imported financial data.

==================================================
13. BANK CONNECTION STATUS
==================================================

After successful connection, dashboard should show:

BANK CONNECTED ✓

SBI
•••• 4821

Last synced:
Just now

[Refresh data]

Do NOT display full account numbers.

Only show masked numbers.

==================================================
14. DISCONNECT
==================================================

Add:

Manage connected accounts

User can see:

SBI
••••4821
Connected

Button:

Disconnect

Before disconnecting:

"Stop using this account's financial data?"

[Disconnect]

[Cancel]

==================================================
15. IMPORTANT SECURITY UX
==================================================

Never ask CashPulse users for:

Bank password
UPI PIN
ATM PIN
Debit card PIN
CVV

Never display or store these credentials.

The UI should communicate:

"CashPulse never asks for your bank password or UPI PIN."

==================================================
16. REAL INTEGRATION ARCHITECTURE
==================================================

Structure the backend so the mock flow can later be replaced with a real Account Aggregator integration.

Create conceptual endpoints:

POST /api/bank/discover
POST /api/bank/send-otp
POST /api/bank/verify-otp
POST /api/bank/accounts
POST /api/bank/consent
POST /api/bank/fetch-transactions
POST /api/bank/disconnect

For the hackathon:

Use mock data.

Do not pretend that the prototype is connected to real banking infrastructure.

Clearly label mock/demo behavior where appropriate.

==================================================
17. DASHBOARD ENTRY POINT
==================================================

Add:

Connect Bank Account

to the dashboard.

Also show:

Import Excel / CSV

and:

Enter Manually

under:

ADD FINANCIAL DATA

So the owner has three ways to provide information:

🏦 Connect Bank
📊 Import Excel
✍ Enter Manually

==================================================
18. SIMPLE USER JOURNEY
==================================================

The complete experience should be:

Create account
↓
Login
↓
Dashboard
↓
Add Financial Data
↓
Connect Bank Account
↓
Select Bank
↓
Enter registered mobile number
↓
OTP verification
↓
Discover account
↓
Select account
↓
Review consent
↓
Allow access
↓
Fetch transaction data
↓
Categorize transactions
↓
Recalculate CashPulse
↓
Run AI Finance Team
↓
Ask AI CFO

==================================================
19. MOBILE RESPONSIVENESS
==================================================

The entire bank connection flow must work perfectly on mobile.

At 390px:

Bank dropdown
Mobile input
OTP
Account selection
Consent
Transaction import

must all fit naturally.

Use large touch targets.

Never use tiny dropdowns or tiny OTP boxes.

==================================================
20. FINAL DESIGN
==================================================

Keep the existing CashPulse visual identity:

dark navy
emerald
cyan
premium fintech
simple language
large readable numbers
rounded cards
subtle glow

The bank connection flow should feel:

SECURE
SIMPLE
TRUSTWORTHY
TRANSPARENT

The owner should understand exactly:

WHAT data is being requested
WHY it is needed
HOW long it will be used
WHO is requesting it

before they approve consent.

Build this as a polished hackathon-ready bank connection experience.