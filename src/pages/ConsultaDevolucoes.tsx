import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { Devolucao, Tecnico, Equipamento } from '../types';
import GraficosDevolucao from '../components/GraficosDevolucao';
import ModalEdicaoDevolucao from '../components/ModalEdicaoDevolucao';
import Paginacao from '../components/Paginacao';

interface DadosGraficos {
  porTecnico: { tecnico_nome: string; total: string }[];
  porTipo: { equipamento_tipo: string; total: string }[];
  porMarca: { equipamento_marca: string; total: string }[];
}

const ITENS_POR_PAGINA = 5;

export default function ConsultaDevolucoes() {
  const [devolucoes, setDevolucoes] = useState<Devolucao[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [dadosGraficos, setDadosGraficos] = useState<DadosGraficos | null>(null);

  const [filtroTecnico, setFiltroTecnico] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroMac, setFiltroMac] = useState('');
  const [filtroOs, setFiltroOs] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [devolucaoEditando, setDevolucaoEditando] = useState<Devolucao | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const montarParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (filtroTecnico) params.tecnico = filtroTecnico;
    if (filtroTipo) params.tipo = filtroTipo;
    if (filtroMarca) params.marca = filtroMarca;
    if (filtroMac) params.mac = filtroMac;
    if (filtroOs) params.os = filtroOs;
    if (filtroDataInicio) params.data_inicio = filtroDataInicio;
    if (filtroDataFim) params.data_fim = filtroDataFim;
    return params;
  }, [filtroTecnico, filtroTipo, filtroMarca, filtroMac, filtroOs, filtroDataInicio, filtroDataFim]);

  const buscar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = montarParams();
      const [respDevolucoes, respGraficos] = await Promise.all([
        axiosClient.get<Devolucao[]>('/devolucoes', { params }),
        axiosClient.get<DadosGraficos>('/devolucoes/graficos', { params }),
      ]);
      setDevolucoes(respDevolucoes.data);
      setPaginaAtual(1);
      setDadosGraficos(respGraficos.data);
    } catch {
      // erro silencioso
    } finally {
      setCarregando(false);
    }
  }, [montarParams]);

  useEffect(() => {
    async function carregar() {
      try {
        const [respTecnicos, respEquipamentos] = await Promise.all([
          axiosClient.get<Tecnico[]>('/tecnicos'),
          axiosClient.get<Equipamento[]>('/equipamentos'),
        ]);
        setTecnicos(respTecnicos.data);
        setEquipamentos(respEquipamentos.data);
        await buscar();
      } catch (error) {
        console.error(error);
      }
    }
    void carregar();
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
    setFiltroDataInicio('');
    setFiltroDataFim('');
  }

  async function excluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      await axiosClient.delete(`/devolucoes/${id}`);
      buscar();
    } catch {
      alert('Erro ao excluir devolução');
    }
  }

  async function exportar(formato: 'excel' | 'pdf') {
    const params = montarParams();
    const resposta = await axiosClient.get(`/devolucoes/exportar/${formato}`, {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([resposta.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = formato === 'excel' ? 'devolucoes.xlsx' : 'devolucoes.pdf';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  const contagemPorMac = devolucoes.reduce<Record<string, number>>((acc, dev) => {
    if (dev.mac) {
      acc[dev.mac] = (acc[dev.mac] || 0) + 1;
    }
    return acc;
  }, {});

  const totalPaginas = Math.ceil(devolucoes.length / ITENS_POR_PAGINA);
  const devolucoesPaginadas = devolucoes.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-blueprint dark:text-signal-soft font-mono mb-6">Consulta de Devoluções</h1>

      <form
        onSubmit={handleFiltrar}
        className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4 mb-6 grid grid-cols-1 md:grid-cols-7 gap-3"
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
          placeholder="Marca (ex: Huawei)"
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

        <div className="md:col-span-7 flex gap-2">
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

      {dadosGraficos && (
        <GraficosDevolucao
          porTecnico={dadosGraficos.porTecnico}
          porTipo={dadosGraficos.porTipo}
          porMarca={dadosGraficos.porMarca}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-mono text-blueprint-deep/70 dark:text-slate-400">
          <span className="text-blueprint dark:text-signal-soft font-bold">{devolucoes.length}</span> registro
          {devolucoes.length !== 1 ? 's' : ''} encontrado{devolucoes.length !== 1 ? 's' : ''}
          {totalPaginas > 1 && ` · página ${paginaAtual} de ${totalPaginas}`}
        </p>
      </div>

      <div className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blueprint-deep/5 dark:bg-slate-900 border-b-2 border-signal/20">
            <tr>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Data</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Técnico</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Marca</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Tipo</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">MAC</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">OS</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Descrição</th>
              <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500 dark:text-slate-500">
                  Carregando...
                </td>
              </tr>
            )}
            {!carregando && devolucoes.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500 dark:text-slate-500">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
            {!carregando &&
              devolucoesPaginadas.map((dev) => (
                <tr key={dev.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-signal/5 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 dark:text-slate-300">
                    {new Date(dev.data_devolucao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </td>
                  <td className="px-4 py-3 dark:text-slate-300">{dev.tecnico_nome}</td>
                  <td className="px-4 py-3 dark:text-slate-300">{dev.equipamento_marca}</td>
                  <td className="px-4 py-3 font-mono dark:text-slate-300">{dev.equipamento_tipo}</td>
                  <td className="px-4 py-3 font-mono dark:text-slate-300">
                    {dev.mac || '-'}
                    {dev.mac && contagemPorMac[dev.mac] > 1 && (
                      <span className="ml-2 text-xs bg-status-warning/20 text-amber-700 px-1.5 py-0.5 rounded-full font-mono">
                        ×{contagemPorMac[dev.mac]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono dark:text-slate-300">{dev.os || '-'}</td>
                  <td className="px-4 py-3 max-w-xs truncate dark:text-slate-300">{dev.descricao || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setDevolucaoEditando(dev)}
                      className="text-signal hover:text-blueprint dark:hover:text-signal-soft font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(dev.id)}
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

      {devolucaoEditando && (
        <ModalEdicaoDevolucao
          devolucao={devolucaoEditando}
          tecnicos={tecnicos}
          equipamentos={equipamentos}
          onFechar={() => setDevolucaoEditando(null)}
          onSalvo={buscar}
        />
      )}
    </div>
  );
}