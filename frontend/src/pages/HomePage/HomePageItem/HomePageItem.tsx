import s from './HomePageItem.module.scss';

type HomePageItemProps = {
  number: number;
  title: string;
  description: string;
};

export const HomePageItem = ({
  number,
  title,
  description,
}: HomePageItemProps) => {
  return (
    <div className={s.root}>
      <div className={s.number}>{number}</div>
      <div className={s.title}>{title}</div>
      <div className={s.description}>{description}</div>
    </div>
  );
};
