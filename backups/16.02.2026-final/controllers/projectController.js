const db = require('../config/database');

exports.getProjects = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count
      FROM projects p 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT p.*, 
        COALESCE(task_counts.task_count, 0) as task_count
      FROM projects p 
      LEFT JOIN (
        SELECT project_id, COUNT(*) as task_count 
        FROM tasks 
        GROUP BY project_id
      ) task_counts ON p.id = task_counts.project_id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const result = await db.query(`
      INSERT INTO projects (name, description, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description || '', status || 'active']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    const result = await db.query(`
      UPDATE projects 
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          status = COALESCE($4, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, name, description, status]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
};
