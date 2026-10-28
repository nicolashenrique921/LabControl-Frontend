interface AlertaProps {
  tipo: 'sucesso' | 'erro';
  mensagem: string;
}

export default function Alerta({ tipo, mensagem }: AlertaProps) {
  const ehSucesso = tipo === 'sucesso';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-md border mb-4 text-sm font-medium ${
        ehSucesso
          ? 'bg-status-success/10 border-status-success/30 text-emerald-800 dark:text-emerald-300'
          : 'bg-status-error/10 border-status-error/30 text-red-800 dark:text-red-300'
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
          ehSucesso ? 'bg-status-success led-pulse-success' : 'bg-status-error led-pulse-error'
        }`}
      />
      {mensagem}
    </div>
  );
}