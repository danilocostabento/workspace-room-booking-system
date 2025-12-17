/**
 * Function to open a dialog box with the link to the form.
 * This will be called by a custom menu or a button on the spreadsheet.
 */
function openPlatform() {
  // 1. Set the URL of your form (web app)
  const platformUrl = "PLATFORM_URL_HERE";

  // 2. Create the HTML content for the dialog box
  // - We use an <a> (link) tag with target="_blank" to open in a new tab.
  // - We add some styling to make it look nicer.
  const htmlOutput = HtmlService.createHtmlOutput(
    `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 10px;">
      <p>Click the button below to open the booking platform in a new tab.</p>
      <a href="${platformUrl}" target="_blank" rel="noopener noreferrer">
        <button style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Open Plataform</button>
      </a>
    </div>
    `
  )
  .setHeight(200);

  // 3. Display the dialog box to the user
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Access to the Reservation Control Platform");
}
