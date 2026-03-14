import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    multipleStatements: true,
  });

  try {
    const migrationFiles = [
      '001_create_tables.sql',
      '002_add_room_fields.sql',
      '003_add_room_images.sql'
    ];

    console.log('Running migrations...');
    
    for (const file of migrationFiles) {
      const migrationPath = path.join(__dirname, file);
      if (fs.existsSync(migrationPath)) {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log(`Running ${file}...`);
        await connection.query(sql);
        console.log(`✓ ${file} completed`);
      } else {
        console.log(`⚠ ${file} not found, skipping`);
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration();
