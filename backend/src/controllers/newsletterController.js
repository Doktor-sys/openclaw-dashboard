const nodemailer = require('nodemailer');
const axios = require('axios');
const { sendEmail } = require('../services/email');

// Newsletter Versand-Log
const newsletterLogs = [];

/**
 * Newsletter über verschiedene Kanäle senden
 */
async function sendNewsletter(req, res) {
  try {
    const { title, content, channels, recipients } = req.body;

    if (!title || !content || !channels || channels.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Titel, Inhalt und mindestens ein Kanal erforderlich'
      });
    }

    const results = {
      email: { success: false, count: 0, error: null },
      telegram: { success: false, count: 0, error: null },
      whatsapp: { success: false, count: 0, error: null }
    };

    // E-Mail senden
    if (channels.includes('email')) {
      try {
        const emailRecipients = recipients?.email || [process.env.NOTIFICATION_EMAIL || ''];
        const validEmails = emailRecipients.filter(e => e && e.includes('@'));
        
        if (validEmails.length > 0) {
          for (const email of validEmails) {
            await sendEmail(email, title, content);
            results.email.count++;
          }
          results.email.success = true;
        } else {
          results.email.error = 'Keine gültigen E-Mail-Adressen konfiguriert';
        }
      } catch (error) {
        results.email.error = error.message;
        console.error('E-Mail Fehler:', error);
      }
    }

    // Telegram senden
    if (channels.includes('telegram')) {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatIds = recipients?.telegram || [process.env.TELEGRAM_CHAT_ID];

        if (!botToken) {
          results.telegram.error = 'Telegram Bot Token nicht konfiguriert';
        } else if (!chatIds || chatIds.length === 0) {
          results.telegram.error = 'Keine Telegram Chat IDs konfiguriert';
        } else {
          for (const chatId of chatIds) {
            if (chatId) {
              await sendTelegramMessage(botToken, chatId, `📧 *${title}*\n\n${content}`);
              results.telegram.count++;
            }
          }
          results.telegram.success = true;
        }
      } catch (error) {
        results.telegram.error = error.message;
        console.error('Telegram Fehler:', error);
      }
    }

    // WhatsApp senden
    if (channels.includes('whatsapp')) {
      try {
        const phoneNumbers = recipients?.whatsapp || [process.env.WHATSAPP_PHONE_NUMBER];
        
        if (!phoneNumbers || phoneNumbers.length === 0) {
          results.whatsapp.error = 'Keine WhatsApp Telefonnummern konfiguriert';
        } else {
          // Für Demo: Simulieren wir den WhatsApp-Versand
          // In Produktion: Twilio oder WhatsApp Business API verwenden
          for (const phone of phoneNumbers) {
            if (phone) {
              // Simulierter Versand
              console.log(`WhatsApp Nachricht an ${phone}: ${title}`);
              results.whatsapp.count++;
            }
          }
          
          // Prüfen ob Twilio konfiguriert ist
          if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
            // Echte Twilio-Integration
            for (const phone of phoneNumbers) {
              if (phone) {
                await sendWhatsAppTwilio(phone, title, content);
                results.whatsapp.count++;
              }
            }
            results.whatsapp.success = true;
          } else {
            results.whatsapp.success = true; // Demo-Modus
            results.whatsapp.note = 'Demo-Modus: WhatsApp Business API nicht konfiguriert';
          }
        }
      } catch (error) {
        results.whatsapp.error = error.message;
        console.error('WhatsApp Fehler:', error);
      }
    }

    // Log-Eintrag erstellen
    const logEntry = {
      id: Date.now().toString(),
      title,
      content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      channels,
      results,
      timestamp: new Date().toISOString(),
      status: Object.values(results).some(r => r.success) ? 'sent' : 'failed'
    };
    newsletterLogs.unshift(logEntry);

    // Nur letzte 100 Einträge behalten
    if (newsletterLogs.length > 100) {
      newsletterLogs.pop();
    }

    // Erfolgsantwort
    const hasSuccess = Object.values(results).some(r => r.success);
    
    res.json({
      success: hasSuccess,
      message: hasSuccess ? 'Newsletter versendet' : 'Newsletter konnte nicht versendet werden',
      results,
      logId: logEntry.id,
      timestamp: logEntry.timestamp
    });

  } catch (error) {
    console.error('Newsletter Fehler:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Telegram Nachricht senden
 */
async function sendTelegramMessage(botToken, chatId, message) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  await axios.post(url, {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  });
}

/**
 * WhatsApp über Twilio senden
 */
async function sendWhatsAppTwilio(to, title, body) {
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  await client.messages.create({
    body: `*${title}*\n\n${body}`,
    from: `whatsapp:${fromNumber}`,
    to: toNumber
  });
}

/**
 * Newsletter Verlauf abrufen
 */
function getNewsletterLogs(req, res) {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const logs = newsletterLogs.slice(offset, offset + limit);
  
  res.json({
    success: true,
    logs,
    total: newsletterLogs.length,
    limit,
    offset
  });
}

/**
 * Newsletter Statistiken
 */
function getNewsletterStats(req, res) {
  const stats = {
    total: newsletterLogs.length,
    sent: newsletterLogs.filter(l => l.status === 'sent').length,
    failed: newsletterLogs.filter(l => l.status === 'failed').length,
    byChannel: {
      email: newsletterLogs.filter(l => l.channels.includes('email')).length,
      telegram: newsletterLogs.filter(l => l.channels.includes('telegram')).length,
      whatsapp: newsletterLogs.filter(l => l.channels.includes('whatsapp')).length
    }
  };
  
  res.json({
    success: true,
    stats
  });
}

/**
 * Newsletter-Vorlagen verwalten
 */
const templates = [
  {
    id: 'welcome',
    name: 'Willkommen',
    title: 'Willkommen bei OpenClaw!',
    content: 'Danke für Ihre Anmeldung. Wir freuen uns, Sie an Bord zu haben!'
  },
  {
    id: 'update',
    name: 'Update-Benachrichtigung',
    title: '🎉 OpenClaw Dashboard Update',
    content: `Neue Features:
✨ Modernes Design
📱 Mobile Optimierung
🤖 Erweiterte KI-Agenten

Vielen Dank für Ihre Unterstützung!`
  },
  {
    id: 'weekly',
    name: 'Wochenbericht',
    title: 'Ihr OpenClaw Wochenbericht',
    content: 'Hier ist Ihr Zusammenfassung dieser Woche...'
  }
];

function getTemplates(req, res) {
  res.json({
    success: true,
    templates
  });
}

module.exports = {
  sendNewsletter,
  getNewsletterLogs,
  getNewsletterStats,
  getTemplates
};
