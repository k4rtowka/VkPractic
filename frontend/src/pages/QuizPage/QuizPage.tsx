import s from './QuizPage.module.scss';

export const QuizPage = () => {
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <header className={s.header}>
          <h1 className={s.title}>Викторина</h1>
        </header>
      </div>
    </div>
  );
};
