import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/useAuth';

const CHAVE_BLOQUEIO = 'labcontrol_bloqueado_ate';

export default function Login() {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(() => {
    const motivo = sessionStorage.getItem('labcontrol_logout_motivo');
    if (motivo === 'inatividade') {
      sessionStorage.removeItem('labcontrol_logout_motivo');
      return 'Sua sessão expirou por inatividade. Faça login novamente.';
    }
    return '';
  });
  const [carregando, setCarregando] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ao montar, verifica se já existe um bloqueio ativo salvo (sobrevive a reload)
  useEffect(() => {
    const bloqueadoAteStr = localStorage.getItem(CHAVE_BLOQUEIO);
    if (bloqueadoAteStr) {
      const bloqueadoAte = Number(bloqueadoAteStr);
      const restante = Math.ceil((bloqueadoAte - Date.now()) / 1000);
      if (restante > 0) {
        iniciarContagem(restante);
      } else {
        localStorage.removeItem(CHAVE_BLOQUEIO);
      }
    }
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function iniciarContagem(segundos: number) {
    setSegundosRestantes(segundos);
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      setSegundosRestantes((atual) => {
        if (atual <= 1) {
          if (intervaloRef.current) clearInterval(intervaloRef.current);
          localStorage.removeItem(CHAVE_BLOQUEIO);
          setErro('');
          return 0;
        }
        return atual - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (segundosRestantes > 0) return;

    setErro('');
    setCarregando(true);

    try {
      await login(username, senha);
      navigate('/devolucao');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        const segundos = err.response.data?.segundos_restantes || 60;
        localStorage.setItem(CHAVE_BLOQUEIO, String(Date.now() + segundos * 1000));
        iniciarContagem(segundos);
        setErro('Muitas tentativas. Aguarde para tentar novamente.');
      } else {
        const mensagem = axios.isAxiosError(err) ? err.response?.data?.mensagem : undefined;
        setErro(mensagem || 'Erro ao fazer login');
      }
    } finally {
      setCarregando(false);
    }
  }

  const bloqueado = segundosRestantes > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-blueprint bg-grid-blueprint relative overflow-hidden p-4">
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="120" cy="100" r="4" fill="#38BDF8" />
        <circle cx="380" cy="60" r="4" fill="#38BDF8" />
        <circle cx="680" cy="140" r="4" fill="#38BDF8" />
        <circle cx="200" cy="400" r="4" fill="#38BDF8" />
        <circle cx="600" cy="480" r="4" fill="#38BDF8" />
        <circle cx="450" cy="300" r="4" fill="#38BDF8" />
        <line x1="120" y1="100" x2="450" y2="300" stroke="#38BDF8" strokeWidth="1" className="linha-sinal" />
        <line x1="380" y1="60" x2="450" y2="300" stroke="#38BDF8" strokeWidth="1" opacity="0.3" />
        <line x1="680" y1="140" x2="450" y2="300" stroke="#38BDF8" strokeWidth="1" opacity="0.3" />
        <line x1="200" y1="400" x2="450" y2="300" stroke="#38BDF8" strokeWidth="1" opacity="0.3" />
        <line x1="600" y1="480" x2="450" y2="300" stroke="#38BDF8" strokeWidth="1" opacity="0.3" />
      </svg>

      <form
        onSubmit={handleSubmit}
        className="corner-brackets relative bg-blueprint-deep/90 backdrop-blur-sm p-8 rounded-md shadow-2xl w-full max-w-sm border border-signal/20"
      >
        <div className="mb-6 text-center">
          <p className="font-mono text-signal text-xs tracking-widest uppercase mb-1">
            IT Lab · Gestão de Ativos
          </p>
          <h1 className="text-2xl font-bold text-white font-mono">Lab Control</h1>
        </div>

        {erro && (
          <div className="flex items-center gap-2 bg-status-error/10 border border-status-error/30 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            <span className="w-2 h-2 rounded-full bg-status-error led-pulse-error shrink-0" />
            {erro}
          </div>
        )}

        {bloqueado && (
          <div className="flex items-center justify-center gap-2 bg-status-warning/10 border border-status-warning/30 text-amber-200 px-4 py-3 rounded mb-4">
            <span className="font-mono text-2xl font-bold text-status-warning">{segundosRestantes}s</span>
            <span className="text-xs">para tentar novamente</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-mono uppercase tracking-wide text-signal-soft mb-1">
            Usuário
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={bloqueado}
            className="w-full bg-white/5 border border-white/20 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal transition disabled:opacity-40"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-mono uppercase tracking-wide text-signal-soft mb-1">
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={bloqueado}
            className="w-full bg-white/5 border border-white/20 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal transition disabled:opacity-40"
            required
          />
        </div>

        <button
          type="submit"
          disabled={carregando || bloqueado}
          className="w-full bg-signal text-blueprint-deep py-2.5 rounded font-mono font-semibold uppercase tracking-wide text-sm hover:bg-signal-soft hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {bloqueado ? `Aguarde ${segundosRestantes}s` : carregando ? 'Conectando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}