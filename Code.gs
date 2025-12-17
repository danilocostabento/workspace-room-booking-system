/**
 * @file Code.gs
 * Main controller. Serves the Web App and acts as the
 * "router" for frontend calls.
 */

/**
 * Adds a custom menu to the Google Sheets interface.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Platform')
      .addItem('Open reservation control platform', 'openPlatform')
      .addToUi();
}

// ===================================================================
// 1. SERVE THE WEB APP
// ===================================================================

/**
 * Main function that is executed when the user accesses the Web App URL.
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle("Room Reservation System");
}

/**
 * Helper function to include HTML files (CSS, JS) inside another.
 * Used in index.html as <?!= include('styles'); ?>
 * @param {string} filename The name of the HTML file to be included.
 * @return {string} The content of the file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


// ===================================================================
// 2. "API" - FUNCTIONS CALLED BY THE FRONTEND
// (Use 'google.script.run' to call these)
// ===================================================================

/**
 * [API] Fetches reservations based on frontend filters.
 * @param {object} filters Object with { date: "YYYY-MM-DD", rooms: ["Room 1", "Room 2"] }
 * @return {Array} A list of reservation objects formatted for the frontend.
 */
function getReservationsByDate(filters) {
  try {
    const targetDate = new Date(filters.date + "T00:00:00-03:00"); 
    const filteredRooms = filters.rooms;
    
    const filterSubject = filters.subject ? filters.subject.toLowerCase() : "";
    const filterRequester = filters.requester ? filters.requester.toLowerCase() : "";

    const allReservations = _getAllReservationsRaw(); 
    const filteredReservations = [];

    for (let i = 1; i < allReservations.length; i++) {
      const reservation = allReservations[i];
      
      // --- Filter 1: Room (Col A) ---
      const room = reservation[0]; 
      if (!filteredRooms.includes(room)) {
        continue;
      }
      
      // --- Filter 2: Date (Col E) ---
      const start = new Date(reservation[4]); 
      const sameDate = start.getDate() === targetDate.getDate() &&
                       start.getMonth() === targetDate.getMonth() &&
                       start.getFullYear() === targetDate.getFullYear();
                       
      if (!sameDate) {
        continue;
      }
      
      // --- Filter 3: Subject (Col C) ---
      if (filterSubject) { 
        const subjectSheet = reservation[2].toLowerCase();
        if (!subjectSheet.includes(filterSubject)) {
          continue;
        }
      }
      
      // --- Filter 4: Requester (Col D) ---
      if (filterRequester) {
        const requesterSheet = reservation[3].toLowerCase();
        if (!requesterSheet.includes(filterRequester)) {
          continue;
        }
      }

      filteredReservations.push({
        id: i, 
        room: room,
        email: reservation[1],
        assunto: reservation[2],
        requester: reservation[3],
        startISO: start.toISOString(),
        endISO: (new Date(reservation[5])).toISOString(),
        participants: reservation[6],
        eventType: reservation[7],
        details: reservation[8],
        participantsEmails: reservation[9] || ""
      });
    }
    return filteredReservations;
    
  } catch (e) {
    Logger.log(e);
    return []; 
  }
}

/**
 * [API] Processes a new booking.
 * @param {object} bookingData Modal data (email, subject, room, date, start, end)
 * @return {string} Success message.
 * @throws {Error} Error message (conflict, etc.)
 */
function processReservation(reservationData) {
  try {
    // 1. Validate and format the data
    const formattedData = {
      email: reservationData.email,
      subject: reservationData.subject,
      requester: reservationData.requester,
      room: reservationData.room,
      start: new Date(reservationData.date + "T" + reservationData.start),
      end: new Date(reservationData.date + "T" + reservationData.end),
      participants: reservationData.participants,
      eventType: reservationData.eventType,
      details: reservationData.details,
      participantsEmails: reservationData.participantsEmails
    };

    // 2. Call the Business Logic (Logic.gs)
    const hasConflict = _hasConflict(
      formattedData.room, 
      formattedData.start, 
      formattedData.end,
      null
    );
    
    if (hasConflict) {
      throw new Error("Schedule Conflict! This room is already booked for the selected time period.");
    }
    
    // 3. Save to the Database (Database.gs)
    _appendReservation(formattedData);
    
    // 4. Send notification (Notification.gs)
    _sendConfirmationEmail(formattedData);
    
    // 5. Returns sucess
    return "Reservation successfully confirmed!";
    
  } catch (e) {
    Logger.log(e);
    throw new Error(e.message);
  }
}

/**
 * [API] Retrieves the list of rooms from the "Salas" spreadsheet.
 * @return {Array} Array of strings with the names of the rooms.
 */
function getRoomsList() {
  try {
    return _getRooms();
  } catch (e) {
    Logger.log(e);
    return [e.message];
  }
}

/**
 * [API] Returns the URL of the "database" spreadsheet.
 * @return {string} The URL of the spreadsheet.
 */
function getSheetUrl() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID).getUrl();
  } catch (e) {
    return "#";
  }
}

/**
 * [API] Deletes a reservation.
 * @param {number} id The ID (index i) of the reservation.
 * @return {string} Success message.
 */
function deleteReservation(id) {
  try {
    const cancelledDataRaw = _getSingleReservaRaw(id);
    const cancelledData = {
        sala: cancelledDataRaw[0],
        email: cancelledDataRaw[1],
        assunto: cancelledDataRaw[2],
        requisitante: cancelledDataRaw[3],
        inicio: new Date(cancelledDataRaw[4]),
        fim: new Date(cancelledDataRaw[5]),
        participantesEmails: cancelledDataRaw[9] || ""
    };

    _deleteRow(id);

    _sendCancellationEmail(cancelledData);

    return "Reservation successfully deleted!";
  } catch (e) {
    Logger.log(e);
    throw new Error("Failed to delete the reservation.");
  }
}

/**
 * [API] Updates an existing reservation.
 * @param {number} id The ID (index i) of the reservation.
 * @param {object} reservationData The new reservation data.
 * @return {string} Success message.
 */
function updateReservation(id, reservationData) {
  try {
    // 1. Format data (same as processReserva)
    const formattedData = {
      email: reservationData.email,
      subject: reservationData.subject,
      requester: reservationData.requester,
      room: reservationData.room,
      start: new Date(reservationData.date + "T" + reservationData.start),
      end: new Date(reservationData.date + "T" + reservationData.end),
      participants: reservationData.participants,
      eventType: reservationData.eventType,
      details: reservationData.details,
      participantsEmails: dadosReserva.participantsEmails
    };

    const oldDataRaw = _getSingleReservationRaw(id);
    const oldData = {
      email: oldDataRaw[1],
      subject: oldDataRaw[2],
      requester: oldDataRaw[3],
      room: oldDataRaw[0],
      start: new Date(oldDataRaw[4]),
      end: new Date(oldDataRaw[5]),
      participants: oldDataRaw[6],
      eventType: oldDataRaw[7],
      details: oldDataRaw[8],
      participantsEmails: oldDataRaw[9] || ""
    }
    
    // 2. Check conflict, EXCLUDING yourself
    const hasConflict = _hasConflict(
      formattedData.room, 
      formattedData.start, 
      formattedData.end,
      id
    );
    
    if (hasConflict) {
      throw new Error("Schedule Conflict! The room is already booked for the selected time period.");
    }
    
    // 3. Update the line
    _updateRow(id, formattedData);
    
    // 4. Send notification
    _sendAlterationEmail(formattedData, oldData);
    
    return "Reservation successfully updated!";
    
  } catch (e) {
    Logger.log(e);
    throw new Error(e.message);
  }
}
