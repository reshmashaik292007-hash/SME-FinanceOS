You are an expert full-stack engineer, senior UI/UX designer, fintech product designer, AI engineer, and hackathon technical lead.

Build a COMPLETE, POLISHED, WORKING full-stack MVP called:

# SME FinanceOS — CashPulse

Tagline:
"Your business finances. One pulse. One AI team."

This is a 24-hour fintech hackathon project. The goal is to create a highly polished end-to-end demo that feels like an AI CFO for small businesses.

The product must allow a small-business owner to:

1. Instantly understand their financial health through one CashPulse score.
2. Understand WHY the score is high or low.
3. Run an AI Finance Team consisting of 4 specialized AI agents.
4. Watch those agents analyze the business sequentially and hand findings to one another.
5. Receive one clear recommended action from the Advisor Agent.
6. Get a professionally drafted payment reminder from the Collections Agent.
7. Copy or simulate sending that reminder.
8. Explore invoices, expenses, subscriptions, and cash-flow information.

PRIORITY ORDER:

1. Working end-to-end demo
2. Premium UI/UX
3. Strong AI-agent experience
4. Realistic seeded financial data
5. Robust fallback behavior
6. Clean architecture

Do NOT build unnecessary features that could compromise the demo.

============================================================
TECH STACK
==========

Frontend:

* React
* Vite
* Tailwind CSS
* React Router
* Recharts
* Lucide React icons

Backend:

* Node.js
* Express
* Anthropic Claude API
* dotenv
* cors

Data:

* Seeded JSON files
* No database required

AI:

* Anthropic Claude API called ONLY from backend
* API key must NEVER be exposed to frontend
* Environment variable:

ANTHROPIC_API_KEY=

The application MUST continue working if the Anthropic API key is missing or the API call fails.

Use deterministic fallback outputs in that case.

============================================================
PROJECT STRUCTURE
=================

Create:

sme-financeos/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── data/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── agents/
│   │   ├── forecastingAgent.js
│   │   ├── collectionsAgent.js
│   │   ├── riskAgent.js
│   │   └── advisorAgent.js
│   ├── data/
│   │   ├── business.json
│   │   ├── invoices.json
│   │   ├── expenses.json
│   │   └── subscriptions.json
│   ├── services/
│   │   ├── claude.js
│   │   └── pulseCalculator.js
│   ├── routes/
│   │   ├── data.js
│   │   ├── pulse.js
│   │   └── agents.js
│   ├── index.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── package.json

Use clean reusable components.

Do NOT put the whole application into one App.jsx file.

============================================================
PRODUCT DESIGN
==============

The product should feel like:

* Premium fintech SaaS
* AI CFO
* Modern financial operating system
* Stripe-level cleanliness
* Linear-level polish
* Bloomberg-inspired information density
* Modern AI-product interaction

It must NOT feel like:

* A generic admin dashboard
* A college CRUD project
* A crypto trading dashboard
* A template with random cards
* An overly colorful analytics dashboard

Use a dark-first interface.

Overall visual direction:

Background:
Very dark navy/black.

Surface:
Dark charcoal/navy cards.

Borders:
Very subtle gray/blue borders.

Primary accent:
Emerald green.

AI accent:
Cyan.

Warning:
Amber.

Danger:
Red.

Typography:
Inter or equivalent.

Use:

* large financial numbers
* strong typography hierarchy
* muted secondary text
* generous spacing
* rounded-xl / rounded-2xl cards
* subtle shadows
* thin borders
* restrained glassmorphism

Use Lucide icons instead of manually created emoji icons wherever possible.

Animations should be subtle and purposeful.

============================================================
GLOBAL LAYOUT
=============

Desktop layout:

LEFT SIDEBAR
+
MAIN CONTENT

Sidebar width approximately 240px.

Sidebar:

Logo:

CashPulse
SME FinanceOS

Navigation:

Overview
Finance Team
Invoices
Expenses
Cash Flow

Each item has a Lucide icon.

Active page:
subtle emerald/cyan highlight.

Bottom sidebar:

AI Finance Team
4 Agents Online
● Live

Business:

Sri Lakshmi Furnitures
Furniture & Interiors

On mobile:
Use a collapsible sidebar or compact navigation.

============================================================
ROUTES
======

Create:

/
redirect to /dashboard

