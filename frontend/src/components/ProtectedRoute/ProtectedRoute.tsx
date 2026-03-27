import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { isAuthSelector } from '../../store/selectors/AuthSelectors';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuth = useAppSelector(isAuthSelector);

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
