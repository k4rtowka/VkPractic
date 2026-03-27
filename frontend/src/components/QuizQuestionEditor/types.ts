export const QUESTION_TIME_MIN = 5;
export const QUESTION_TIME_MAX = 60;
export const QUESTION_TIME_DEFAULT = 30;

export const MAX_OPTIONS = 4;
export const MIN_OPTIONS = 2;

export type QuizQuestionDraft = {
  id: string;
  text: string;
  timeSeconds: number;
  multiple: boolean;
  options: string[];
  correctOptionIndexes: number[];
};

export type QuizQuestionEditorProps = {
  value: QuizQuestionDraft;
  onChange: (next: QuizQuestionDraft) => void;
  questionNumber: number;
  onRemove?: () => void;
  canRemove?: boolean;
};
