require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };
  const dbName = (process.env.DB_NAME || 'studyvault').replace(/[^a-zA-Z0-9_]/g, '');
  const connection = await mysql.createConnection(config);
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);
    const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    const seed = await fs.readFile(path.join(__dirname, 'seed.sql'), 'utf8');
    await connection.query(schema);
    await connection.query(seed);

    const adminName = process.env.SEED_ADMIN_NAME || 'StudyVault Admin';
    const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@studyvault.local').toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await connection.execute(
      `INSERT INTO admins (name,email,password_hash,role,is_active)
       VALUES (?,?,?,'SUPER_ADMIN',1)
       ON DUPLICATE KEY UPDATE name=VALUES(name), is_active=1`,
      [adminName, adminEmail, passwordHash]
    );

    console.log(`Database '${dbName}' is ready.`);
    console.log(`Development admin: ${adminEmail}`);
    console.log('Seeded universities/courses and DCRUST B.Tech subjects.');
    console.log('No real study documents were added.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Database setup failed:', error.message);
  process.exit(1);
});
