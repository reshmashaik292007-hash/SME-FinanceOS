UPGRADE THE EXISTING SME FinanceOS — CashPulse APPLICATION.

IMPORTANT:
DO NOT REBUILD THE APPLICATION FROM SCRATCH.

The existing application already has:
- CashPulse dashboard
- dynamic invoices
- dynamic expenses
- 4 AI agents
- Agent Council
- AI CFO assistant
- voice assistant UI
- backend APIs
- seeded business data

KEEP ALL EXISTING FUNCTIONALITY.

Now add TWO MAJOR CAPABILITIES:

1. MULTILINGUAL AI + RELIABLE VOICE INPUT
2. EXCEL / CSV BUSINESS DATA IMPORT

These should integrate with the existing application and current data.

============================================================
1. MULTILINGUAL EXPERIENCE
============================================================

Add a language selector to the application header.

Label:

Language

Options:

English
తెలుగు
हिन्दी

The selected language should be remembered during the session.

Default:
English

Design the selector as a simple dropdown.

Do NOT make it visually dominant.

============================================================
2. LANGUAGE SUPPORT
============================================================

The application should support:

English
Telugu
Hindi

Translate the OWNER-FACING UI.

Examples:

English:

Your Business Pulse

Telugu:

మీ వ్యాపార పల్స్

Hindi:

आपके व्यवसाय की स्थिति

English:

What needs your attention?

Telugu:

మీ దృష్టి ఏ విషయంపై అవసరం?

Hindi:

आपके ध्यान की जरूरत किस पर है?

English:

Talk to your AI CFO

Telugu:

మీ AI CFOతో మాట్లాడండి

Hindi:

अपने AI CFO से बात करें

English:

Customers owe you

Telugu:

కస్టమర్లు మీకు ఇవ్వాల్సిన మొత్తం

Hindi:

ग्राहकों से लेना बाकी है

Keep financial numbers and currency formatting consistent.

Use ₹ for Indian currency.

============================================================
3. AI RESPONSE LANGUAGE
============================================================

The AI CFO must answer in the language selected by the user.

If language is:

English:
Answer in English.

Telugu:
Answer in natural Telugu.

Hindi:
Answer in natural Hindi.

Do NOT translate financial numbers incorrectly.

Example:

English:
"Ravi Traders owes you ₹48,000 and is 23 days late."

Telugu:
"Ravi Traders మీకు ₹48,000 చెల్లించాలి. పేమెంట్ 23 రోజులు ఆలస్యమైంది."

Hindi:
"Ravi Traders को आपको ₹48,000 देना है और भुगतान 23 दिन लेट है।"

Use simple conversational language.

Avoid overly formal Telugu/Hindi.

The target user is a normal small-business owner.

============================================================
4. VOICE ASSISTANT — FIX MICROPHONE
============================================================

The existing microphone is not reliably working.

REPLACE THE CURRENT IMPLEMENTATION WITH A ROBUST VOICE INPUT EXPERIENCE.

Do NOT just display a microphone icon.

The microphone must have these states:

IDLE

LISTENING

PROCESSING

SUCCESS

ERROR

UNSUPPORTED

============================================================
5. MICROPHONE PERMISSION
============================================================

When the user taps the microphone:

Request browser microphone permission.

If permission is granted:

Start recording.

If permission is denied:

Show:

"Microphone access is blocked."

Then provide:

"Allow microphone access in your browser settings."

Also provide:

"Or type your question instead."

Never leave the user stuck.

============================================================
6. VOICE INPUT IMPLEMENTATION
============================================================

Implement reliable browser audio capture.

Use:

MediaRecorder API

for recording audio.

Do NOT depend exclusively on:

SpeechRecognition / webkitSpeechRecognition

because browser support varies.

The microphone button should actually record audio.

Flow:

Tap microphone

↓

Request permission

↓

LISTENING

↓

Record audio

↓

Show animated waveform

↓

Stop recording

↓

PROCESSING

↓

Transcribe audio

↓

Send transcript to AI

↓

AI responds

↓

Show text response

↓

Read response aloud if supported

