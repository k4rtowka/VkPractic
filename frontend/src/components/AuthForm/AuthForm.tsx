import s from './AuthForm.module.scss';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import type { ValidationType } from '../../utils/validation';
import { getValidationAttrs } from '../../utils/validation';

export type AuthFormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
  icon?: string;
  id: string;
  validationType: ValidationType;
};

export type AuthFormFooter = {
  text: string;
  linkText: string;
  onClick?: () => void;
};

type AuthFormProps = {
  title: string;
  subtitle?: string;
  fields: AuthFormField[];
  submitButtonText: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  footer?: AuthFormFooter;
  errors?: Record<string, string>;
};

export const AuthForm = (props: AuthFormProps) => {
  const { title, subtitle, fields, submitButtonText, onSubmit, footer, errors } = props;

  return (
    <div className={s.card}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        {subtitle && <p className={s.subtitle}>{subtitle}</p>}
      </div>

      <form className={s.form} onSubmit={onSubmit} noValidate>
        <div className={s.fields}>
          {fields.map((field) => (
            <Input
              key={field.name}
              id={field.id}
              name={field.name}
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              icon={field.icon}
              error={errors?.[field.name]}
              {...getValidationAttrs(field.validationType)}
            />
          ))}
        </div>

        <div className={s.submitWrapper}>
          <Button type="submit" text={submitButtonText} />
        </div>

        {footer && (
          <p className={s.footer}>
            {footer.text}{' '}
            <button
              type="button"
              className={s.footerLink}
              onClick={footer.onClick}
            >
              {footer.linkText}
            </button>
          </p>
        )}
      </form>
    </div>
  );
};
