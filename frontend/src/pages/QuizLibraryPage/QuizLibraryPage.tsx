import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Svg } from '../../components/Svg/Svg';
import { getApiErrorMessage, getMyQuizzes } from '../../api/quiz';
import { useAppSelector } from '../../hooks/redux';
import { tokenSelector } from '../../store/selectors/AuthSelectors';
import { questionsLabel, participantsLabel } from '../../utils/counters';
import { formatDate } from '../../utils/date';
import type { MyQuizDto } from '../../types/quiz';
import s from './QuizLibraryPage.module.scss';

const STATUS_LABEL: Record<string, string> = {
  waiting: 'Ожидание',
  live: 'Идёт',
  finished: 'Завершена',
};

const ROLE_LABEL: Record<string, string> = {
  host: 'Организатор',
  participant: 'Участник',
};

export const QuizLibraryPage = () => {
  const navigate = useNavigate();
  const token = useAppSelector(tokenSelector);

  const [quizzes, setQuizzes] = useState<MyQuizDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await getMyQuizzes(token);
      setQuizzes(res.data.quizzes);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось загрузить викторины'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <header className={s.header}>
          <h1 className={s.title}>Мои викторины</h1>
          <div>
            <Button
              variant="primary"
              text="Создать новую викторину"
              onClick={() => navigate('/quiz-create')}
            />
          </div>
        </header>

        {loading && <p className={s.status}>Загрузка…</p>}
        {error && <p className={s.errorText}>{error}</p>}

        {!loading && !error && quizzes.length === 0 && (
          <p className={s.status}>У вас ещё нет викторин. Создайте первую!</p>
        )}

        <ul className={s.list}>
          {quizzes.map((quiz) => (
            <li key={quiz.quizId} className={s.card}>
              <div className={s.cardMain}>
                <div className={s.titleRow}>
                  <h2 className={s.quizTitle}>{quiz.title}</h2>
                  <span
                    className={
                      quiz.role === 'host' ? s.badgeHost : s.badgeParticipant
                    }
                  >
                    {ROLE_LABEL[quiz.role]}
                  </span>
                  {quiz.sessionStatus && (
                    <span className={s.badge}>
                      {STATUS_LABEL[quiz.sessionStatus] ?? quiz.sessionStatus}
                    </span>
                  )}
                </div>
                {quiz.description && (
                  <p className={s.description}>{quiz.description}</p>
                )}
                <div className={s.meta}>
                  <span className={s.metaItem}>
                    <span className={s.metaIcon}>
                      <Svg name="trophy" width={18} height={18} />
                    </span>
                    {questionsLabel(quiz.questionsCount)}
                  </span>
                  <span className={s.metaItem}>
                    <span className={s.metaIcon}>
                      <Svg name="calendar" width={18} height={18} />
                    </span>
                    {formatDate(quiz.createdAt)}
                  </span>
                  {quiz.participantCount > 0 && (
                    <span className={s.metaItem}>
                      {participantsLabel(quiz.participantCount)}
                    </span>
                  )}
                </div>
              </div>
              <div className={s.actions}>
                {quiz.sessionId && quiz.sessionStatus === 'finished' && (
                  <Button
                    variant="primary"
                    text="Результаты"
                    onClick={() =>
                      navigate(`/quiz/session/${quiz.sessionId}/results`)
                    }
                  />
                )}
                {quiz.role === 'host' &&
                  quiz.sessionId &&
                  quiz.sessionStatus === 'waiting' && (
                    <Button
                      variant="primary"
                      text="Лобби"
                      onClick={() =>
                        navigate(`/quiz/session/${quiz.sessionId}/lobby`)
                      }
                    />
                  )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
