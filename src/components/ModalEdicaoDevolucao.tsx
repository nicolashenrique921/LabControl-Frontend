import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { Devolucao, Tecnico, Equipamento } from '../types';
import Alerta from './Alerta';

interface ModalEdicaoProps {
  devolucao: Devolucao;
  tecnicos: Tecnico[];
  equipamentos: Equipamento[];
  onFechar: () => void;
  onSalvo: () => void;
}

export default function ModalEdicaoDevolucao({
  devolucao,
  tecnicos,
  equipamentos,
  onFechar,
  onSalvo,
}: ModalEdicaoProps) {
  const [mac, setMac] = useState(devolucao.mac || '');
  const [os, setOs] = useState(devolucao.os || '');
  const [tecnicoId, setTecnicoId] = useState(String(devolucao.tecnico_id || ''));
  const [equipamentoId, setEquipamentoId] = useState(String(devolucao.equipamento_id || ''));
  const [dataDevolucao, setDataDevolucao] = useState(devolucao.data_devolucao.slice(0, 10));
  const [descricao, setDescricao] = useState(devolucao.descricao || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (!tecnicoId || !equipamentoId || !dataDevolucao) {
      setErro('Técnico, equipamento e data são obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      await axiosClient.put(`/devolucoes/${devolucao.id}`, {
        mac: mac.trim() ? mac.trim().toUpperCase() : null,
        os: os.trim() ? os.trim().toUpperCase() : null,
        tecnico_id: Number(tecnicoId),
        equipamento_id: Number(equipamentoId),
        data_devolucao: dataDevolucao,
        descricao: descricao.trim() || null,
      });
      onSalvo();
      onFechar();
    } catch {
      setErro('Erro ao salvar alterações');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-blueprint-deep/70 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="corner-brackets relative bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-signal/20 w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-blueprint dark:text-signal-soft font-mono mb-4">Editar Devolução</h2>

        {erro && <Alerta tipo="erro" mensagem={erro} />}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="flex-1 border border-gray-300 dark:border-slate-600 rounded py-2 text-gray-700 dark:text-slate-300 font-mono uppercase tracking-wide text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              Equipamento
            </label>
            <select
              value={equipamentoId}
              onChange={(e) => setEquipamentoId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
              required
            >
              <option value="">Selecione</option>
              {equipamentos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.marca} - {eq.tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex-1 border border-gray-300 dark:border-slate-600 rounded py-2 text-gray-700 dark:text-slate-300 font-mono uppercase tracking-wide text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              Técnico
            </label>
            <select
              value={tecnicoId}
              onChange={(e) => setTecnicoId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
              required
            >
              <option value="">Selecione</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex-1 border border-gray-300 dark:border-slate-600 rounded py-2 text-gray-700 dark:text-slate-300 font-mono uppercase tracking-wide text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              Data
            </label>
            <input
              type="date"
              value={dataDevolucao}
              onChange={(e) => setDataDevolucao(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex-1 border border-gray-300 dark:border-slate-600 rounded py-2 text-gray-700 dark:text-slate-300 font-mono uppercase tracking-wide text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                MAC
              </label>
              <input
                type="text"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-signal"
              />
            </div>
            <div>
              <label className="flex-1 border border-gray-300 dark:border-slate-600 rounded py-2 text-gray-700 dark:text-slate-300 font-mono uppercase tracking-wide text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                OS
              </label>
              <input
                type="text"
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-signal"
              />
            </div>
          </div>

          <div>
            <label className="flex-1 border border-gray-300 dark:border-slate-600 rounded py-2 text-gray-700 dark:text-slate-300 font-mono uppercase tracking-wide text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 border border-gray-300 rounded py-2 text-gray-700 font-mono uppercase tracking-wide text-sm hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-signal text-blueprint-deep font-mono uppercase tracking-wide text-sm font-semibold rounded py-2 hover:bg-signal-soft hover:shadow-[0_0_16px_rgba(56,189,248,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}