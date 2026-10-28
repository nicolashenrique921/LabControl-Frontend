import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { Teste, AvaliacaoTeste } from '../types';
import ModalEdicaoTeste from '../components/ModalEdicaoTeste';
import GraficoAvaliacaoTestes from '../components/GraficoAvaliacaoTestes';
import Paginacao from '../components/Paginacao';

const LABEL_AVALIACAO: Record<AvaliacaoTeste, string> = {
  confirmado: 'Confirmado',
  nao_confirmado: 'Não Confirmado',
  inconclusivo: 'Inconclusivo',
};

const COR_AVALIACAO: Record<AvaliacaoTeste, string> = {
  confirmado: 'bg-status-success/15 text-emerald-700',
  nao_confirmado: 'bg-status-error/15 text-red-700',
  inconclusivo: 'bg-status-warning/15 text-amber-700',
};

const ITENS_POR_PAGINA = 5;

export default function ConsultaTestes() {
  const [testes, setTestes] = useState<Teste[]>([]);

  const [filtroTecnico, setFiltroTecnico] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroMac, setFiltroMac] = useState('');
  const [filtroOs, setFiltroOs] = useState('');
  const [filtroAvaliacao, setFiltroAvaliacao] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [testeEditando, setTesteEditando] = useState<Teste | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [dadosGraficos, setDadosGraficos] = useState({
    confirmado: 0,
    nao_confirmado: 0,
    inconclusivo: 0,
  });

  const totalPaginas = Math.ceil(testes.length / ITENS_POR_PAGINA);
  const testesPaginados = testes.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  const montarParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (filtroTecnico) params.tecnico = filtroTecnico;
    if (filtroTipo) params.tipo = filtroTipo;
    if (filtroMarca) params.marca = filtroMarca;
    if (filtroMac) params.mac = filtroMac;
    if (filtroOs) params.os = filtroOs;
    if (filtroAvaliacao) params.avaliacao = filtroAvaliacao;
    if (filtroDataInicio) params.data_inicio = filtroDataInicio;
    if (filtroDataFim) params.data_fim = filtroDataFim;
    return params;
  }, [
    filtroTecnico,
    filtroTipo,
    filtroMarca,
    filtroMac,
    filtroOs,
    filtroAvaliacao,
    filtroDataInicio,
    filtroDataFim,
  ]);

  const buscar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = montarParams();
      const [respTestes, respGraficos] = await Promise.all([
        axiosClient.get<Teste[]>('/testes', { params }),
        axiosClient.get('/testes/graficos', { params }),
      ]);
      setTestes(respTestes.data);
      setPaginaAtual(1);
      setDadosGraficos(respGraficos.data);
    } catch {
      // erro silencioso
    } finally {
      setCarregando(false);
    }
  }, [montarParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiltrar(e: FormEvent) {
    e.preventDefault();
    buscar();
  }

  function limparFiltros() {
    setFiltroTecnico('');
    setFiltroTipo('');
    setFiltroMarca('');
    setFiltroMac('');
    setFiltroOs('');
    setFiltroAvaliacao('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  }

  async function excluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este teste?')) return;
    try {
      await axiosClient.delete(`/testes/${id}`);
      buscar();
    } catch {
      alert('Erro ao excluir teste');
    }
  }

  async function exportar(formato: 'excel' | 'pdf') {
    const params = montarParams();
    const resposta = await axiosClient.get(`/testes/exportar/${formato}`, {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([resposta.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = formato === 'excel' ? 'testes.xlsx' : 'testes.pdf';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-blueprint dark:text-signal-soft font-mono mb-6">Consulta de Testes</h1>

      <form
        onSubmit={handleFiltrar}
        className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4 mb-6 grid grid-cols-1 md:grid-cols-8 gap-3"
      >
        <input
          type="text"
          placeholder="Técnico"
          value={filtroTecnico}
          onChange={(e) => setFiltroTecnico(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
        />
        <input
          type="text"
          placeholder="Tipo (ex: ONT)"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
        />
        <input
          type="text"
          placeholder="Marca"
          value={filtroMarca}
          onChange={(e) => setFiltroMarca(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
        />
        <input
          type="text"
          placeholder="MAC"
          value={filtroMac}
          onChange={(e) => setFiltroMac(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-signal"
        />
        <input
          type="text"
          placeholder="OS"
          value={filtroOs}
          onChange={(e) => setFiltroOs(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-signal"
        />
        <select
          value={filtroAvaliacao}
          onChange={(e) => setFiltroAvaliacao(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
        >
          <option value="">Todas avaliações</option>
          <option value="confirmado">Confirmado</option>
          <option value="nao_confirmado">Não Confirmado</option>
          <option value="inconclusivo">Inconclusivo</option>
        </select>
        <input
          type="date"
          value={filtroDataInicio}
          onChange={(e) => setFiltroDataInicio(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
        />
        <input
          type="date"
          value={filtroDataFim}
          onChange={(e) => setFiltroDataFim(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
        />

        <div className="md:col-span-8 flex gap-2">
          <button
            type="submit"
            className="bg-signal text-blueprint-deep px-4 py-2 rounded text-sm font-mono uppercase tracking-wide font-semibold hover:bg-signal-soft hover:shadow-[0_0_16px_rgba(56,189,248,0.4)] active:scale-[0.98] transition-all"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={limparFiltros}
            className="border border-gray-300 dark:border-slate-600 px-4 py-2 rounded text-sm text-gray-700 dark:text-slate-300 font-mono uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            Limpar filtros
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => exportar('excel')}
            className="bg-status-success text-white px-4 py-2 rounded text-sm font-mono uppercase tracking-wide font-medium hover:brightness-110 transition"
          >
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={() => exportar('pdf')}
            className="bg-status-error text-white px-4 py-2 rounded text-sm font-mono uppercase tracking-wide font-medium hover:brightness-110 transition"
          >
            Exportar PDF
          </button>
        </div>
      </form>

      <GraficoAvaliacaoTestes dados={dadosGraficos} />

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-mono text-blueprint-deep/70 dark:text-slate-400">
          <span className="text-blueprint dark:text-signal-soft font-bold">{testes.length}</span> registro
          {testes.length !== 1 ? 's' : ''} encontrado{testes.length !== 1 ? 's' : ''}
          {totalPaginas > 1 && ` · página ${paginaAtual} de ${totalPaginas}`}
        </p>
      </div>

      <div className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blueprint-deep/5 dark:bg-slate-900 border-b-2 border-signal/20">
            <tr>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Data Teste</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Técnico</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Marca</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Tipo</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">MAC</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">OS</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Defeito Relatado</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Avaliação</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Observação</th>
              <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500 dark:text-slate-500">
                  Carregando...
                </td>
              </tr>
            )}
            {!carregando && testes.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500 dark:text-slate-500">
                  Nenhum teste encontrado
                </td>
              </tr>
            )}
            {!carregando &&
              testesPaginados.map((teste) => (
                <tr key={teste.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-signal/5 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 dark:text-slate-300">
                    {new Date(teste.data_teste).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </td>
                  <td className="px-4 py-3 dark:text-slate-300">{teste.tecnico_nome}</td>
                  <td className="px-4 py-3 dark:text-slate-300">{teste.equipamento_marca}</td>
                  <td className="px-4 py-3 font-mono dark:text-slate-300">{teste.equipamento_tipo}</td>
                  <td className="px-4 py-3 font-mono dark:text-slate-300">{teste.mac || '-'}</td>
                  <td className="px-4 py-3 font-mono dark:text-slate-300">{teste.os || '-'}</td>
                  <td className="px-4 py-3 max-w-xs truncate dark:text-slate-300">{teste.descricao_defeito || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-mono uppercase ${COR_AVALIACAO[teste.avaliacao]}`}>
                      {LABEL_AVALIACAO[teste.avaliacao]}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate dark:text-slate-300">{teste.observacao || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setTesteEditando(teste)}
                      className="text-signal hover:text-blueprint dark:hover:text-signal-soft font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(teste.id)}
                      className="text-status-error hover:text-red-700 font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Paginacao
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        onMudarPagina={setPaginaAtual}
      />

      {testeEditando && (
        <ModalEdicaoTeste
          teste={testeEditando}
          onFechar={() => setTesteEditando(null)}
          onSalvo={buscar}
        />
      )}
    </div>
  );
}