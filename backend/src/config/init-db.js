const db = require('./database');

const initializeDatabase = async () => {
  try {
    console.log('Initializing PostgreSQL database...');

    // Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_to INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        model VARCHAR(100) DEFAULT 'minimax-m2.1-free',
        description TEXT,
        status VARCHAR(50) DEFAULT 'offline',
        tasks_completed INTEGER DEFAULT 0,
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS contexts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content TEXT,
        file_type VARCHAR(50) DEFAULT 'md',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        mime_type VARCHAR(100),
        size BIGINT DEFAULT 0,
        path VARCHAR(500),
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await db.query('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);');

    console.log('Database tables created successfully');
    
    // Insert default agents if not exists
    const agents = await db.query('SELECT COUNT(*) FROM agents');
    if (parseInt(agents.rows[0].count) === 0) {
      console.log('Inserting default agents...');
      await db.query(`
        INSERT INTO agents (name, type, model, description, status, tasks_completed) VALUES
        ('OpenClaw Bot', 'general', 'minimax-m2.1-free', 'Haupt-Bot für OpenClaw', 'online', 999),
        ('Code Agent', 'coding', 'minimax-m2.1-free', 'Spezialisiert auf Code-Generierung und Refactoring', 'online', 42),
        ('Research Agent', 'research', 'gpt-4', 'Recherchiert und analysiert Informationen', 'idle', 28),
        ('Analysis Agent', 'analysis', 'claude-3-sonnet', 'Analysiert Daten und erstellt Berichte', 'online', 15)
      `);
      console.log('Default agents inserted');
    }

    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };
