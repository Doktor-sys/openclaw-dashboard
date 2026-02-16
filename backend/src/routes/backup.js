const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

const BACKUP_DIR = '/root/openclaw-backups';

router.post('/create', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `${BACKUP_DIR}/openclaw-${timestamp}.sql`;
  
  exec(`mkdir -p ${BACKUP_DIR} && docker exec openclaw-postgres pg_dump -U openclaw openclaw_db > ${backupFile}`, (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    res.json({ 
      success: true, 
      message: 'Backup erstellt',
      file: backupFile
    });
  });
});

router.get('/list', (req, res) => {
  exec(`ls -lt ${BACKUP_DIR}/*.sql 2>/dev/null | head -10`, (err, stdout) => {
    if (err) return res.json({ backups: [] });
    
    const backups = stdout.trim().split('\n').filter(Boolean).map(line => {
      const parts = line.split(/\s+/);
      return { file: parts[8], size: parts[4], date: parts[5] + ' ' + parts[6] + ' ' + parts[7] };
    });
    
    res.json({ backups });
  });
});

module.exports = router;
