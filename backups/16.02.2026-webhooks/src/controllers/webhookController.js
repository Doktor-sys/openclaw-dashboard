const axios = require('axios');

const webhookLogs = [];

async function sendWebhook(req, res) {
  try {
    const { platform, message, webhookUrl } = req.body;
    
    if (!platform || !message || !webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'Plattform, Nachricht und Webhook URL erforderlich'
      });
    }

    let formattedMessage = {};
    
    if (platform === 'slack') {
      formattedMessage = { text: message };
    } else if (platform === 'discord') {
      formattedMessage = { content: message };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Plattform muss slack oder discord sein'
      });
    }

    await axios.post(webhookUrl, formattedMessage);
    
    const logEntry = {
      id: Date.now().toString(),
      platform,
      message: message.substring(0, 100),
      success: true,
      timestamp: new Date().toISOString()
    };
    webhookLogs.unshift(logEntry);
    
    if (webhookLogs.length > 100) webhookLogs.pop();

    res.json({
      success: true,
      message: `Nachricht an ${platform} gesendet`
    });

  } catch (err) {
    console.error('Webhook Fehler:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

function getWebhookLogs(req, res) {
  res.json({
    success: true,
    logs: webhookLogs.slice(0, 20)
  });
}

module.exports = {
  sendWebhook,
  getWebhookLogs,
  getWebhookSettings: () => ({})
};
