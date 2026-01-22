import mysql, { Connection } from 'mysql2/promise';

// Create the connection to database
export default async function dbConnect(): Promise<Connection> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      charset: 'utf8mb4',
    });
    return connection;
  } catch {
    console.error("Fail to connect Database.");
    throw "Database ERROR.";
  }
}
