import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const AUTH_REQUIRED = true;

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (AUTH_REQUIRED && !isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
