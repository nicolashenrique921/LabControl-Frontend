import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { Tecnico } from '../types';
import Alerta from '../components/Alerta';

export default function CadastroTecnicos() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const resposta = await axiosClient.get<Tecnico[]>('/tecnicos');
    setTecnicos(resposta.data);
  }

  async function handleCriar(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Nome do técnico é obrigatório');
      return;
    }

    setSalvando(true);
    try {
      await axiosClient.post('/tecnicos', { nome: nome.trim() });
      setNome('');
      carregar();
    } catch {
      setErro('Erro ao criar técnico');
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(tecnico: Tecnico) {
    setEditandoId(tecnico.id);
    setNomeEdicao(tecnico.nome);
  }

  async function salvarEdicao(id: number) {
    if (!nomeEdicao.trim()) return;
    try {
      await axiosClient.put(`/tecnicos/${id}`, { nome: nomeEdicao.trim() });
      setEditandoId(null);
      carregar();
    } catch {
      alert('Erro ao editar técnico');
    }
  }

  async function excluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este técnico?')) return;
    try {
      await axiosClient.delete(`/tecnicos/${id}`);
      carregar();
    } catch {
      alert('Erro ao excluir técnico');
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blueprint dark:text-signal-soft font-mono mb-6">Cadastro de Técnicos</h1>

      {erro && <Alerta tipo="erro" mensagem={erro} />}

      <form
        onSubmit={handleCriar}
        className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4 mb-6 flex gap-3 items-end"
      >
        <div className="flex-1">
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">
            Nome do Técnico
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: João Silva"
            className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
          />
        </div>
        <button
          type="submit"
          disabled={salvando}
          className="bg-signal text-blueprint-deep px-5 py-2 rounded font-mono uppercase tracking-wide font-semibold hover:bg-signal-soft hover:shadow-[0_0_16px_rgba(56,189,248,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      <div className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blueprint-deep/5 dark:bg-slate-900 border-b-2 border-signal/20">
            <tr>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Nome</th>
              <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tecnicos.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-6 text-gray-500 dark:text-slate-500">
                  Nenhum técnico cadastrado
                </td>
              </tr>
            )}
            {tecnicos.map((tecnico) => (
              <tr key={tecnico.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-signal/5 dark:hover:bg-slate-700/50">
                {editandoId === tecnico.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={nomeEdicao}
                        onChange={(e) => setNomeEdicao(e.target.value)}
                        className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-signal"
                      />
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => salvarEdicao(tecnico.id)}
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
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 dark:text-slate-300">{tecnico.nome}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => iniciarEdicao(tecnico)}
                        className="text-signal hover:text-blueprint dark:hover:text-signal-soft font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(tecnico.id)}
                        className="text-status-error hover:text-red-700 font-medium"
                      >
                        Excluir
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}