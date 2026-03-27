import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Pool, PoolConnection } from 'mysql2/promise';
import { pool } from '../db';
import type { User, UserPublic } from '../types';

type DbConn = Pool | PoolConnection;

export class UserRepository {
  async getUser(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?',
      [email],
    );
    const row = Array.isArray(rows) ? rows[0] : null;
    return row ? (row as User) : null;
  }

  async checkUserExist(email: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async addUser(
    connection: DbConn,
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<number> {
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    );
    return result.insertId;
  }

  async getPublicById(userId: number): Promise<UserPublic | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId],
    );
    const row = Array.isArray(rows) ? rows[0] : null;
    return row ? (row as UserPublic) : null;
  }

  async updateName(userId: number, name: string): Promise<void> {
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
  }

  async getDisplayName(userId: number): Promise<string | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT name FROM users WHERE id = ?',
      [userId],
    );
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.name) return null;
    return String(row.name);
  }
}

export const userRepository = new UserRepository();
