export type ValidationType = 'text' | 'email' | 'phone' | 'password';

const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+?[\d\s\-()]{10,15}$/,
  password: /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
} as const;

export const validateField = (
  value: string,
  type: ValidationType,
): string | undefined => {
  const trimmed = value.trim();

  if (!value || trimmed === '') {
    return 'Заполните поле';
  }
  if (value !== trimmed) {
    return 'Уберите пробелы в начале и конце';
  }

  switch (type) {
    case 'text':
      if (trimmed.length < 2) return 'Минимум 2 символа';
      if (trimmed.length > 30) return 'Максимум 30 символов';
      break;
    case 'email':
      if (!PATTERNS.email.test(trimmed)) return 'Неверный формат email';
      break;
    case 'phone':
      if (!PATTERNS.phone.test(trimmed)) return 'Неверный формат телефона';
      break;
    case 'password':
      if (trimmed.length < 8) return 'Минимум 8 символов';
      if (!PATTERNS.password.test(trimmed)) return 'Нужны буквы и цифры';
      break;
  }
  return undefined;
};

export const getValidationAttrs = (type: ValidationType) => {
  switch (type) {
    case 'text':
      return { required: true, minLength: 2, maxLength: 30 };
    case 'email':
      return {
        required: true,
        pattern: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
      };
    case 'phone':
      return {
        pattern: '^\\+?[\\d\\s\\-()]{10,15}$',
      };
    case 'password':
      return {
        required: true,
        minLength: 8,
        pattern: '^(?=.*[a-zA-Z])(?=.*\\d).{8,}$',
      };
    default:
      return {};
  }
};
