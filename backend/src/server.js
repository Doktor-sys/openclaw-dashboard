const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const contextRoutes = require('./routes/context');
const agentRoutes = require('./routes/agents');
const settingsRoutes = require('./routes/settings');
const activityRoutes = require('./routes/activities');
const taskRoutes = require('./routes/tasks');
const uploadRoutes = require('./routes/uploads');
const statsRoutes = require('./routes/stats');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
const weatherRoutes = require('./routes/weather');
const codeGeneratorRoutes = require('./routes/codeGenerator');
const newsletterRoutes = require('./routes/newsletter');
const contextDocsRoutes = require('./routes/context-docs');
const githubRoutes = require('./routes/github');
const webhookRoutes = require('./routes/webhook');
const analyticsRoutes = require('./routes/analytics');
const backupRoutes = require('./routes/backup');
const analyticsController = require('./controllers/analyticsController');
const { initializeDatabase } = require('./config/init-db');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Analytics middleware
app.use('/api', analyticsController.logApiCall.bind(analyticsController));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/context', contextRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/code', codeGeneratorRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/context-docs', contextDocsRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/backup', backupRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

let botClient = null;
let botStatus = 'offline';

const broadcast = (type, payload) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, payload }));
    }
  });
};

// Make broadcast available to controllers
app.locals.broadcast = broadcast;

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'bot_register') {
      // Prüfe ob Bot noch aktiv ist
      if (botClient && botClient.readyState === WebSocket.OPEN) {
        console.log('Bot bereits registriert und aktiv.');
        ws.close();
        return;
      }
      // Alten Bot ersetzen wenn getrennt
      if (botClient) {
        console.log('Alter Bot wurde ersetzt.');
      }
      botClient = ws;
      botStatus = 'online';
      console.log('Bot registriert:', data.bot);
      broadcast('bot_online', { bot: 'OpenClaw Bot' });
    } else if (data.type === 'bot_status_update') {
      botStatus = data.status;
      
      if (data.status === 'idle') {
        broadcast('bot_idle', { status: 'idle' });
      } else if (data.status === 'online' || data.status === 'running') {
        broadcast('bot_online', { status: data.status });
      }
      
      broadcast('bot_status', { status: data.status, timestamp: data.timestamp });
    } else if (data.type === 'bot_unregister') {
      if (ws === botClient) {
        botClient = null;
        botStatus = 'offline';
        broadcast('bot_offline', { bot: 'OpenClaw Bot' });
      }
    } else if (data.type === 'task_update') {
      broadcast('task_update', data.payload);
    } else if (data.type === 'send_to_bot') {
      if (botClient && botClient.readyState === WebSocket.OPEN) {
        botClient.send(JSON.stringify({
          type: data.command,
          ...data.params
        }));
      }
    }
  });

  ws.on('close', () => {
    if (ws === botClient) {
      botClient = null;
      botStatus = 'offline';
      broadcast('bot_offline', { bot: 'OpenClaw Bot' });
    }
    console.log('WebSocket disconnected');
  });
});

app.post('/api/bot/command', (req, res) => {
  const { command, params } = req.body;
  
  if (botClient && botClient.readyState === WebSocket.OPEN) {
    botClient.send(JSON.stringify({
      type: 'bot_command',
      command: {
        action: command,
        ...params
      }
    }));
    res.json({ success: true, message: 'Befehl an Bot gesendet' });
  } else {
    res.status(503).json({ success: false, message: 'Bot nicht verbunden' });
  }
});

app.get('/api/bot/status', (req, res) => {
  res.json({
    connected: botClient !== null,
    status: botStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    server.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
