import { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import type { Nota, NotaResumo } from '../types';
import EmojiPicker from '../components/EmojiPicker';

type StatusSalvamento = 'salvo' | 'salvando' | 'digitando' | 'erro';

export default function BlocoNotas() {
  const [notas, setNotas] = useState<NotaResumo[]>([]);
  const [notaAtual, setNotaAtual] = useState<Nota | null>(null);
  const [titulo, setTitulo] = useState('');
  const [status, setStatus] = useState<StatusSalvamento>('salvo');
  const [busca, setBusca] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notaAtualIdRef = useRef<number | null>(null);
  const notaArrastadaRef = useRef<number | null>(null);

  useEffect(() => {
    carregarNotas();
  }, []);

  async function carregarNotas() {
    const resposta = await axiosClient.get<NotaResumo[]>('/notas');
    setNotas(resposta.data);
    if (resposta.data.length > 0 && !notaAtualIdRef.current) {
      abrirNota(resposta.data[0].id);
    }
  }

  async function abrirNota(id: number) {
    salvarAgoraSeNecessario();
    const resposta = await axiosClient.get<Nota>(`/notas/${id}`);
    setNotaAtual(resposta.data);
    setTitulo(resposta.data.titulo);
    notaAtualIdRef.current = resposta.data.id;
    setStatus('salvo');
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = resposta.data.conteudo;
      }
    }, 0);
  }

  async function novaNota() {
    salvarAgoraSeNecessario();
    const resposta = await axiosClient.post<Nota>('/notas');
    setNotas((prev) => [
      {
        id: resposta.data.id,
        titulo: resposta.data.titulo,
        fixada: resposta.data.fixada,
        ordem: resposta.data.ordem,
        atualizado_em: resposta.data.atualizado_em,
      },
      ...prev,
    ]);
    setNotaAtual(resposta.data);
    setTitulo(resposta.data.titulo);
    notaAtualIdRef.current = resposta.data.id;
    if (editorRef.current) editorRef.current.innerHTML = '';
    setStatus('salvo');
  }

  async function excluirNotaAtual() {
    if (!notaAtual) return;
    if (!confirm(`Excluir a nota "${notaAtual.titulo}"? Essa ação não pode ser desfeita.`)) return;

    await axiosClient.delete(`/notas/${notaAtual.id}`);
    const restantes = notas.filter((n) => n.id !== notaAtual.id);
    setNotas(restantes);
    notaAtualIdRef.current = null;

    if (restantes.length > 0) {
      abrirNota(restantes[0].id);
    } else {
      setNotaAtual(null);
      setTitulo('');
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  }

  async function alternarFixar(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    const resposta = await axiosClient.put(`/notas/${id}/fixar`);
    setNotas((prev) => {
      const atualizado = prev.map((n) => (n.id === id ? { ...n, fixada: resposta.data.fixada } : n));
      return atualizado.sort((a, b) => {
        if (a.fixada !== b.fixada) return a.fixada ? -1 : 1;
        return a.ordem - b.ordem;
      });
    });
  }

  function handleDragStart(id: number) {
    notaArrastadaRef.current = id;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(idAlvo: number) {
    const idArrastada = notaArrastadaRef.current;
    notaArrastadaRef.current = null;
    if (!idArrastada || idArrastada === idAlvo) return;

    setNotas((prev) => {
      const lista = [...prev];
      const indiceOrigem = lista.findIndex((n) => n.id === idArrastada);
      const indiceDestino = lista.findIndex((n) => n.id === idAlvo);
      if (indiceOrigem === -1 || indiceDestino === -1) return prev;

      if (lista[indiceOrigem].fixada !== lista[indiceDestino].fixada) return prev;

      const [item] = lista.splice(indiceOrigem, 1);
      lista.splice(indiceDestino, 0, item);

      const novaOrdem = lista.map((nota, index) => ({ id: nota.id, ordem: index }));
      axiosClient.put('/notas/reordenar', { ordens: novaOrdem }).catch(() => {});

      return lista.map((nota, index) => ({ ...nota, ordem: index }));
    });
  }

  function exportarNota() {
    if (!notaAtual || !editorRef.current) return;

    const texto = editorRef.current.innerText;
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(titulo || 'nota').trim()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  function imprimirNota() {
    if (!notaAtual || !editorRef.current) return;

    const janela = window.open('', '_blank');
    if (!janela) return;

    janela.document.write(`
    <html>
      <head>
        <title>${titulo || 'Nota'}</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; }
          h1 { font-size: 20px; border-bottom: 2px solid #0E3A5C; padding-bottom: 8px; margin-bottom: 20px; }
          .conteudo { font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
        </style>
      </head>
      <body>
        <h1>${titulo || 'Sem título'}</h1>
        <div class="conteudo">${editorRef.current.innerHTML}</div>
      </body>
    </html>
  `);
    janela.document.close();
    janela.focus();
    janela.print();
    janela.close();
  }

  const salvar = useCallback(async () => {
    if (!notaAtualIdRef.current || !editorRef.current) return;
    setStatus('salvando');
    try {
      const conteudo = editorRef.current.innerHTML;
      const resposta = await axiosClient.put<Nota>(`/notas/${notaAtualIdRef.current}`, {
        titulo: titulo.trim() || 'Sem título',
        conteudo,
      });
      setNotas((prev) =>
        prev
          .map((n) =>
            n.id === resposta.data.id
              ? { ...n, titulo: resposta.data.titulo, atualizado_em: resposta.data.atualizado_em }
              : n
          )
          .sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime())
      );
      setStatus('salvo');
    } catch {
      setStatus('erro');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titulo]);

  function salvarAgoraSeNecessario() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      salvar();
    }
  }

  function agendarSalvamento() {
    setStatus('digitando');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      salvar();
    }, 1200);
  }

  function aplicarFormatacao(comando: string, valor?: string) {
    editorRef.current?.focus();
    document.execCommand(comando, false, valor);
    agendarSalvamento();
  }

  function inserirEmoji(emoji: string) {
    editorRef.current?.focus();
    document.execCommand('insertText', false, emoji);
    agendarSalvamento();
  }

  const notasFiltradas = busca.trim()
    ? notas.filter((n) => n.titulo.toLowerCase().includes(busca.toLowerCase()))
    : notas;

  const LABEL_STATUS: Record<StatusSalvamento, { texto: string; cor: string }> = {
    salvo: { texto: 'Salvo', cor: 'text-status-success' },
    salvando: { texto: 'Salvando...', cor: 'text-signal' },
    digitando: { texto: 'Digitando...', cor: 'text-gray-400' },
    erro: { texto: 'Erro ao salvar', cor: 'text-status-error' },
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Lista de notas */}
      <div className="w-64 shrink-0 corner-brackets bg-white rounded-lg shadow-sm border border-signal/10 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={novaNota}
            className="w-full bg-signal text-blueprint-deep font-mono uppercase tracking-wide text-xs font-semibold py-2 rounded hover:bg-signal-soft transition"
          >
            + Nova Nota
          </button>
          <input
            type="text"
            placeholder="Buscar notas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full mt-2 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {notasFiltradas.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">Nenhuma nota ainda</p>
          )}
          {notasFiltradas.map((nota) => (
            <div
              key={nota.id}
              draggable
              onDragStart={() => handleDragStart(nota.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(nota.id)}
              onClick={() => abrirNota(nota.id)}
              className={`group flex items-center gap-1 px-3 py-2.5 border-b border-gray-50 hover:bg-signal/5 transition cursor-pointer ${
                notaAtual?.id === nota.id ? 'bg-signal/10' : ''
              }`}
            >
              <span className="text-gray-300 cursor-grab select-none" title="Arrastar para reordenar">
                ⠿
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate flex items-center gap-1">
                  {nota.fixada && <span title="Fixada">📌</span>}
                  {nota.titulo}
                </p>
                <p className="text-xs text-gray-400 font-mono">
                  {new Date(nota.atualizado_em).toLocaleDateString('pt-BR')}{' '}
                  {new Date(nota.atualizado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => alternarFixar(nota.id, e)}
                className={`opacity-0 group-hover:opacity-100 transition text-sm px-1 ${
                  nota.fixada ? 'opacity-100' : ''
                }`}
                title={nota.fixada ? 'Desafixar' : 'Fixar'}
              >
                {nota.fixada ? '📌' : '📍'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 corner-brackets bg-white rounded-lg shadow-sm border border-signal/10 flex flex-col overflow-hidden min-w-0">
        {!notaAtual ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Crie uma nota para começar
          </div>
        ) : (
          <>
            {/* Barra de menus */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 text-sm font-mono">
              <div className="relative group">
                <button className="text-gray-600 hover:text-blueprint transition">Arquivo</button>
                <div className="absolute hidden group-hover:block z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 w-44">
                  <button
                    onClick={novaNota}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10"
                  >
                    Nova nota
                  </button>
                  <button
                    onClick={exportarNota}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10"
                  >
                    Exportar (.txt)
                  </button>
                  <button
                    onClick={imprimirNota}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10"
                  >
                    Imprimir
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={excluirNotaAtual}
                    className="w-full text-left px-3 py-1.5 text-sm text-status-error hover:bg-status-error/10"
                  >
                    Excluir nota
                  </button>
                </div>
              </div>

              <div className="relative group">
                <button className="text-gray-600 hover:text-blueprint transition">Editar</button>
                <div className="absolute hidden group-hover:block z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 w-40">
                  <button
                    onClick={() => aplicarFormatacao('undo')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10"
                  >
                    Desfazer
                  </button>
                  <button
                    onClick={() => aplicarFormatacao('redo')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10"
                  >
                    Refazer
                  </button>
                </div>
              </div>

              <div className="relative group">
                <button className="text-gray-600 hover:text-blueprint transition">Formatar</button>
                <div className="absolute hidden group-hover:block z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 w-44">
                  <button
                    onClick={() => aplicarFormatacao('bold')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10 font-bold"
                  >
                    Negrito
                  </button>
                  <button
                    onClick={() => aplicarFormatacao('italic')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10 italic"
                  >
                    Itálico
                  </button>
                  <button
                    onClick={() => aplicarFormatacao('underline')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10 underline"
                  >
                    Sublinhado
                  </button>
                  <button
                    onClick={() => aplicarFormatacao('insertUnorderedList')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10"
                  >
                    Lista com marcadores
                  </button>
                  <button
                    onClick={() => aplicarFormatacao('insertOrderedList')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10"
                  >
                    Lista numerada
                  </button>
                  <button
                    onClick={() => aplicarFormatacao('removeFormat')}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-signal/10"
                  >
                    Limpar formatação
                  </button>
                </div>
              </div>

              <div className="relative group">
                <button className="text-gray-600 hover:text-blueprint transition">Exibir</button>
                <div className="absolute hidden group-hover:block z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 w-44 text-xs text-gray-500 px-3 py-2">
                  {editorRef.current?.innerText.trim().split(/\s+/).filter(Boolean).length || 0} palavras
                </div>
              </div>

              <div className="flex-1" />

              <span className={`text-xs ${LABEL_STATUS[status].cor}`}>{LABEL_STATUS[status].texto}</span>
            </div>

            {/* Barra de ferramentas rápida */}
            <div className="flex items-center gap-1 px-4 py-1.5 border-b border-gray-100">
              <button
                type="button"
                onClick={() => aplicarFormatacao('bold')}
                className="px-2.5 py-1 rounded font-bold text-sm hover:bg-blueprint-deep/5 transition"
                title="Negrito"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => aplicarFormatacao('italic')}
                className="px-2.5 py-1 rounded italic text-sm hover:bg-blueprint-deep/5 transition"
                title="Itálico"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => aplicarFormatacao('underline')}
                className="px-2.5 py-1 rounded underline text-sm hover:bg-blueprint-deep/5 transition"
                title="Sublinhado"
              >
                U
              </button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button
                type="button"
                onClick={() => aplicarFormatacao('insertUnorderedList')}
                className="px-2.5 py-1 rounded text-sm hover:bg-blueprint-deep/5 transition"
                title="Lista com marcadores"
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => aplicarFormatacao('insertOrderedList')}
                className="px-2.5 py-1 rounded text-sm hover:bg-blueprint-deep/5 transition"
                title="Lista numerada"
              >
                1. Lista
              </button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <EmojiPicker onSelecionar={inserirEmoji} />
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button
                type="button"
                onClick={exportarNota}
                className="px-2.5 py-1 rounded text-sm hover:bg-blueprint-deep/5 transition"
                title="Exportar como .txt"
              >
                ⬇ Exportar
              </button>
              <button
                type="button"
                onClick={imprimirNota}
                className="px-2.5 py-1 rounded text-sm hover:bg-blueprint-deep/5 transition"
                title="Imprimir"
              >
                🖨 Imprimir
              </button>
            </div>

            {/* Título */}
            <input
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                agendarSalvamento();
              }}
              placeholder="Título da nota"
              className="px-4 py-3 text-lg font-semibold text-blueprint font-mono border-b border-gray-100 focus:outline-none"
            />

            {/* Editor de texto */}
            <div
              ref={editorRef}
              contentEditable
              onInput={agendarSalvamento}
              className="flex-1 overflow-y-auto px-4 py-3 text-sm text-gray-800 focus:outline-none whitespace-pre-wrap break-words"
              style={{ wordBreak: 'break-word' }}
              suppressContentEditableWarning
            />
          </>
        )}
      </div>
    </div>
  );
}