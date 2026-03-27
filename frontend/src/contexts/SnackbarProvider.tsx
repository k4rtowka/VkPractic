import { useState, useEffect, type ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import {
  SnackbarContext,
  setSnackbarRef,
  clearSnackbarRef,
  type SnackbarType,
} from './snackbar';

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');
  const [duration, setDuration] = useState(3000);

  const show = (msg: string, t?: SnackbarType, d = 3000) => {
    setMessage(msg);
    setType(t ?? 'info');
    setDuration(d);
    setOpen(true);
  };

  useEffect(() => {
    setSnackbarRef(show);
    return clearSnackbarRef;
  }, []);

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity={type} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
