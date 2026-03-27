import { Request, Response } from 'express';
import { quizService } from '../services/quizService';
import { emitLobbyParticipants, emitLobbyUserJoined } from '../socket/lobby';

function parseIdParam(raw: string | string[]): number {
  return Number.parseInt(Array.isArray(raw) ? (raw[0] ?? '') : raw, 10);
}

const JOIN_ERRORS: Record<string, { status: number; error: string }> = {
  INVALID_CODE: { status: 400, error: 'Некорректный код комнаты' },
  SESSION_NOT_FOUND: { status: 404, error: 'Комната не найдена' },
  SESSION_NOT_WAITING: { status: 409, error: 'Игра уже началась или завершена' },
  HOST_CANNOT_JOIN: {
    status: 400,
    error: 'Организатор входит по ссылке из экрана создания викторины',
  },
};

export const sessionController = {
  async joinByRoomCode(req: Request, res: Response): Promise<void> {
    const userId = req.userId!;
    const { roomCode } = req.body;

    if (!roomCode) {
      res.status(400).json({ error: 'Укажите код комнаты' });
      return;
    }

    try {
      const result = await quizService.joinSessionByRoomCode(userId, roomCode);
      const participants = await quizService.listParticipants(result.sessionId);
      emitLobbyParticipants(result.sessionId, participants);
      if (result.isNewParticipant) {
        emitLobbyUserJoined(result.sessionId, result.joinerName);
      }
      res.json({
        sessionId: result.sessionId,
        quizTitle: result.quizTitle,
        alreadyJoined: !result.isNewParticipant,
      });
    } catch (err) {
      if (!(err instanceof Error)) throw err;
      const mapped = JOIN_ERRORS[err.message];
      if (mapped) {
        res.status(mapped.status).json({ error: mapped.error });
        return;
      }
      throw err;
    }
  },

  async getSessionResults(req: Request, res: Response): Promise<void> {
    const userId = req.userId!;
    const sessionId = parseIdParam(req.params.sessionId);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.status(400).json({ error: 'Некорректный идентификатор сессии' });
      return;
    }
    const data = await quizService.getSessionResults(sessionId, userId);
    if (!data) {
      res.status(404).json({ error: 'Результаты не найдены' });
      return;
    }
    res.json(data);
  },

  async getHostSession(req: Request, res: Response): Promise<void> {
    const userId = req.userId!;
    const sessionId = parseIdParam(req.params.sessionId);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.status(400).json({ error: 'Некорректный идентификатор сессии' });
      return;
    }

    const data = await quizService.getHostSession(sessionId, userId);
    if (!data) {
      res.status(404).json({ error: 'Сессия не найдена' });
      return;
    }

    res.json({
      session: {
        id: data.sessionId,
        roomCode: data.roomCode,
        status: data.status,
        createdAt: data.createdAt,
      },
      quiz: {
        id: data.quizId,
        title: data.title,
        questionsCount: data.questionsCount,
      },
      participants: data.participants,
    });
  },
};
