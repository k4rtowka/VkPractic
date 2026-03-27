import {
  QUESTION_TIME_DEFAULT,
  QUESTION_TIME_MAX,
  QUESTION_TIME_MIN,
  type QuizQuestionDraft,
} from './types';

export const clampQuestionTime = (seconds: number): number => {
  return Math.min(
    QUESTION_TIME_MAX,
    Math.max(QUESTION_TIME_MIN, Math.round(seconds)),
  );
};

export const createEmptyQuestion = (): QuizQuestionDraft => {
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: '',
    timeSeconds: QUESTION_TIME_DEFAULT,
    multiple: false,
    options: ['', ''],
    correctOptionIndexes: [],
  };
};
