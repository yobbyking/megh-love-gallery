/**
 * MEGH LOVE — Device Gallery Server
 *
 * Receives file uploads from the Android APK and displays them in a
 * premium web gallery sorted by date.
 *
 * Features:
 *   - Receive image/video/file uploads from APK
 *   - Display in premium gallery UI (sorted by date)
 *   - Download any file from the web
 *   - Auth code (simple device pairing)
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const DEVICE_CODE = process.env.DEVICE_CODE || 'MEGH-LOVE-2026';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Storage for uploaded files
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// File metadata store (in memory)
const files = []; // [{id, name, type, size, date, path, thumbnail}]

// Multer config for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const fileDir = path.join(UPLOADS_DIR, file.fieldname);
      if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
      cb(null, fileDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
});

// === API ===

app.get('/health', (req, res) => {
  res.json({ ok: true, files: files.length, bot: 'MEGH LOVE GALLERY' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload a file (image/video/file)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const code = req.body.code;
  if (code !== DEVICE_CODE) {
    // Delete the uploaded file if code doesn't match
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(401).json({ error: 'Invalid device code' });
  }

  const fileMeta = {
    id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
    date: req.body.date || new Date().toISOString(),
    uploadDate: new Date().toISOString(),
    path: `/files/${req.file.fieldname}/${path.basename(req.file.path)}`,
    category: req.body.category || 'other',
  };

  files.push(fileMeta);
  console.log(`[UPLOAD] ${fileMeta.name} (${fileMeta.type}, ${(fileMeta.size/1024).toFixed(1)}KB) — total: ${files.length}`);

  res.json({ success: true, file: fileMeta });
});

// Upload file metadata only (for listing without uploading)
app.post('/api/files', (req, res) => {
  const code = req.body.code;
  if (code !== DEVICE_CODE) return res.status(401).json({ error: 'Invalid device code' });

  const fileMetas = req.body.files || [];
  for (const f of fileMetas) {
    files.push({
      id: `meta_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...f,
      uploadDate: new Date().toISOString(),
    });
  }
  console.log(`[LIST] Added ${fileMetas.length} file metadata entries — total: ${files.length}`);
  res.json({ success: true, count: fileMetas.length });
});

// List all files (sorted by date desc)
app.get('/api/files', (req, res) => {
  const sorted = [...files].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ files: sorted, total: sorted.length });
});

// Download a file
app.get('/files/:category/:filename', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.category, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(filePath);
});

// Delete a file
app.delete('/api/files/:id', (req, res) => {
  const idx = files.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const file = files[idx];
  // Delete from disk if it was uploaded
  if (file.path && file.path.startsWith('/files/')) {
    const filePath = path.join(UPLOADS_DIR, file.path.replace('/files/', ''));
    try { fs.unlinkSync(filePath); } catch {}
  }
  files.splice(idx, 1);
  res.json({ success: true });
});

// Clear all files
app.post('/api/clear', (req, res) => {
  files.length = 0;
  // Clear uploads directory
  try {
    fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch {}
  res.json({ success: true, message: 'All files cleared' });
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║   MEGH LOVE — Device Gallery Server          ║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`\n🌐 http://localhost:${PORT}`);
  console.log(`📁 Files: ${files.length}`);
  console.log(`🔑 Device code: ${DEVICE_CODE}\n`);
});
