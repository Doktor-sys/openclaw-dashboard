const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-for-development-only';

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
      }

      const result = await db.query(
        'SELECT * FROM users WHERE username = $1 OR email = $1',
        [username]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'Benutzerkonto ist deaktiviert' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.created_at
        }
      });
    } catch (error) {
      console.error('Login error:', error);
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

      const existingCheck = await db.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
      }

      // Check if this is the first user - make them admin
      const userCount = await db.query('SELECT COUNT(*) FROM users');
      const isFirstUser = parseInt(userCount.rows[0].count) === 0;
      const role = isFirstUser ? 'admin' : 'user';

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, role, is_active) 
         VALUES ($1, $2, $3, $4, true) 
         RETURNING id, username, email, role, created_at`,
        [username, email, hashedPassword, role]
      );

      const newUser = result.rows[0];

      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.created_at
        }
      });
    } catch (error) {
      console.error('Register error:', error);
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
      
      const result = await db.query(
        'SELECT id, username, email, role, avatar, is_active, created_at FROM users WHERE id = $1',
        [decoded.id]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ error: 'Benutzer nicht gefunden' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'Benutzerkonto ist deaktiviert' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.created_at
      });
    } catch (error) {
      res.status(401).json({ error: 'Ungültiger Token' });
    }
  }

  async logout(req, res) {
    res.json({ message: 'Erfolgreich ausgeloggt' });
  }

  async getAllUsers(req, res) {
    try {
      const result = await db.query(
        'SELECT id, username, email, role, avatar, is_active, created_at FROM users ORDER BY created_at DESC'
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email, role, is_active, avatar } = req.body;
      const token = req.headers.authorization?.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Nur Administratoren können Benutzer bearbeiten' });
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (username) {
        updates.push(`username = $${paramCount++}`);
        values.push(username);
      }
      if (email) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (role) {
        updates.push(`role = $${paramCount++}`);
        values.push(role);
      }
      if (is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(is_active);
      }
      if (avatar !== undefined) {
        updates.push(`avatar = $${paramCount++}`);
        values.push(avatar);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, role, avatar, is_active`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Benutzer nicht gefunden' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization?.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Nur Administratoren können Benutzer löschen' });
      }

      if (decoded.id === parseInt(id)) {
        return res.status(400).json({ error: 'Sie können sich nicht selbst löschen' });
      }

      await db.query('DELETE FROM users WHERE id = $1', [id]);

      res.json({ message: 'Benutzer gelöscht' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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
