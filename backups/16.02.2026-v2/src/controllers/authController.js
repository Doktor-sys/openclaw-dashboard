const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-for-development-only';

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
      }

      const users = await this.getUsers();
      const user = users.find(u => u.username === username);

      if (!user) {
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen haben' });
      }

      const users = await this.getUsers();
      const existingUser = users.find(u => 
        u.username === username || u.email === email
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await this.saveUsers(users);

      const token = jwt.sign(
        { id: newUser.id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          createdAt: newUser.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Kein Token bereitgestellt' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const users = await this.getUsers();
      const user = users.find(u => u.id === decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'Benutzer nicht gefunden' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      });
    } catch (error) {
      res.status(401).json({ error: 'Ungültiger Token' });
    }
  }

  async logout(req, res) {
    res.json({ message: 'Erfolgreich ausgeloggt' });
  }

  async getUsers() {
    const fs = require('fs').promises;
    const path = require('path');
    const USERS_FILE = path.join(__dirname, '../../data/users.json');

    try {
      const content = await fs.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      const defaultUsers = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@openclaw.local',
          password: await bcrypt.hash('admin123', 10),
          createdAt: new Date().toISOString()
        }
      ];
      await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
      return defaultUsers;
    }
  }

  async saveUsers(users) {
    const fs = require('fs').promises;
    const path = require('path');
    const USERS_FILE = path.join(__dirname, '../../data/users.json');
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AuthController();