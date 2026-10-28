import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { UsuarioAdmin } from '../types';
import Alerta from '../components/Alerta';

export default function Administracao() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<'admin' | 'usuario'>('usuario');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<'admin' | 'usuario'>('usuario');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const resposta = await axiosClient.get<UsuarioAdmin[]>('/usuarios');
    setUsuarios(resposta.data);
  }

  async function handleCriar(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (!username.trim() || !senha.trim()) {
      setErro('Usuário e senha são obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      await axiosClient.post('/usuarios', {
        username: username.trim(),
        senha: senha.trim(),
        perfil,
      });
      setUsername('');
      setSenha('');
      setPerfil('usuario');
      carregar();
    } catch (err: unknown) {
      const mensagem =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
          : undefined;
      setErro(mensagem || 'Erro ao criar usuário');
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(usuario: UsuarioAdmin) {
    setEditandoId(usuario.id);
    setNovaSenha('');
    setNovoPerfil(usuario.perfil);
  }

  async function salvarEdicao(id: number) {
    const payload: { senha?: string; perfil?: string } = { perfil: novoPerfil };
    if (novaSenha.trim()) {
      payload.senha = novaSenha.trim();
    }
    try {
      await axiosClient.put(`/usuarios/${id}`, payload);
      setEditandoId(null);
      carregar();
    } catch {
      alert('Erro ao editar usuário');
    }
  }

  async function excluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await axiosClient.delete(`/usuarios/${id}`);
      carregar();
    } catch {
      alert('Erro ao excluir usuário');
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blueprint dark:text-signal-soft font-mono mb-6">Administração de Usuários</h1>

      {erro && <Alerta tipo="erro" mensagem={erro} />}

      <form
        onSubmit={handleCriar}
        className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4 mb-6 flex gap-3 items-end flex-wrap"
      >
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">Usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">Perfil</label>
          <select
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as 'admin' | 'usuario')}
            className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
          >
            <option value="usuario">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={salvando}
          className="bg-signal text-blueprint-deep px-5 py-2 rounded font-mono uppercase tracking-wide font-semibold hover:bg-signal-soft hover:shadow-[0_0_16px_rgba(56,189,248,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          Criar Usuário
        </button>
      </form>

      <div className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blueprint-deep/5 dark:bg-slate-900 border-b-2 border-signal/20">
            <tr>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Usuário</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Perfil</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Nova Senha</th>
              <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-signal/5 dark:hover:bg-slate-700/50">
                <td className="px-4 py-3 font-mono dark:text-slate-300">{usuario.username}</td>
                <td className="px-4 py-3">
                  {editandoId === usuario.id ? (
                    <select
                      value={novoPerfil}
                      onChange={(e) => setNovoPerfil(e.target.value as 'admin' | 'usuario')}
                      className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-signal"
                    >
                      <option value="usuario">Usuário</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-mono uppercase ${
                        usuario.perfil === 'admin'
                          ? 'bg-signal/20 text-blueprint dark:text-signal-soft'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      {usuario.perfil}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editandoId === usuario.id ? (
                    <input
                      type="password"
                      placeholder="Deixe em branco p/ manter"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-signal"
                    />
                  ) : (
                    <span className="dark:text-slate-500">••••••••</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {editandoId === usuario.id ? (
                    <>
                      <button
                        onClick={() => salvarEdicao(usuario.id)}
                        className="text-status-success hover:text-emerald-700 font-medium"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 font-medium"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => iniciarEdicao(usuario)}
                        className="text-signal hover:text-blueprint dark:hover:text-signal-soft font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(usuario.id)}
                        className="text-status-error hover:text-red-700 font-medium"
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}