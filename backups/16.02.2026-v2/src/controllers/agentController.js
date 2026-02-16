const db = require('../config/database');

exports.getAgents = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM agents ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM agents WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const { name, type, model, description } = req.body;
    const result = await db.query(`
      INSERT INTO agents (name, type, model, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, type || 'general', model || 'minimax-m2.1-free', description || '']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, model, description, status, tasks_completed } = req.body;
    
    const result = await db.query(`
      UPDATE agents 
      SET name = COALESCE($2, name),
          type = COALESCE($3, type),
          model = COALESCE($4, model),
          description = COALESCE($5, description),
          status = COALESCE($6, status),
          tasks_completed = COALESCE($7, tasks_completed),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, name, type, model, description, status, tasks_completed]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM agents WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: error.message });
  }
};
