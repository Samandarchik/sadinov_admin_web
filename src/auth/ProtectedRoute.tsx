import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth();
  const loc = useLocation();

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-10 w-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}
