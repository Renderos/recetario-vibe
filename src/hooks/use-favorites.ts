"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Favoritos guardados en localStorage.
 * localStorage es un "sistema externo" a React, así que nos suscribimos con
 * useSyncExternalStore: todos los componentes que usan el hook (navbar,
 * botones, página de favoritos) se mantienen sincronizados, incluso entre
 * pestañas gracias al evento "storage".
 */

const STORAGE_KEY = "sazon:favorites";
const CHANGE_EVENT = "sazon:favorites-change";
const EMPTY: string[] = [];

// El snapshot debe ser estable: solo re-parseamos si cambia el string guardado
let lastRaw: string | null = null;
let lastParsed: string[] = EMPTY;

function getSnapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === lastRaw) return lastParsed;
  lastRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    lastParsed = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : EMPTY;
  } catch {
    lastParsed = EMPTY;
  }
  return lastParsed;
}

// En el servidor no hay localStorage: null significa "todavía no lo sabemos"
function getServerSnapshot(): null {
  return null;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeFavorites(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Modo privado o almacenamiento lleno: ignoramos sin romper la UI
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useFavorites() {
  const snapshot = useSyncExternalStore<string[] | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  // false durante SSR/hidratación: evita parpadeos de "no tienes favoritos"
  const ready = snapshot !== null;
  const favorites = snapshot ?? EMPTY;

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    writeFavorites(
      current.includes(id) ? current.filter((f) => f !== id) : [id, ...current],
    );
  }, []);

  const remove = useCallback((id: string) => {
    writeFavorites(getSnapshot().filter((f) => f !== id));
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return { favorites, ready, toggle, remove, isFavorite };
}
