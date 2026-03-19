import { useState } from 'react';
import {
  AuthForm,
  type AuthFormField,
} from '../../components/AuthForm/AuthForm';
import s from './AuthPage.module.scss';

const registrationFields: AuthFormField[] = [
  {
    name: 'name',
    label: 'Имя',
    type: 'text',
    placeholder: 'Ваше имя',
    icon: 'user',
    id: 'name',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'ваш@email.com',
    icon: 'email',
    id: 'email',
  },
  {
    name: 'password',
    label: 'Пароль',
    type: 'password',
    placeholder: '********',
    icon: 'lock',
    id: 'password',
  },
  {
    name: 'confirmPassword',
    label: 'Подтвердите пароль',
    type: 'password',
    placeholder: '********',
    icon: 'lock',
    id: 'confirmPassword',
  },
];

const loginFields: AuthFormField[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'ваш@email.com',
    icon: 'email',
    id: 'email',
  },
  {
    name: 'password',
    label: 'Пароль',
    type: 'password',
    placeholder: '........',
    icon: 'lock',
    id: 'password',
  },
];

export const AuthPage = () => {
  const [mode, setMode] = useState<'register' | 'login'>('register');

  const isRegister = mode === 'register';
  const fields = isRegister ? registrationFields : loginFields;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(isRegister ? 'Register' : 'Login', data);
    // TODO: вызов API
  };

  return (
    <div className={s.root}>
      <AuthForm
        title={isRegister ? 'Регистрация' : 'Вход в систему'}
        subtitle={
          isRegister ? 'Создайте свой аккаунт' : 'Добро пожаловать в QuizMaster'
        }
        fields={fields}
        submitButtonText={isRegister ? 'Зарегистрироваться' : 'Войти'}
        onSubmit={handleSubmit}
        footer={
          isRegister
            ? {
                text: 'Уже есть аккаунт?',
                linkText: 'Войти',
                onClick: () => setMode('login'),
              }
            : {
                text: 'Нет аккаунта?',
                linkText: 'Регистрация',
                onClick: () => setMode('register'),
              }
        }
      />
    </div>
  );
};
