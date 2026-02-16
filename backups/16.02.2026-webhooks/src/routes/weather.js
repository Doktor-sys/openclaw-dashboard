const express = require('express');
const { getWeatherData, getWeatherIcon } = require('../controllers/weatherController');

const router = express.Router();

// Wetter-Daten für alle Städte
router.get('/data', getWeatherData);

// Wetter-Icon Helper
router.get('/icon/:condition', (req, res) => {
  const { condition } = req.params;
  const icon = getWeatherIcon(condition);
  res.json({ icon });
});

module.exports = router;