import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { pool } from '../db';
import { userRepository } from '../repositories/userRepository';
import type { UserPublic } from '../types';

const SALT_ROUNDS = 10;

export class AuthService {
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<UserPublic> {
    const exists = await userRepository.checkUserExist(email);
    if (exists) {
      throw new Error('USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const insertId = await userRepository.addUser(
      pool,
      name,
      email,
      passwordHash,
    );

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
    const user = await userRepository.getUser(email);
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

  async updateName(userId: number, name: string): Promise<UserPublic> {
    const user = await userRepository.getPublicById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    await userRepository.updateName(userId, name);

    return {
      id: user.id,
      name,
      email: user.email,
      created_at: user.created_at,
    };
  }
}

export const authService = new AuthService();