============================================================
7. SPEECH-TO-TEXT
============================================================

Create a backend endpoint:

POST /api/voice/transcribe

Accept recorded audio.

Design the backend so a speech-to-text provider can be used.

Use an environment variable for the transcription service.

For example:

SPEECH_TO_TEXT_API_KEY=

Do NOT expose this key in frontend.

If a cloud transcription service is configured:

Use it.

If no transcription service is configured:

Fall back to browser Speech Recognition when available.

If neither is available:

Show:

"Voice transcription isn't available in this browser. You can type instead."

IMPORTANT:

The application must never crash because voice transcription is unavailable.

============================================================
8. MULTILINGUAL SPEECH RECOGNITION
============================================================

Voice input must support:

English:
en-IN

Telugu:
te-IN

Hindi:
hi-IN

When user selects Telugu:

Set speech recognition language to:

te-IN

When Hindi:

hi-IN

When English:

en-IN

The microphone should understand Indian accents as well as possible.

============================================================
9. VOICE UI
============================================================

Create a premium voice assistant panel.

Header:

Talk to your AI CFO

Subtitle:

"You don't need to type. Just speak."

Large central microphone.

Idle:

🎙

"Tap to speak"

Listening:

"Listening..."

Animated waveform.

Processing:

"Understanding you..."

Response:

AI response card.

Buttons:

🔊 Listen

🎙 Ask again

✕ Close

Secondary:

"Or type your question..."

============================================================
10. VOICE LANGUAGE INDICATOR
============================================================

Inside voice panel show:

Speaking in:

English ▼

or:

తెలుగు ▼

or:

हिन्दी ▼

This should be synchronized with the global language setting.

Allow the user to change language directly inside the voice panel.

============================================================
11. TEXT-TO-SPEECH
============================================================

Use browser SpeechSynthesis API where supported.

When AI responds:

Show:

🔊 Listen

When clicked:

Read the AI response aloud.

Use:

en-IN
te-IN
hi-IN

depending on selected language.

If the selected language is not supported by the browser's installed voices:

Show the text response normally.

Do not break the application.

============================================================
12. NATURAL MULTILINGUAL QUESTIONS
============================================================

The user should be able to ask naturally.

English:

"Who owes me the most?"

Telugu:

"నాకు ఎక్కువ డబ్బులు ఎవరు ఇవ్వాలి?"

Hindi:

"मुझे सबसे ज्यादा पैसे कौन देना है?"

English:

"How much cash do I have?"

Telugu:

"నా దగ్గర ఎంత క్యాష్ ఉంది?"

Hindi:

"मेरे पास कितना कैश है?"

English:

"What should I do today?"

Telugu:

"నేను ఈరోజు ఏం చేయాలి?"

Hindi:

"मुझे आज क्या करना चाहिए?"

The AI should answer using the CURRENT business data.

============================================================
13. MULTILINGUAL AI BACKEND
============================================================

Create/update:

POST /api/assistant

Request:

{
  message,
  language,
  context
}

The backend should tell Claude:

"You are an AI CFO for a small business.

Answer the user's question using only the supplied business data.

Respond in the requested language.

Use simple conversational language.

Do not invent financial information.

If the user asks for an action, clearly explain the action before executing it."

Pass:

language
current business data
current CashPulse
relevant agent results

============================================================
14. DYNAMIC LANGUAGE FOR AGENTS
============================================================

The Agent Council should also respect the selected language.

Agent summaries should appear in:

English
Telugu
Hindi

However, keep the internal agent names consistent:

Forecasting Agent
Collections Agent
Risk Agent
Advisor Agent

Only translate the owner-facing descriptions.

============================================================
15. EXCEL / CSV IMPORT
============================================================

THIS IS A MAJOR FEATURE.

Add a clearly visible button on the dashboard:

+ Import Business Data

Also add it to:

Invoices
Expenses
Customer Payments
Business Spending

============================================================
16. IMPORT CENTER
============================================================

Create a page or modal:

IMPORT BUSINESS DATA

Subtitle:

"Upload your Excel or CSV file and we'll organize it for you."

