import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { pool } from '../db';
import type { GameQuestion, LeaderboardEntry } from '../types/quiz';

export type SessionParticipantRow = { userId: number; name: string };

export type HostSessionRow = {
  sessionId: number;
  quizId: number;
  roomCode: string;
  status: 'waiting' | 'live' | 'finished';
  createdAt: Date;
  title: string;
  questionsCount: number;
};

export type SessionByCodeRow = {
  sessionId: number;
  hostUserId: number;
  status: string;
  quizTitle: string;
};

export type UserQuizRow = {
  quizId: number;
  title: string;
  description: string;
  createdAt: Date;
  questionsCount: number;
  sessionId: number | null;
  sessionStatus: string | null;
  roomCode: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  participantCount: number;
  role: 'host' | 'participant';
};

export type SessionWithQuizRow = {
  sessionId: number;
  quizId: number;
  hostUserId: number;
  status: 'waiting' | 'live' | 'finished';
  startedAt: Date | null;
  finishedAt: Date | null;
  quizTitle: string;
  questionsCount: number;
};

export class QuizRepository {
  async addQuiz(
    connection: PoolConnection,
    userId: number,
    title: string,
    description: string,
  ): Promise<number> {
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO quizzes (user_id, title, description) VALUES (?, ?, ?)',
      [userId, title, description],
    );
    return result.insertId;
  }

  async addQuestion(
    connection: PoolConnection,
    quizId: number,
    sortOrder: number,
    body: string,
    timeSeconds: number,
    multipleChoice: boolean,
  ): Promise<number> {
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO quiz_questions (quiz_id, sort_order, body, time_seconds, multiple_choice)
       VALUES (?, ?, ?, ?, ?)`,
      [quizId, sortOrder, body, timeSeconds, multipleChoice ? 1 : 0],
    );
    return result.insertId;
  }

  async addOption(
    connection: PoolConnection,
    questionId: number,
    sortOrder: number,
    body: string,
    isCorrect: boolean,
  ): Promise<void> {
    await connection.query<ResultSetHeader>(
      `INSERT INTO quiz_question_options (question_id, sort_order, body, is_correct)
       VALUES (?, ?, ?, ?)`,
      [questionId, sortOrder, body, isCorrect ? 1 : 0],
    );
  }

  async addSession(
    connection: PoolConnection,
    quizId: number,
    hostUserId: number,
    roomCode: string,
  ): Promise<number> {
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO quiz_sessions (quiz_id, host_user_id, room_code, status)
       VALUES (?, ?, ?, 'waiting')`,
      [quizId, hostUserId, roomCode],
    );
    return result.insertId;
  }

  async getHostSession(
    sessionId: number,
    hostUserId: number,
  ): Promise<HostSessionRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         qs.id AS session_id,
         qs.quiz_id AS quiz_id,
         qs.room_code AS room_code,
         qs.status AS status,
         qs.created_at AS created_at,
         q.title AS title,
         (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS questions_count
       FROM quiz_sessions qs
       INNER JOIN quizzes q ON q.id = qs.quiz_id
       WHERE qs.id = ? AND qs.host_user_id = ?`,
      [sessionId, hostUserId],
    );

    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;

    return {
      sessionId: row.session_id,
      quizId: row.quiz_id,
      roomCode: row.room_code,
      status: row.status as HostSessionRow['status'],
      createdAt: row.created_at,
      title: row.title,
      questionsCount: Number(row.questions_count),
    };
  }

  async getListParticipants(
    sessionId: number,
  ): Promise<SessionParticipantRow[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.user_id AS user_id, u.name AS name
       FROM quiz_session_participants p
       INNER JOIN users u ON u.id = p.user_id
       WHERE p.session_id = ?
       ORDER BY p.joined_at ASC`,
      [sessionId],
    );

    if (!Array.isArray(rows)) return [];

    return rows.map((r) => ({
      userId: r.user_id as number,
      name: String(r.name),
    }));
  }

  async isSessionHost(sessionId: number, userId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM quiz_sessions WHERE id = ? AND host_user_id = ? LIMIT 1',
      [sessionId, userId],
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async isSessionParticipant(
    sessionId: number,
    userId: number,
  ): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM quiz_session_participants WHERE session_id = ? AND user_id = ? LIMIT 1',
      [sessionId, userId],
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async getSessionByRoomCode(code: string): Promise<SessionByCodeRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT qs.id AS session_id, qs.host_user_id, qs.status, q.title AS quiz_title
       FROM quiz_sessions qs
       INNER JOIN quizzes q ON q.id = qs.quiz_id
       WHERE qs.room_code = ?`,
      [code],
    );

    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;

    return {
      sessionId: row.session_id as number,
      hostUserId: row.host_user_id as number,
      status: String(row.status),
      quizTitle: String(row.quiz_title),
    };
  }

  async addParticipant(sessionId: number, userId: number): Promise<void> {
    await pool.query<ResultSetHeader>(
      'INSERT INTO quiz_session_participants (session_id, user_id) VALUES (?, ?)',
      [sessionId, userId],
    );
  }

  async getQuizQuestions(quizId: number): Promise<GameQuestion[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT q.id, q.sort_order, q.body, q.time_seconds, q.multiple_choice,
              o.id AS option_id, o.sort_order AS option_sort_order,
              o.body AS option_body, o.is_correct
       FROM quiz_questions q
       LEFT JOIN quiz_question_options o ON o.question_id = q.id
       WHERE q.quiz_id = ?
       ORDER BY q.sort_order ASC, o.sort_order ASC`,
      [quizId],
    );

    if (!Array.isArray(rows) || rows.length === 0) return [];

    const map = new Map<number, GameQuestion>();
    for (const r of rows) {
      let q = map.get(r.id);
      if (!q) {
        q = {
          id: r.id,
          sortOrder: r.sort_order,
          body: String(r.body),
          timeSeconds: r.time_seconds,
          multipleChoice: !!r.multiple_choice,
          options: [],
        };
        map.set(r.id, q);
      }
      if (r.option_id != null) {
        q.options.push({
          id: r.option_id,
          sortOrder: r.option_sort_order,
          body: String(r.option_body),
          isCorrect: !!r.is_correct,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async setSessionLive(sessionId: number): Promise<void> {
    await pool.query(
      "UPDATE quiz_sessions SET status = 'live', started_at = NOW() WHERE id = ?",
      [sessionId],
    );
  }

  async setSessionFinished(sessionId: number): Promise<void> {
    await pool.query(
      "UPDATE quiz_sessions SET status = 'finished', finished_at = NOW() WHERE id = ?",
      [sessionId],
    );
  }

  async updateParticipantScores(
    sessionId: number,
    scores: Map<number, number>,
  ): Promise<void> {
    for (const [userId, totalScore] of scores) {
      await pool.query(
        'UPDATE quiz_session_participants SET total_score = ? WHERE session_id = ? AND user_id = ?',
        [totalScore, sessionId, userId],
      );
    }
  }

  async getLeaderboard(sessionId: number): Promise<LeaderboardEntry[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.user_id, u.name, p.total_score
       FROM quiz_session_participants p
       INNER JOIN users u ON u.id = p.user_id
       WHERE p.session_id = ?
       ORDER BY p.total_score DESC, p.joined_at ASC`,
      [sessionId],
    );
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => ({
      userId: r.user_id as number,
      name: String(r.name),
      totalScore: r.total_score as number,
    }));
  }

  async getUserQuizzes(userId: number): Promise<UserQuizRow[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT q.id, q.title, q.description, q.created_at,
              (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS questions_count,
              qs.id AS session_id, qs.status, qs.room_code, qs.started_at, qs.finished_at,
              (SELECT COUNT(*) FROM quiz_session_participants p WHERE p.session_id = qs.id) AS participant_count,
              'host' AS role
       FROM quizzes q
       LEFT JOIN quiz_sessions qs ON qs.quiz_id = q.id
       WHERE q.user_id = ?

       UNION ALL

       SELECT q.id, q.title, q.description, q.created_at,
              (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS questions_count,
              qs.id AS session_id, qs.status, qs.room_code, qs.started_at, qs.finished_at,
              (SELECT COUNT(*) FROM quiz_session_participants p2 WHERE p2.session_id = qs.id) AS participant_count,
              'participant' AS role
       FROM quiz_session_participants p
       INNER JOIN quiz_sessions qs ON qs.id = p.session_id
       INNER JOIN quizzes q ON q.id = qs.quiz_id
       WHERE p.user_id = ?

       ORDER BY created_at DESC`,
      [userId, userId],
    );
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => ({
      quizId: r.id as number,
      title: String(r.title),
      description: String(r.description),
      createdAt: r.created_at as Date,
      questionsCount: Number(r.questions_count),
      sessionId: (r.session_id as number) ?? null,
      sessionStatus: r.status ? String(r.status) : null,
      roomCode: r.room_code ? String(r.room_code) : null,
      startedAt: (r.started_at as Date) ?? null,
      finishedAt: (r.finished_at as Date) ?? null,
      participantCount: Number(r.participant_count ?? 0),
      role: String(r.role) as UserQuizRow['role'],
    }));
  }

  async getSessionWithQuiz(
    sessionId: number,
  ): Promise<SessionWithQuizRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT qs.id AS session_id, qs.quiz_id, qs.host_user_id, qs.status,
              qs.started_at, qs.finished_at,
              q.title AS quiz_title,
              (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS questions_count
       FROM quiz_sessions qs
       INNER JOIN quizzes q ON q.id = qs.quiz_id
       WHERE qs.id = ?`,
      [sessionId],
    );
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;
    return {
      sessionId: row.session_id as number,
      quizId: row.quiz_id as number,
      hostUserId: row.host_user_id as number,
      status: row.status as SessionWithQuizRow['status'],
      startedAt: (row.started_at as Date) ?? null,
      finishedAt: (row.finished_at as Date) ?? null,
      quizTitle: String(row.quiz_title),
      questionsCount: Number(row.questions_count),
    };
  }
}

export const quizRepository = new QuizRepository();
