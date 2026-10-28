import { useState } from 'react';
import type { ReactNode } from 'react';
import axiosClient from '../api/axiosClient';
import type { Usuario } from '../types';
import { AuthContext } from './AuthContextInstance';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioSalvo = localStorage.getItem('labcontrol_usuario');
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  });
  const [carregando] = useState(false);

  async function login(username: string, senha: string) {
    const resposta = await axiosClient.post('/auth/login', { username, senha });
    const { token, usuario: usuarioLogado } = resposta.data;

    localStorage.setItem('labcontrol_token', token);
    localStorage.setItem('labcontrol_usuario', JSON.stringify(usuarioLogado));
    setUsuario(usuarioLogado);
  }

  function logout() {
    localStorage.removeItem('labcontrol_token');
    localStorage.removeItem('labcontrol_usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}