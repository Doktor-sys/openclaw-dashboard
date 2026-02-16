const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const CONTEXT_DIR = process.env.CONTEXT_PATH || '/openclaw/context';

// Liste aller Context-Dateien
router.get('/files', (req, res) => {
  try {
    const files = [
      {
        id: 'memory',
        name: 'memory.md',
        title: 'Coding Patterns & Prompts',
        description: 'Technische Referenz, Troubleshooting, Best Practices',
        size: '57 KB',
        lastModified: '2026-02-13'
      },
      {
        id: 'project',
        name: 'ProjectContext.md',
        title: 'Project Management',
        description: 'Timeline, Roadmap, Architektur-Dokumentation',
        size: '26 KB',
        lastModified: '2026-02-13'
      },
      {
        id: 'agent',
        name: 'AgentConfig.md',
        title: 'Agent Configuration',
        description: 'Bot-Konfiguration, AI Model Registry',
        size: '32 KB',
        lastModified: '2026-02-13'
      }
    ];

    res.json({
      success: true,
      files,
      directory: CONTEXT_DIR
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Einzelne Datei laden
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Sicherheit: Nur erlaubte Dateien
    const allowedFiles = ['memory.md', 'ProjectContext.md', 'AgentConfig.md'];
    if (!allowedFiles.includes(filename)) {
      return res.status(403).json({
        success: false,
        error: 'Datei nicht erlaubt'
      });
    }

    const filePath = path.join(CONTEXT_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Datei nicht gefunden'
      });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);

    res.json({
      success: true,
      filename,
      content,
      size: stats.size,
      lastModified: stats.mtime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Datei aktualisieren (für zukünftige Bearbeitung)
router.post('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;

    // Sicherheit: Nur erlaubte Dateien
    const allowedFiles = ['memory.md', 'ProjectContext.md', 'AgentConfig.md'];
    if (!allowedFiles.includes(filename)) {
      return res.status(403).json({
        success: false,
        error: 'Datei nicht erlaubt'
      });
    }

    const filePath = path.join(CONTEXT_DIR, filename);
    
    // Backup erstellen
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
    }

    fs.writeFileSync(filePath, content, 'utf-8');

    res.json({
      success: true,
      message: 'Datei gespeichert',
      filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
