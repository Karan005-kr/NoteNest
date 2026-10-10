const path = require('path');

function int(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: int(process.env.PORT, 5000),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: int(process.env.DB_PORT, 3306),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'studyvault',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || '',
  MAX_FILE_SIZE_MB: int(process.env.MAX_FILE_SIZE_MB, 20),
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads/materials',
};

if (!env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production.');
}

// Convenient fallback for local development only.
if (!env.JWT_SECRET) {
  env.JWT_SECRET = 'studyvault-development-secret-change-me';
}

env.UPLOAD_ABSOLUTE_DIR = path.resolve(process.cwd(), env.UPLOAD_DIR);

module.exports = { env };
