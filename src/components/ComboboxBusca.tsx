import { useState, useRef, useEffect } from 'react';

export interface ComboboxOption {
  id: string;
  label: string;
  descricao?: string;
  textoBusca: string;
}

interface ComboboxBuscaProps {
  opcoes: ComboboxOption[];
  valor: string;
  onSelecionar: (id: string) => void;
  placeholder?: string;
  vazio?: string;
}

export default function ComboboxBusca({
  opcoes,
  valor,
  onSelecionar,
  placeholder = 'Digite para buscar...',
  vazio = 'Nenhum resultado encontrado',
}: ComboboxBuscaProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const opcaoSelecionada = opcoes.find((o) => o.id === valor);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const filtradas = busca.trim()
    ? opcoes.filter((o) => o.textoBusca.includes(busca.toLowerCase()))
    : opcoes;

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={aberto ? busca : opcaoSelecionada?.label || ''}
        onChange={(e) => {
          setBusca(e.target.value);
          if (!aberto) setAberto(true);
        }}
        onFocus={() => {
          setAberto(true);
          setBusca('');
        }}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
        autoComplete="off"
      />
      {aberto && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg">
          {filtradas.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400 dark:text-slate-500">{vazio}</div>
          )}
          {filtradas.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => {
                onSelecionar(op.id);
                setBusca('');
                setAberto(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-signal/10 transition border-b border-gray-50 dark:border-slate-700 last:border-0 ${
                op.id === valor ? 'bg-signal/10' : ''
              }`}
            >
              <div className="font-medium text-gray-800 dark:text-slate-200">{op.label}</div>
              {op.descricao && (
                <div className="text-xs text-gray-500 dark:text-slate-400 font-mono">{op.descricao}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}