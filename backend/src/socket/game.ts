import type { Server } from 'socket.io';
import type { GameQuestion } from '../types/quiz';

const MAX_SCORE = 1000;
const SPEED_WEIGHT = 0.5;
const QUESTION_START_DELAY_MS = 4000;
const RESULT_DISPLAY_MS = 5000;

interface PlayerAnswer {
  optionIds: number[];
  answeredAt: number;
}

interface ActiveGame {
  sessionId: number;
  quizId: number;
  hostUserId: number;
  questions: GameQuestion[];
  participantUserIds: Set<number>;
  participantNames: Map<number, string>;
  currentQuestionIndex: number;
  questionStartedAt: number;
  scores: Map<number, number>;
  roundAnswers: Map<number, PlayerAnswer>;
  roundTimer: ReturnType<typeof setTimeout> | null;
  nextQuestionTimer: ReturnType<typeof setTimeout> | null;
  onFinish: (sessionId: number, scores: Map<number, number>) => Promise<void>;
}

const activeGames = new Map<number, ActiveGame>();
let io: Server | null = null;

export function setGameIo(server: Server): void {
  io = server;
}

export function getActiveGame(sessionId: number): ActiveGame | undefined {
  return activeGames.get(sessionId);
}

function calculateScore(timeTakenMs: number, totalTimeMs: number): number {
  const ratio = Math.min(Math.max(timeTakenMs, 0) / totalTimeMs, 1);
  return Math.round(MAX_SCORE * (1 - ratio * SPEED_WEIGHT));
}

function isAnswerCorrect(question: GameQuestion, optionIds: number[]): boolean {
  const correctIds = new Set(
    question.options.filter((o) => o.isCorrect).map((o) => o.id),
  );
  if (optionIds.length !== correctIds.size) return false;
  return optionIds.every((id) => correctIds.has(id));
}

export function createGame(
  sessionId: number,
  quizId: number,
  hostUserId: number,
  questions: GameQuestion[],
  participants: { userId: number; name: string }[],
  onFinish: (sessionId: number, scores: Map<number, number>) => Promise<void>,
): void {
  const game: ActiveGame = {
    sessionId,
    quizId,
    hostUserId,
    questions,
    participantUserIds: new Set(participants.map((p) => p.userId)),
    participantNames: new Map(participants.map((p) => [p.userId, p.name])),
    currentQuestionIndex: -1,
    questionStartedAt: 0,
    scores: new Map(participants.map((p) => [p.userId, 0])),
    roundAnswers: new Map(),
    roundTimer: null,
    nextQuestionTimer: null,
    onFinish,
  };
  activeGames.set(sessionId, game);
}

export function startGame(sessionId: number): void {
  if (!io) return;
  const game = activeGames.get(sessionId);
  if (!game) return;

  io.to(`session:${sessionId}`).emit('game:started', {});

  game.nextQuestionTimer = setTimeout(() => {
    sendNextQuestion(sessionId);
  }, QUESTION_START_DELAY_MS);
}

function sendNextQuestion(sessionId: number): void {
  if (!io) return;
  const game = activeGames.get(sessionId);
  if (!game) return;

  game.currentQuestionIndex++;
  game.roundAnswers.clear();

  const question = game.questions[game.currentQuestionIndex];
  if (!question) return;

  game.questionStartedAt = Date.now();

  io.to(`session:${sessionId}`).emit('game:question', {
    questionIndex: game.currentQuestionIndex,
    totalQuestions: game.questions.length,
    body: question.body,
    options: question.options.map((o) => ({
      id: o.id,
      sortOrder: o.sortOrder,
      body: o.body,
    })),
    timeSeconds: question.timeSeconds,
    multipleChoice: question.multipleChoice,
  });

  game.roundTimer = setTimeout(() => {
    endRound(sessionId);
  }, question.timeSeconds * 1000);
}

export function handleAnswer(
  sessionId: number,
  userId: number,
  optionIds: number[],
): { ok: boolean; error?: string } {
  const game = activeGames.get(sessionId);
  if (!game) return { ok: false, error: 'Игра не найдена' };
  if (!game.participantUserIds.has(userId))
    return { ok: false, error: 'Вы не участник' };
  if (game.currentQuestionIndex < 0)
    return { ok: false, error: 'Вопрос ещё не начался' };
  if (game.roundAnswers.has(userId))
    return { ok: false, error: 'Вы уже ответили' };

  game.roundAnswers.set(userId, {
    optionIds,
    answeredAt: Date.now(),
  });

  if (io) {
    io.to(`session:${sessionId}`).emit('game:answer_count', {
      count: game.roundAnswers.size,
      total: game.participantUserIds.size,
    });
  }

  if (game.roundAnswers.size >= game.participantUserIds.size) {
    if (game.roundTimer) {
      clearTimeout(game.roundTimer);
      game.roundTimer = null;
    }
    endRound(sessionId);
  }

  return { ok: true };
}

function endRound(sessionId: number): void {
  if (!io) return;
  const game = activeGames.get(sessionId);
  if (!game) return;

  game.roundTimer = null;

  const question = game.questions[game.currentQuestionIndex];
  if (!question) return;

  const totalTimeMs = question.timeSeconds * 1000;
  const correctOptionIds = question.options
    .filter((o) => o.isCorrect)
    .map((o) => o.id);

  const playerResults: {
    userId: number;
    name: string;
    scoreDelta: number;
    totalScore: number;
    correct: boolean;
  }[] = [];

  for (const uid of game.participantUserIds) {
    const answer = game.roundAnswers.get(uid);
    let scoreDelta = 0;
    let correct = false;

    if (answer && isAnswerCorrect(question, answer.optionIds)) {
      const timeTaken = answer.answeredAt - game.questionStartedAt;
      scoreDelta = calculateScore(timeTaken, totalTimeMs);
      correct = true;
    }

    const newTotal = (game.scores.get(uid) ?? 0) + scoreDelta;
    game.scores.set(uid, newTotal);

    playerResults.push({
      userId: uid,
      name: game.participantNames.get(uid) ?? 'Участник',
      scoreDelta,
      totalScore: newTotal,
      correct,
    });
  }

  playerResults.sort((a, b) => b.totalScore - a.totalScore);

  const isLast = game.currentQuestionIndex >= game.questions.length - 1;

  io.to(`session:${sessionId}`).emit('game:question_result', {
    questionIndex: game.currentQuestionIndex,
    correctOptionIds,
    playerResults,
    isLast,
  });

  if (isLast) {
    const leaderboard = playerResults.map((p, i) => ({
      rank: i + 1,
      userId: p.userId,
      name: p.name,
      totalScore: p.totalScore,
    }));

    setTimeout(() => {
      io?.to(`session:${sessionId}`).emit('game:finished', { leaderboard });
      game.onFinish(sessionId, game.scores).catch(console.error);
      cleanupGame(sessionId);
    }, RESULT_DISPLAY_MS);
  } else {
    game.nextQuestionTimer = setTimeout(() => {
      sendNextQuestion(sessionId);
    }, RESULT_DISPLAY_MS);
  }
}

function cleanupGame(sessionId: number): void {
  const game = activeGames.get(sessionId);
  if (!game) return;
  if (game.roundTimer) clearTimeout(game.roundTimer);
  if (game.nextQuestionTimer) clearTimeout(game.nextQuestionTimer);
  activeGames.delete(sessionId);
}