/dashboard

/agents

/invoices

/expenses

/cash-flow

============================================================
DASHBOARD
=========

The dashboard is the most important screen.

At top:

"Good morning, Sri Lakshmi Furnitures"

Subtitle:

"Here's your financial health at a glance."

Right side:

"Updated just now"

Button:

"Run Finance Team Analysis"

The button must trigger the full AI agent workflow.

============================================================
CASH PULSE HERO
===============

Create a large premium hero card.

Title:

Financial Health

Main score:

78 / 100

Status:

HEALTHY

Subtitle:

"Stable finances, but receivables need attention."

Create a heartbeat monitor visualization.

IMPORTANT:

DO NOT use a simple circular progress bar.

The CashPulse must be visually distinctive.

Build an animated SVG or Recharts heartbeat-style line.

The visualization should:

* continuously animate
* have subtle waves
* periodically produce heartbeat spikes
* glow softly
* contain a moving glowing dot
* react to the score

Behavior:

Score 80-100:
calm pulse

Score 60-79:
moderate pulse

Score 40-59:
faster pulse

Score below 40:
irregular/faster pulse

The animation should feel like a medical heart monitor representing business financial health.

Below it show:

"Your pulse is stable, but ₹1.42L is currently tied up in overdue invoices. Two customers have repeatedly paid late."

IMPORTANT:

This explanation must come from:

GET /api/pulse

The frontend must show a skeleton while waiting.

If Claude is unavailable, use a deterministic fallback explanation.

============================================================
CASH PULSE FACTORS
==================

Inside or below the hero card show five small factors:

Cash on Hand
Receivables
Upcoming Expenses
Spending Trend
Profitability

Each should have:

* score
* tiny progress bar
* status
* tooltip/explanation

Example:

Cash on Hand
82
Healthy

Receivables
65
Watch

Upcoming Expenses
70
Stable

Spending Trend
76
Healthy

Profitability
88
Strong

============================================================
KEY METRICS
===========

Create four cards:

1.

Bank Balance

₹4,80,000

↑ 8.2% vs last period

2.

Overdue Invoices

₹1,42,000

5 invoices overdue

3.

Upcoming Expenses

₹4,10,000

Next 30 days

4.

Net Profit

₹1,18,000

This month

Use subtle mini sparklines.

Do not hardcode these values in the UI.

Calculate them from backend data.

============================================================
FINANCIAL SIGNALS
=================

Section title:

Financial Signals

Subtitle:

"What's affecting your pulse?"

Create three insight cards.

COLLECTIONS

Icon:
alert/message

"3 customers are consistently paying late."

₹42,000 at risk

Button:
View invoices

SPENDING

"Software spending increased 24% this month."

₹18,400 / month

Button:
Review expenses

PROFITABILITY

"Gross margin remains healthy at 31%."

+3.4% vs last period

Button:
View cash flow

Calculate these from seed data where possible.

============================================================
AI FINANCE TEAM
===============

Create a premium section.

Header:

Meet your AI Finance Team

Subtitle:

"Four specialized agents. One financial decision."

Show four agent cards.

FORECASTING AGENT

Icon:
TrendingUp

Role:
"Predicts what's coming."

Status:
● Ready

COLLECTIONS AGENT

Icon:
MessageCircle

Role:
"Gets your money moving."

Status:
● Ready

RISK AGENT

Icon:
ShieldAlert

Role:
"Finds hidden leakage."

Status:
● Ready

ADVISOR AGENT

Icon:
Sparkles

Role:
"Tells you what to do."

Status:
● Ready

Each card should have:

* icon
* name
* role
* status
* subtle hover animation
* subtle AI glow

Main CTA:

RUN FINANCE TEAM ANALYSIS →

============================================================
AGENT ANALYSIS FLOW
===================

When user clicks:

Run Finance Team Analysis

Navigate to /agents OR reveal the Agent Council section.

Show an activation screen.

Example:

"Activating Finance Team..."

Then progress:

Analyzing cash flow...
✓ Forecasting Agent

Reviewing receivables...
✓ Collections Agent

Scanning expenses...
✓ Risk Agent

Synthesizing recommendation...
✓ Advisor Agent

Use sequential animations.

Do not show all results instantly.

The frontend should progressively reveal each agent.

============================================================
AGENT COUNCIL
=============

