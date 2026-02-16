const express = require('express');
const router = express.Router();
const codeGenerator = require('../controllers/codeGenerator');

// Code Generierung starten
router.post('/generate', codeGenerator.generateApp);

// Job Status abfragen
router.get('/status/:jobId', codeGenerator.getJobStatus);

// Alle generierten Apps auflisten
router.get('/apps', codeGenerator.listGeneratedApps);

module.exports = router;