require('dotenv').config();
const mysql = require('mysql2/promise');
const { spawnSync } = require('child_process');

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('db:reset is blocked in production.');
  }
  const dbName = (process.env.DB_NAME || 'studyvault').replace(/[^a-zA-Z0-9_]/g, '');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log(`Dropped database '${dbName}'. Rebuilding...`);
  } finally {
    await connection.end();
  }
  const result = spawnSync(process.execPath, [require.resolve('./setup')], { stdio: 'inherit' });
  process.exit(result.status || 0);
}

main().catch((error) => {
  console.error('Database reset failed:', error.message);
  process.exit(1);
});
