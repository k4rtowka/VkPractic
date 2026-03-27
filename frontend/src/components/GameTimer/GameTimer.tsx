import cn from 'classnames';
import s from './GameTimer.module.scss';

type GameTimerProps = {
  seconds: number;
  urgent?: boolean;
};

export const GameTimer = ({ seconds, urgent }: GameTimerProps) => (
  <div className={cn(s.root, urgent && s.urgent)}>{seconds}</div>
);
