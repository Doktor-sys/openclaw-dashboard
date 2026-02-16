const axios = require('axios');

const webhookLogs = [];

async function sendWebhook(req, res) {
  try {
    const { platform, message, channel, data } = req.body;
    
    if (!platform || !message) {
      return res.status(400).json({
        success: false,
        error: 'Plattform und Nachricht erforderlich'
      });
    }

    let webhookUrl = null;
    let success = false;
    let error = null;

    // Get webhook URL from settings or request
    if (platform === 'slack') {
      webhookUrl = data?.webhookUrl || process.env.SLACK_WEBHOOK_URL;
    } else if (platform === 'discord') {
      webhookUrl = data?.webhookUrl || process.env.DISCORD_WEBHOOK_URL;
    } else if (platform === 'telegram') {
      // Telegram is handled by newsletter controller
      return res.status(400).json({
        success: false,
        error: 'Telegram wird über den Newsletter-Controller verwaltet'
      });
    }

    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        error: `Webhook URL für ${platform} nicht konfiguriert`
      });
    }

    // Format message based on platform
    let formattedMessage = message;
    
    if (platform === 'slack') {
      formattedMessage = {
        text: message,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          }
        ]
      };
    } else if (platform === 'discord') {
      formattedMessage = {
        content: message,
        embeds: data?.embeds || []
      };
    }

    // Send webhook
    await axios.post(webhookUrl, formattedMessage);
    success = true;

    // Log the webhook
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
      message: `Nachricht an ${platform} gesendet`,
      logId: logEntry.id
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
  const limit = parseInt(req.query.limit) || 20;
  
  res.json({
    success: true,
    logs: webhookLogs.slice(0, limit),
    total: webhookLogs.length
  });
}

function getWebhookSettings(req, res) {
  // Return which webhooks are configured (not the URLs)
  res.json({
    success: true,
    configured: {
      slack: !!process.env.SLACK_WEBHOOK_URL,
      discord: !!process.env.DISCORD_WEBHOOK_URL
    }
  });
}

module.exports = {
  sendWebhook,
  getWebhookLogs,
  getWebhookSettings
};
