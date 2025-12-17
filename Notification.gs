/**
 * @file Notification.gs
 * Manages the sending of notification emails.
 */

const FIXED_COPY_EMAIL = "YOUR_RECEPTION_EMAIL";

/**
 * Sends a confirmation email to the user who made the reservation.
 * @param {object} formattedData Reservation data (with Date objects).
 */
function _sendConfirmationEmail(formattedData) {
  let email = "";
  try {
    email = formattedData.email;
    const subject = `Confirmação de Reserva: ${formattedData.subject} - ${formattedData.requester}`;
    
    // Formats dates to the local timezone (pt-BR)
    const optionsDate = { timeZone: "America/Sao_Paulo", day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = formattedData.start.toLocaleDateString('pt-BR', optionsDate);
    
    const startHour = formattedData.start.toLocaleTimeString('pt-BR', { timeZone: "America/Sao_Paulo", hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    const endHour = formattedData.end.toLocaleTimeString('pt-BR', { timeZone: "America/Sao_Paulo", hour: '2-digit', minute: '2-digit' }).replace(':', 'h');

    // E-mail body
    const body = `
      <p>Dear,</p>

      <p>We inform you that the meeting room reservation has been duly registered with the following details:</p>
      <p style="padding-left: 20px;">
        <strong>Date:</strong> ${formattedDate}<br>
        <strong>Schedule:</strong> From ${startHour} to ${endHour}<br>
        <strong>Room:</strong> ${formattedData.room}<br><br>

        <strong>Details:</strong> ${formattedData.details ? `${formattedData.details} - We will provide it as requested.` : 'No details requested.'}
      </p>

      <p><strong><em><u>Important guidelines:</u></em></strong></p>

      <ul>
        <li>Entry to the room will be allowed up to <strong>15 minutes</strong> after the originally scheduled time. After this period, the reservation will automatically be considered a no-show, and the room will be available for new requests..</li>
        <li>The use of the space may be extended for up to <strong>5 minutes</strong> after the scheduled end time, in order to allow for the proper conclusion of the meeting.</li>
        <li>I kindly request that you strictly adhere to the established schedules in order to ensure organization and the availability of spaces for all users..</li>
      </ul>

      <p>Best regards,</p>
    `;

    const signatureHtml = getGmailSignature();

    let ccEmails = [FIXED_COPY_EMAIL];

    if (formattedData.participantsEmails) {
      ccEmails = ccEmails.concat(formattedData.participantsEmails.split(';'));
    }

    const mailOptions = {
      htmlBody: body + signatureHtml,
      cc: [...new Set(ccEmails.filter(e => e && e.trim() !== ''))].join(',')
    };

    // Send the e-mail
    MailApp.sendEmail(email, subject, "", mailOptions);
    
    Logger.log(`Confirmation email sent to ${email} with CC to ${mailOptions.cc || 'nobody'}`);

  } catch (e) {
    Logger.log(`Failed to send confirmation email to ${email}: ${e.message}`);
  }
}

/**
 * Sends a reservation CHANGE email, comparing old and new data.
 * @param {object} formattedData The new reservation data.
 * @param {object} oldData The reservation data before editing.
 */
function _sendAlterationEmail(formattedData, oldData) {
  let email = "";
  try {
    email = formattedData.email;
    const subject = `ALTERAÇÃO de Reserva: ${formattedData.subject} - ${formattedData.requester}`;
    
    // --- 1. Format Dates/Times (New and Old) ---
    const optionsDate = { timeZone: "America/Sao_Paulo", day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = formattedData.start.toLocaleDateString('pt-BR', optionsDate);
    const oldFormattedDate = oldData.start.toLocaleDateString('pt-BR', optionsDate);
    
    const startHour = formattedData.start.toLocaleTimeString('pt-BR', { timeZone: "America/Sao_Paulo", hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    const oldStartHour = oldData.start.toLocaleTimeString('pt-BR', { timeZone: "America/Sao_Paulo", hour: '2-digit', minute: '2-digit' }).replace(':', 'h');

    const endHour = formattedData.end.toLocaleTimeString('pt-BR', { timeZone: "America/Sao_Paulo", hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    const oldEndHour = oldData.end.toLocaleTimeString('pt-BR', { timeZone: "America/Sao_Paulo", hour: '2-digit', minute: '2-digit' }).replace(':', 'h');

    // --- 2. Comparison Logic (HTML) ---
    const dateHtml = (formattedDate === oldFormattedDate) 
        ? formattedDate 
        : `<s>${oldFormattedDate}</s> <strong>${formattedDate}</strong>`;

    const scheduleHtml = (startHour === oldStartHour && endHour === oldEndHour)
        ? `From ${startHour} to ${endHour}`
        : `From <s>${oldStartHour}</s> <strong>${startHour}</strong> to <s>${oldEndHour}</s> <strong>${endHour}</strong>`;
    
    const localHtml = (formattedData.room === oldData.room)
        ? formattedData.room
        : `<s>${oldData.room}</s> <strong>${formattedData.room}</strong>`;

    const oldDetailsTxt = oldData.details ? `${oldData.details} - We will provide it as requested.` : 'No details requested.';
    const newDetailsTxt = formattedData.details ? `${formattedData.details} - We will provide it as requested.` : 'No details requested.';
    
    const detailsHtml = (formattedData.details === oldData.details)
        ? newDetailsTxt
        : `<s>${oldDetailsTxt}</s><br><strong>${newDetailsTxt}</strong>`;

    const subjectHtml = (formattedData.subject === oldData.subject)
        ? formattedData.subject
        : `<s>${oldData.subject}</s> <strong>${formattedData.subject}</strong>`;
    
    const eventTypeHtml = (formattedData.eventType === oldData.eventType)
        ? formattedData.eventType
        : `<s>${oldData.eventType}</s> <strong>${formattedData.eventType}</strong>`;
    
    const participantsHtml = (formattedData.participants === oldData.participants)
        ? formattedData.participants
        : `<s>${oldData.participants}</s> <strong>${formattedData.participants}</strong>`;
    

    // --- 3. Build the Email Body ---
    const body = `
      <p>Dear,</p>

      <p>We inform you that the meeting room reservation has been duly <strong>CHANGED</strong>. Here are the details (changes highlighted):</p>
      
      <p style="padding-left: 20px; line-height: 1.6;">
        <strong>Date:</strong> ${dateHtml}<br>
        <strong>Schedule:</strong> ${scheduleHtml}<br>
        <strong>Room:</strong> ${localHtml}<br><br>

        <strong>Subject:</strong> ${subjectHtml}<br>
        <strong>Event Type:</strong> ${eventTypeHtml}<br>
        <strong>Participants:</strong> ${participantsHtml}<br>
        <strong>Details:</strong> ${detailsHtml}
      </p>

      <p><strong><em><u>Important guidelines:</u></em></strong></p>
      <ul>
        <li>Entry to the room will be allowed up to <strong>15 minutes</strong> after the originally scheduled time. After this period, the reservation will automatically be considered a no-show, and the room will be available for new requests.</li>
        <li>The use of the space may be extended for up to <strong>5 minutes</strong> after the scheduled end time, in order to allow for the proper conclusion of the meeting.</li>
        <li>I kindly request that you strictly adhere to the established schedules in order to ensure organization and the availability of spaces for all users..</li>
      </ul>

      <p>Best regards,</p>
    `;
    
    // --- 4. Signature and Shipping Options ---
    const signatureHtml = getGmailSignature();

    let ccEmails = [FIXED_COPY_EMAIL];

    if (formattedData.participantsEmails) {
      ccEmails = ccEmails.concat(formattedData.participantsEmails.split(';'));
    };
    if (oldData.participantesEmails) {
      ccEmails = ccEmails.concat(oldData.participantsEmails.split(';'));
    };

    const mailOptions = {
      htmlBody: body + signatureHtml,
      cc: [...new Set(ccEmails.filter(e => e && e.trim() !== ''))].join(',')
    };

    // Send the e-mail
    MailApp.sendEmail(email, subject, "", mailOptions);
    
    Logger.log(`Change email sent to ${email} with CC to ${mailOptions.cc || 'nobody'}`);

  } catch (e) {
    Logger.log(`Failed to send change email to ${email}: ${e.message}`);
  }
}

/**
 * Sends a reservation CANCELLATION email.
 * @param {object} cancelledData The data of the reservation that was deleted.
 */
function _sendCancellationEmail(cancelledData) {
  let email = "";
  try {
    email = cancelledData.email;
    const subject = `Reservation Cancellation: ${cancelledData.subject} - ${cancelledData.requester}`;

    // Formats dates to the local timezone (pt-BR)
    const optionsDate = { timeZone: "America/Sao_Paulo", day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = cancelledData.start.toLocaleDateString('pt-BR', optionsDate);
    
    const startHour = cancelledData.start.toLocaleTimeString('pt-BR', { timeZone: "America/Sao_Paulo", hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    const endHour = cancelledData.end.toLocaleTimeString('pt-BR', { timeZone: "America/Sao_Paulo", hour: '2-digit', minute: '2-digit' }).replace(':', 'h');

    // E-mail body in HTML
    const body = `
      <p>Dear,</p>
      
      <p>We inform you that the meeting room reservation listed below has been <strong>CANCELLED</strong> successfully:</p>
      
      <p style="padding-left: 20px; border-left: 3px solid #d93025; color: #333;">
        <strong>Subject:</strong> ${cancelledData.subject}<br>
        <strong>Room:</strong> ${cancelledData.room}<br>
        <strong>Date:</strong> ${formattedDate}<br>
        <strong>Schedule:</strong> Das ${startHour} às ${endHour}
      </p>
      
      <p>This time slot is now available for new requests.</p>
      <p>Best regards,</p>
    `;

    const signatureHtml = getGmailSignature();

    let ccEmails = [FIXED_COPY_EMAIL];

    if (cancelledData.participantsEmails) {
      ccEmails = ccEmails.concat(cancelledData.participantsEmails.split(';'));
    }

    const mailOptions = {
      htmlBody: body + signatureHtml,
      cc: [...new Set(ccEmails.filter(e => e && e.trim() !== ''))].join(',')
    };

    // Send the e-mail
    MailApp.sendEmail(email, subject, "", mailOptions); 
    
    Logger.log(`CANCELLATION email sent to ${email}`);

  } catch (e) {
    Logger.log(`Failed to send cancellation email to ${email}: ${e.message}`);
  }
}

/**
  * Retrieves the user's default Gmail signature using the Advanced API.
  * Requires the "Gmail API" (Advanced Service) enabled.
  * @return {string} The signature in HTML.
  */
function getGmailSignature() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    
    // Fetches the user's 'Send As' settings
    const aliases = Gmail.Users.Settings.SendAs.list(userEmail);
    if (!aliases.sendAs) {
      Logger.log("No 'SendAs' alias found.");
      return "";
    }

    // Finds the main alias
    let primaryAlias = aliases.sendAs.find(alias => alias.isPrimary === true);
    if (!primaryAlias || !primaryAlias.signature) {
      primaryAlias = aliases.sendAs.find(alias => alias.signature);
    }

    if (primaryAlias && primaryAlias.signature) {
      return primaryAlias.signature;
    } else {
      Logger.log("No default signature found in the aliases.");
      return "";
    }
    
  } catch (e) {
    Logger.log("Error fetching signature via Gmail API: " + e.message);
    return ""; 
  }
}
