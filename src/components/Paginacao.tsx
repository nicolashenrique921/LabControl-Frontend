interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}

function gerarPaginasVisiveis(paginaAtual: number, totalPaginas: number): (number | '...')[] {
  const delta = 1; // quantas páginas mostrar de cada lado da atual
  const paginas: (number | '...')[] = [];

  const inicio = Math.max(2, paginaAtual - delta);
  const fim = Math.min(totalPaginas - 1, paginaAtual + delta);

  paginas.push(1);

  if (inicio > 2) {
    paginas.push('...');
  }

  for (let i = inicio; i <= fim; i++) {
    paginas.push(i);
  }

  if (fim < totalPaginas - 1) {
    paginas.push('...');
  }

  if (totalPaginas > 1) {
    paginas.push(totalPaginas);
  }

  return paginas;
}

export default function Paginacao({ paginaAtual, totalPaginas, onMudarPagina }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  const paginasVisiveis = gerarPaginasVisiveis(paginaAtual, totalPaginas);

  return (
    <div className="flex items-center justify-center gap-1 py-4 flex-wrap">
      <button
        onClick={() => onMudarPagina(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="px-3 py-1.5 rounded text-sm font-mono border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ‹
      </button>

      {paginasVisiveis.map((pagina, index) =>
        pagina === '...' ? (
          <span key={`reticencias-${index}`} className="px-2 text-sm text-gray-400 font-mono">
            …
          </span>
        ) : (
          <button
            key={pagina}
            onClick={() => onMudarPagina(pagina)}
            className={`px-3 py-1.5 rounded text-sm font-mono border transition ${
              pagina === paginaAtual
                ? 'bg-signal text-blueprint-deep border-signal font-semibold'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {pagina}
          </button>
        )
      )}

      <button
        onClick={() => onMudarPagina(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="px-3 py-1.5 rounded text-sm font-mono border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
      </button>
    </div>
  );
}