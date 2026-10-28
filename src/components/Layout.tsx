import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useTheme } from '../contexts/useTheme';
import { useLogoutPorInatividade } from '../hooks/useLogoutPorInatividade';

interface LayoutProps {
  children: ReactNode;
}

const linkBase =
  'flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-mono uppercase tracking-wide transition-all';
const linkAtivo = 'bg-signal text-blueprint-deep shadow-[0_0_12px_rgba(56,189,248,0.4)]';
const linkInativo = 'text-white/70 hover:bg-white/10 hover:text-white';

export default function Layout({ children }: LayoutProps) {
  const { usuario, logout } = useAuth();
  const { tema, alternarTema } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  useLogoutPorInatividade(() => {
    sessionStorage.setItem('labcontrol_logout_motivo', 'inatividade');
    logout();
    navigate('/login');
  });

  return (
    <div className="min-h-screen bg-[#EEF3F8] dark:bg-slate-900 relative isolate overflow-x-hidden flex transition-colors">
      <div className="pointer-events-none fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-signal/20 rounded-full blur-[120px] -z-10" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[-5%] w-[600px] h-[600px] bg-blueprint/15 dark:bg-signal/10 rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none fixed inset-0 bg-grid-light dark:opacity-10 -z-10" />

      <aside className="w-64 shrink-0 bg-blueprint-deep dark:bg-slate-950 shadow-lg border-r border-signal/20 flex flex-col min-h-screen sticky top-0">
        <div className="flex items-center gap-2 px-5 py-6 border-b border-white/10">
          <span className="w-2 h-2 rounded-full bg-status-success led-pulse-success" />
          <span className="text-xl font-bold text-white font-mono tracking-tight">
            Lab Control
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3">
          <NavLink to="/devolucao" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Registro
          </NavLink>
          <NavLink to="/resultado-teste" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Resultado de Teste
          </NavLink>
          <NavLink to="/consulta" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Consulta
          </NavLink>
          <NavLink to="/consulta-testes" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Consulta de Testes
          </NavLink>
          <NavLink to="/equipamentos" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Equipamentos
          </NavLink>
          <NavLink to="/tecnicos" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Técnicos
          </NavLink>
          <NavLink to="/bloco-notas" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
            Bloco de Notas
          </NavLink>
          {usuario?.perfil === 'admin' && (
            <NavLink to="/administracao" className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}>
              Administração
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            onClick={alternarTema}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition text-sm font-mono text-white/80"
          >
            <span>{tema === 'escuro' ? '🌙 Escuro' : '☀️ Claro'}</span>
            <span
              className={`w-9 h-5 rounded-full relative transition-colors ${
                tema === 'escuro' ? 'bg-signal' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  tema === 'escuro' ? 'left-4' : 'left-0.5'
                }`}
              />
            </span>
          </button>

          <div>
            <p className="text-sm text-white/70 font-mono truncate">
              {usuario?.username}
              {usuario?.perfil === 'admin' && (
                <span className="ml-1 text-xs bg-signal/20 text-signal-soft px-2 py-0.5 rounded-full">
                  admin
                </span>
              )}
            </p>
            <button
              onClick={handleLogout}
              className="mt-2 text-sm text-status-error hover:text-red-300 font-mono uppercase tracking-wide transition"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 relative z-10 min-w-0 text-slate-800 dark:text-slate-200 transition-colors">
        {children}
      </main>
    </div>
  );
}