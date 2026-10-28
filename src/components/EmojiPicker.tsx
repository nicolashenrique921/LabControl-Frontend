import { useState, useRef, useEffect } from 'react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🙂', '😉', '😊', '😍',
  '🤔', '😐', '😑', '😴', '😪', '🙄', '😮', '😲', '😢', '😭',
  '😡', '🤬', '😱', '🥳', '😎', '🤓', '👍', '👎', '👌', '🤝',
  '👏', '🙏', '💪', '✅', '❌', '⚠️', '🔥', '⭐', '📌', '📎',
  '📝', '📅', '⏰', '🔧', '🔌', '🛠️', '💻', '🖥️', '📡', '🌐',
];

interface EmojiPickerProps {
  onSelecionar: (emoji: string) => void;
}

export default function EmojiPicker({ onSelecionar }: EmojiPickerProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="px-2.5 py-1.5 rounded text-sm hover:bg-blueprint-deep/5 transition border border-transparent hover:border-gray-200"
        title="Inserir emoji"
      >
        😀
      </button>
      {aberto && (
        <div className="absolute z-30 mt-1 w-64 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg p-2 grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelecionar(emoji);
                setAberto(false);
              }}
              className="text-lg hover:bg-signal/10 rounded p-1 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}