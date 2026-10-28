import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './ThemeContextInstance';
import type { Tema } from './ThemeContextInstance';

const CHAVE_TEMA = 'labcontrol_tema';

function obterTemaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE_TEMA);
  if (salvo === 'claro' || salvo === 'escuro') return salvo;

  const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefereEscuro ? 'escuro' : 'claro';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(obterTemaInicial);

  useEffect(() => {
    const root = document.documentElement;
    if (tema === 'escuro') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(CHAVE_TEMA, tema);
  }, [tema]);

  function alternarTema() {
    setTema((atual) => (atual === 'claro' ? 'escuro' : 'claro'));
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>{children}</ThemeContext.Provider>
  );
}