import cn from 'classnames';
import s from './Leaderboard.module.scss';

type Entry = {
  userId: number;
  name: string;
  totalScore: number;
  rank?: number;
};

type LeaderboardProps = {
  entries: Entry[];
  highlightUserId?: number;
};

export const Leaderboard = ({ entries, highlightUserId }: LeaderboardProps) => (
  <div className={s.list}>
    {entries.map((entry, i) => (
      <div
        key={entry.userId}
        className={cn(
          s.row,
          i === 0 && s.first,
          entry.userId === highlightUserId && s.highlight,
        )}
      >
        <span className={s.rank}>{entry.rank ?? i + 1}</span>
        <span className={s.name}>{entry.name}</span>
        <span className={s.score}>{entry.totalScore}</span>
      </div>
    ))}
  </div>
);
