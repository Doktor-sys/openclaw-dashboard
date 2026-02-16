const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const CONTEXTS_FILE = path.join(DATA_DIR, 'contexts.json');
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const initialProjects = [
      { id: '1', name: 'Dashboard Projekt', description: 'OpenClaw Dashboard Entwicklung', status: 'in_progress', created_at: new Date().toISOString(), tasks: [] },
      { id: '2', name: 'Bot Integration', description: 'WebSocket und Bot-Kommunikation', status: 'in_progress', created_at: new Date().toISOString(), tasks: [] },
      { id: '3', name: 'Datenbank Setup', description: 'Supabase-Integration', status: 'completed', created_at: new Date().toISOString(), tasks: [] }
    ];
    
    const initialTasks = [
      { id: '1', project_id: '1', title: 'Backend API', description: 'Express Server mit WebSocket', status: 'completed', priority: 'high', created_at: new Date().toISOString() },
      { id: '2', project_id: '1', title: 'Frontend UI', description: 'React Components erstellen', status: 'in_progress', priority: 'high', created_at: new Date().toISOString() },
      { id: '3', project_id: '2', title: 'Bot Verbindung', description: 'WebSocket Verbindung testen', status: 'completed', priority: 'medium', created_at: new Date().toISOString() }
    ];
    
    const initialAgents = [
      { id: '1', name: 'OpenClaw Bot', type: 'general', model: 'GPT-4', status: 'active', config: { version: '1.0.0' }, created_at: new Date().toISOString() }
    ];
    
    const initialActivities = [
      { id: '1', type: 'system', message: 'Dashboard initialisiert', status: 'info', created_at: new Date().toISOString() },
      { id: '2', type: 'bot', message: 'Bot verbunden', status: 'success', created_at: new Date().toISOString() },
      { id: '3', type: 'project', message: 'Demo-Projekte erstellt', status: 'info', created_at: new Date().toISOString() }
    ];
    
    if (!await fileExists(PROJECTS_FILE)) {
      await fs.writeFile(PROJECTS_FILE, JSON.stringify(initialProjects, null, 2));
    }
    if (!await fileExists(TASKS_FILE)) {
      await fs.writeFile(TASKS_FILE, JSON.stringify(initialTasks, null, 2));
    }
    if (!await fileExists(AGENTS_FILE)) {
      await fs.writeFile(AGENTS_FILE, JSON.stringify(initialAgents, null, 2));
    }
    if (!await fileExists(ACTIVITIES_FILE)) {
      await fs.writeFile(ACTIVITIES_FILE, JSON.stringify(initialActivities, null, 2));
    }
  } catch (error) {
    console.error('Fehler beim Erstellen des Datenverzeichnisses:', error);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readDataFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function writeDataFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

ensureDataDir();

const demoController = {
  projects: {
    getProjects: async (req, res) => {
      const projects = await readDataFile(PROJECTS_FILE);
      const tasks = await readDataFile(TASKS_FILE);
      
      const projectsWithTasks = projects.map(project => ({
        ...project,
        tasks: tasks.filter(task => task.project_id === project.id)
      }));
      
      res.json(projectsWithTasks);
    },
    
    createProject: async (req, res) => {
      const projects = await readDataFile(PROJECTS_FILE);
      const newProject = {
        id: Date.now().toString(),
        ...req.body,
        created_at: new Date().toISOString()
      };
      projects.push(newProject);
      await writeDataFile(PROJECTS_FILE, projects);
      res.json(newProject);
    },
    
    updateProject: async (req, res) => {
      const projects = await readDataFile(PROJECTS_FILE);
      const index = projects.findIndex(p => p.id === req.params.id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...req.body };
        await writeDataFile(PROJECTS_FILE, projects);
        res.json(projects[index]);
      } else {
        res.status(404).json({ error: 'Project not found' });
      }
    },
    
    deleteProject: async (req, res) => {
      let projects = await readDataFile(PROJECTS_FILE);
      projects = projects.filter(p => p.id !== req.params.id);
      await writeDataFile(PROJECTS_FILE, projects);
      res.json({ message: 'Project deleted' });
    }
  },
  
  tasks: {
    getTasks: async (req, res) => {
      const tasks = await readDataFile(TASKS_FILE);
      res.json(tasks);
    },
    
    getTasksByProject: async (req, res) => {
      const tasks = await readDataFile(TASKS_FILE);
      const projectTasks = tasks.filter(task => task.project_id === req.params.projectId);
      res.json(projectTasks);
    },
    
    createTask: async (req, res) => {
      const tasks = await readDataFile(TASKS_FILE);
      const newTask = {
        id: Date.now().toString(),
        ...req.body,
        created_at: new Date().toISOString()
      };
      tasks.push(newTask);
      await writeDataFile(TASKS_FILE, tasks);
      res.json(newTask);
    },
    
    updateTask: async (req, res) => {
      const tasks = await readDataFile(TASKS_FILE);
      const index = tasks.findIndex(t => t.id === req.params.id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...req.body };
        await writeDataFile(TASKS_FILE, tasks);
        res.json(tasks[index]);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    },
    
    deleteTask: async (req, res) => {
      let tasks = await readDataFile(TASKS_FILE);
      tasks = tasks.filter(t => t.id !== req.params.id);
      await writeDataFile(TASKS_FILE, tasks);
      res.json({ message: 'Task deleted' });
    }
  },
  
  agents: {
    getAgents: async (req, res) => {
      const agents = await readDataFile(AGENTS_FILE);
      res.json(agents);
    },
    
    createAgent: async (req, res) => {
      const agents = await readDataFile(AGENTS_FILE);
      const newAgent = {
        id: Date.now().toString(),
        ...req.body,
        created_at: new Date().toISOString()
      };
      agents.push(newAgent);
      await writeDataFile(AGENTS_FILE, agents);
      res.json(newAgent);
    },
    
    updateAgent: async (req, res) => {
      const agents = await readDataFile(AGENTS_FILE);
      const index = agents.findIndex(a => a.id === req.params.id);
      if (index !== -1) {
        agents[index] = { ...agents[index], ...req.body };
        await writeDataFile(AGENTS_FILE, agents);
        res.json(agents[index]);
      } else {
        res.status(404).json({ error: 'Agent not found' });
      }
    },
    
    deleteAgent: async (req, res) => {
      let agents = await readDataFile(AGENTS_FILE);
      agents = agents.filter(a => a.id !== req.params.id);
      await writeDataFile(AGENTS_FILE, agents);
      res.json({ message: 'Agent deleted' });
    }
  },
  
  activities: {
    getActivities: async (req, res) => {
      const activities = await readDataFile(ACTIVITIES_FILE);
      const limit = parseInt(req.query.limit) || 10;
      res.json(activities.slice(0, limit));
    },
    
    createActivity: async (type, message, status = 'info') => {
      const activities = await readDataFile(ACTIVITIES_FILE);
      const newActivity = {
        id: Date.now().toString(),
        type,
        message,
        status,
        created_at: new Date().toISOString()
      };
      activities.unshift(newActivity);
      await writeDataFile(ACTIVITIES_FILE, activities.slice(0, 100));
    }
  }
};

module.exports = { demoController, ensureDataDir };