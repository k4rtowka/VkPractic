import express from 'express';
import cors from 'cors';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { config } from './config';
import { testConnection } from './db';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { quizService } from './services/quizService';
import { setLobbyIo, emitLobbyParticipants } from './socket/lobby';
import {
  setGameIo,
  createGame,
  startGame,
  handleAnswer,
} from './socket/game';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

setLobbyIo(io);
setGameIo(io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Unauthorized'));
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret as string) as {
      userId: number;
    };
    socket.data.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

function toPositiveInt(value: unknown): number {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : NaN;
  return Number.isInteger(n) && n > 0 ? n : NaN;
}

io.on('connection', (socket) => {
  socket.on(
    'lobby:enter',
    async (
      payload: { sessionId?: unknown },
      ack?: (r: { ok: boolean; error?: string }) => void,
    ) => {
      const sessionId = toPositiveInt(payload?.sessionId);
      if (Number.isNaN(sessionId)) {
        ack?.({ ok: false, error: 'Некорректная сессия' });
        return;
      }

      const userId = socket.data.userId as number;
      const role = await quizService.getLobbyRole(sessionId, userId);
      if (!role) {
        ack?.({ ok: false, error: 'Нет доступа к комнате' });
        return;
      }

      socket.data.sessionId = sessionId;
      await socket.join(`session:${sessionId}`);
      const participants = await quizService.listParticipants(sessionId);
      emitLobbyParticipants(sessionId, participants);
      ack?.({ ok: true });
    },
  );

  socket.on(
    'game:start',
    async (
      payload: { sessionId?: unknown },
      ack?: (r: { ok: boolean; error?: string }) => void,
    ) => {
      const sessionId = toPositiveInt(payload?.sessionId);
      if (Number.isNaN(sessionId)) {
        ack?.({ ok: false, error: 'Некорректная сессия' });
        return;
      }

      const userId = socket.data.userId as number;

      try {
        const { quizId, questions, participants } =
          await quizService.startSession(sessionId, userId);

        createGame(sessionId, quizId, userId, questions, participants, (sid, scores) =>
          quizService.finishSession(sid, scores),
        );
        startGame(sessionId);
        ack?.({ ok: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Ошибка запуска игры';
        ack?.({ ok: false, error: message });
      }
    },
  );

  socket.on(
    'game:answer',
    (
      payload: { optionIds?: unknown },
      ack?: (r: { ok: boolean; error?: string }) => void,
    ) => {
      const sessionId = socket.data.sessionId as number | undefined;
      if (!sessionId) {
        ack?.({ ok: false, error: 'Вы не в комнате' });
        return;
      }

      const raw = payload?.optionIds;
      if (!Array.isArray(raw) || raw.length === 0) {
        ack?.({ ok: false, error: 'Выберите вариант ответа' });
        return;
      }

      const optionIds = raw
        .filter((v): v is number => typeof v === 'number' && Number.isInteger(v))
        .slice(0, 10);

      if (optionIds.length === 0) {
        ack?.({ ok: false, error: 'Некорректные варианты' });
        return;
      }

      const userId = socket.data.userId as number;
      ack?.(handleAnswer(sessionId, userId, optionIds));
    },
  );
});

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

async function start(): Promise<void> {
  const connected = await testConnection();
  if (!connected) {
    console.error('Не удалось подключиться к MySQL');
    process.exit(1);
  }

  server.listen(config.port, () => {
    console.log(`Server: http://localhost:${config.port}`);
    console.log(`API: http://localhost:${config.port}/api`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
