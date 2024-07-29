const MEETING_URL = 'https://meet.google.com/yjj-ouqb-cpu?hs=224'; // Replace with your Google Meet URL
const MEETING_CODE = MEETING_URL.split('/').pop().split('?')[0]; // Extract meeting code from URL
const FEEDBACK_FORM_URL = 'https://forms.gle/V4e8FNxcJ2ZaJbRq5'; // Replace with your Google Form URL
const SENDER_EMAIL = 'hackathong2024@gmail.com'; // Replace with your email

// Function to monitor Google Meet and set up a trigger to send feedback form
function monitorGoogleMeet() {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Look ahead 24 hours

    console.log(`Current time: ${now.toISOString()}`);
    console.log(`Searching for events from ${now.toISOString()} to ${futureDate.toISOString()}`);

    const calendarEvents = Calendar.Events.list('primary', {
      timeMin: now.toISOString(),
      timeMax: futureDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    console.log(`calendarEvents: ${JSON.stringify(calendarEvents)}`);

    if (!calendarEvents.items || calendarEvents.items.length === 0) {
      console.log('No calendar events found within the specified time range.');
      return;
    }

    console.log(`Found ${calendarEvents.items.length} events in the specified time range.`);

    let eventFound = false;

    for (const event of calendarEvents.items) {
      console.log(`Checking event: ${JSON.stringify(event)}`);
      if (event.hangoutLink && event.hangoutLink.includes(MEETING_CODE)) {
        console.log(`Event found with matching meeting code: ${event.hangoutLink}`);
        eventFound = true;
        const endTime = new Date(event.end.dateTime);
        console.log(`Setting trigger to send feedback at: ${endTime.toISOString()}`);
        ScriptApp.newTrigger('sendFeedbackToAttendees')
          .timeBased()
          .at(endTime)
          .create();
      }
    }

    if (!eventFound) {
      console.log('No meetings found with the given meeting code.');
    } else {
      console.log('Triggers set up to send feedback forms at meeting end times.');
    }
  } catch (error) {
    console.error('Error monitoring Google Meet:', error);
  }
}

// Function to send feedback form to all attendees of the meeting
function sendFeedbackToAttendees() {
  const now = new Date();
  const pastDate = new Date(now.getTime() - 15 * 60 * 1000); // Look back 15 minutes to account for delays

  console.log(`Searching for events that ended from ${pastDate.toISOString()} to ${now.toISOString()}`);

  const calendarEvents = Calendar.Events.list('primary', {
    timeMin: pastDate.toISOString(),
    timeMax: now.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  console.log(`calendarEvents: ${JSON.stringify(calendarEvents)}`);

  for (const event of calendarEvents.items) {
    if (event.hangoutLink && event.hangoutLink.includes(MEETING_CODE)) {
      const attendees = event.attendees.filter(attendee => attendee.responseStatus === 'accepted' || attendee.responseStatus === 'tentative');
      attendees.forEach(attendee => {
        sendFeedbackForm(attendee.email);
      });
      console.log('Feedback forms sent to all attendees of the ended meeting.');
      return; // Stop after finding the first matching event
    }
  }

  console.log('No recently ended meetings found with the given meeting code.');
}

// Function to send feedback form to an attendee
function sendFeedbackForm(email) {
  const subject = 'Thank you for attending the Google Meet';
  const body = `
    <p>Dear Attendee,</p>
    <p>Thank you for attending the Google Meet session.</p>
    <p>We value your feedback. Please take a moment to fill out this short feedback form: <a href="${FEEDBACK_FORM_URL}">Feedback Form</a></p>
    <p>Best regards,</p>
    <p>Your Team</p>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body,
    from: SENDER_EMAIL
  });

  console.log(`Feedback form sent to ${email}`);
}

// Function to set up a trigger to run the monitorGoogleMeet function every 5 minutes
function createMonitorTrigger() {
  ScriptApp.newTrigger('monitorGoogleMeet')
    .timeBased()
    .everyMinutes(5)
    .create();
}

// Function to delete all triggers (useful for cleanup)
function deleteAllTriggers() {
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

// Run this function once to create the monitor trigger
function setup() {
  deleteAllTriggers(); // Optional: clear any existing triggers
  createMonitorTrigger();
}

// Test the setup
function testSetup() {
  monitorGoogleMeet(); // Manually run the monitorGoogleMeet function to test
}
