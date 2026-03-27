export type CreateQuizWithSessionResult = {
  quizId: number;
  sessionId: number;
  roomCode: string;
  title: string;
  questionsCount: number;
};

export type GameQuestionOption = {
  id: number;
  sortOrder: number;
  body: string;
  isCorrect: boolean;
};

export type GameQuestion = {
  id: number;
  sortOrder: number;
  body: string;
  timeSeconds: number;
  multipleChoice: boolean;
  options: GameQuestionOption[];
};

export type LeaderboardEntry = {
  userId: number;
  name: string;
  totalScore: number;
};
