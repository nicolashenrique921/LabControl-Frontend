import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DadosAvaliacao {
  confirmado: number;
  nao_confirmado: number;
  inconclusivo: number;
}

const CORES = {
  confirmado: '#34D399',
  nao_confirmado: '#F87171',
  inconclusivo: '#F5A623',
};

const LABELS = {
  confirmado: 'Confirmado',
  nao_confirmado: 'Não Confirmado',
  inconclusivo: 'Inconclusivo',
};

export default function GraficoAvaliacaoTestes({ dados }: { dados: DadosAvaliacao }) {
  const chartData = (Object.keys(dados) as (keyof DadosAvaliacao)[])
    .map((chave) => ({ name: LABELS[chave], value: dados[chave], cor: CORES[chave] }))
    .filter((item) => item.value > 0);

  const total = dados.confirmado + dados.nao_confirmado + dados.inconclusivo;

  return (
    <div className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4 mb-6">
      <h3 className="text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-3">
        Resultado dos Testes
      </h3>

      <div className="flex gap-3 mb-3 flex-wrap">
        <span className="text-xs font-mono bg-blueprint-deep/5 dark:bg-slate-900 text-blueprint-deep dark:text-slate-300 px-2.5 py-1 rounded-full">
          Total: <span className="font-bold">{total}</span>
        </span>
        <span className="text-xs font-mono bg-status-success/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
          Confirmado: <span className="font-bold">{dados.confirmado}</span>
        </span>
        <span className="text-xs font-mono bg-status-error/15 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full">
          Não Confirmado: <span className="font-bold">{dados.nao_confirmado}</span>
        </span>
        <span className="text-xs font-mono bg-status-warning/15 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
          Inconclusivo: <span className="font-bold">{dados.inconclusivo}</span>
        </span>
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 py-8 text-center">Sem dados para os filtros aplicados</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} label>
              {chartData.map((item) => (
                <Cell key={item.name} fill={item.cor} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}