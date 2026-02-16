const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

let stats = {
  totalRequests: 0,
  apiCalls: {},
  responseTimes: [],
  errors: [],
  serverUptime: Date.now(),
  botConnections: 0,
  fileUploads: 0
};

const API_DIR = path.join(__dirname, '../../uploads');

router.get('/overview', (req, res) => {
  const uptime = Date.now() - stats.serverUptime;
  
  const overview = {
    server: {
      uptime: Math.floor(uptime / 1000),
      uptimeFormatted: formatUptime(uptime),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    },
    database: {
      mode: 'demo',
      status: 'connected'
    },
    bot: {
      connected: stats.botConnections > 0,
      connections: stats.botConnections
    },
    uploads: {
      total: stats.fileUploads,
      directorySize: getDirectorySize(API_DIR)
    },
    api: {
      totalRequests: stats.totalRequests,
      callsPerEndpoint: stats.apiCalls
    }
  };

  res.json(overview);
});

router.get('/tasks', (req, res) => {
  const taskStats = {
    total: 0,
    byStatus: {
      todo: 0,
      in_progress: 0,
      done: 0
    },
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    },
    completionRate: 0,
    recentActivity: []
  };

  res.json(taskStats);
});

router.get('/projects', (req, res) => {
  const projectStats = {
    total: 0,
    active: 0,
    completed: 0,
    totalTasks: 0,
    avgTasksPerProject: 0,
    recentProjects: []
  };

  res.json(projectStats);
});

router.get('/activities', (req, res) => {
  res.json({
    recent: [],
    byType: {
      task: 0,
      auth: 0,
      system: 0,
      bot: 0
    }
  });
});

router.get('/performance', (req, res) => {
  const responseTimes = stats.responseTimes.slice(-100);
  
  res.json({
    responseTimes,
    avgResponseTime: responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0,
    errors: stats.errors.slice(-50),
    errorRate: stats.totalRequests > 0
      ? ((stats.errors.length / stats.totalRequests) * 100).toFixed(2)
      : 0
  });
});

router.get('/charts', (req, res) => {
  const charts = {
    tasksOverTime: generateTimeSeriesData(7, 'tasks'),
    activityOverTime: generateTimeSeriesData(7, 'activity'),
    taskDistribution: {
      status: [
        { name: 'Offen', value: 3 },
        { name: 'In Arbeit', value: 2 },
        { name: 'Erledigt', value: 4 }
      ],
      priority: [
        { name: 'Hoch', value: 4, color: '#ef4444' },
        { name: 'Mittel', value: 3, color: '#f59e0b' },
        { name: 'Niedrig', value: 2, color: '#10b981' }
      ]
    }
  };

  res.json(charts);
});

router.get('/health', (req, res) => {
  const checks = {
    server: { status: 'healthy', latency: 0 },
    database: { status: 'healthy', latency: 1 },
    storage: { status: 'healthy', freeSpace: 0 },
    memory: { status: 'healthy', usagePercent: 0 }
  };

  checks.memory.usagePercent = Math.round(
    (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
  );

  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');

  res.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks
  });
});

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function getDirectorySize(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const files = fs.readdirSync(dirPath);
    let totalSize = 0;
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
    return totalSize;
  } catch {
    return 0;
  }
}

function generateTimeSeriesData(days, type) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 10) + 1
    });
  }

  return data;
}

module.exports = router;
