const express = require('express');
const router = express.Router();
const {
  sendNewsletter,
  getNewsletterLogs,
  getNewsletterStats,
  getTemplates
} = require('../controllers/newsletterController');

// Newsletter senden
router.post('/send', sendNewsletter);

// Verlauf abrufen
router.get('/logs', getNewsletterLogs);

// Statistiken
router.get('/stats', getNewsletterStats);

// Vorlagen
router.get('/templates', getTemplates);

module.exports = router;