Create a premium vertical timeline.

Header:

Finance Team Council

Subtitle:

"Your AI finance team is working together."

Timeline:

FORECASTING AGENT

Icon:
TrendingUp

Status:
Complete

Example summary:

"Cash flow looks stable for the next 30 days, but the balance could fall below ₹2L around Day 24 if overdue invoices aren't collected."

Show:

Cash Forecast
30 days
60 days
90 days

Then a handoff:

↓
HANDING OFF TO COLLECTIONS

COLLECTIONS AGENT

Example:

"₹1.42L is currently overdue. Two customers show repeated late-payment behavior."

Top target:

Ravi Traders

₹48,000

23 days overdue

Risk:
HIGH

Then:

↓
HANDING OFF TO RISK

RISK AGENT

Example:

"One software subscription appears unused and monthly software spending increased 24%."

Potential savings:

₹6,999 / month

Then:

↓
HANDING OFF TO ADVISOR

ADVISOR AGENT

Example:

"Collect from Ravi Traders first. This single action would improve near-term cash position more than cutting expenses."

Priority:

HIGH

The connecting timeline should visually communicate data handoff.

Use glowing nodes and subtle animations.

============================================================
ADVISOR PANEL
=============

Create a prominent Advisor card.

Title:

AI CFO Recommendation

Main recommendation:

"Collect ₹48,000 from Ravi Traders."

Reason:

"Your cash forecast shows a potential liquidity dip in 24 days. This invoice is both large and significantly overdue."

Impact:

+₹48,000 cash

Priority:

HIGH

CTA:

View Collection Draft →

This should be visually prominent.

============================================================
COLLECTION DRAFT
================

Create a premium card.

Title:

Ready-to-send collection reminder

Subtitle:

Drafted by Collections Agent

Fields:

TO:
Ravi Traders

SUBJECT:
Payment follow-up — Invoice #INV-1042

BODY:

Hi Ravi,

Just following up regarding invoice #INV-1042 for ₹48,000, which is currently 23 days overdue.

We'd appreciate it if you could arrange payment at your earliest convenience.

Please let us know if there is anything needed from our side to complete the payment.

Regards,
Sri Lakshmi Furnitures

Buttons:

Copy Message

Send Reminder

Copy button:

Use navigator.clipboard.

Show toast:

"Reminder copied ✓"

Send button:

No actual email integration.

Show toast:

"Reminder sent successfully ✓"

============================================================
SEED DATA
=========

Create realistic data for:

Sri Lakshmi Furnitures

Industry:
Furniture & Interiors

Currency:
INR

Starting/running bank balance:
₹4,80,000

Create 12-15 invoices.

Each invoice must contain:

id
customer
amount
issueDate
dueDate
status
paidDate
paymentDelayDays
paymentHistory

Statuses:

PAID
PENDING
OVERDUE

Include at least two customers with repeated late-payment patterns.

Important customers:

Ravi Traders

Metro Wholesale

Ravi Traders should have multiple historical invoices with late payments.

Metro Wholesale should also demonstrate repeated late payment behavior.

Create realistic amounts ranging from approximately ₹15,000 to ₹1,50,000.

Create 18-20 expenses.

Each:

id
date
merchant
category
amount
description
recurring
risk

Categories:

Rent
Payroll
Supplies
Software
Utilities
Marketing
Travel
Operations

Create recurring subscriptions:

CloudSuite Pro
₹6,999/month
Potentially unused

AccountingPro
₹2,499/month

Canva Business
₹1,299/month

Google Workspace
₹1,200/month

Create enough historical expenses to calculate spending trends.

Include at least:

* one possible duplicate charge
* one unusual spending spike
* one unused subscription
* one recurring expense increase

============================================================
PULSE SCORE CALCULATION
=======================

Create:

server/services/pulseCalculator.js

Function:

calculatePulseScore(data)

The score MUST be calculated.

DO NOT simply return 78.

Use weighted components:

Cash on hand:
25%

Overdue invoices:
20%

Upcoming expenses:
20%

Spending trend:
15%

Profitability:
20%

Each component should produce a 0-100 subscore.

Then:

overallScore =
cashScore * 0.25 +
receivablesScore * 0.20 +
expenseScore * 0.20 +
spendingScore * 0.15 +
profitabilityScore * 0.20

