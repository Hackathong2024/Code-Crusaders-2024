// Define constants for your calendar ID, email details, and Telegram bot
const CONFIG = {
    CALENDAR_ID: '4cb310ecd3d5fe95b300cb5fea12934e1e2f2048f243a4f222ee94359da9dc11@group.calendar.google.com',
    SENDER_EMAIL: 'hackathong2024@gmail.com',
    TELEGRAM_BOT_TOKEN: '7325112928:AAFDv35jnSYrGkVY6HKHWaiAMEe1P9zdyw8',
    TELEGRAM_CHAT_ID: '-4212503471'
  };
  
  function sendEventReminders() {
    const events = getUpcomingEvents();
    if (events.length > 0) {
      events.forEach(event => {
        if (event) {
          Logger.log('Processing event: ' + event.getTitle());
          sendReminderEmail(event);
          sendTelegramReminder(event);
        } else {
          Logger.log('Skipping undefined event');
        }
      });
    } else {
      Logger.log('No upcoming events found');
    }
  }
  
  // Function to get events for the next day
  function getUpcomingEvents() {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow.setHours(0, 0, 0, 0));
    const end = new Date(tomorrow.setHours(23, 59, 59, 999));
    return calendar.getEvents(start, end);
  }
  
  function sendReminderEmail(event) {
    const recipients = getEventAttendees(event);
    const subject = `Reminder: ${event.getTitle()} on ${formatDate(event.getStartTime())}`;
    const body = createEmailBody(event);
    const attachments = getAttachments(event);
  
    Logger.log(`Number of attachments: ${attachments.length}`); // Log number of attachments
  
    MailApp.sendEmail({
      to: recipients,
      subject: subject,
      htmlBody: body,
      attachments: attachments,
      from: CONFIG.SENDER_EMAIL
    });
  }
  
  
  // Function to get attendees' email addresses
  function getEventAttendees(event) {
    return event.getGuestList().map(guest => guest.getEmail()).join(',');
  }
  
  // Function to create the email body content
  function createEmailBody(event) {
    return `
      <p>Dear Attendee,</p>
      <p>This is a reminder for the upcoming event:</p>
      <p><strong>${event.getTitle()}</strong></p>
      <p><strong>Date:</strong> ${formatDate(event.getStartTime())}</p>
      <p><strong>Time:</strong> ${formatTime(event.getStartTime())}</p>
      <p><strong>Location:</strong> ${event.getLocation() || 'No location specified'}</p>
      <p><strong>Description:</strong> ${event.getDescription() || 'No description'}</p>
      <p>Best regards,</p>
      <p>CodeCrusaders Team</p>
    `;
  }
  
  // Function to format date in a readable format
  function formatDate(date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'MMMM dd, yyyy');
  }
  
  // Function to format time in a readable format
  function formatTime(date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'hh:mm a');
  }
  
  function getAttachments(event) {
    if (!event) {
      Logger.log('Event is undefined in getAttachments function');
      return [];
    }
    
    const attachments = [];
    try {
      const files = DriveApp.getFilesByName(event.getTitle());
      while (files.hasNext()) {
        const file = files.next();
        attachments.push(file.getAs(file.getMimeType()));
      }
    } catch (error) {
      Logger.log('Error getting attachments: ' + error.toString());
    }
    return attachments;
  }
  
  
  
  // Function to send a reminder via Telegram
  function sendTelegramReminder(event) {
    const message = `
      Reminder for the upcoming event:
      *${event.getTitle()}*
      Date: ${formatDate(event.getStartTime())}
      Time: ${formatTime(event.getStartTime())}
      Location: ${event.getLocation() || 'No location specified'}
      Description: ${event.getDescription() || 'No description'}
    `;
  
    const payload = {
      method: "sendMessage",
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    };
  
    const options = {
      method: "post",
      payload: payload
    };
  
    const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
    UrlFetchApp.fetch(url, options);
  }
  