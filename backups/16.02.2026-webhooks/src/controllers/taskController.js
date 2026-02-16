const db = require('../config/database');

exports.getTasks = async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = `
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
    `;
    
    if (project_id) {
      query += ' WHERE t.project_id = $1';
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const params = project_id ? [project_id] : [];
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, project_id, status, priority } = req.body;
    const result = await db.query(`
      INSERT INTO tasks (title, description, project_id, status, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, description || '', project_id || null, status || 'todo', priority || 'medium']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, project_id, status, priority } = req.body;
    
    const result = await db.query(`
      UPDATE tasks 
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          project_id = COALESCE($4, project_id),
          status = COALESCE($5, status),
          priority = COALESCE($6, priority),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, title, description, project_id, status, priority]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = result.rows[0];
    
    // Broadcast task update to all connected clients
    if (req.app.locals.broadcast) {
      req.app.locals.broadcast('task_update', {
        taskId: id,
        status: updatedTask.status,
        title: updatedTask.title,
        timestamp: new Date().toISOString()
      });
    }
    
    // AUTOMATISCHE BOT-AKTION: Wenn Status auf "in_progress" und Keywords passen
    if (status === 'in_progress') {
      const taskTitle = updatedTask.title.toLowerCase();
      let appType = null;
      
      // Keyword-Erkennung
      if (taskTitle.includes('wetter') || taskTitle.includes('weather')) {
        appType = 'weather';
      } else if (taskTitle.includes('todo') || taskTitle.includes('aufgabe') || taskTitle.includes('task')) {
        appType = 'todo';
      } else if (taskTitle.includes('rechner') || taskTitle.includes('calculator') || taskTitle.includes('taschenrechner')) {
        appType = 'calculator';
      }
      
      // Wenn ein App-Typ erkannt wurde, starte Code-Generierung
      if (appType) {
        console.log(`[Auto-Bot] Task "${updatedTask.title}" erkannt als ${appType}. Starte Code-Generierung...`);
        
        // Importiere Code-Generator
        const codeGenerator = require('./codeGenerator');
        const jobId = `auto_task_${id}_${Date.now()}`;
        
        // Simuliere Request-Objekt für Code-Generator
        const mockReq = {
          body: { appType, jobId },
          app: req.app
        };
        const mockRes = {
          json: (data) => console.log('[Auto-Bot] Code-Generierung gestartet:', data),
          status: (code) => ({ json: (data) => console.error('[Auto-Bot] Fehler:', code, data) })
        };
        
        // Starte Generierung asynchron (nicht auf Antwort warten)
        codeGenerator.generateApp(mockReq, mockRes);
        
        // Informiere alle Clients über Bot-Aktion
        if (req.app.locals.broadcast) {
          req.app.locals.broadcast('bot_auto_action', {
            taskId: id,
            taskTitle: updatedTask.title,
            appType: appType,
            jobId: jobId,
            message: `🤖 Bot startet automatisch: ${updatedTask.title}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.bulkUpdate = async (req, res) => {
  try {
    const { task_ids, updates } = req.body;
    
    if (!task_ids || task_ids.length === 0) {
      return res.status(400).json({ error: 'No task IDs provided' });
    }
    
    const result = await db.query(`
      UPDATE tasks 
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($2::integer[])
      RETURNING *
    `, [updates.status, task_ids]);
    
    res.json({ 
      message: 'Tasks updated',
      updated: result.rows.length,
      tasks: result.rows
    });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await db.query(`
      SELECT * FROM tasks 
      WHERE project_id = $1 
      ORDER BY created_at DESC
    `, [projectId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks by project:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createTaskForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority } = req.body;
    
    const result = await db.query(`
      INSERT INTO tasks (title, description, project_id, status, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, description || '', projectId, status || 'todo', priority || 'medium']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task for project:', error);
    res.status(500).json({ error: error.message });
  }
};
