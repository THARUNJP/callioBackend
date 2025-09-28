import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config()
const { Pool } = pkg;

export const pool = new Pool({
  host: 'localhost',             // your local machine
  user: process.env.DB_USER || 'postgres', // your DB username
  password: process.env.DB_PASS || '',     // your DB password
  database: process.env.DB_NAME || 'webRTC', // your database name
  port: process.env.DB_PORT || 5432,       // PostgreSQL default port
  max: 10,                                 // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Generic query executor
export async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(query, params);
    return res.rows;  // return only rows like MySQL
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    client.release();
  }
}
