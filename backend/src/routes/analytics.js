const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/stats', analyticsController.getStats.bind(analyticsController));
router.post('/reset', analyticsController.resetAnalytics.bind(analyticsController));

module.exports = router;
