import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import User from '../models/User.js';

let transporter;
export function getTransporter() {
  // If SMTP not configured, skip sending
  if (!process.env.SMTP_HOST) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

function render(template, context) {
  return handlebars.compile(template)(context);
}

export async function sendRegistrationOpenEmail(registration, recipients) {
  const t = getTransporter();
  if (!t) return; // SMTP disabled
  const subject = `New placement registration: ${registration.companyNameCached}`;
  const html = render(
    `<p>Hello,</p>
     <p>Registration has opened for <b>{{company}}</b> (Batch {{batch}}).</p>
     <p>Drive Date: {{date}}</p>
     <p>Visit: {{link}}</p>`,
    {
      company: registration.companyNameCached,
      batch: registration.batch,
      date: new Date(registration.driveDate).toLocaleString(),
      link: `${process.env.FRONTEND_URL}/company/${encodeURIComponent(registration.companyNameCached)}/register`,
    }
  );
  const toList = recipients.join(',');
  if (!toList) return;
  await t.sendMail({ from: process.env.SMTP_USER || 'noreply@example.com', to: toList, subject, html });
}

export async function sendDriveReminderEmail(registration) {
  const t = getTransporter();
  if (!t) return; // SMTP disabled
  const subject = `Reminder: ${registration.companyNameCached} drive tomorrow`;
  const html = render(
    `<p>Reminder: Drive for <b>{{company}}</b> is scheduled for tomorrow ({{date}}).</p>
     <p>See details at {{link}}</p>`,
    {
      company: registration.companyNameCached,
      date: new Date(registration.driveDate).toLocaleString(),
      link: `${process.env.FRONTEND_URL}/drive/${encodeURIComponent(registration.companyNameCached)}`,
    }
  );
  // For demo: not querying all students; in real code, filter registrants
  const to = process.env.SMTP_USER;
  if (!to) return;
  await t.sendMail({ from: process.env.SMTP_USER || 'noreply@example.com', to, subject, html });
}

export async function sendPlacedEmail(companyName, studentEmail) {
  const t = getTransporter();
  if (!t) return; // SMTP disabled
  const subject = `Congratulations! Placement at ${companyName}`;
  const html = render(
    `<p>Congratulations on being placed at <b>{{company}}</b>!</p>
     <p>Please submit your interview experience to help other students: <a href="{{link}}">Share your experience</a></p>
     <p>Your experience will be reviewed by staff before being published.</p>`,
    {
      company: companyName,
      link: `${process.env.FRONTEND_URL}/company/${encodeURIComponent(companyName)}/add-interview-experience`,
    }
  );
  await t.sendMail({ from: process.env.SMTP_USER || 'noreply@example.com', to: studentEmail, subject, html });
}

export async function sendDriveCreatedEmail(drive, registration) {
  const companyName = registration.companyNameCached || 'Unknown Company';
  const driveDate = new Date(drive.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const driveTime = new Date(drive.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Create rounds information
  let roundsInfo = '';
  if (drive.rounds && drive.rounds.length > 0) {
    roundsInfo = '<h3 style="color: #2c3e50; margin-top: 25px;">Interview Rounds:</h3><ul style="margin: 10px 0; padding-left: 20px;">';
    drive.rounds.forEach((round, index) => {
      roundsInfo += `<li style="margin: 8px 0;"><strong>Round ${index + 1}:</strong> ${round.name}`;
      if (round.description) {
        roundsInfo += ` - ${round.description}`;
      }
      roundsInfo += '</li>';
    });
    roundsInfo += '</ul>';
  }
  
  // Create eligibility information
  let eligibilityInfo = '';
  if (registration.eligibility) {
    eligibilityInfo = '<h3 style="color: #2c3e50; margin-top: 25px;">Eligibility Criteria:</h3><ul style="margin: 10px 0; padding-left: 20px;">';
    if (registration.eligibility.minCgpa) {
      eligibilityInfo += `<li style="margin: 8px 0;">Minimum CGPA: ${registration.eligibility.minCgpa}</li>`;
    }
    if (registration.eligibility.maxArrears !== undefined) {
      eligibilityInfo += `<li style="margin: 8px 0;">Maximum Current Arrears: ${registration.eligibility.maxArrears}</li>`;
    }
    if (registration.eligibility.maxHistoryArrears !== undefined) {
      eligibilityInfo += `<li style="margin: 8px 0;">Maximum History of Arrears: ${registration.eligibility.maxHistoryArrears}</li>`;
    }
    if (registration.eligibility.minTenthPercent) {
      eligibilityInfo += `<li style="margin: 8px 0;">Minimum 10th Percentage: ${registration.eligibility.minTenthPercent}%</li>`;
    }
    if (registration.eligibility.minTwelfthPercent) {
      eligibilityInfo += `<li style="margin: 8px 0;">Minimum 12th Percentage: ${registration.eligibility.minTwelfthPercent}%</li>`;
    }
    if (registration.eligibility.acceptedBatches && registration.eligibility.acceptedBatches.length > 0) {
      eligibilityInfo += `<li style="margin: 8px 0;">Eligible Batches: ${registration.eligibility.acceptedBatches.join(', ')}</li>`;
    }
    eligibilityInfo += '</ul>';
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">New Placement Drive Announcement</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
        <h3 style="color: #34495e; margin-top: 0; font-size: 24px;">${companyName}</h3>
        <p style="margin: 8px 0;"><strong>Drive Date:</strong> ${driveDate}</p>
        <p style="margin: 8px 0;"><strong>Time:</strong> ${driveTime}</p>
        <p style="margin: 8px 0;"><strong>Batch:</strong> ${registration.batch}</p>
      </div>
      
      ${eligibilityInfo}
      
      ${roundsInfo}
      
      <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
        <p style="margin: 0;"><strong>Action Required:</strong> Please visit the PlaceMate portal to register for this drive if you meet the eligibility criteria.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/company/${encodeURIComponent(companyName)}/register" 
           style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Register for Drive
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 14px;">
        <p>This is an automated notification from PlaceMate. Please do not reply to this email.</p>
        <p>For any queries, please contact the placement office.</p>
      </div>
    </div>
  `;
  
  return html;
}

export async function getAllStudentEmails() {
  try {
    const students = await User.find({ role: 'student' }, 'email');
    return students.map(student => student.email).filter(email => email);
  } catch (error) {
    console.error('Error fetching student emails:', error);
    return [];
  }
}

export async function sendDriveNotificationToAllStudents(drive, registration) {
  const t = getTransporter();
  if (!t) {
    console.log('SMTP not configured, skipping email notification');
    return;
  }

  try {
    const studentEmails = await getAllStudentEmails();
    if (studentEmails.length === 0) {
      console.log('No student emails found, skipping notification');
      return;
    }

    const companyName = registration.companyNameCached || 'Unknown Company';
    const driveDate = new Date(drive.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const subject = `New Placement Drive: ${companyName} - ${driveDate}`;
    const html = await sendDriveCreatedEmail(drive, registration);
    
    // Send to all students
    const toList = studentEmails.join(',');
    await t.sendMail({ 
      from: process.env.SMTP_USER || 'noreply@example.com', 
      to: toList, 
      subject, 
      html 
    });
    
    console.log(`Drive notification sent to ${studentEmails.length} students for ${companyName}`);
  } catch (error) {
    console.error('Error sending drive notification emails:', error);
  }
}


