import { createContext } from 'react';

export type Tema = 'claro' | 'escuro';

export interface ThemeContextType {
  tema: Tema;
  alternarTema: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);