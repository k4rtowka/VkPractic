import type { PlayerResultDto } from '../../types/quiz';
import s from './HostGamePage.module.scss';

type RoundResultsProps = {
  results: PlayerResultDto[];
};

export const RoundResults = ({ results }: RoundResultsProps) => (
  <table className={s.resultTable}>
    <thead>
      <tr>
        <th>#</th>
        <th>Участник</th>
        <th>Очки</th>
        <th>Всего</th>
      </tr>
    </thead>
    <tbody>
      {results.map((p, i) => (
        <tr key={p.userId}>
          <td>{i + 1}</td>
          <td>{p.name}</td>
          <td className={p.scoreDelta > 0 ? s.deltaPositive : s.deltaZero}>
            {p.scoreDelta > 0 ? `+${p.scoreDelta}` : '0'}
          </td>
          <td>{p.totalScore}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
