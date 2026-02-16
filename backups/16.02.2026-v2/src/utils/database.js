const supabase = require('../config/supabase');

exports.createTables = async () => {
  const tables = [
    {
      name: 'projects',
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'in_progress',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'tasks',
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'todo',
          priority VARCHAR(50) DEFAULT 'medium',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'contexts',
      sql: `
        CREATE TABLE IF NOT EXISTS contexts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          filename VARCHAR(255) UNIQUE NOT NULL,
          content TEXT,
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'agents',
      sql: `
        CREATE TABLE IF NOT EXISTS agents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) DEFAULT 'general',
          model VARCHAR(50) DEFAULT 'GPT-4',
          status VARCHAR(50) DEFAULT 'inactive',
          config JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'activities',
      sql: `
        CREATE TABLE IF NOT EXISTS activities (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'info',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`Tabelle '${table.name}' wird erstellt...`);
      await supabase.rpc('exec_sql', { sql: table.sql });
      console.log(`Tabelle '${table.name}' erstellt`);
    } catch (error) {
      console.error(`Fehler beim Erstellen der Tabelle '${table.name}':`, error.message);
    }
  }
};