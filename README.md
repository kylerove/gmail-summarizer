# Email Summarizer with OpenAI

This Email Summarizer is a script designed to provide a concise email summary (to yourself) of specified Gmail emails over a specified number of days. It leverages OpenAI's GPT model to synthesize email data into readable, single-sentence summaries.

## Features

1. **Customizable Time Frame**: Set the number of days in the past for which you want to summarize emails.
2. **Filter by Read/Unread**: Option to only summarize unread emails, helping you catch up quickly on unattended emails.
3. **Category-specific Summaries**: Summarize emails by Gmail categories such as primary, social, promotions, etc.
4. **Automated Email Summary Creation**: Generates an email report to yourself with bullet point summary of all relevant emails
5. **Link to Original Email**: Each summary in the report includes a direct link to the original email for easy access.
6. **OpenAI Integration**: Utilizes powerful AI from OpenAI for generating concise and relevant summaries.

## How to Install

### Prerequisites
- A Google account with Gmail access.
- Access to Google Apps Script.
- An API key from OpenAI.

### Steps
1. **Obtain OpenAI API Key**: First, you need to get an API key from OpenAI by signing up on their platform and selecting an appropriate API plan.
2. **Deploy the Script**:
   - Open Google Apps Script console at [script.google.com](https://script.google.com).
   - Create a new project.
   - Copy the provided script code into the script editor.
   - Replace `"<key-goes-here>"` with your actual OpenAI API key in the `openaiApiKey` variable.
   - Save and name your project.
3. **Grant Necessary Permissions**:
   - Run any function from the script editor to trigger the authorization process.
   - Review and accept the permissions required for accessing your Gmail.

## Modifying and Customization

### Changing the Summarization Range
Change the `numDaysToLookBack` variable to adjust the number of days to generate the email summary.

```javascript
var numDaysToLookBack = 5; // Change 5 to your desired days
```

## Category-Specific Emails
Modify the `inboxType` to your chosen type of emails.

```javascript
var inboxType = 'social'; // Options: primary, social, promotions, updates, forums, reservations, purchases
```

## Customizing Summarization Instructions
Adjust the summarization Instruction variable to tailor the AI's summarizing approach.
```javascript
var summarizationInstruction = "Summarize this email in 10 words or less.";
```
