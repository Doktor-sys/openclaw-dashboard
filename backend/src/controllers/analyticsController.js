const db = require('../config/database');

const COST_PER_1K_TOKENS = {
  'openai-gpt4': { input: 0.015, output: 0.075 },
  'openai-gpt35': { input: 0.0005, output: 0.002 },
  'anthropic': { input: 0.003, output: 0.015 },
  'kimi': { input: 0.0, output: 0.0 },
  'weather': { input: 0.0, output: 0.0 },
  'github': { input: 0.0, output: 0.0 },
  'newsletter': { input: 0.0, output: 0.0 }
};

class AnalyticsController {
  async logApiCall(req, res, next) {
    const startTime = Date.now();
    const endpoint = req.path;
    
    // Skip tracking analytics and health endpoints
    if (endpoint.startsWith('/analytics') || endpoint === '/health') {
      return next();
    }
    
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      if (statusCode >= 200 && statusCode < 300) {
        analyticsController.logCall(req.user?.id || 0, endpoint, duration, statusCode, req.body?.model || 'unknown').catch(console.error);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  }

  async logCall(userId, endpoint, duration, statusCode, model = 'unknown') {
    try {
      await db.query(
        `INSERT INTO analytics (user_id, endpoint, duration_ms, status_code, model) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, endpoint, duration, statusCode, model]
      );
    } catch (err) {
      console.error('Error logging analytics:', err.message);
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

      const recentCalls = await db.query(
        `SELECT * FROM analytics ORDER BY created_at DESC LIMIT 20`
      );

      const costEstimate = this.estimateCost(callsByEndpoint.rows);

      res.json({
        success: true,
        period,
        summary: {
          totalCalls: parseInt(totalCalls.rows[0].count),
          avgDuration: callsByEndpoint.rows.reduce((acc, r) => acc + parseFloat(r.avg_duration || 0), 0) / (callsByEndpoint.rows.length || 1)
        },
        byEndpoint: callsByEndpoint.rows,
        byDay: callsByDay.rows,
        recentCalls: recentCalls.rows,
        costEstimate
      });
    } catch (err) {
      console.error('Analytics error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  estimateCost(callsByEndpoint) {
    let totalCost = 0;
    const breakdown = {};

    for (const call of callsByEndpoint) {
      const endpoint = call.endpoint;
      let provider = 'other';
      
      if (endpoint.includes('code') || endpoint.includes('agent')) provider = 'openai-gpt4';
      if (endpoint.includes('kimi')) provider = 'kimi';
      if (endpoint.includes('anthropic')) provider = 'anthropic';
      if (endpoint.includes('weather')) provider = 'weather';
      if (endpoint.includes('github')) provider = 'github';
      if (endpoint.includes('newsletter')) provider = 'newsletter';

      const tokensEstimate = parseInt(call.count) * 1000;
      const costs = COST_PER_1K_TOKENS[provider] || { input: 0.001, output: 0.002 };
      const cost = (tokensEstimate / 1000) * (costs.input + costs.output);
      
      totalCost += cost;
      breakdown[provider] = (breakdown[provider] || 0) + cost;
    }

    return { total: totalCost, breakdown };
  }

  async resetAnalytics(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-for-development-only';
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Nur Administratoren können Analytics zurücksetzen' });
      }

      await db.query('DELETE FROM analytics');
      res.json({ success: true, message: 'Analytics zurückgesetzt' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

const analyticsController = new AnalyticsController();
module.exports = analyticsController;
