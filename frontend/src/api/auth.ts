import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const register = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const updateProfile = (name: string, token: string) =>
  api.patch('/auth/profile', { name }, {
    headers: { Authorization: `Bearer ${token}` },
  });
