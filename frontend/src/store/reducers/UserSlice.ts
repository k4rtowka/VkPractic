import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../models/User';

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_USER = 'user';

interface UserState {
  user: User | null;
  token: string | null;
}

const loadFromStorage = (): UserState => ({
  token: localStorage.getItem(STORAGE_KEY_TOKEN),
  user: (() => {
    const s = localStorage.getItem(STORAGE_KEY_USER);
    return s ? (JSON.parse(s) as User) : null;
  })(),
});

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromStorage() as UserState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem(STORAGE_KEY_TOKEN, action.payload.token);
      localStorage.setItem(
        STORAGE_KEY_USER,
        JSON.stringify(action.payload.user),
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.user));
      }
    },
  },
});

export const { setAuth, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
