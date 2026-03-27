import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import cn from 'classnames';
import { Button } from '../../components/Button/Button';
import { GameTimer } from '../../components/GameTimer/GameTimer';
import { Leaderboard } from '../../components/Leaderboard/Leaderboard';
import { useAppSelector } from '../../hooks/redux';
import { tokenSelector } from '../../store/selectors/AuthSelectors';
import type {
  GameQuestionDto,
  QuestionResultDto,
  GameLeaderboardEntry,
} from '../../types/quiz';
import { RoundResults } from './RoundResults';
import s from './HostGamePage.module.scss';

type Phase = 'starting' | 'question' | 'result' | 'leaderboard';

export const HostGamePage = () => {
  const { sessionId: rawId } = useParams<{ sessionId: string }>();
  const token = useAppSelector(tokenSelector);
  const navigate = useNavigate();
  const sessionId = Number.parseInt(rawId ?? '', 10);

  const [phase, setPhase] = useState<Phase>('starting');
  const [question, setQuestion] = useState<GameQuestionDto | null>(null);
  const [result, setResult] = useState<QuestionResultDto | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameLeaderboardEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!token || !Number.isInteger(sessionId) || sessionId <= 0) return;

    const socket: Socket = io({ auth: { token }, withCredentials: true });

    socket.on('connect', () => {
      socket.emit('lobby:enter', { sessionId });
    });

    socket.on('game:question', (data: GameQuestionDto) => {
      setQuestion(data);
      setTimeLeft(data.timeSeconds);
      setAnsweredCount(0);
      setPhase('question');
    });

    socket.on('game:question_result', (data: QuestionResultDto) => {
      setResult(data);
      setTotalParticipants(data.playerResults.length);
      setPhase('result');
    });

    socket.on(
      'game:finished',
      (data: { leaderboard: GameLeaderboardEntry[] }) => {
        setLeaderboard(data.leaderboard);
        setPhase('leaderboard');
      },
    );

    socket.on(
      'game:answer_count',
      (data: { count: number; total: number }) => {
        setAnsweredCount(data.count);
        setTotalParticipants(data.total);
      },
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [sessionId, token]);

  useEffect(() => {
    if (phase !== 'question') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, question?.questionIndex]);

  if (phase === 'starting') {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <div className={s.centeredBlock}>
            <h1 className={s.pageTitle}>Викторина начинается...</h1>
            <p className={s.pageHint}>
              Участники получат первый вопрос через несколько секунд
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'leaderboard') {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <h1 className={s.pageTitle}>Итоги викторины</h1>
          <p className={s.pageSubtitle}>Финальный рейтинг участников</p>
          <Leaderboard entries={leaderboard} />
          <div className={s.centered}>
            <Button
              variant="primary"
              type="button"
              text="К моим викторинам"
              onClick={() => navigate('/quiz-library')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const correctSet = new Set(result.correctOptionIds);
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <div className={s.topBar}>
            <span className={s.questionLabel}>
              Вопрос {result.questionIndex + 1}
              {question ? ` из ${question.totalQuestions}` : ''} — результаты
            </span>
          </div>

          {question && (
            <div className={s.questionCard}>
              <p className={s.questionBody}>{question.body}</p>
              <div className={s.optionsGrid}>
                {question.options.map((opt, i) => (
                  <div
                    key={opt.id}
                    className={cn(
                      s.option,
                      s[`option${i % 4}`],
                      correctSet.has(opt.id) ? s.optionCorrect : s.optionWrong,
                    )}
                  >
                    {opt.body}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={s.questionCard}>
            <h3 className={s.resultTitle}>Рейтинг раунда</h3>
            <RoundResults results={result.playerResults} />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'question' && question) {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <div className={s.topBar}>
            <span className={s.questionLabel}>
              Вопрос {question.questionIndex + 1} из {question.totalQuestions}
            </span>
            <GameTimer seconds={timeLeft} urgent={timeLeft <= 5} />
          </div>

          <div className={s.questionCard}>
            <p className={s.questionBody}>{question.body}</p>
            <div className={s.optionsGrid}>
              {question.options.map((opt, i) => (
                <div
                  key={opt.id}
                  className={cn(s.option, s[`option${i % 4}`])}
                >
                  {opt.body}
                </div>
              ))}
            </div>
          </div>

          <p className={s.answeredInfo}>
            Ответили: {answeredCount} из {totalParticipants}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
