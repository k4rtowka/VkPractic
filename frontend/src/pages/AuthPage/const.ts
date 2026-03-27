import type { AuthFormField } from '../../components/AuthForm/AuthForm';

export const registrationFields: AuthFormField[] = [
  {
    name: 'name',
    label: 'Имя',
    type: 'text',
    placeholder: 'Ваше имя',
    icon: 'user',
    id: 'name',
    validationType: 'text',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'ваш@email.com',
    icon: 'email',
    id: 'email',
    validationType: 'email',
  },
  {
    name: 'password',
    label: 'Пароль',
    type: 'password',
    placeholder: '********',
    icon: 'lock',
    id: 'password',
    validationType: 'password',
  },
  {
    name: 'confirmPassword',
    label: 'Подтвердите пароль',
    type: 'password',
    placeholder: '********',
    icon: 'lock',
    id: 'confirmPassword',
    validationType: 'password',
  },
];

export const loginFields: AuthFormField[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'ваш@email.com',
    icon: 'email',
    id: 'email',
    validationType: 'email',
  },
  {
    name: 'password',
    label: 'Пароль',
    type: 'password',
    placeholder: '********',
    icon: 'lock',
    id: 'password',
    validationType: 'password',
  },
];
