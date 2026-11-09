"use client";

import Link from "next/link";
import { useEffect } from "react";

/** UI compartida por los error.tsx de la app. */
export function ErrorState({
  error,
  retry,
  title = "Algo salió mal",
}: {
  error: unknown;
  retry: () => void;
  title?: string;
}) {
  useEffect(() => {
    // Aquí se podría reportar a un servicio como Sentry
    console.error(error);
  }, [error]);

  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: string }).digest)
      : null;

  return (
    <div role="alert" className="mx-auto max-w-lg space-y-5 py-16 text-center">
      <p className="font-display text-6xl">🍳</p>
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="text-muted">
        No pudimos cargar esta sección. Puede que el servicio de recetas no
        esté disponible en este momento.
      </p>
      {digest && <p className="text-xs text-muted">Código: {digest}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
