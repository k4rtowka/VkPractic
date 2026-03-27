import s from './Button.module.scss';
import { type ComponentProps, type ReactNode } from 'react';
import cn from 'classnames';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  text: string;
  icon?: ReactNode;
};

export const Button = (props: ButtonProps) => {
  const { variant = 'primary', text, icon, ...rest } = props;
  return (
    <button className={cn(s.root, s[variant])} {...rest}>
      {icon && <span className={s.icon}>{icon}</span>}
      {text}
    </button>
  );
};
