import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { Equipamento } from '../types';
import Alerta from '../components/Alerta';

export default function CadastroEquipamentos() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [marca, setMarca] = useState('');
  const [tipo, setTipo] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [marcaEdicao, setMarcaEdicao] = useState('');
  const [tipoEdicao, setTipoEdicao] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const resposta = await axiosClient.get<Equipamento[]>('/equipamentos');
    setEquipamentos(resposta.data);
  }

  async function handleCriar(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (!marca.trim() || !tipo.trim()) {
      setErro('Marca e tipo são obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      await axiosClient.post('/equipamentos', { marca: marca.trim(), tipo: tipo.trim() });
      setMarca('');
      setTipo('');
      carregar();
    } catch (err) {
      const mensagem =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
          : undefined;
      setErro(mensagem || 'Erro ao criar equipamento');
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(equip: Equipamento) {
    setEditandoId(equip.id);
    setMarcaEdicao(equip.marca);
    setTipoEdicao(equip.tipo);
  }

  async function salvarEdicao(id: number) {
    if (!marcaEdicao.trim() || !tipoEdicao.trim()) return;
    try {
      await axiosClient.put(`/equipamentos/${id}`, {
        marca: marcaEdicao.trim(),
        tipo: tipoEdicao.trim(),
      });
      setEditandoId(null);
      carregar();
    } catch (err) {
      const mensagem =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
          : undefined;
      alert(mensagem || 'Erro ao editar equipamento');
    }
  }

  async function excluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;
    try {
      await axiosClient.delete(`/equipamentos/${id}`);
      carregar();
    } catch {
      alert('Erro ao excluir equipamento');
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blueprint dark:text-signal-soft font-mono mb-6">Cadastro de Equipamentos</h1>

      {erro && <Alerta tipo="erro" mensagem={erro} />}

      <form
        onSubmit={handleCriar}
        className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4 mb-6 flex gap-3 items-end"
      >
        <div className="flex-1">
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">Marca</label>
          <input
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Ex: Huawei"
            className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">Tipo</label>
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Ex: ONT"
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
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Marca</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Tipo</th>
              <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentos.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500 dark:text-slate-500">
                  Nenhum equipamento cadastrado
                </td>
              </tr>
            )}
            {equipamentos.map((equip) => (
              <tr key={equip.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-signal/5 dark:hover:bg-slate-700/50">
                {editandoId === equip.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={marcaEdicao}
                        onChange={(e) => setMarcaEdicao(e.target.value)}
                        className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-signal"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={tipoEdicao}
                        onChange={(e) => setTipoEdicao(e.target.value)}
                        className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-signal"
                      />
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => salvarEdicao(equip.id)}
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
                    <td className="px-4 py-3 dark:text-slate-300">{equip.marca}</td>
                    <td className="px-4 py-3 font-mono dark:text-slate-300">{equip.tipo}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => iniciarEdicao(equip)}
                        className="text-signal hover:text-blueprint dark:hover:text-signal-soft font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(equip.id)}
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