import { createContext } from 'react';
import type { Usuario } from '../types';

export interface AuthContextType {
  usuario: Usuario | null;
  login: (username: string, senha: string) => Promise<void>;
  logout: () => void;
  carregando: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);