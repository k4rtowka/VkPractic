import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { config } from '../config';
import type { User, UserPublic } from '../types';

const SALT_ROUNDS = 10;

export class AuthService {
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<UserPublic> {
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (Array.isArray(existing) && existing.length > 0) {
      throw new Error('USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    );

    const insertId = (result as ResultSetHeader).insertId;
    return {
      id: insertId,
      name,
      email,
      created_at: new Date(),
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: UserPublic; token: string }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?',
      [email],
    );

    const user = Array.isArray(rows) ? (rows[0] as User) : null;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const expiresIn = config.jwt.expiresIn;
    const token = jwt.sign({ userId: user.id }, config.jwt.secret as string, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });

    const { password_hash: _, ...userPublic } = user;
    return { user: userPublic, token };
  }
}

export const authService = new AuthService();
