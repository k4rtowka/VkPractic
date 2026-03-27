import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm/AuthForm';
import s from './AuthPage.module.scss';
import { useAppDispatch } from '../../hooks/redux';
import { loginUser, registerUser } from '../../store/actions/authActions';
import { loginFields, registrationFields } from './const';
import { validateField } from '../../utils/validation';

export const AuthPage = () => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isRegister = mode === 'register';
  const fields = isRegister ? registrationFields : loginFields;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const value = data[field.name] ?? '';
      const error = validateField(value, field.validationType);
      if (error) {
        newErrors[field.name] = error;
      }
    }
    if (isRegister && data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const promise = isRegister
      ? dispatch(
          registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        )
      : dispatch(loginUser({ email: data.email, password: data.password }));

    promise
      .unwrap()
      .then(() => navigate('/home'))
      .catch(() => {});
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
        errors={errors}
        footer={
          isRegister
            ? {
                text: 'Уже есть аккаунт?',
                linkText: 'Войти',
                onClick: () => {
                  setMode('login');
                  setErrors({});
                },
              }
            : {
                text: 'Нет аккаунта?',
                linkText: 'Регистрация',
                onClick: () => {
                  setMode('register');
                  setErrors({});
                },
              }
        }
      />
    </div>
  );
};
