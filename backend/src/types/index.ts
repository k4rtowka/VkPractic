export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

export type UserPublic = Omit<User, 'password_hash'>;

export type { LobbyParticipant } from './lobby';
export type {
  CreateQuizWithSessionResult,
  GameQuestion,
  GameQuestionOption,
  LeaderboardEntry,
} from './quiz';
