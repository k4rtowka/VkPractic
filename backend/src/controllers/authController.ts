import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Заполните все поля' });
      return;
    }

    try {
      const user = await authService.register(name, email, password);
      res.status(201).json({ message: 'Регистрация успешна', user });
    } catch (err) {
      if (err instanceof Error && err.message === 'USER_EXISTS') {
        res.status(409).json({ error: 'Пользователь с таким email уже существует' });
        return;
      }
      throw err;
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Заполните все поля' });
      return;
    }

    try {
      const { user, token } = await authService.login(email, password);
      res.json({ token, user });
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ error: 'Неверный email или пароль' });
        return;
      }
      throw err;
    }
  },
};
