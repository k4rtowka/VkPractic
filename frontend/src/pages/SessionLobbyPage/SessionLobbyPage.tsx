import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { Button } from '../../components/Button/Button';
import { getApiErrorMessage, getHostSession } from '../../api/quiz';
import type { HostSessionResponse } from '../../types/quiz';
import { useAppSelector } from '../../hooks/redux';
import { tokenSelector } from '../../store/selectors/AuthSelectors';
import { useSnackbar } from '../../contexts/snackbar';
import { participantsLabel, questionsLabel } from '../../utils/counters';
import s from './SessionLobbyPage.module.scss';

const STATUS_LABEL: Record<
  HostSessionResponse['session']['status'],
  string
> = {
  waiting: 'Ожидание участников',
  live: 'Идёт викторина',
  finished: 'Завершена',
};

export const SessionLobbyPage = () => {
  const { sessionId: sessionIdParam } = useParams<{ sessionId: string }>();
  const token = useAppSelector(tokenSelector);
  const { show } = useSnackbar();
  const navigate = useNavigate();

  const [data, setData] = useState<HostSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participantCount, setParticipantCount] = useState(0);
  const [starting, setStarting] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const sessionId = Number.parseInt(sessionIdParam ?? '', 10);

  const load = useCallback(async () => {
    if (!token || !Number.isInteger(sessionId) || sessionId <= 0) {
      setLoading(false);
      setError('Некорректная ссылка');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await getHostSession(sessionId, token);
      setData(res.data);
      setParticipantCount(res.data.participants.length);
    } catch (e) {
      setData(null);
      setError(getApiErrorMessage(e, 'Не удалось загрузить комнату'));
    } finally {
      setLoading(false);
    }
  }, [sessionId, token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token || !Number.isInteger(sessionId) || sessionId <= 0) {
      return;
    }

    const socket: Socket = io({
      auth: { token },
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('lobby:participants', (payload: { count?: number }) => {
      if (payload.count) {
        setParticipantCount(payload.count);
      }
    });

    socket.on('lobby:user_joined', (payload: { userName?: string }) => {
      const name = payload?.userName?.trim() || 'Участник';
      show(`${name} присоединился`, 'info');
    });

    socket.on('game:started', () => {
      navigate(`/quiz/session/${sessionId}/host-game`);
    });

    socket.on('connect', () => {
      socket.emit(
        'lobby:enter',
        { sessionId },
        (ack: { ok?: boolean; error?: string } | undefined) => {
          if (ack && ack.ok === false && ack.error) {
            show(ack.error, 'error');
          }
        },
      );
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, token, show, navigate]);

  const startQuiz = () => {
    const socket = socketRef.current;
    if (!socket) return;

    setStarting(true);
    socket.emit(
      'game:start',
      { sessionId },
      (ack: { ok?: boolean; error?: string } | undefined) => {
        if (ack && !ack.ok) {
          show(ack.error ?? 'Не удалось запустить', 'error');
          setStarting(false);
        }
      },
    );
  };

  const copyCode = async () => {
    if (!data?.session.roomCode) return;
    try {
      await navigator.clipboard.writeText(data.session.roomCode);
      show('Код скопирован', 'success');
    } catch {
      show('Не удалось скопировать', 'error');
    }
  };

  if (loading && !data && !error) {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <p className={s.loading}>Загрузка…</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <p className={s.error}>{error}</p>
          <div className={s.retry}>
            <Button
              variant="secondary"
              type="button"
              text="Повторить"
              onClick={load}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { session, quiz } = data;

  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <h1 className={s.title}>Комната ожидания</h1>
        <p className={s.subtitle}>{quiz.title}</p>

        <div className={s.card}>
          <div className={s.codeBlock}>
            <span className={s.codeLabel}>Код комнаты</span>
            <div className={s.codeRow}>
              <span className={s.code}>{session.roomCode}</span>
              <Button
                variant="secondary"
                type="button"
                text="Скопировать"
                onClick={copyCode}
              />
            </div>
          </div>

          <div className={s.meta}>
            <span>
              Статус:{' '}
              <span className={s.metaStrong}>
                {STATUS_LABEL[session.status]}
              </span>
            </span>
            <span>
              Викторина:{' '}
              <span className={s.metaStrong}>
                {questionsLabel(quiz.questionsCount)}
              </span>
            </span>
            <span>
              Участники:{' '}
              <span className={s.metaStrong}>
                {participantsLabel(participantCount)}
              </span>
            </span>
          </div>

          {session.status === 'waiting' && (
            <div className={s.startBlock}>
              <Button
                variant="primary"
                type="button"
                text={starting ? 'Запуск…' : 'Начать викторину'}
                disabled={starting || participantCount === 0}
                onClick={startQuiz}
              />
              {participantCount === 0 && (
                <p className={s.hint}>
                  Дождитесь хотя бы одного участника, чтобы начать
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
