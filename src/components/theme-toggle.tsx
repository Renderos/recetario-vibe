"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Switch de modo claro / oscuro.
 *
 * - La preferencia se guarda en localStorage ("sazon:theme").
 * - Se aplica como atributo data-theme en <html>, que es lo que lee el CSS.
 * - Si el usuario nunca eligió, se respeta el tema del sistema operativo.
 * - El script THEME_SCRIPT (src/lib/theme.ts, inyectado en layout.tsx) aplica el tema antes de pintar,
 *   para evitar el "parpadeo" de tema incorrecto al recargar.
 */

const CHANGE_EVENT = "sazon:theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

type Theme = "light" | "dark";

function getTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

// En el servidor no sabemos el tema: null = "aún no lo sabemos"
function getServerTheme(): null {
  return null;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY) return;
    // Otra pestaña cambió el tema: lo aplicamos también aquí
    if (e.newValue === "light" || e.newValue === "dark") {
      document.documentElement.dataset.theme = e.newValue;
    } else {
      delete document.documentElement.dataset.theme;
    }
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onChange);
  };
}

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Sin almacenamiento: el tema dura solo esta visita
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    getTheme,
    getServerTheme,
  );
  const isDark = theme === "dark";
  const label = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      disabled={theme === null}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-border bg-surface transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-0"
    >
      {/* Iconos fijos a cada lado del riel */}
      <span className="pointer-events-none absolute left-1.5 text-muted" aria-hidden>
        <SunIcon />
      </span>
      <span className="pointer-events-none absolute right-1.5 text-muted" aria-hidden>
        <MoonIcon />
      </span>
      {/* Perilla que se desliza */}
      <span
        aria-hidden
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow transition-transform duration-300 motion-reduce:transition-none ${
          isDark ? "translate-x-7" : "translate-x-0.5"
        }`}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
