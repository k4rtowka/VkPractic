import { type RootState } from '..';

const authSelector = (state: RootState) => state.user;

export const isAuthSelector = (state: RootState) =>
  authSelector(state).token !== null;
export const userSelector = (state: RootState) => authSelector(state).user;
export const tokenSelector = (state: RootState) => authSelector(state).token;
