const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md|json|zip/;
    const allowedMimes = /jpeg|jpg|png|gif|pdf|msword|vnd\.openxmlformats|vnd\.ms-excel|vnd\.ms-powerpoint|text|json|zip/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimes.test(file.mimetype);
    if (extname && (mimetype || extname === '.txt')) {
      return cb(null, true);
    }
    cb(new Error('Ungültiger Dateityp'));
  }
});

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    const fileData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      uploadedBy: req.body.userId || 'anonymous',
      projectId: req.body.projectId || null,
      taskId: req.body.taskId || null,
      createdAt: new Date().toISOString()
    };

    res.status(201).json(fileData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { projectId, taskId } = req.query;
    let files = [];
    
    if (fs.existsSync(UPLOAD_DIR)) {
      const fileList = fs.readdirSync(UPLOAD_DIR);
      files = fileList.map(filename => {
        const filePath = path.join(UPLOAD_DIR, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          size: stats.size,
          createdAt: stats.birthtime,
          url: `/uploads/${filename}`
        };
      });
    }

    if (projectId || taskId) {
      // Filter logic for database-stored file metadata
    }

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Datei gelöscht' });
    } else {
      res.status(404).json({ error: 'Datei nicht gefunden' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.post('/', upload.single('file'), this.uploadFile);
router.get('/', this.getFiles);
router.delete('/:filename', this.deleteFile);

module.exports = router;