Show three import options:

📄 Transactions

Upload bank transaction / transaction history.

🧾 Invoices

Upload invoice records.

💸 Expenses

Upload business expenses.

Also support:

CSV
XLSX
XLS

============================================================
17. DRAG AND DROP
============================================================

Create a modern drag-and-drop upload area.

Example:

┌─────────────────────────────────────┐
│                                     │
│             ↑                       │
│       Drop your Excel file          │
│                                     │
│       or click to browse            │
│                                     │
│       XLSX • XLS • CSV              │
│                                     │
└─────────────────────────────────────┘

Make it work on desktop and mobile.

On mobile:

[ Choose file ]

============================================================
18. SUPPORTED DATA TYPES
============================================================

Support:

1. Bank transactions
2. Invoices
3. Expenses

The import system should attempt to identify which type of data was uploaded.

============================================================
19. TRANSACTION IMPORT
============================================================

Expected columns may include:

Date
Description
Amount
Type
Category
Reference

Example:

Date | Description | Amount | Type | Category

2026-09-01
Supplier payment
₹25,000
Debit
Supplies

2026-09-03
Customer payment
₹48,000
Credit
Sales

Do NOT require exact column names.

Recognize common variations:

date
transaction date
txn date

description
narration
details

amount
value
transaction amount

debit
withdrawal
expense

credit
deposit
income

============================================================
20. INVOICE IMPORT
============================================================

Recognize:

Invoice Number
Customer
Amount
Issue Date
Due Date
Status

Allow variations such as:

Invoice No
Invoice ID
Customer Name
Client
Total
Invoice Amount
Invoice Date
Due
Payment Status

============================================================
21. EXPENSE IMPORT
============================================================

Recognize:

Date
Merchant
Category
Amount
Description

Also recognize:

Vendor
Payee
Expense Type
Value
Narration

============================================================
22. SMART COLUMN MAPPING
============================================================

After uploading a file:

DO NOT immediately import it.

Show a preview screen:

"Check your data before importing"

Display detected columns.

Example:

Excel column:

Txn Date

Detected as:

Date ✓

Excel column:

Narration

Detected as:

Description ✓

Excel column:

Withdrawal

Detected as:

Expense Amount ✓

Allow the user to manually change the mapping.

Example:

Date
▼

Description
▼

Amount
▼

Category
▼

Type
▼

Then:

[Import 127 records]

============================================================
23. DATA PREVIEW
============================================================

Show the first 5–10 rows.

Example:

DATE
01 Sep 2026

DESCRIPTION
Supplier payment

AMOUNT
₹25,000

CATEGORY
Supplies

TYPE
Expense

Use a clean table.

Show:

127 records detected

119 valid

8 need attention

============================================================
24. VALIDATION
============================================================

Validate:

- missing dates
- invalid amounts
- duplicate records
- unsupported formats
- missing customer names
- invalid invoice dates

Do NOT silently discard invalid records.

Show:

8 records need attention.

Allow:

Import valid records

and:

Review errors

============================================================
25. DUPLICATE DETECTION
============================================================

Before importing:

Detect likely duplicates using:

date
amount
description
reference

If duplicate records are detected:

"12 possible duplicate transactions found."

Options:

Skip duplicates

Import anyway

Review

============================================================
26. IMPORT SUCCESS
============================================================

After import:

Show a success screen:

✓ Import complete

127 transactions added

₹8.42L total transaction value

CashPulse has been updated.

Buttons:

View dashboard

View imported data

Run AI Finance Team

============================================================
27. DYNAMIC DATA PIPELINE
============================================================

Imported data MUST become part of the existing business data.

Flow:

Excel / CSV

↓

Import parser

↓

Validation

↓

Normalization

↓

Current business data

↓

CashPulse recalculation

↓

Dashboard update

↓

AI agents

↓

Voice assistant

Everything must use the same current dataset.

============================================================
28. EXCEL PARSING
============================================================

Use a reliable XLSX parsing library.

Recommended:

SheetJS / xlsx

Support:

.xlsx
.xls
.csv

