import s from './Button.module.scss';
import { type ComponentProps } from 'react';
import cn from 'classnames';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  text: string;
};

export const Button = (props: ButtonProps) => {
  const { variant = 'primary', text, ...rest } = props;
  return (
    <button className={cn(s.root, s[variant])} {...rest}>
      {text}
    </button>
  );
};
