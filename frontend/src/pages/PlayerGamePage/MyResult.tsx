import s from './PlayerGamePage.module.scss';

type MyResultProps = {
  correct: boolean;
  scoreDelta: number;
  totalScore: number;
};

export const MyResult = ({ correct, scoreDelta, totalScore }: MyResultProps) => (
  <div className={s.resultCard}>
    <p className={correct ? s.resultCorrect : s.resultIncorrect}>
      {correct ? 'Правильно!' : 'Неправильно'}
    </p>
    <p className={s.resultDelta}>+{scoreDelta}</p>
    <p className={s.resultTotal}>Всего: {totalScore} очков</p>
  </div>
);
