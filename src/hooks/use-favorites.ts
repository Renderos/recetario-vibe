"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Favoritos guardados en localStorage.
 * Varios componentes usan este hook a la vez (navbar, botón, página),
 * así que se sincronizan con un evento propio + el evento "storage"
 * (este último cubre otras pestañas del navegador).
 */

const STORAGE_KEY = "sazon:favorites";
const CHANGE_EVENT = "sazon:favorites-change";

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
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
  const [favorites, setFavorites] = useState<string[]>([]);
  // false hasta leer localStorage: evita parpadeos de "no tienes favoritos"
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    setReady(true);
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = readFavorites();
    writeFavorites(
      current.includes(id) ? current.filter((f) => f !== id) : [id, ...current],
    );
  }, []);

  const remove = useCallback((id: string) => {
    writeFavorites(readFavorites().filter((f) => f !== id));
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return { favorites, ready, toggle, remove, isFavorite };
}
