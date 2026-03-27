const QUESTION_TIME_MIN = 5;
const QUESTION_TIME_MAX = 60;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

export type CreateQuizQuestionInput = {
  text: string;
  timeSeconds: number;
  multiple: boolean;
  options: string[];
  correctOptionIndexes: number[];
};

export type CreateQuizPayload = {
  title: string;
  description: string;
  questions: CreateQuizQuestionInput[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseCreateQuizPayload(
  body: unknown,
): CreateQuizPayload | null {
  if (!isPlainObject(body)) {
    return null;
  }

  const title = body.title;
  const description = body.description;
  const questions = body.questions;

  if (typeof title !== 'string' || typeof description !== 'string') {
    return null;
  }

  if (!Array.isArray(questions)) {
    return null;
  }

  const parsedQuestions: CreateQuizQuestionInput[] = [];

  for (const q of questions) {
    if (!isPlainObject(q)) {
      return null;
    }

    const text = q.text;
    const timeSeconds = q.timeSeconds;
    const multiple = q.multiple;
    const options = q.options;
    const correctOptionIndexes = q.correctOptionIndexes;

    if (typeof text !== 'string') {
      return null;
    }
    if (typeof timeSeconds !== 'number' || !Number.isInteger(timeSeconds)) {
      return null;
    }
    if (typeof multiple !== 'boolean') {
      return null;
    }
    if (!Array.isArray(options)) {
      return null;
    }
    if (!Array.isArray(correctOptionIndexes)) {
      return null;
    }

    const opts: string[] = [];
    for (const o of options) {
      if (typeof o !== 'string') {
        return null;
      }
      opts.push(o);
    }

    const correct: number[] = [];
    for (const c of correctOptionIndexes) {
      if (typeof c !== 'number' || !Number.isInteger(c)) {
        return null;
      }
      correct.push(c);
    }

    parsedQuestions.push({
      text,
      timeSeconds,
      multiple,
      options: opts,
      correctOptionIndexes: correct,
    });
  }

  return {
    title,
    description,
    questions: parsedQuestions,
  };
}

export function validateCreateQuizPayload(
  payload: CreateQuizPayload,
): string | null {
  const title = payload.title.trim();
  if (!title) {
    return 'Укажите название викторины';
  }
  if (title.length > 255) {
    return 'Название слишком длинное';
  }

  if (payload.questions.length === 0) {
    return 'Добавьте хотя бы один вопрос';
  }

  for (let i = 0; i < payload.questions.length; i++) {
    const q = payload.questions[i];
    const prefix = `Вопрос ${i + 1}: `;

    const text = q.text.trim();
    if (!text) {
      return `${prefix}введите текст`;
    }

    if (
      q.timeSeconds < QUESTION_TIME_MIN ||
      q.timeSeconds > QUESTION_TIME_MAX
    ) {
      return `${prefix}время ответа от ${QUESTION_TIME_MIN} до ${QUESTION_TIME_MAX} с`;
    }

    const trimmedOptions = q.options.map((o) => o.trim());
    if (
      trimmedOptions.length < MIN_OPTIONS ||
      trimmedOptions.length > MAX_OPTIONS
    ) {
      return `${prefix}нужно от ${MIN_OPTIONS} до ${MAX_OPTIONS} вариантов ответа`;
    }

    if (trimmedOptions.some((o) => !o)) {
      return `${prefix}заполните все варианты ответа`;
    }

    if (trimmedOptions.some((o) => o.length > 512)) {
      return `${prefix}вариант ответа слишком длинный`;
    }

    const correct = q.correctOptionIndexes;
    if (correct.length === 0) {
      return `${prefix}отметьте хотя бы один правильный ответ`;
    }

    if (!q.multiple && correct.length !== 1) {
      return `${prefix}можно выбрать только один правильный ответ`;
    }

    const uniqueCorrect = new Set(correct);
    if (uniqueCorrect.size !== correct.length) {
      return `${prefix}повторяются отметки правильных ответов`;
    }

    for (const idx of correct) {
      if (idx < 0 || idx >= trimmedOptions.length) {
        return `${prefix}некорректный индекс правильного ответа`;
      }
    }
  }

  return null;
}

export function normalizeCreateQuizPayload(
  payload: CreateQuizPayload,
): CreateQuizPayload {
  return {
    title: payload.title.trim(),
    description: payload.description.trim(),
    questions: payload.questions.map((q) => ({
      ...q,
      text: q.text.trim(),
      options: q.options.map((o) => o.trim()),
    })),
  };
}
