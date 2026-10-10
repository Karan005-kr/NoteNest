const fs = require('fs/promises');
const path = require('path');
const { env } = require('../../config/env');

function publicUrlFor(filename) {
  return `/uploads/materials/${encodeURIComponent(filename)}`;
}

async function removeStoredFile(filePath) {
  if (!filePath) return;
  const absolute = path.resolve(process.cwd(), filePath);
  const uploadRoot = path.resolve(env.UPLOAD_ABSOLUTE_DIR);
  if (!absolute.startsWith(uploadRoot + path.sep) && absolute !== uploadRoot) return;
  try {
    await fs.unlink(absolute);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function relativePathFor(filename) {
  return path.join(env.UPLOAD_DIR, filename).replace(/\\/g, '/');
}

module.exports = { publicUrlFor, relativePathFor, removeStoredFile };
