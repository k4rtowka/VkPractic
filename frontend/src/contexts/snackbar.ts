import { createContext, useContext } from 'react';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

type ShowFn = (message: string, type?: SnackbarType, duration?: number) => void;

let showRef: ShowFn | null = null;

export const snackbar = {
  show: (msg: string, t?: SnackbarType, d = 3000) => showRef?.(msg, t, d),
};

export const SnackbarContext = createContext<{ show: ShowFn } | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

export const setSnackbarRef = (fn: ShowFn) => {
  showRef = fn;
};
export const clearSnackbarRef = () => {
  showRef = null;
};
