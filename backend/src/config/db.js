const mysql = require('mysql2/promise');
const { env } = require('./env');

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

async function testDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
}

module.exports = { pool, testDatabaseConnection };
