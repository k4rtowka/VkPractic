import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Токен не передан' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret as string) as {
      userId: number;
    };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Недействительный токен' });
  }
}
