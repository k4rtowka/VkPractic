import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import {
  login as apiLogin,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
} from '../../api/auth';
import { snackbar } from '../../contexts/snackbar';
import { setAuth, updateUser } from '../reducers/UserSlice';
import type { RootState } from '..';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    data: { name: string; email: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await apiRegister(data);
      dispatch(setAuth({ user: res.data.user, token: res.data.token }));
      snackbar.show('Регистрация прошла успешно', 'success');
      return res.data;
    } catch (e) {
      const msg = (e as AxiosError<{ message?: string }>)?.response?.data?.message ?? 'Ошибка регистрации';
      snackbar.show(msg, 'error');
      return rejectWithValue(msg);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    data: { email: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await apiLogin(data);
      dispatch(setAuth({ user: res.data.user, token: res.data.token }));
      snackbar.show('Вход выполнен', 'success');
      return res.data;
    } catch (e) {
      const msg = (e as AxiosError<{ message?: string }>)?.response?.data?.message ?? 'Неверный логин или пароль';
      snackbar.show(msg, 'error');
      return rejectWithValue(msg);
    }
  }
);

export const updateProfileUser = createAsyncThunk(
  'auth/updateProfile',
  async (name: string, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.user.token;
    if (!token) {
      snackbar.show('Не авторизован', 'error');
      return rejectWithValue('Не авторизован');
    }
    try {
      const res = await apiUpdateProfile(name, token);
      dispatch(updateUser(res.data.user));
      snackbar.show('Профиль обновлён', 'success');
      return res.data;
    } catch (e) {
      const msg = (e as AxiosError<{ message?: string }>)?.response?.data?.message ?? 'Ошибка обновления профиля';
      snackbar.show(msg, 'error');
      return rejectWithValue(msg);
    }
  }
);
