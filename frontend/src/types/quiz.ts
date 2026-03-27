export type CreateQuizQuestionPayload = {
  text: string;
  timeSeconds: number;
  multiple: boolean;
  options: string[];
  correctOptionIndexes: number[];
};

export type CreateQuizPayload = {
  title: string;
  description: string;
  questions: CreateQuizQuestionPayload[];
};

export type CreateQuizResponse = {
  quiz: { id: number; title: string };
  session: {
    id: number;
    roomCode: string;
    status: 'waiting';
    questionsCount: number;
  };
};

export type LobbyParticipantDto = {
  userId: number;
  name: string;
};

export type HostSessionResponse = {
  session: {
    id: number;
    roomCode: string;
    status: 'waiting' | 'live' | 'finished';
    createdAt: string;
  };
  quiz: {
    id: number;
    title: string;
    questionsCount: number;
  };
  participants: LobbyParticipantDto[];
};

export type JoinSessionResponse = {
  sessionId: number;
  quizTitle: string;
  alreadyJoined: boolean;
};

export type MyQuizDto = {
  quizId: number;
  title: string;
  description: string;
  createdAt: string;
  questionsCount: number;
  sessionId: number | null;
  sessionStatus: string | null;
  roomCode: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  participantCount: number;
  role: 'host' | 'participant';
};

export type LeaderboardEntryDto = {
  userId: number;
  name: string;
  totalScore: number;
};

export type SessionResultsResponse = {
  session: {
    id: number;
    status: string;
    startedAt: string | null;
    finishedAt: string | null;
  };
  quiz: { id: number; title: string; questionsCount: number };
  leaderboard: LeaderboardEntryDto[];
};

export type GameQuestionDto = {
  questionIndex: number;
  totalQuestions: number;
  body: string;
  options: { id: number; sortOrder: number; body: string }[];
  timeSeconds: number;
  multipleChoice: boolean;
};

export type PlayerResultDto = {
  userId: number;
  name: string;
  scoreDelta: number;
  totalScore: number;
  correct: boolean;
};

export type QuestionResultDto = {
  questionIndex: number;
  correctOptionIds: number[];
  playerResults: PlayerResultDto[];
  isLast: boolean;
};

export type GameLeaderboardEntry = {
  rank: number;
  userId: number;
  name: string;
  totalScore: number;
};
