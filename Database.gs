/**
 * @file Database.gs
 * Data access layer.
 * Handles all reads and writes to the Google Sheet.
 */

// ===================================================================
// CONFIGURATION
// ===================================================================

// !!! IMPORTANT: Replace with your spreadsheet ID !!!
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; 
const SHEET_NAME_RESERVATIONS = "Reservations";
const SHEET_NAME_ROOMS = "Rooms";

// ===================================================================
// "INTERNAL" FUNCTIONS (used by Code.gs)
// ===================================================================

/**
 * Fetches the main reservations spreadsheet.
 * @return {GoogleAppsScript.Spreadsheet.Sheet} The spreadsheet object.
 */
function _getSheetReservas() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_RESERVATIONS);
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME_RESERVATIONS}" not found.`);
  }
  return sheet;
}

/**
  * Searches for the room spreadsheet.
  * @return {GoogleAppsScript.Spreadsheet.Sheet} The spreadsheet object.
  */
function _getSheetRooms() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_ROOMS);
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME_ROOMS}" not found.`);
  }
  return sheet;
}

/**
 * Fetches ALL the data from the reservations spreadsheet.
 * @return {Array<Array<any>>} Matrix with all the data.
 */
function _getAllReservationsRaw() {
  const sheet = _getSheetReservations();
  return sheet.getDataRange().getValues();
}

/**
 * Adds a new row to the reservations spreadsheet.
 * @param {object} formattedData Already validated reservation data.
 */
function _appendReservation(formattedData) {
  const sheet = _getSheetReservas();
  const timestamp = new Date();
  
  sheet.appendRow([
    formattedData.room,                // Coluna A
    formattedData.email,               // Coluna B
    formattedData.subject,             // Coluna C
    formattedData.requester,        // Coluna D
    formattedData.start,              // Coluna E
    formattedData.end,                 // Coluna F
    formattedData.participants,       // Coluna G
    formattedData.eventType,          // Coluna H
    formattedData.details,            // Coluna I
    formattedData.participantsEmails, // Coluna J
    timestamp                            // Coluna J (Timestamp da reserva)
  ]);
}

/**
 * Fetches the list of rooms from the "Rooms" spreadsheet.
 * @return {Array<string>} A simple list of room names.
 */
function _getRooms() {
  const sheet = _getSheetRooms();
  // Assume that the rooms are in Column A, starting from row 2
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  
  // Converts [["Room 1"], ["Room 2"]] into ["Room 1", "Room 2"]
  return data.map(row => row[0]); 
}

/**
 * Deletes a row from the "Reservations" spreadsheet based on the index (id).
 * @param {number} id The row index (i) coming from the frontend.
 */
function _deleteRow(id) {
  const sheet = _getSheetReservations();
  // id is the index 'i' (starts at 1), which corresponds to the row 'id + 1' in the spreadsheet
  sheet.deleteRow(id + 1); 
}

/**
 * Updates an existing row in the "Reservations" spreadsheet.
 * @param {number} id The row index (i) coming from the frontend.
 * @param {object} formattedData The object containing the new data.
 */
function _updateRow(id, formattedData) {
  const sheet = _getSheetReservas();
  const row = id + 1; // Converts index to line number
  
  // Define the values for the 6 columns (A through F)
  sheet.getRange(row, 1, 1, 10).setValues([[
    formattedData.room,
    formattedData.email,
    formattedData.subject,
    formattedData.requester,
    formattedData.start,
    formattedData.end,
    formattedData.participants,
    formattedData.eventType,
    formattedData.details,
    formattedData.participantsEmails
  ]]);
}

/**
 * Retrieves the data of a single reservation row.
 * @param {number} id The index of the row (i) coming from the frontend.
 * @return {Array} An array with the row's data.
 */
function _getSingleReservationRaw(id) {
  const sheet = _getSheetReservations();
  const row = id + 1; // Converts index to line number
  
  // Reads 1 row, 10 columns (A to J)
  const data = sheet.getRange(row, 1, 1, 10).getValues(); 
  
  return data[0]; // Returns the first (and only) row of the array
}
