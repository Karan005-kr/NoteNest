const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticateAdmin = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authentication required. Use Authorization: Bearer <token>.');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch (_error) {
    throw new ApiError(401, 'Invalid or expired token.');
  }

  const [rows] = await pool.execute(
    'SELECT id, name, email, role, is_active FROM admins WHERE id = ? LIMIT 1',
    [payload.sub]
  );

  const admin = rows[0];
  if (!admin || !admin.is_active) {
    throw new ApiError(401, 'Admin account is unavailable.');
  }

  req.admin = admin;
  next();
});

module.exports = { authenticateAdmin };
