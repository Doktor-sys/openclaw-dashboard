const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

async function sendEmail(to, subject, text) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'OpenClaw Bot <noreply@openclaw.com>',
      to,
      subject,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('E-Mail gesendet:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('E-Mail-Fehler:', error);
    return { success: false, error: error.message };
  }
}

async function sendTaskCompletedNotification(taskInfo) {
  const to = process.env.NOTIFICATION_EMAIL || '';
  if (!to) {
    console.log('Keine E-Mail-Adresse konfiguriert');
    return { success: false, error: 'No email configured' };
  }

  const subject = '✅ OpenClaw: Aufgabe erledigt';
  const text = `
Hallo!

Eine Aufgabe wurde erfolgreich erledigt:

${taskInfo.title}
${taskInfo.description ? `Beschreibung: ${taskInfo.description}` : ''}
Zeitstempel: ${new Date().toLocaleString('de-DE')}

Viele Grüße
OpenClaw Bot
  `.trim();

  return sendEmail(to, subject, text);
}

async function sendBotStatusNotification(status) {
  const to = process.env.NOTIFICATION_EMAIL || '';
  if (!to) {
    return { success: false, error: 'No email configured' };
  }

  const subject = `ℹ️ OpenClaw Bot: Status - ${status}`;
  const text = `
Hallo!

Der OpenClaw Bot-Status hat sich geändert:

Neuer Status: ${status}
Zeitstempel: ${new Date().toLocaleString('de-DE')}

Viele Grüße
OpenClaw Bot
  `.trim();

  return sendEmail(to, subject, text);
}

module.exports = {
  sendEmail,
  sendTaskCompletedNotification,
  sendBotStatusNotification
};
