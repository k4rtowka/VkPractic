import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { useAppSelector } from '../../hooks/redux';
import { tokenSelector } from '../../store/selectors/AuthSelectors';
import s from './PlayerWaitingPage.module.scss';

export const PlayerWaitingPage = () => {
  const { sessionId: sessionIdParam } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAppSelector(tokenSelector);
  const quizTitle = location.state?.quizTitle ?? 'Викторина';

  const sessionId = Number.parseInt(sessionIdParam ?? '', 10);

  useEffect(() => {
    if (!token || !Number.isInteger(sessionId) || sessionId <= 0) {
      return;
    }

    const socket: Socket = io({
      auth: { token },
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('lobby:enter', { sessionId });
    });

    socket.on('game:started', () => {
      navigate(`/quiz/session/${sessionId}/play`, { replace: true });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [sessionId, token, navigate]);

  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <h1 className={s.title}>Вы в комнате</h1>
        <p className={s.subtitle}>{quizTitle}</p>
        <p className={s.hint}>Ожидайте начала от организатора.</p>
      </div>
    </div>
  );
};
