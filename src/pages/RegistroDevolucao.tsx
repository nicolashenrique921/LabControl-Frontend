import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axiosClient from '../api/axiosClient';
import type { Tecnico, Equipamento } from '../types';
import Alerta from '../components/Alerta';
import ComboboxBusca from '../components/ComboboxBusca';

export default function RegistroDevolucao() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  const [mac, setMac] = useState('');
  const [os, setOs] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [equipamentoId, setEquipamentoId] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [descricao, setDescricao] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarListas();
  }, []);

  useEffect(() => {
    if (!mensagemSucesso && !erro) return;
    const timer = setTimeout(() => {
      setMensagemSucesso('');
      setErro('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [mensagemSucesso, erro]);

  async function carregarListas() {
    try {
      const [respTecnicos, respEquipamentos] = await Promise.all([
        axiosClient.get<Tecnico[]>('/tecnicos'),
        axiosClient.get<Equipamento[]>('/equipamentos'),
      ]);
      setTecnicos(respTecnicos.data);
      setEquipamentos(respEquipamentos.data);
    } catch {
      setErro('Não foi possível carregar técnicos/equipamentos');
    }
  }

  function limparFormulario() {
    setMac('');
    setOs('');
    setTecnicoId('');
    setEquipamentoId('');
    setDataDevolucao('');
    setDescricao('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');

    if (!tecnicoId || !equipamentoId || !dataDevolucao) {
      setErro('Técnico, equipamento e data de devolução são obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      await axiosClient.post('/devolucoes', {
        mac: mac.trim() ? mac.trim().toUpperCase() : null,
        os: os.trim() ? os.trim().toUpperCase() : null,
        tecnico_id: Number(tecnicoId),
        equipamento_id: Number(equipamentoId),
        data_devolucao: dataDevolucao,
        descricao: descricao.trim() || null,
      });

      setMensagemSucesso('Devolução registrada com sucesso!');
      limparFormulario();
    } catch {
      setErro('Erro ao registrar devolução. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  const opcoesEquipamento = equipamentos.map((eq) => ({
    id: String(eq.id),
    label: `${eq.marca} - ${eq.tipo}`,
    textoBusca: `${eq.marca} ${eq.tipo}`.toLowerCase(),
  }));

  const opcoesTecnico = tecnicos.map((tec) => ({
    id: String(tec.id),
    label: tec.nome,
    textoBusca: tec.nome.toLowerCase(),
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blueprint dark:text-signal-soft font-mono mb-6">
        Registro de Devolução
      </h1>

      {mensagemSucesso && <Alerta tipo="sucesso" mensagem={mensagemSucesso} />}
      {erro && <Alerta tipo="erro" mensagem={erro} />}

      <form
        onSubmit={handleSubmit}
        className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-6 space-y-4"
      >
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-1">
            Equipamento <span className="text-gray-400 dark:text-slate-500 normal-case">(opcional)</span>
          </label>
          <ComboboxBusca
            opcoes={opcoesEquipamento}
            valor={equipamentoId}
            onSelecionar={setEquipamentoId}
            placeholder="Busque por marca ou tipo..."
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 mb-1">
            Técnico <span className="text-status-error">*</span>
          </label>
          <ComboboxBusca
            opcoes={opcoesTecnico}
            valor={tecnicoId}
            onSelecionar={setTecnicoId}
            placeholder="Busque pelo nome..."
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 mb-1">
            Data de Devolução <span className="text-status-error">*</span>
          </label>
          <input
            type="date"
            value={dataDevolucao}
            onChange={(e) => setDataDevolucao(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 mb-1">
              MAC <span className="text-gray-400 normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              value={mac}
              onChange={(e) => setMac(e.target.value)}
              placeholder="AA:BB:CC:11:22:33"
              className="w-full border border-gray-300 rounded px-3 py-2 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 mb-1">
              OS <span className="text-gray-400 normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              value={os}
              onChange={(e) => setOs(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 mb-1">
            Descrição <span className="text-gray-400 normal-case">(opcional)</span>
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full bg-signal text-blueprint-deep font-mono uppercase tracking-wide font-semibold py-2.5 rounded hover:bg-signal-soft hover:shadow-[0_0_16px_rgba(56,189,248,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Devolução'}
        </button>
      </form>
    </div>
  );
}