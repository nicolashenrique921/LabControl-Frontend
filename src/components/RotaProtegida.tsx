import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

interface RotaProtegidaProps {
  children: ReactNode;
  somenteAdmin?: boolean;
}

export default function RotaProtegida({ children, somenteAdmin = false }: RotaProtegidaProps) {
  const { usuario, carregando } = useAuth();

  if (carregando) return <div>Carregando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (somenteAdmin && usuario.perfil !== 'admin') return <Navigate to="/devolucao" replace />;

  return <>{children}</>;
}