/**
 * UJENZILINK — GOOGLE APPS SCRIPT WEB APP
 * Receives form submissions (Project Review intake + Contact page)
 * and writes them as rows into a Google Sheet.
 *
 * ─────────────────────────────────────────────
 * SETUP INSTRUCTIONS
 * ─────────────────────────────────────────────
 * 1. Go to https://sheets.google.com and create a new Spreadsheet.
 *    Name it something like "UjenziLink Submissions".
 *
 * 2. Create two tabs (sheet names must match exactly):
 *       - "ProjectReview"
 *       - "Contact"
 *    Add header rows to each (see HEADERS below for the exact columns).
 *
 * 3. In the Spreadsheet, go to Extensions → Apps Script.
 *    Delete any starter code and paste this entire file in.
 *
 * 4. Click Deploy → New deployment.
 *       - Type: Web app
 *       - Execute as: Me
 *       - Who has access: Anyone
 *    Click Deploy, authorize the permissions it asks for.
 *
 * 5. Copy the Web App URL it gives you (ends in /exec).
 *    Paste it into assets/js/main.js as the value of UJENZILINK_SCRIPT_URL.
 *
 * 6. Re-deploy ("Manage deployments" → edit → New version) any time
 *    you change this script.
 * ─────────────────────────────────────────────
 */

var HEADERS = {
  ProjectReview: [
    'Submitted At', 'Full Name', 'Phone Number', 'Email', 'Project Location',
    'Project Type', 'Current Stage', 'Managed By', 'Main Concern',
    'Budget Range', 'Local or Diaspora', 'Preferred Contact', 'Page URL'
  ],
  Contact: [
    'Submitted At', 'Name', 'Phone', 'Email', 'Subject', 'Message', 'Page URL'
  ]
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.sheet === 'ProjectReview' ? 'ProjectReview' : 'Contact';

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(HEADERS[sheetName]);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[sheetName]);
    }

    var row = buildRow(sheetName, data);
    sheet.appendRow(row);

    // Optional: email yourself a notification on new submissions.
    // Uncomment and set your email below to enable.
    // MailApp.sendEmail({
    //   to: "hello@ujenzilink.co.ke",
    //   subject: "New " + sheetName + " submission — UjenziLink",
    //   body: row.join("\n")
    // });

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buildRow(sheetName, data) {
  var ts = data.submittedAt || new Date().toISOString();
  if (sheetName === 'ProjectReview') {
    return [
      ts,
      data.fullName || '',
      data.phone || '',
      data.email || '',
      data.projectLocation || '',
      data.projectType || '',
      data.currentStage || '',
      data.managedBy || '',
      data.mainConcern || '',
      data.budgetRange || '',
      data.ownerType || '',
      data.preferredContact || '',
      data.pageUrl || ''
    ];
  }
  // Contact
  return [
    ts,
    data.name || '',
    data.phone || '',
    data.email || '',
    data.subject || '',
    data.message || '',
    data.pageUrl || ''
  ];
}

/**
 * Optional: lets you test the script directly in the Apps Script editor.
 * Select this function and click Run — check your Sheet for a test row.
 */
function testDoPost() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        sheet: 'ProjectReview',
        fullName: 'Test Owner',
        phone: '+254700000000',
        email: 'test@example.com',
        projectLocation: 'Kileleshwa, Nairobi',
        projectType: 'Residential home',
        currentStage: 'Foundation',
        managedBy: 'Contractor only',
        mainConcern: 'Want to confirm foundation is complete before next payment',
        budgetRange: 'Ksh 5M – 10M',
        ownerType: 'I am based abroad (diaspora)',
        preferredContact: 'WhatsApp',
        pageUrl: 'https://ujenzilink.co.ke/project-review.html'
      })
    }
  };
  var result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
