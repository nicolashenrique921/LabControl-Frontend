import { useEffect, useRef, useCallback } from 'react';

const TEMPO_LIMITE_MS = 30 * 60 * 1000; // 30 minutos

const EVENTOS_DE_ATIVIDADE = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
];

export function useLogoutPorInatividade(aoExpirar: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reiniciarTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      aoExpirar();
    }, TEMPO_LIMITE_MS);
  }, [aoExpirar]);

  useEffect(() => {
    reiniciarTimer();

    EVENTOS_DE_ATIVIDADE.forEach((evento) => {
      window.addEventListener(evento, reiniciarTimer);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      EVENTOS_DE_ATIVIDADE.forEach((evento) => {
        window.removeEventListener(evento, reiniciarTimer);
      });
    };
  }, [reiniciarTimer]);
}