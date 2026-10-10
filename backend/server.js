require('dotenv').config();

const { env } = require('./src/config/env');
const { testDatabaseConnection } = require('./src/config/db');
const app = require('./src/app');

async function start() {
  try {
    await testDatabaseConnection();
    app.listen(env.PORT, () => {
      console.log(`StudyVault API running at http://localhost:${env.PORT}`);
      console.log(`Health: http://localhost:${env.PORT}/api/health`);
      console.log(`Swagger: http://localhost:${env.PORT}/api/docs`);
    });
  } catch (error) {
    console.error('Failed to start StudyVault API.');
    console.error(error.message);
    process.exit(1);
  }
}

start();
