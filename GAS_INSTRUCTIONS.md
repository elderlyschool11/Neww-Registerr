# Google Apps Script Setup Instructions

Follow these steps to connect your website to Google Sheets:

1. Create a new **Google Sheet**.
2. Give it a name (e.g., "Elderly Registration").
3. Set the first row headers:
   - `Timestamp`
   - `LineID`
   - `DisplayName`
   - `FirstName`
   - `LastName`
   - `Age`
   - `Gender`
   - `Weight`
   - `Height`
   - `ChronicDiseases`
4. Go to **Extensions** > **Apps Script**.
5. Delete any existing code and paste the following:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(),
    data.lineId || "",
    data.displayName || "",
    data.firstName,
    data.lastName,
    data.age,
    data.gender,
    data.weight,
    data.height,
    data.chronicDiseases
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
```

6. Click **Deploy** > **New Deployment**.
7. Select **Web App**.
8. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
9. Copy the **Web App URL** and paste it into your `.env` file (or provide it to the app) as `VITE_GAS_URL`.

---
*Note: Ensure you allow the script to access your Google Sheets.*
