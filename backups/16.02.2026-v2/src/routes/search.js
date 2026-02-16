const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const contextController = require('../controllers/contextController');
const agentController = require('../controllers/agentController');

router.get('/', async (req, res) => {
  try {
    const { q, type, status, priority, project } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Suchbegriff muss mindestens 2 Zeichen haben' });
    }

    const searchTerm = q.toLowerCase();
    const results = {
      projects: [],
      tasks: [],
      contexts: [],
      agents: []
    };

    let allProjects = [];
    let allTasks = [];
    let allContexts = [];
    let allAgents = [];

    try {
      const mockRes1 = { json: (data) => data };
      allProjects = await projectController.getProjects(req, mockRes1);

      const mockRes2 = { json: (data) => data };
      allTasks = await taskController.getTasks(req, mockRes2);

      const mockRes3 = { json: (data) => data };
      allContexts = await contextController.getContexts(req, mockRes3);

      const mockRes4 = { json: (data) => data };
      allAgents = await agentController.getAgents(req, mockRes4);
    } catch (e) {
      console.error('Search error:', e);
    }

    if (!type || type === 'projects' || type === 'all') {
      results.projects = allProjects.filter(p => 
        p.name?.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      ).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        type: 'project',
        url: `/projects/${p.id}`
      }));
    }

    if (!type || type === 'tasks' || type === 'all') {
      let filteredTasks = allTasks.filter(t =>
        t.title?.toLowerCase().includes(searchTerm) ||
        t.description?.toLowerCase().includes(searchTerm)
      );

      if (status) {
        filteredTasks = filteredTasks.filter(t => t.status === status);
      }
      if (priority) {
        filteredTasks = filteredTasks.filter(t => t.priority === priority);
      }
      if (project) {
        filteredTasks = filteredTasks.filter(t => t.project_id === parseInt(project));
      }

      results.tasks = filteredTasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        project_id: t.project_id,
        type: 'task',
        url: `/tasks?task=${t.id}`
      }));
    }

    if (!type || type === 'contexts' || type === 'all') {
      results.contexts = allContexts.filter(c =>
        c.filename?.toLowerCase().includes(searchTerm) ||
        c.content?.toLowerCase().includes(searchTerm)
      ).map(c => ({
        id: c.id,
        filename: c.filename,
        content: c.content?.substring(0, 200),
        type: 'context',
        url: `/context/${c.filename}`
      }));
    }

    if (!type || type === 'agents' || type === 'all') {
      results.agents = allAgents.filter(a =>
        a.name?.toLowerCase().includes(searchTerm) ||
        a.type?.toLowerCase().includes(searchTerm)
      ).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        status: a.status,
        type: 'agent',
        url: `/agents/${a.id}`
      }));
    }

    const totalResults = 
      results.projects.length + 
      results.tasks.length + 
      results.contexts.length + 
      results.agents.length;

    res.json({
      query: q,
      totalResults,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/filters', (req, res) => {
  res.json({
    taskStatus: [
      { value: 'todo', label: 'Offen' },
      { value: 'in_progress', label: 'In Arbeit' },
      { value: 'done', label: 'Erledigt' }
    ],
    taskPriority: [
      { value: 'high', label: 'Hoch', color: '#ef4444' },
      { value: 'medium', label: 'Mittel', color: '#f59e0b' },
      { value: 'low', label: 'Niedrig', color: '#10b981' }
    ],
    projectStatus: [
      { value: 'active', label: 'Aktiv' },
      { value: 'completed', label: 'Abgeschlossen' },
      { value: 'archived', label: 'Archiviert' }
    ],
    agentStatus: [
      { value: 'online', label: 'Online' },
      { value: 'idle', label: 'Leerlauf' },
      { value: 'offline', label: 'Offline' }
    ]
  });
});

router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const searchTerm = q.toLowerCase();
    const suggestions = [];

    try {
      const mockRes1 = { json: (data) => data };
      const projects = await projectController.getProjects(req, mockRes1);
      
      projects.filter(p => p.name?.toLowerCase().includes(searchTerm))
        .slice(0, 3)
        .forEach(p => {
          suggestions.push({
            type: 'project',
            text: p.name,
            url: `/projects/${p.id}`
          });
        });

      const mockRes2 = { json: (data) => data };
      const tasks = await taskController.getTasks(req, mockRes2);
      
      tasks.filter(t => t.title?.toLowerCase().includes(searchTerm))
        .slice(0, 5)
        .forEach(t => {
          suggestions.push({
            type: 'task',
            text: t.title,
            url: `/tasks?task=${t.id}`
          });
        });
    } catch (e) {}

    res.json(suggestions.slice(0, 8));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