The backend or frontend may parse the file, but make sure the resulting normalized data is sent to the backend and integrated with the current dataset.

============================================================
29. NORMALIZED DATA MODEL
============================================================

Normalize imported records into a consistent structure.

Transactions:

{
 id,
 date,
 description,
 amount,
 type,
 category,
 source
}

Invoices:

{
 id,
 invoiceNumber,
 customer,
 amount,
 issueDate,
 dueDate,
 status,
 source
}

Expenses:

{
 id,
 date,
 merchant,
 category,
 amount,
 description,
 recurring,
 source
}

============================================================
30. IMPORT SOURCE INDICATOR
============================================================

For imported records, show a subtle:

Imported

badge.

Example:

CloudSuite Pro
₹6,999
Imported

Seeded demo data can show:

Demo data

This helps during the hackathon demo.

============================================================
31. IMPORT HISTORY
============================================================

Create a small:

Import History

section.

Show:

September Transactions.xlsx
127 records
Imported just now

Expenses.csv
42 records
Imported yesterday

Allow:

View

Delete imported batch

If deletion is too complex, at minimum show the history.

============================================================
32. DATA RESET
============================================================

Add:

Reset Demo Data

under settings/more.

When clicked:

"Restore the original demo business data?"

[Restore]

[Cancel]

This is extremely useful during the hackathon.

It allows us to demonstrate multiple scenarios repeatedly.

============================================================
33. CASH PULSE AFTER IMPORT
============================================================

This is critical.

After importing data:

Recalculate:

Cash balance
Overdue invoices
Upcoming expenses
Spending trend
Profitability
CashPulse

Do NOT keep showing the original seeded score.

Example:

Before import:

78 / 100

After importing additional overdue invoices:

64 / 100

The pulse visualization should update.

============================================================
34. AI AGENTS AFTER IMPORT
============================================================

When user clicks:

Check my business with AI

The agents MUST analyze the newly imported data.

Forecasting:
current transactions + invoices + expenses

Collections:
current invoices

Risk:
current expenses + subscriptions + transactions

Advisor:
outputs from all three

Never use only the original seed data.

============================================================
35. VOICE AFTER IMPORT
============================================================

The voice assistant must also use imported data.

Example:

User uploads:

business_transactions.xlsx

Then asks:

"Who owes me money?"

AI must answer based on imported invoices.

User asks:

"నా ఖర్చులు ఎక్కువగా ఎక్కడ ఉన్నాయి?"

AI must analyze imported expenses.

User asks:

"मेरी सबसे बड़ी समस्या क्या है?"

AI must analyze current CashPulse and data.

============================================================
36. FILE IMPORT UI LOCATION
============================================================

Dashboard:

[ + Import Business Data ]

Customer Payments:

[ + Import Invoices ]

Business Spending:

[ + Import Expenses ]

Also:

More → Import Data

Do not place too many buttons.

Use one consistent design.

============================================================
37. IMPORT DATA BUTTON
============================================================

Use a clear icon:

Upload / FileSpreadsheet

Label:

Import Data

Do NOT use:

"Upload Dataset"

The user is a small-business owner, not a developer.

============================================================
38. MOBILE IMPORT EXPERIENCE
============================================================

On mobile:

Import Data

↓

Choose data type

Transactions
Invoices
Expenses

↓

Choose file

↓

Preview

↓

Confirm

↓

Import complete

Make the entire flow mobile friendly.

============================================================
39. VOICE BUTTON
============================================================

The microphone should remain visible globally.

Desktop:

Floating bottom-right.

Mobile:

Floating above bottom navigation.

Label:

Ask AI

When idle:

🎙 Ask AI

When listening:

● Listening...

When processing:

◌ Thinking...

When speaking:

🔊 Speaking...

============================================================
40. ERROR STATES
============================================================

Voice error:

"We couldn't hear you. Please try again."

Permission error:

"Microphone access is blocked."

Unsupported:

"Voice input isn't supported here. You can type instead."

Import error:

"We couldn't read this file."

Invalid file:

"Please upload an XLSX, XLS or CSV file."

