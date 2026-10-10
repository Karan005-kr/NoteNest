const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');

async function login(req, res) {
  const { email, password } = req.body;
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, role, is_active FROM admins WHERE email = ? LIMIT 1',
    [email.toLowerCase()]
  );
  const admin = rows[0];
  if (!admin || !admin.is_active || !(await bcrypt.compare(password, admin.password_hash))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = jwt.sign(
    { sub: admin.id, role: admin.role, email: admin.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    },
  });
}

async function me(req, res) {
  res.json({ success: true, message: 'Authenticated admin.', data: req.admin });
}

async function logout(_req, res) {
  // JWT bearer tokens are stateless; the client should remove its stored token.
  res.json({ success: true, message: 'Logged out. Remove the bearer token on the client.' });
}

module.exports = { login, me, logout };
