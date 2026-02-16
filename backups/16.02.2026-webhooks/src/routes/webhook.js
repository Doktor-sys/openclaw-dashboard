const express = require('express');
const router = express.Router();
const { sendWebhook, getWebhookLogs, getWebhookSettings } = require('../controllers/webhookController');

router.post('/send', sendWebhook);
router.get('/logs', getWebhookLogs);
router.get('/settings', getWebhookSettings);

module.exports = router;
