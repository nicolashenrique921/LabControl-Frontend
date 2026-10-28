import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { DevolucaoSemTeste, AvaliacaoTeste } from '../types';
import Alerta from '../components/Alerta';
import ComboboxBusca from '../components/ComboboxBusca';

const LABEL_AVALIACAO: Record<AvaliacaoTeste, string> = {
  confirmado: 'Confirmado',
  nao_confirmado: 'Não Confirmado',
  inconclusivo: 'Inconclusivo',
};

export default function ResultadoTeste() {
  const [devolucoes, setDevolucoes] = useState<DevolucaoSemTeste[]>([]);
  const [devolucaoId, setDevolucaoId] = useState('');
  const [devolucaoSelecionada, setDevolucaoSelecionada] = useState<DevolucaoSemTeste | null>(null);

  const [dataTeste, setDataTeste] = useState('');
  const [avaliacao, setAvaliacao] = useState<AvaliacaoTeste | ''>('');
  const [observacao, setObservacao] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDevolucoesSemTeste();
  }, []);

  useEffect(() => {
    if (!mensagemSucesso && !erro) return;
    const timer = setTimeout(() => {
      setMensagemSucesso('');
      setErro('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [mensagemSucesso, erro]);

  async function carregarDevolucoesSemTeste() {
    try {
      const resposta = await axiosClient.get<DevolucaoSemTeste[]>('/testes/sem-teste');
      setDevolucoes(resposta.data);
    } catch {
      setErro('Não foi possível carregar as devoluções pendentes de teste');
    }
  }

  function handleSelecionarDevolucao(id: string) {
    setDevolucaoId(id);
    const dev = devolucoes.find((d) => String(d.id) === id) || null;
    setDevolucaoSelecionada(dev);
  }

  function limparFormulario() {
    setDevolucaoId('');
    setDevolucaoSelecionada(null);
    setDataTeste('');
    setAvaliacao('');
    setObservacao('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');

    if (!devolucaoId || !dataTeste || !avaliacao) {
      setErro('Devolução, data do teste e avaliação são obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      await axiosClient.post('/testes', {
        devolucao_id: Number(devolucaoId),
        data_teste: dataTeste,
        avaliacao,
        observacao: observacao.trim() || null,
      });

      setMensagemSucesso('Resultado de teste registrado com sucesso!');
      limparFormulario();
      carregarDevolucoesSemTeste();
    } catch (err) {
      const mensagem =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
          : undefined;
      setErro(mensagem || 'Erro ao registrar resultado de teste');
    } finally {
      setSalvando(false);
    }
  }

  const opcoesDevolucao = devolucoes.map((dev) => ({
    id: String(dev.id),
    label: `${dev.tecnico_nome} · ${dev.equipamento_marca} ${dev.equipamento_tipo} · ${new Date(dev.data_devolucao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`,
    descricao: `MAC: ${dev.mac || '-'}  ·  OS: ${dev.os || '-'}`,
    textoBusca: [
      dev.tecnico_nome,
      dev.equipamento_marca,
      dev.equipamento_tipo,
      dev.mac || '',
      dev.os || '',
      dev.data_devolucao,
    ]
      .join(' ')
      .toLowerCase(),
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blueprint dark:text-signal-soft font-mono mb-6">Resultado de Teste</h1>

      {mensagemSucesso && <Alerta tipo="sucesso" mensagem={mensagemSucesso} />}
      {erro && <Alerta tipo="erro" mensagem={erro} />}

      <form
        onSubmit={handleSubmit}
        className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-6 space-y-4"
      >
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">
            Devolução <span className="text-status-error">*</span>
          </label>
          <ComboboxBusca
            opcoes={opcoesDevolucao}
            valor={devolucaoId}
            onSelecionar={(id) => handleSelecionarDevolucao(id)}
            placeholder="Busque por técnico, MAC, OS, marca ou tipo..."
            vazio="Nenhuma devolução pendente encontrada"
          />
          {devolucoes.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
              Não há devoluções pendentes de teste no momento.
            </p>
          )}
        </div>

        {devolucaoSelecionada && (
          <div className="bg-blueprint-deep/5 dark:bg-slate-900 border border-signal/10 dark:border-signal/20 rounded-md p-4 text-sm space-y-1 dark:text-slate-300">
            <p className="font-mono text-xs uppercase tracking-wide text-blueprint-deep/60 dark:text-slate-500 mb-2">
              Dados do Registro
            </p>
            <p><span className="text-gray-500 dark:text-slate-500">Técnico:</span> {devolucaoSelecionada.tecnico_nome}</p>
            <p><span className="text-gray-500 dark:text-slate-500">Equipamento:</span> {devolucaoSelecionada.equipamento_marca} - {devolucaoSelecionada.equipamento_tipo}</p>
            <p className="font-mono"><span className="text-gray-500 dark:text-slate-500 font-sans">MAC:</span> {devolucaoSelecionada.mac || '-'}</p>
            <p className="font-mono"><span className="text-gray-500 dark:text-slate-500 font-sans">OS:</span> {devolucaoSelecionada.os || '-'}</p>
            <p>
              <span className="text-gray-500 dark:text-slate-500">Data devolução:</span>{' '}
              {new Date(devolucaoSelecionada.data_devolucao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            </p>
            {devolucaoSelecionada.descricao && (
              <p><span className="text-gray-500 dark:text-slate-500">Defeito relatado:</span> {devolucaoSelecionada.descricao}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">
            Data do Teste <span className="text-status-error">*</span>
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
            Avaliação <span className="text-status-error">*</span>
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
            Observação <span className="text-gray-400 dark:text-slate-500 normal-case">(opcional)</span>
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full bg-signal text-blueprint-deep font-mono uppercase tracking-wide font-semibold py-2.5 rounded hover:bg-signal-soft hover:shadow-[0_0_16px_rgba(56,189,248,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Registrar Resultado'}
        </button>
      </form>
    </div>
  );
}