const express = require('express');
const router = express.Router();
const { sendTaskCompletedNotification } = require('../services/email');

router.post('/task-completed', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await sendTaskCompletedNotification({ title, description });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
