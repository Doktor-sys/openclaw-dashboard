const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = '/root/openclaw-backups';

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `${BACKUP_DIR}/openclaw-backup-${timestamp}.sql`;
  
  try {
    // Ensure backup directory exists
    exec(`mkdir -p ${BACKUP_DIR}`, (err) => {
      if (err) throw err;
      
      // Create database backup
      const cmd = `docker exec openclaw-postgres pg_dump -U openclaw openclaw_db > ${backupFile}`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error('Backup failed:', err);
          return { success: false, error: err.message };
        }
        
        // Also backup uploads and context
        exec(`docker cp openclaw-backend:/app/data ${BACKUP_DIR}/data-${timestamp}`, () => {});
        
        console.log('Backup created:', backupFile);
        return { success: true, file: backupFile, timestamp };
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function listBackups() {
  return new Promise((resolve) => {
    exec(`ls -la ${BACKUP_DIR}/*.sql 2>/dev/null || echo "No backups"`, (err, stdout) => {
      if (err) resolve([]);
      const files = stdout.trim().split('\n').filter(f => f.includes('.sql'));
      resolve(files);
    });
  });
}

module.exports = { createBackup, listBackups };
