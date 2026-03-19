import s from './Input.module.scss';
import { type ComponentProps } from 'react';
import cn from 'classnames';
import { Svg } from '../Svg/Svg';

type InputProps = Omit<ComponentProps<'input'>, 'className'> & {
  label: string;
  icon?: string;
  className?: string;
};

export const Input = (props: InputProps) => {
  const { label, icon, className, id, ...rest } = props;

  return (
    <div className={cn(s.root, className)}>
      <label className={s.label} htmlFor={id}>
        {label}
      </label>
      <div className={s.inputWrapper}>
        {icon && (
          <span className={s.icon} aria-hidden="true">
            <Svg name={icon} className={s.iconImg} />
          </span>
        )}
        <input
          id={id}
          className={cn(s.input, icon && s.inputWithIcon)}
          {...rest}
        />
      </div>
    </div>
  );
};
