
// src/components/ProtectedRoute.tsx
// Componente para proteger rotas que exigem autenticação.
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react'; // Importar React para JSX.Element

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;