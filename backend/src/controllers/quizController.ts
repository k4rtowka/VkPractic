import { Request, Response } from 'express';
import { quizService } from '../services/quizService';
import {
  normalizeCreateQuizPayload,
  parseCreateQuizPayload,
  validateCreateQuizPayload,
} from '../validation/quizCreatePayload';

export const quizController = {
  async listMyQuizzes(req: Request, res: Response): Promise<void> {
    const userId = req.userId!;
    const quizzes = await quizService.getUserQuizzes(userId);
    res.json({ quizzes });
  },

  async createWithSession(req: Request, res: Response): Promise<void> {
    const userId = req.userId!;

    const parsed = parseCreateQuizPayload(req.body);
    if (!parsed) {
      res.status(400).json({ error: 'Некорректное тело запроса' });
      return;
    }

    const validationError = validateCreateQuizPayload(parsed);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const payload = normalizeCreateQuizPayload(parsed);

    try {
      const result = await quizService.createQuizWithSession(userId, payload);
      res.status(201).json({
        quiz: { id: result.quizId, title: result.title },
        session: {
          id: result.sessionId,
          roomCode: result.roomCode,
          status: 'waiting' as const,
          questionsCount: result.questionsCount,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'ROOM_CODE_COLLISION') {
        res
          .status(503)
          .json({ error: 'Не удалось выделить код комнаты, попробуйте снова' });
        return;
      }
      throw err;
    }
  },
};
