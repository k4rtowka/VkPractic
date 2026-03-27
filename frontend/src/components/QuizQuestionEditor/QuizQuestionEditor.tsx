import { useState } from 'react';
import { Button } from '../Button/Button';
import s from './QuizQuestionEditor.module.scss';
import {
  QUESTION_TIME_DEFAULT,
  QUESTION_TIME_MAX,
  QUESTION_TIME_MIN,
  MAX_OPTIONS,
  MIN_OPTIONS,
  type QuizQuestionEditorProps,
} from './types';
import { clampQuestionTime } from './utils';

export const QuizQuestionEditor = ({
  value,
  onChange,
  questionNumber,
  onRemove,
  canRemove,
}: QuizQuestionEditorProps) => {
  const { text, multiple, options, correctOptionIndexes, timeSeconds } = value;
  const groupName = `correct-${value.id}`;

  const [timeInput, setTimeInput] = useState(() => String(timeSeconds));

  const commitTimeInput = () => {
    const trimmed = timeInput.trim();
    if (trimmed === '') {
      onChange({ ...value, timeSeconds: QUESTION_TIME_DEFAULT });
      setTimeInput(String(QUESTION_TIME_DEFAULT));
      return;
    }
    const n = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(n)) {
      onChange({ ...value, timeSeconds: QUESTION_TIME_DEFAULT });
      setTimeInput(String(QUESTION_TIME_DEFAULT));
      return;
    }
    const clamped = clampQuestionTime(n);
    onChange({ ...value, timeSeconds: clamped });
    setTimeInput(String(clamped));
  };

  const setMultiple = (nextMultiple: boolean) => {
    if (nextMultiple === multiple) return;
    if (!nextMultiple && correctOptionIndexes.length > 1) {
      onChange({
        ...value,
        multiple: false,
        correctOptionIndexes: correctOptionIndexes.slice(0, 1),
      });
      return;
    }
    onChange({ ...value, multiple: nextMultiple });
  };

  const setText = (next: string) => onChange({ ...value, text: next });

  const setOptionText = (index: number, optionText: string) => {
    const nextOptions = options.map((o, i) => (i === index ? optionText : o));
    onChange({ ...value, options: nextOptions });
  };

  const toggleCorrectMultiple = (index: number) => {
    const set = new Set(correctOptionIndexes);
    if (set.has(index)) set.delete(index);
    else set.add(index);
    onChange({
      ...value,
      correctOptionIndexes: [...set].sort((a, b) => a - b),
    });
  };

  const setCorrectSingle = (index: number) => {
    onChange({ ...value, correctOptionIndexes: [index] });
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    onChange({ ...value, options: [...options, ''] });
  };

  const removeOption = (index: number) => {
    if (options.length <= MIN_OPTIONS || index < MIN_OPTIONS) return;
    const nextOptions = options.filter((_, i) => i !== index);
    const nextCorrect = correctOptionIndexes
      .filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i));
    onChange({
      ...value,
      options: nextOptions,
      correctOptionIndexes: nextCorrect,
    });
  };

  return (
    <div className={s.root}>
      <div className={s.headRow}>
        <h2 className={s.heading} id={`question-heading-${value.id}`}>
          Вопрос {questionNumber}
        </h2>
        {canRemove && (
          <Button
            variant="secondary"
            type="button"
            text="Удалить вопрос"
            onClick={onRemove}
          />
        )}
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor={`text-${value.id}`}>
          Вопрос
        </label>
        <textarea
          id={`text-${value.id}`}
          className={s.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст вопроса"
          rows={3}
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor={`time-${value.id}`}>
          Время на ответ, сек
        </label>
        <div className={s.timeRow}>
          <input
            id={`time-${value.id}`}
            type="number"
            className={s.timeInput}
            min={QUESTION_TIME_MIN}
            max={QUESTION_TIME_MAX}
            step={1}
            inputMode="numeric"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            onBlur={commitTimeInput}
          />
          <span className={s.timeSuffix} aria-hidden="true">
            сек
          </span>
        </div>
        <p className={s.timeHint} id={`time-hint-${value.id}`}>
          От {QUESTION_TIME_MIN} до {QUESTION_TIME_MAX} секунд
        </p>
      </div>

      <div className={s.toggleRow}>
        <input
          id={`multi-${value.id}`}
          type="checkbox"
          className={s.toggleInput}
          checked={multiple}
          onChange={(e) => setMultiple(e.target.checked)}
        />
        <label className={s.toggleLabel} htmlFor={`multi-${value.id}`}>
          Несколько правильных ответов
        </label>
      </div>

      <div className={s.optionsFieldset}>
        <span className={s.legend}>Варианты ответа</span>
        <p className={s.hint}>
          Отметьте правильны{multiple ? 'е' : 'й'} вариант
          {multiple ? 'ы' : ''} рядом с полем.
        </p>
        <ul className={s.optionList}>
          {options.map((optionText, index) => (
            <li key={index} className={s.optionRow}>
              <div className={s.correctCell}>
                {multiple ? (
                  <input
                    id={`cb-${value.id}-${index}`}
                    type="checkbox"
                    className={s.markCheckbox}
                    checked={correctOptionIndexes.includes(index)}
                    onChange={() => toggleCorrectMultiple(index)}
                  />
                ) : (
                  <input
                    id={`rb-${value.id}-${index}`}
                    type="radio"
                    className={s.markRadio}
                    name={groupName}
                    checked={correctOptionIndexes[0] === index}
                    onChange={() => setCorrectSingle(index)}
                  />
                )}
              </div>
              <input
                type="text"
                className={s.optionInput}
                value={optionText}
                onChange={(e) => setOptionText(index, e.target.value)}
                placeholder={`Вариант ${index + 1}`}
                aria-label={`Текст варианта ${index + 1}`}
              />
              {index >= MIN_OPTIONS && (
                <button
                  type="button"
                  className={s.removeOptionBtn}
                  onClick={() => removeOption(index)}
                  aria-label={`Удалить вариант ${index + 1}`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        {options.length < MAX_OPTIONS && (
          <div className={s.addRow}>
            <Button
              variant="secondary"
              type="button"
              text="Добавить вариант"
              onClick={addOption}
            />
          </div>
        )}
      </div>
    </div>
  );
};
