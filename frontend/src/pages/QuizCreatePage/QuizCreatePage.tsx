import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { QuizQuestionEditor } from '../../components/QuizQuestionEditor/QuizQuestionEditor';
import { type QuizQuestionDraft } from '../../components/QuizQuestionEditor/types';
import { createEmptyQuestion } from '../../components/QuizQuestionEditor/utils';
import { Svg } from '../../components/Svg/Svg';
import {
  createQuizWithSession,
  getApiErrorMessage,
  mapQuestionsForApi,
} from '../../api/quiz';
import { useSnackbar } from '../../contexts/snackbar';
import { useAppSelector } from '../../hooks/redux';
import { tokenSelector } from '../../store/selectors/AuthSelectors';

import s from './QuizCreatePage.module.scss';

export const QuizCreatePage = () => {
  const navigate = useNavigate();
  const token = useAppSelector(tokenSelector);
  const { show } = useSnackbar();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>(() => [
    createEmptyQuestion(),
  ]);

  const updateQuestion = (id: string, next: QuizQuestionDraft) => {
    setQuestions((prev) =>
      prev.map((question) => (question.id === id ? next : question)),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.length <= 1 ? prev : prev.filter((question) => question.id !== id),
    );
  };

  const handleLaunch = async () => {
    if (!token) {
      show('Войдите в аккаунт', 'error');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      show('Укажите название викторины', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await createQuizWithSession(
        {
          title: trimmedTitle,
          description: description.trim(),
          questions: mapQuestionsForApi(questions),
        },
        token,
      );
      navigate(`/quiz/session/${data.session.id}/lobby`);
    } catch (e) {
      show(getApiErrorMessage(e, 'Не удалось создать викторину'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <header className={s.header}>
          <h1 className={s.title}>Создание викторины</h1>
          <div>
            <Button
              variant="primary"
              type="button"
              text="Запустить"
              disabled={isLoading}
              onClick={handleLaunch}
              icon={
                <Svg
                  name="play"
                  width={20}
                  height={20}
                  className={s.playIcon}
                />
              }
            />
          </div>
        </header>

        <div className={s.formCard}>
          <div className={s.field}>
            <Input
              id="quiz-title"
              label="Название викторины"
              name="title"
              placeholder="Введите название викторины"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className={s.field}>
            <label className={s.textareaLabel} htmlFor="quiz-description">
              Описание
            </label>
            <textarea
              id="quiz-description"
              className={s.textarea}
              name="description"
              placeholder="Краткое описание викторины"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className={s.questionsSection}>
          <h2 className={s.sectionTitle}>Вопросы</h2>
          <div className={s.questionList}>
            {questions.map((question, index) => (
              <QuizQuestionEditor
                key={question.id}
                value={question}
                onChange={(next) => updateQuestion(question.id, next)}
                questionNumber={index + 1}
                canRemove={questions.length > 1}
                onRemove={() => removeQuestion(question.id)}
              />
            ))}
          </div>
          <div className={s.addQuestionRow}>
            <Button
              variant="secondary"
              type="button"
              text="Добавить вопрос"
              onClick={addQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