AI error:

"AI is temporarily unavailable. Showing available financial insights."

Never show technical stack traces to the owner.

============================================================
41. SECURITY
============================================================

Never expose:

ANTHROPIC_API_KEY

SPEECH_TO_TEXT_API_KEY

Any API secrets

in frontend code.

Use environment variables.

Validate uploaded files.

Restrict accepted file types.

Do not execute uploaded files.

============================================================
42. SMALL BUSINESS LANGUAGE
============================================================

Use very simple labels.

Instead of:

"Import Dataset"

say:

"Import Data"

Instead of:

"Transaction ingestion"

say:

"Add your transactions"

Instead of:

"Data normalization"

say:

"Organizing your data..."

Instead of:

"AI orchestration"

say:

"Your AI team is checking..."

Instead of:

"Liquidity risk"

say:

"Cash may get tight."

============================================================
43. DEMO EXPERIENCE
============================================================

The final hackathon demo should support TWO paths.

PATH A:

Seeded demo data.

Owner opens app.

CashPulse:

78 / 100

Then:

Check my business with AI.

AI team finds:

Cash may get tight in 24 days.

Ravi Traders owes ₹48,000.

CloudSuite Pro may be unnecessary.

Advisor:

Collect ₹48,000 first.

PATH B:

REAL DATA DEMO.

Owner clicks:

Import Data.

Uploads:

transactions.xlsx

or:

invoices.xlsx

or:

expenses.csv

Application:

Reads data.

Shows preview.

User confirms.

Data is imported.

CashPulse recalculates.

Dashboard updates.

AI team analyzes the imported data.

Owner taps:

🎙 Ask AI

and speaks in:

English
Telugu
Hindi

AI answers using the imported data.

This should be one of the strongest hackathon moments.

============================================================
44. UI PRINCIPLE
============================================================

The entire experience should remain SIMPLE.

The owner should never need to understand:

- APIs
- AI models
- agents
- datasets
- schemas
- JSON
- technical processing

They should see:

Import my data
↓
Check my finances
↓
Ask AI
↓
Know what to do

============================================================
45. FINAL CHECKLIST
============================================================

Before finishing, verify:

MULTILINGUAL:

✓ English UI
✓ Telugu UI
✓ Hindi UI
✓ AI answers in selected language
✓ Voice language selection
✓ Telugu voice
✓ Hindi voice
✓ English voice

VOICE:

✓ microphone permission
✓ recording
✓ listening state
✓ waveform
✓ processing state
✓ transcription
✓ AI response
✓ text-to-speech
✓ browser fallback
✓ graceful unsupported state

IMPORT:

✓ XLSX
✓ XLS
✓ CSV
✓ transactions
✓ invoices
✓ expenses
✓ drag and drop
✓ file picker
✓ preview
✓ column mapping
✓ validation
✓ duplicate detection
✓ confirmation
✓ import success
✓ dynamic dashboard update

DYNAMIC DATA:

✓ CashPulse recalculates
✓ dashboard updates
✓ invoices update
✓ expenses update
✓ cash flow updates
✓ AI agents use imported data
✓ voice assistant uses imported data

RESPONSIVE:

✓ 390px
✓ 768px
✓ 1024px
✓ 1280px
✓ 1440px

No horizontal overflow.

============================================================
FINAL PRODUCT GOAL
============================================================

The product should feel like:

A friendly AI CFO that a small-business owner can:

LOOK AT
SPEAK TO
UPLOAD DATA TO
AND ACT ON.

The most powerful demo sequence should be:

UPLOAD EXCEL
↓
DATA ORGANIZED
↓
CASHPULSE RECALCULATED
↓
AI TEAM ANALYZES
↓
OWNER SPEAKS IN TELUGU / HINDI / ENGLISH
↓
AI ANSWERS
↓
AI RECOMMENDS ONE ACTION
↓
OWNER TAKES ACTION

Do not remove existing features.

Do not create a static mockup.

Actually implement the functionality.

Make the experience extremely simple for non-technical small-business owners.

BUILD THIS UPGRADE NOW.