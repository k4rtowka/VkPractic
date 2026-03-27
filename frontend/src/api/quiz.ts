import axios, { isAxiosError } from 'axios';
import type { QuizQuestionDraft } from '../components/QuizQuestionEditor/types';
import type {
  CreateQuizPayload,
  CreateQuizQuestionPayload,
  CreateQuizResponse,
  HostSessionResponse,
  JoinSessionResponse,
  MyQuizDto,
  SessionResultsResponse,
} from '../types/quiz';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function mapQuestionsForApi(
  questions: QuizQuestionDraft[],
): CreateQuizQuestionPayload[] {
  return questions.map(
    ({ text, timeSeconds, multiple, options, correctOptionIndexes }) => ({
      text,
      timeSeconds,
      multiple,
      options,
      correctOptionIndexes,
    }),
  );
}

export const createQuizWithSession = (
  payload: CreateQuizPayload,
  token: string,
) =>
  api.post<CreateQuizResponse>('/quizzes', payload, {
    headers: authHeaders(token),
  });

export const getHostSession = (sessionId: number, token: string) =>
  api.get<HostSessionResponse>(`/sessions/${sessionId}`, {
    headers: authHeaders(token),
  });

export const joinSessionByCode = (roomCode: string, token: string) =>
  api.post<JoinSessionResponse>(
    '/sessions/join',
    { roomCode },
    { headers: authHeaders(token) },
  );

export const getMyQuizzes = (token: string) =>
  api.get<{ quizzes: MyQuizDto[] }>('/quizzes', {
    headers: authHeaders(token),
  });

export const getSessionResults = (sessionId: number, token: string) =>
  api.get<SessionResultsResponse>(`/sessions/${sessionId}/results`, {
    headers: authHeaders(token),
  });

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (
    isAxiosError(err) &&
    err.response?.data &&
    typeof err.response.data === 'object' &&
    err.response.data !== null &&
    'error' in err.response.data &&
    typeof (err.response.data as { error: unknown }).error === 'string'
  ) {
    return (err.response.data as { error: string }).error;
  }
  return fallback;
}