Round to nearest integer.

Classify:

80-100:
Excellent

60-79:
Healthy

40-59:
Watch

0-39:
Critical

Return:

{
score,
status,
factors: {
cash,
receivables,
upcomingExpenses,
spending,
profitability
},
metrics: {
bankBalance,
overdueInvoices,
upcomingExpenses,
netProfit
}
}

============================================================
PULSE EXPLANATION
=================

GET:

/api/pulse

Flow:

1. Load seed data.
2. Calculate pulse score.
3. Generate a short explanation using Claude.
4. Return explanation.

Claude prompt:

"You are the financial health explainer for a small business.

Given the calculated financial health metrics, explain in 1-2 plain-English sentences why the business currently has this CashPulse score.

Mention the most important financial factor.

Use Indian Rupee formatting.

Do not use financial jargon.

Do not invent numbers.

Return only the explanation."

If Claude fails:

Generate fallback explanation from the strongest negative factor.

============================================================
BACKEND API
===========

Implement:

GET /api/data

Returns:

{
business,
invoices,
expenses,
subscriptions
}

GET /api/pulse

Returns:

{
score,
status,
explanation,
factors,
metrics
}

POST /api/agents/run

Runs all four AI agents sequentially.

============================================================
CLAUDE SERVICE
==============

Create:

server/services/claude.js

Use Anthropic SDK.

Create reusable function:

callClaude({
systemPrompt,
userPrompt
})

Handle:

* missing API key
* API errors
* malformed responses
* timeout/failure

Never crash the Express server.

============================================================
FORECASTING AGENT
=================

Create:

server/agents/forecastingAgent.js

System prompt:

"You are the Forecasting Agent on an AI finance team for a small business.

Your responsibility is to forecast cash flow.

Analyze only the financial data provided.

Project cash position for:
30 days
60 days
90 days

Consider:

* current bank balance
* expected invoice collections
* overdue invoices
* upcoming expenses
* recurring subscriptions
* payroll
* rent
* known outgoing payments

Identify:

* potential cash shortages
* approximate dates of concern
* expected cash position
* major assumptions

Be concise.

Return valid JSON only."

Return structure:

{
summary,
forecast: {
days30,
days60,
days90
},
risk,
liquidityDip,
assumptions
}

============================================================
COLLECTIONS AGENT
=================

Create:

server/agents/collectionsAgent.js

System prompt:

"You are the Collections Agent on an AI finance team for a small business.

Review unpaid and overdue invoices.

Rank collection urgency using:

* invoice amount
* days overdue
* customer payment history
* repeated late-payment behavior

Choose ONE most urgent invoice.

Draft a professional but firm payment reminder.

Do not threaten the customer.

Do not invent information.

Return valid JSON only."

Return:

{
summary,
urgentInvoice,
risk,
reasons,
draft: {
recipient,
subject,
body
}
}

============================================================
RISK AGENT
==========

Create:

server/agents/riskAgent.js

System prompt:

"You are the Risk Agent on an AI finance team for a small business.

Analyze expenses and subscriptions.

Look for:

* duplicate charges
* unused subscriptions
* unusual spending spikes
* recurring expense increases
* abnormal transactions

Quantify possible savings where possible.

Prioritize the most important anomalies.

Return valid JSON only."

Return:

{
summary,
anomalies: [],
potentialMonthlySavings,
riskLevel
}

============================================================
ADVISOR AGENT
=============

Create:

server/agents/advisorAgent.js

The Advisor receives outputs from:

Forecasting Agent
Collections Agent
Risk Agent

System prompt:

"You are the senior financial advisor coordinating an AI finance team for a small business.

You receive reports from three specialist agents:

1. Forecasting
2. Collections
3. Risk

Choose ONE highest-priority action for the business owner.

Do not provide a list.

Choose the action with the greatest near-term financial impact.

Explain the decision in simple business language.

Return valid JSON only."

Return:

{
priority,
action,
reason,
impact
}

============================================================
AGENT EXECUTION
===============

POST:

/api/agents/run

Execution order MUST be:

1. Forecasting
2. Collections
3. Risk
4. Advisor

The Advisor MUST receive the actual outputs of the first three agents.

Return:

{
success: true,
agents: {
forecasting,
collections,
risk,
advisor
},
execution: {
startedAt,
completedAt
}
}

