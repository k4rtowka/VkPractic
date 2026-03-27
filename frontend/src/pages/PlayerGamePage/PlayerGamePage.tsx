import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import cn from 'classnames';
import { Button } from '../../components/Button/Button';
import { GameTimer } from '../../components/GameTimer/GameTimer';
import { Leaderboard } from '../../components/Leaderboard/Leaderboard';
import { useAppSelector } from '../../hooks/redux';
import {
  tokenSelector,
  userSelector,
} from '../../store/selectors/AuthSelectors';
import type {
  GameQuestionDto,
  QuestionResultDto,
  GameLeaderboardEntry,
} from '../../types/quiz';
import { MyResult } from './MyResult';
import s from './PlayerGamePage.module.scss';

type Phase = 'waiting' | 'question' | 'answered' | 'result' | 'leaderboard';

export const PlayerGamePage = () => {
  const { sessionId: rawId } = useParams<{ sessionId: string }>();
  const token = useAppSelector(tokenSelector);
  const user = useAppSelector(userSelector);
  const navigate = useNavigate();
  const sessionId = Number.parseInt(rawId ?? '', 10);

  const [phase, setPhase] = useState<Phase>('waiting');
  const [question, setQuestion] = useState<GameQuestionDto | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [result, setResult] = useState<QuestionResultDto | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameLeaderboardEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const myUserId = user?.id;

  useEffect(() => {
    if (!token || !Number.isInteger(sessionId) || sessionId <= 0) return;

    const socket: Socket = io({ auth: { token }, withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('lobby:enter', { sessionId });
    });

    socket.on('game:question', (data: GameQuestionDto) => {
      setQuestion(data);
      setSelectedOptions([]);
      setTimeLeft(data.timeSeconds);
      setPhase('question');
    });

    socket.on('game:question_result', (data: QuestionResultDto) => {
      setResult(data);
      setPhase('result');
    });

    socket.on(
      'game:finished',
      (data: { leaderboard: GameLeaderboardEntry[] }) => {
        setLeaderboard(data.leaderboard);
        setPhase('leaderboard');
      },
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
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

  const submitAnswer = (optionIds: number[]) => {
    socketRef.current?.emit('game:answer', { optionIds });
    setPhase('answered');
  };

  const handleOptionClick = (optionId: number) => {
    if (phase !== 'question' || !question) return;

    if (question.multipleChoice) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelectedOptions([optionId]);
      submitAnswer([optionId]);
    }
  };

  const myResult = result?.playerResults.find((p) => p.userId === myUserId);

  if (phase === 'waiting') {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <div className={s.centeredBlock}>
            <h1 className={s.pageTitle}>Приготовьтесь!</h1>
            <p className={s.pageHint}>Первый вопрос появится через мгновение</p>
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
          <p className={s.pageSubtitle}>Финальный рейтинг</p>
          <Leaderboard entries={leaderboard} highlightUserId={myUserId} />
          <div className={s.centered}>
            <Button
              variant="primary"
              type="button"
              text="На главную"
              onClick={() => navigate('/home')}
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
              {question ? ` из ${question.totalQuestions}` : ''}
            </span>
          </div>

          {question && (
            <>
              <p className={s.questionBody}>{question.body}</p>
              <div className={s.optionsGrid}>
                {question.options.map((opt, i) => (
                  <button
                    key={opt.id}
                    disabled
                    className={cn(
                      s.optionBtn,
                      s[`option${i % 4}`],
                      correctSet.has(opt.id) ? s.optionCorrect : s.optionWrong,
                    )}
                  >
                    {opt.body}
                  </button>
                ))}
              </div>
            </>
          )}

          <MyResult
            correct={myResult?.correct ?? false}
            scoreDelta={myResult?.scoreDelta ?? 0}
            totalScore={myResult?.totalScore ?? 0}
          />
        </div>
      </div>
    );
  }

  if (phase === 'answered') {
    return (
      <div className={s.root}>
        <div className={s.wrapper}>
          <div className={s.topBar}>
            <span className={s.questionLabel}>
              Вопрос {question ? `${question.questionIndex + 1} из ${question.totalQuestions}` : ''}
            </span>
            <GameTimer seconds={timeLeft} urgent={timeLeft <= 5} />
          </div>
          <div className={s.centeredBlock}>
            <h2 className={s.pageTitle}>Ответ принят!</h2>
            <p className={s.pageHint}>Ожидайте результатов</p>
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

          <p className={s.questionBody}>{question.body}</p>

          <div className={s.optionsGrid}>
            {question.options.map((opt, i) => (
              <button
                key={opt.id}
                className={cn(
                  s.optionBtn,
                  s[`option${i % 4}`],
                  selectedOptions.includes(opt.id) && s.optionSelected,
                )}
                onClick={() => handleOptionClick(opt.id)}
              >
                {opt.body}
              </button>
            ))}
          </div>

          {question.multipleChoice && selectedOptions.length > 0 && (
            <div className={s.centered}>
              <Button
                variant="primary"
                type="button"
                text="Ответить"
                onClick={() => submitAnswer(selectedOptions)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
