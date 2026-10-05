import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

// checa só se existe token; a validade é verificada pela api
const ProtectedRoute =({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
