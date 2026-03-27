import crypto from 'crypto';
import { pool } from '../db';
import { quizRepository } from '../repositories/quizRepository';
import type { UserQuizRow } from '../repositories/quizRepository';
import { userRepository } from '../repositories/userRepository';
import type {
  CreateQuizWithSessionResult,
  GameQuestion,
  LeaderboardEntry,
} from '../types/quiz';
import type { CreateQuizPayload } from '../validation/quizCreatePayload';

const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_MAX_ATTEMPTS = 32;

function randomRoomCode(): string {
  const bytes = crypto.randomBytes(ROOM_CODE_LENGTH);
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[bytes[i]! % ROOM_CODE_ALPHABET.length];
  }
  return code;
}

function isDuplicateKeyError(e: unknown): boolean {
  const err = e as { code?: string; errno?: number };
  return err.code === 'ER_DUP_ENTRY' || err.errno === 1062;
}

export class QuizService {
  async createQuizWithSession(
    userId: number,
    payload: CreateQuizPayload,
  ): Promise<CreateQuizWithSessionResult> {
    const questionsCount = payload.questions.length;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const quizId = await quizRepository.addQuiz(
        conn,
        userId,
        payload.title,
        payload.description,
      );

      for (let i = 0; i < payload.questions.length; i++) {
        const question = payload.questions[i]!;
        const questionId = await quizRepository.addQuestion(
          conn,
          quizId,
          i,
          question.text,
          question.timeSeconds,
          question.multiple,
        );
        const correctSet = new Set(question.correctOptionIndexes);

        for (let j = 0; j < question.options.length; j++) {
          await quizRepository.addOption(
            conn,
            questionId,
            j,
            question.options[j],
            correctSet.has(j),
          );
        }
      }

      let sessionId = 0;
      let roomCode = '';

      for (let attempt = 0; attempt < ROOM_CODE_MAX_ATTEMPTS; attempt++) {
        roomCode = randomRoomCode();
        try {
          sessionId = await quizRepository.addSession(
            conn,
            quizId,
            userId,
            roomCode,
          );
          break;
        } catch (e) {
          if (isDuplicateKeyError(e)) {
            continue;
          }
          throw e;
        }
      }

      if (!sessionId) {
        throw new Error('ROOM_CODE_COLLISION');
      }

      await conn.commit();

      return {
        quizId,
        sessionId,
        roomCode,
        title: payload.title,
        questionsCount,
      };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async getHostSession(
    sessionId: number,
    userId: number,
  ): Promise<{
    sessionId: number;
    quizId: number;
    roomCode: string;
    status: 'waiting' | 'live' | 'finished';
    createdAt: Date;
    title: string;
    questionsCount: number;
    participants: { userId: number; name: string }[];
  } | null> {
    const row = await quizRepository.getHostSession(sessionId, userId);
    if (!row) {
      return null;
    }

    const participants = await quizRepository.getListParticipants(
      row.sessionId,
    );

    return {
      sessionId: row.sessionId,
      quizId: row.quizId,
      roomCode: row.roomCode,
      status: row.status,
      createdAt: row.createdAt,
      title: row.title,
      questionsCount: row.questionsCount,
      participants,
    };
  }

  async listParticipants(
    sessionId: number,
  ): Promise<{ userId: number; name: string }[]> {
    return quizRepository.getListParticipants(sessionId);
  }

  async getLobbyRole(
    sessionId: number,
    userId: number,
  ): Promise<'host' | 'participant' | null> {
    if (await quizRepository.isSessionHost(sessionId, userId)) {
      return 'host';
    }
    if (await quizRepository.isSessionParticipant(sessionId, userId)) {
      return 'participant';
    }
    return null;
  }

  async joinSessionByRoomCode(
    userId: number,
    roomCodeRaw: string,
  ): Promise<{
    sessionId: number;
    quizTitle: string;
    isNewParticipant: boolean;
    joinerName: string;
  }> {
    const code = roomCodeRaw.trim().toUpperCase();
    if (!code || code.length > 8) {
      throw new Error('INVALID_CODE');
    }

    const sessionRow = await quizRepository.getSessionByRoomCode(code);
    if (!sessionRow) {
      throw new Error('SESSION_NOT_FOUND');
    }

    if (sessionRow.status !== 'waiting') {
      throw new Error('SESSION_NOT_WAITING');
    }

    if (sessionRow.hostUserId === userId) {
      throw new Error('HOST_CANNOT_JOIN');
    }

    const sessionId = sessionRow.sessionId;

    const already = await quizRepository.isSessionParticipant(
      sessionId,
      userId,
    );

    if (!already) {
      await quizRepository.addParticipant(sessionId, userId);
    }

    const nameFromDb = await userRepository.getDisplayName(userId);
    const joinerName = nameFromDb?.trim() || 'Участник';

    return {
      sessionId,
      quizTitle: sessionRow.quizTitle,
      isNewParticipant: !already,
      joinerName,
    };
  }
  async startSession(
    sessionId: number,
    userId: number,
  ): Promise<{
    quizId: number;
    questions: GameQuestion[];
    participants: { userId: number; name: string }[];
  }> {
    const session = await quizRepository.getSessionWithQuiz(sessionId);
    if (!session) throw new Error('SESSION_NOT_FOUND');
    if (session.hostUserId !== userId) throw new Error('NOT_HOST');
    if (session.status !== 'waiting') throw new Error('SESSION_NOT_WAITING');

    const participants =
      await quizRepository.getListParticipants(sessionId);
    if (participants.length === 0) throw new Error('NO_PARTICIPANTS');

    const questions = await quizRepository.getQuizQuestions(session.quizId);
    if (questions.length === 0) throw new Error('NO_QUESTIONS');

    await quizRepository.setSessionLive(sessionId);

    return { quizId: session.quizId, questions, participants };
  }

  async finishSession(
    sessionId: number,
    scores: Map<number, number>,
  ): Promise<void> {
    await quizRepository.updateParticipantScores(sessionId, scores);
    await quizRepository.setSessionFinished(sessionId);
  }

  async getUserQuizzes(userId: number): Promise<UserQuizRow[]> {
    return quizRepository.getUserQuizzes(userId);
  }

  async getSessionResults(
    sessionId: number,
    userId: number,
  ): Promise<{
    session: {
      id: number;
      status: string;
      startedAt: Date | null;
      finishedAt: Date | null;
    };
    quiz: { id: number; title: string; questionsCount: number };
    leaderboard: LeaderboardEntry[];
  } | null> {
    const session = await quizRepository.getSessionWithQuiz(sessionId);
    if (!session) return null;

    const isHost = session.hostUserId === userId;
    const isParticipant = await quizRepository.isSessionParticipant(
      sessionId,
      userId,
    );
    if (!isHost && !isParticipant) return null;

    const leaderboard = await quizRepository.getLeaderboard(sessionId);

    return {
      session: {
        id: session.sessionId,
        status: session.status,
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
      },
      quiz: {
        id: session.quizId,
        title: session.quizTitle,
        questionsCount: session.questionsCount,
      },
      leaderboard,
    };
  }
}

export const quizService = new QuizService();
