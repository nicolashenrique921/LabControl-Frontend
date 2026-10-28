import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DadoGrafico {
  total: string;
  [key: string]: string;
}

interface GraficosDevolucaoProps {
  porTecnico: DadoGrafico[];
  porTipo: DadoGrafico[];
  porMarca: DadoGrafico[];
}

export default function GraficosDevolucao({ porTecnico, porTipo, porMarca }: GraficosDevolucaoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4">
        <h3 className="text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-2">
          Por Técnico
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={porTecnico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tecnico_nome" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#38BDF8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4">
        <h3 className="text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-2">
          Por Tipo
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={porTipo}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="equipamento_tipo" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#34D399" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="corner-brackets bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-signal/10 dark:border-signal/20 p-4">
        <h3 className="text-xs font-mono uppercase tracking-wide text-blueprint-deep/70 dark:text-slate-400 mb-2">
          Por Marca
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={porMarca}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="equipamento_marca" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#F5A623" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}