const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');

fs.mkdirSync(env.UPLOAD_ABSOLUTE_DIR, { recursive: true });

const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.ppt', '.pptx']);
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_ABSOLUTE_DIR),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extension}`;
    cb(null, safeName);
  },
});

const uploadMaterialFile = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return cb(new ApiError(400, 'Only PDF, DOC, DOCX, PPT and PPTX files are allowed.'));
    }
    cb(null, true);
  },
}).single('file');

module.exports = { uploadMaterialFile };
