import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

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
     <p>Please submit your interview experience: <a href="{{link}}">Share experience</a></p>`,
    {
      company: companyName,
      link: `${process.env.FRONTEND_URL}/company/${encodeURIComponent(companyName)}/interview-experience`,
    }
  );
  await t.sendMail({ from: process.env.SMTP_USER || 'noreply@example.com', to: studentEmail, subject, html });
}


