exports.getSettings = (req, res) => {
  res.json({
    serverConfig: {},
    apiKeys: {},
    notifications: { enabled: true }
  });
};

exports.updateSettings = (req, res) => {
  res.json({ ...req.body });
};