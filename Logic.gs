/**
 * @file Logic.gs
 * Business rules of the application.
 * Ex: Checking for schedule conflicts.
 */

/**
 * Checks if a new reservation time conflicts with existing reservations.
 * @param {string} room The room for the new reservation.
 * @param {Date} newStart The start time of the new reservation.
 * @param {Date} newEnd The end time of the new reservation.
 * @param {number | null} excludeId The row index (id) to ignore (for edits).
 * @return {boolean} True if there is a conflict, False otherwise.
 */
function _hasConflict(room, startNew, endNew, excludeId = null) {
  const allReservations = _getAllReservationsRaw();
  
  for (let i = 1; i < allReservations.length; i++) {
    if (i === excludeId) {
      continue; 
    }

    const reservation = allReservations[i];
    const roomSheet = reservation[0]; // Coluna A
    
    if (roomSheet !== room) {
      continue;
    }
    
    const startSheet = new Date(reservation[4]); // Collumn E
    const endSheet = new Date(reservation[5]); // Collumn F
    
    if (startNew < endSheet && endNew > startSheet) {
      return true;
    }
  }
  return false; 
}
