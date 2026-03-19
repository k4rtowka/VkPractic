import mysql from 'mysql2/promise';
import { config } from '../config';

export const pool = mysql.createPool(config.db);

export async function testConnection(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    conn.release();
    return true;
  } catch {
    return false;
  }
}
