import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { Teste, AvaliacaoTeste } from '../types';
import Alerta from './Alerta';

interface ModalEdicaoTesteProps {
  teste: Teste;
  onFechar: () => void;
  onSalvo: () => void;
}

const LABEL_AVALIACAO: Record<AvaliacaoTeste, string> = {
  confirmado: 'Confirmado',
  nao_confirmado: 'Não Confirmado',
  inconclusivo: 'Inconclusivo',
};

export default function ModalEdicaoTeste({ teste, onFechar, onSalvo }: ModalEdicaoTesteProps) {
  const [dataTeste, setDataTeste] = useState(teste.data_teste.slice(0, 10));
  const [avaliacao, setAvaliacao] = useState<AvaliacaoTeste>(teste.avaliacao);
  const [observacao, setObservacao] = useState(teste.observacao || '');
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

    setSalvando(true);
    try {
      await axiosClient.put(`/testes/${teste.id}`, {
        data_teste: dataTeste,
        avaliacao,
        observacao: observacao.trim() || null,
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
        <h2 className="text-lg font-bold text-blueprint dark:text-signal-soft font-mono mb-1">Editar Teste</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          {teste.tecnico_nome} · {teste.equipamento_marca} {teste.equipamento_tipo}
        </p>

        {erro && <Alerta tipo="erro" mensagem={erro} />}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">
              Data do Teste
            </label>
            <input
              type="date"
              value={dataTeste}
              onChange={(e) => setDataTeste(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">
              Avaliação
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(LABEL_AVALIACAO) as AvaliacaoTeste[]).map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setAvaliacao(valor)}
                  className={`py-2 rounded text-xs font-mono uppercase tracking-wide border transition-all ${
                    avaliacao === valor
                      ? valor === 'confirmado'
                        ? 'bg-status-success text-white border-status-success'
                        : valor === 'nao_confirmado'
                        ? 'bg-status-error text-white border-status-error'
                        : 'bg-status-warning text-white border-status-warning'
                      : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:border-signal'
                  }`}
                >
                  {LABEL_AVALIACAO[valor]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">
              Observação
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 border border-gray-300 dark:border-slate-600 rounded py-2 text-gray-700 dark:text-slate-300 font-mono uppercase tracking-wide text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition"
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