If one agent fails:

Do NOT fail the whole request.

Use fallback output for that agent and continue.

============================================================
INVOICES PAGE
=============

Create a polished invoice management page.

Header:

Invoices

Subtitle:

"Track receivables and identify collection risk."

Top metrics:

Total Receivables
Overdue
Collected This Month

Table:

Invoice
Customer
Amount
Due Date
Status
Days Late
Risk

Status badges:

PAID
PENDING
OVERDUE

Risk badges:

LOW
MEDIUM
HIGH

Highlight overdue invoices.

Add search/filter UI if easy, but don't sacrifice core functionality.

============================================================
EXPENSES PAGE
=============

Header:

Expenses

Subtitle:

"See where your business money is going."

Top metrics:

Total Spend
Recurring Spend
Potential Savings

Table:

Date
Merchant
Category
Amount
Recurring
Risk

Highlight:

duplicate charges
unusual spending
unused subscriptions

Create a small "AI detected" indicator.

============================================================
CASH FLOW PAGE
==============

Create a premium Recharts visualization.

Header:

Cash Flow Forecast

Tabs:

30 Days
60 Days
90 Days

Show:

Actual cash
Projected cash
Minimum safe balance

Include a potential liquidity dip annotation.

Example:

Day 24
₹1.86L

Below chart:

"Without additional collections, cash may fall below your preferred safety threshold."

Use real calculations from the seed data and forecasting output.

============================================================
NAVIGATION EXPERIENCE
=====================

Navigation should be smooth.

Use React Router.

Every page should maintain the same sidebar and top navigation.

============================================================
LOADING EXPERIENCE
==================

The loading experience is extremely important.

When running agents:

Show:

"Finance Team is thinking..."

Then:

✓ Forecasting Agent completed

✓ Collections Agent completed

✓ Risk Agent completed

✓ Advisor Agent completed

Use animated dots and progress states.

The timeline should reveal agents progressively.

Avoid a generic full-screen spinner.

============================================================
TOAST SYSTEM
============

Create reusable toast notifications.

Examples:

"Analysis started"
"Forecasting Agent completed"
"Collections Agent completed"
"Risk Agent completed"
"Advisor recommendation ready"
"Reminder copied ✓"
"Reminder sent successfully ✓"

============================================================
ERROR HANDLING
==============

The application must survive:

* missing API key
* Claude API failure
* malformed Claude response
* backend failure
* empty data
* network error

Display graceful messages.

For AI failure:

"AI agent temporarily unavailable. Showing deterministic analysis."

Then continue the demo.

============================================================
FALLBACK AI OUTPUTS
===================

Create deterministic fallback outputs matching the seed data.

The demo must work completely without an Anthropic API key.

This is mandatory.

============================================================
RESPONSIVE DESIGN
=================

Optimize primarily for desktop 1440px.

Also support:

1280px
1024px
768px
mobile

Desktop:

sidebar + dashboard grid

Mobile:

stack sections
collapsible navigation
full-width cards
horizontal scrolling where appropriate

============================================================
ACCESSIBILITY
=============

Use:

* semantic buttons
* aria-labels where necessary
* keyboard-accessible controls
* readable contrast
* focus states

============================================================
PERFORMANCE
===========

Avoid unnecessary rerenders.

Use reusable components.

Do not introduce unnecessary dependencies.

============================================================
ANIMATION
=========

Use CSS transitions and Framer Motion ONLY if truly useful.

Animations:

* page fade-in
* card entrance
* score counter
* pulse heartbeat
* AI status indicators
* timeline reveal
* button hover
* toast entrance

Keep animations premium and subtle.

Do not over-animate.

============================================================
CASH PULSE VISUAL SPECIFICATION
===============================

This is the signature visual.

Build a dark rectangular financial-monitor card.

Top:

FINANCIAL HEALTH

78

HEALTHY

Center:

large animated ECG-style line.

The line should have:

small oscillations
+
periodic larger spike
+
glowing effect
+
moving point

Under line:

"Business pulse is stable"

At the bottom:

Cash
₹4.80L

Receivables
₹3.20L

Expenses
₹4.10L

The pulse line should subtly change speed based on score.

============================================================
DESIGN SYSTEM
=============

Use consistent:

Border radius:
12-20px

Spacing:
8px base system

