const authController = require('../controllers/authController');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Kein Token bereitgestellt' });
  }

  const decoded = authController.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Ungültiger oder abgelaufener Token' });
  }

  req.user = decoded;
  next();
};

module.exports = authMiddleware;