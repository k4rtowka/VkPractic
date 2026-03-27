import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Leaderboard } from '../../components/Leaderboard/Leaderboard';
import { getApiErrorMessage, getSessionResults } from '../../api/quiz';
import { useAppSelector } from '../../hooks/redux';
import { tokenSelector } from '../../store/selectors/AuthSelectors';
import type { SessionResultsResponse } from '../../types/quiz';
import { questionsLabel } from '../../utils/counters';
import s from './SessionResultsPage.module.scss';

export const SessionResultsPage = () => {
  const { sessionId: rawId } = useParams<{ sessionId: string }>();
  const token = useAppSelector(tokenSelector);
  const navigate = useNavigate();
  const sessionId = Number.parseInt(rawId ?? '', 10);

  const [data, setData] = useState<SessionResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token || !Number.isInteger(sessionId) || sessionId <= 0) {
      setLoading(false);
      setError('Некорректная ссылка');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await getSessionResults(sessionId, token);
      setData(res.data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось загрузить результаты'));
    } finally {
      setLoading(false);
    }
  }, [sessionId, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <p className={s.loading}>Загрузка…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <p className={s.error}>{error}</p>
          <div className={s.centered}>
            <Button
              variant="secondary"
              type="button"
              text="Назад"
              onClick={() => navigate('/quiz-library')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { quiz, leaderboard } = data;

  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <h1 className={s.title}>{quiz.title}</h1>
        <p className={s.subtitle}>Результаты викторины</p>

        <div className={s.meta}>
          <span>{questionsLabel(quiz.questionsCount)}</span>
          <span>
            {leaderboard.length}{' '}
            {leaderboard.length === 1 ? 'участник' : 'участников'}
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <p className={s.empty}>Нет участников</p>
        ) : (
          <Leaderboard entries={leaderboard} />
        )}

        <div className={s.centered}>
          <Button
            variant="secondary"
            type="button"
            text="К моим викторинам"
            onClick={() => navigate('/quiz-library')}
          />
        </div>
      </div>
    </div>
  );
};