Card padding:
20-28px

Headings:
strong but not oversized

Body:
14-16px

Muted:
gray-blue

Primary:
emerald/cyan

Warnings:
amber

Critical:
red

Do not use excessive shadows.

============================================================
DEMO DATA STORY
===============

The seeded data must tell a coherent story.

Business:

Sri Lakshmi Furnitures

Current situation:

* healthy but not perfect cash position
* several overdue invoices
* two repeat late-paying customers
* upcoming expenses
* increasing software spend
* unused subscription
* possible duplicate charge
* healthy profitability
* potential liquidity dip in approximately 24 days

The data must make the AI agents produce interesting findings.

The intended demo story is:

STEP 1:

Owner opens dashboard.

CashPulse:

78 / 100

Healthy.

STEP 2:

Owner sees:

₹4.80L cash

₹1.42L overdue

₹4.10L upcoming expenses

STEP 3:

Owner clicks:

Run Finance Team Analysis

STEP 4:

Forecasting Agent:

"Potential liquidity dip in 24 days."

STEP 5:

Collections Agent:

"Ravi Traders is the highest collection priority."

₹48,000
23 days overdue

STEP 6:

Collections drafts payment reminder.

STEP 7:

Risk Agent:

"CloudSuite Pro appears unused."

Potential saving:

₹6,999/month

STEP 8:

Advisor:

"Collect ₹48,000 from Ravi Traders first."

STEP 9:

Owner clicks:

Copy Message

or

Send Reminder

Toast appears.

This creates the story:

DETECT
→
ANALYZE
→
COLLABORATE
→
RECOMMEND
→
ACT

============================================================
IMPORTANT UX PRINCIPLE
======================

The application should communicate:

"Don't just look at your finances.
Let your AI finance team tell you what to do."

The Advisor recommendation must always be the final focal point.

============================================================
NO FAKE FUNCTIONALITY
=====================

Do not create buttons that appear functional but do nothing.

If a feature cannot be fully implemented:

* either implement a simple version
* or clearly show it as a non-functional demo action

Copy must work.

Send must show a success toast.

Run Finance Team Analysis MUST call the backend.

Dashboard metrics MUST come from backend data.

Pulse score MUST be calculated.

AI outputs MUST come from Claude when API key exists.

Fallback outputs MUST work when API key doesn't exist.

============================================================
README
======

Create README.md containing:

Project overview

Features

Tech stack

Architecture

Folder structure

Setup instructions

Install dependencies

Environment variables

How to start backend

How to start frontend

API endpoints

AI agent architecture

Fallback mode

Demo walkthrough

============================================================
ENVIRONMENT
===========

Create:

.env.example

Containing:

ANTHROPIC_API_KEY=

Do not commit .env.

Add .env to .gitignore.

============================================================
FINAL VALIDATION
================

Before considering the project complete, test:

1. npm install works
2. frontend starts
3. backend starts
4. /api/data works
5. /api/pulse works
6. /api/agents/run works
7. Dashboard loads
8. CashPulse displays
9. Pulse animation works
10. Metrics display correctly
11. Finance Team button works
12. Agents execute sequentially
13. Timeline renders
14. Advisor recommendation renders
15. Collection draft renders
16. Copy button works
17. Send button works
18. Toast works
19. Invoices page works
20. Expenses page works
21. Cash Flow page works
22. Mobile layout works
23. Missing Claude API key does NOT crash application
24. Claude API failure does NOT crash application
25. No frontend API key exposure
26. No console errors
27. No broken routes
28. No placeholder lorem ipsum
29. No unfinished TODO sections
30. No fake metrics unrelated to seed data

============================================================
FINAL INSTRUCTION
=================

Do not stop after creating a plan.

Actually CREATE the files and IMPLEMENT the complete application.

Do not merely give code snippets.

Build the entire working project.

If something is ambiguous, choose the simplest production-quality implementation that supports the hackathon demo.

Prioritize the Dashboard and Agent Council visually.

The final result should look like a startup-quality fintech MVP that could realistically be presented to judges.

The most important emotional sequence should be:

"I understand my business health."

↓

"I understand what's wrong."

↓

"My AI finance team investigated it."

↓

"They agree on what matters most."

↓

"I can take action immediately."

Make the application polished enough that a judge can understand the value within 10 seconds.
