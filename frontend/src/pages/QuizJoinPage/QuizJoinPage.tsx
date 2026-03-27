import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { getApiErrorMessage, joinSessionByCode } from '../../api/quiz';
import { useSnackbar } from '../../contexts/snackbar';
import { useAppSelector } from '../../hooks/redux';
import { tokenSelector } from '../../store/selectors/AuthSelectors';
import s from './QuizJoinPage.module.scss';

export const QuizJoinPage = () => {
  const navigate = useNavigate();
  const token = useAppSelector(tokenSelector);
  const { show } = useSnackbar();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      show('Войдите в аккаунт', 'error');
      return;
    }

    const roomCode = code.trim().toUpperCase();
    if (!roomCode) {
      show('Введите код комнаты', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await joinSessionByCode(roomCode, token);
      navigate(`/quiz/session/${data.sessionId}/waiting`, {
        state: { quizTitle: data.quizTitle },
        replace: true,
      });
    } catch (e) {
      show(getApiErrorMessage(e, 'Не удалось войти в комнату'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <h1 className={s.title}>Вход по коду</h1>
        <p className={s.subtitle}>Введите код, который показал организатор</p>

        <div className={s.card}>
          <div className={s.field}>
            <label className={s.label} htmlFor="room-code">
              Код комнаты
            </label>
            <input
              id="room-code"
              className={s.codeInput}
              type="text"
              autoComplete="off"
              maxLength={6}
              placeholder="ABC12X"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          <Button
            variant="primary"
            text="Войти"
            disabled={isLoading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};
