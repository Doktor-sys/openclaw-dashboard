const db = require('../config/database');

const COST_PER_CALL = {
  '/api/code': 0.001,
  '/api/agents': 0.0005,
  '/api/newsletter': 0.001,
  '/api/github': 0.0005,
  '/api/weather': 0,
  '/api/projects': 0,
  '/api/tasks': 0,
  '/api/context': 0
};

class AnalyticsController {
  async logApiCall(req, res, next) {
    const startTime = Date.now();
    const endpoint = req.path;
    
    // Skip tracking analytics endpoints
    if (endpoint.startsWith('/analytics')) {
      return next();
    }
    
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      if (statusCode >= 200 && statusCode < 300) {
        analyticsController.log(endpoint, duration, statusCode).catch(console.error);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  }

  async log(endpoint, duration, statusCode) {
    try {
      await db.query(
        `INSERT INTO analytics (endpoint, duration_ms, status_code) VALUES ($1, $2, $3)`,
        [endpoint, duration, statusCode]
      );
    } catch (err) {
      console.error('Analytics log error:', err.message);
    }
  }

  async getStats(req, res) {
    try {
      const { period = '7d' } = req.query;
      
      let dateFilter = "NOW() - INTERVAL '7 days'";
      if (period === '24h') dateFilter = "NOW() - INTERVAL '24 hours'";
      if (period === '30d') dateFilter = "NOW() - INTERVAL '30 days'";
      if (period === 'all') dateFilter = "NOW() - INTERVAL '100 years'";

      const totalCalls = await db.query(
        `SELECT COUNT(*) as count FROM analytics WHERE created_at > ${dateFilter}`
      );

      const avgResult = await db.query(
        `SELECT AVG(duration_ms) as avg FROM analytics WHERE created_at > ${dateFilter}`
      );

      const callsByEndpoint = await db.query(
        `SELECT endpoint, COUNT(*) as count, AVG(duration_ms) as avg_duration 
         FROM analytics WHERE created_at > ${dateFilter} 
         GROUP BY endpoint ORDER BY count DESC LIMIT 10`
      );

      const callsByDay = await db.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM analytics WHERE created_at > ${dateFilter} 
         GROUP BY DATE(created_at) ORDER BY date`
      );

      // Calculate cost
      let totalCost = 0;
      const breakdown = {};
      for (const row of callsByEndpoint.rows) {
        const cost = COST_PER_CALL[row.endpoint] || 0.0001;
        const c = parseInt(row.count) * cost;
        totalCost += c;
        breakdown[row.endpoint] = c;
      }

      res.json({
        success: true,
        period,
        summary: {
          totalCalls: parseInt(totalCalls.rows[0].count),
          avgDuration: Math.round(avgResult.rows[0].avg || 0)
        },
        byEndpoint: callsByEndpoint.rows,
        byDay: callsByDay.rows,
        costEstimate: { total: totalCost, breakdown }
      });
    } catch (err) {
      console.error('Analytics error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

const analyticsController = new AnalyticsController();
module.exports = analyticsController;
