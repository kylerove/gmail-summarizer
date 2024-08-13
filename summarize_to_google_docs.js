// The open-ai API-key. Replace api-key between the quotation marks ("<key-goes-here>")
// The line should look like:
// var openApiKey= "sk-8wQYhgoKAULIzxvntoheuntoahunoahusntoheusnoh-oouthontuhontuhosntuhosntuh"
var openaiApiKey = "your-open-ai-key-here";

// Number of days to look back in the inbox from today.
var numDaysToLookBack = 2;

// Change to false if you want to summarize all emails.
var onlyUnread = false; 

// Which inbox to summarize. Options are: primary,social,promotions,updates,forums,reservations,purchases
var inboxType = 'primary';

// This is the master prompt for summarizing the email. You can modify the below to change the instructions to the LLM.
var summarizationInstruction = "You are an email summarizer and will be given a subject and an email. Summarize the email in a single sentence." 

// The main calling function.
function createGoogleDocReport() {
  var numDaysToLookBack = 2;
  var today = new Date();
  var startDate = new Date(today.getTime() - numDaysToLookBack * 24 * 60 * 60 * 1000);
  var startDateString = startDate.toISOString().substring(0, 10).replace(/-/g, '/');
  var endDateString = today.toISOString().substring(0, 10).replace(/-/g, '/');
  var docName = `Email Summary Report ${inboxType} ${startDateString} to ${endDateString}`;
  var doc = getOrCreateDocument(docName);
  var body = doc.getBody();
  body.clear();
  
  var searchQuery = `after:${startDateString} `;
  searchQuery += (onlyUnread ? 'is:unread' : '') + `category:${inboxType}`;
  console.log(searchQuery);
  var threads = GmailApp.search(searchQuery);
  
  threads.forEach(thread => {
    var messages = GmailApp.getMessagesForThreads([thread])[0]; // Assuming fetching first message per thread
    messages.forEach(message => {
      if (message.isUnread()) {
        var messageId = message.getId();
          var sender = extractSenderName(message.getFrom());
        var date = message.getDate();
        var summary = summarize(message.getSubject(), message.getPlainBody());
        
        // Add content to the document
        var emailLink = "https://mail.google.com/mail/u/0/#inbox/" + messageId;
        var senderDateText = `${sender} (${date.toLocaleDateString()})`;
        body.appendParagraph(senderDateText).setBold(true);
        var summaryParagraph = body.appendParagraph(summary);
        summaryParagraph.setBold(false);
        var linkParagraph = body.appendParagraph(emailLink)
        linkParagraph.setLinkUrl(emailLink);
        linkParagraph.setBold(false);  // Link in normal text
        body.appendHorizontalRule(); // Adds a visual separator
      }
    });
  });
  
  doc.saveAndClose(); // Save and close the document
  Logger.log('Document created: ' + doc.getUrl());
}

// Gets the existing document or creates the document if not found.
function getOrCreateDocument(docName) {
  var files = DriveApp.getFilesByName(docName);
  if (files.hasNext()) {
    return DocumentApp.openById(files.next().getId());
  } else {
    return DocumentApp.create(docName);
  }
}

// From the google sender name, only extract the name portion.
function extractSenderName(fromField) {
  // Extracts the sender's name by trimming off the email part.
  var nameMatch = fromField.match(/(.*)\s+</); // Matches 'Name <email>'
  return nameMatch ? nameMatch[1] : fromField; // Returns the name or the whole field if no match
}

// Call OpenAI and summarize the email.
function summarize(subject, body) {
  var apiKey = openaiApiKey;  // Ensure to replace this with your actual API key from OpenAI
  var apiURL = "https://api.openai.com/v1/chat/completions";

  body = body.substring(0,3000)
  user_message = "Here's the email:\nSubject: " + subject +"\nBody: " + body;
  // Configure the data payload as specified
  var data = {
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "system",
        "content": summarizationInstruction
      },
      {
        "role": "user",
        "content": user_message
      }
    ],
    "temperature": 0.1, // Keep it 0.1 to keep LLM from mischief. Increase at your own risk.
    "max_tokens": 3000, // Modify per your long email requirement and token budget.
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0
  };


  // Set up the requestOptions including headers and payload
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + apiKey  // Use the API key securely
    },
    payload: JSON.stringify(data),
    muteHttpExceptions: true  // Useful for debugging by preventing exception throw on HTTP error responses
  };
  
  // Execute the HTTP request and handle the response
  try {
    var response = UrlFetchApp.fetch(apiURL, options);
    var responseCode = response.getResponseCode();
    var responseBody = response.getContentText();

    if (responseCode === 200) {
      var responseJson = JSON.parse(responseBody);
      return responseJson.choices[0].message.content.trim();  // Return the first choice's text trimmed of whitespace
    } else {
      console.error("Non-success response (" + responseCode + "): " + responseBody);
      return "Error";
    }
  } catch (error) {
    console.error("Exception caught during API request:", error.toString());
    return "Error";
  }
}



/*
Developed by: Chetan Kumar @ Coremaitri and GPT-4-Turbo @ OpenAI
Developer email: chetankumar.work@gmail.com
Date Created: 13/08/2024

   _,.----.  ,--.-,,-,--,    ,----.  ,--.--------.   ,---.      .-._                ,--.-.,-.                     ___    ,---.                   
 .' .' -   \/==/  /|=|  | ,-.--` , \/==/,  -   , -\.--.'  \    /==/ \  .-._        /==/- |\  \ .--.-. .-.-..-._ .'=.'\ .--.'  \      .-.,.---.   
/==/  ,  ,-'|==|_ ||=|, ||==|-  _.-`\==\.-.  - ,-./\==\-/\ \   |==|, \/ /, /       |==|_ `/_ //==/ -|/=/  /==/ \|==|  |\==\-/\ \    /==/  `   \  
|==|-   |  .|==| ,|/=| _||==|   `.-. `--`\==\- \   /==/-|_\ |  |==|-  \|  |        |==| ,   / |==| ,||=| -|==|,|  / - |/==/-|_\ |  |==|-, .=., | 
|==|_   `-' \==|- `-' _ /==/_ ,    /      \==\_ \  \==\,   - \ |==| ,  | -|        |==|-  .|  |==|- | =/  |==|  \/  , |\==\,   - \ |==|   '='  / 
|==|   _  , |==|  _     |==|    .-'       |==|- |  /==/ -   ,| |==| -   _ |        |==| _ , \ |==|,  \/ - |==|- ,   _ |/==/ -   ,| |==|- ,   .'  
\==\.       /==|   .-. ,\==|_  ,`-._      |==|, | /==/-  /\ - \|==|  /\ , |        /==/  '\  ||==|-   ,   /==| _ /\   /==/-  /\ - \|==|_  . ,'.  
 `-.`.___.-'/==/, //=/  /==/ ,     /      /==/ -/ \==\ _.\=\.-'/==/, | |- |        \==\ /\=\.'/==/ , _  .'/==/  / / , |==\ _.\=\.-'/==/  /\ ,  ) 
            `--`-' `-`--`--`-----``       `--`--`  `--`        `--`./  `--`         `--`      `--`..---'  `--`./  `--` `--`        `--`-`--`--'  
*/
