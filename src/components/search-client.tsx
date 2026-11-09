"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ApiError, Recipe } from "@/lib/types";
import { RecipeCard, RecipeGrid } from "./recipe-card";
import { RecipeGridSkeleton } from "./skeletons";

const SUGGESTIONS = ["pasta", "chicken", "cake", "soup", "taco", "curry"];
const DEBOUNCE_MS = 400;

/** Resultado de una petición concreta; `key` identifica query + intento. */
type Result =
  | { key: string; status: "error"; message: string }
  | { key: string; status: "success"; recipes: Recipe[]; query: string };

type State =
  | { status: "idle" }
  | { status: "loading" }
  | Omit<Extract<Result, { status: "error" }>, "key">
  | Omit<Extract<Result, { status: "success" }>, "key">;

export function SearchClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [debounced, setDebounced] = useState(query.trim());
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);

  // El estado visible se DERIVA: si el último resultado no corresponde a la
  // búsqueda actual, estamos cargando. Así no hace falta setState en el efecto.
  const requestKey = `${debounced}#${attempt}`;
  const state: State =
    debounced.length < 2
      ? { status: "idle" }
      : result?.key === requestKey
        ? result
        : { status: "loading" };

  // 1) Debounce: espera a que el usuario deje de escribir
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // 2) Sincroniza ?q= en la URL para poder compartir la búsqueda
  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debounced, pathname, router]);

  // 3) Llama al Route Handler /api/recipes
  useEffect(() => {
    if (debounced.length < 2) return;

    const key = `${debounced}#${attempt}`;
    const controller = new AbortController();

    fetch(`/api/recipes?q=${encodeURIComponent(debounced)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const data: { recipes: Recipe[] } | ApiError = await res.json();
        if (!res.ok || "error" in data) {
          throw new Error("error" in data ? data.error : "La búsqueda falló");
        }
        setResult({ key, status: "success", recipes: data.recipes, query: debounced });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          key,
          status: "error",
          message: err instanceof Error ? err.message : "Error desconocido",
        });
      });

    return () => controller.abort();
  }, [debounced, attempt]);

  return (
    <div className="space-y-8">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setDebounced(query.trim());
        }}
        className="space-y-3"
      >
        <label htmlFor="search" className="sr-only">
          Nombre de la receta
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
            width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. lasagne, chicken curry, brownies…"
            autoComplete="off"
            maxLength={60}
            className="w-full rounded-full border border-border bg-surface py-4 pr-5 pl-12 text-base outline-none transition-shadow focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Prueba:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s);
                setDebounced(s);
              }}
              className="rounded-full border border-border px-3 py-1 transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite">
        {state.status === "idle" && (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
            {query.trim().length === 1
              ? "Escribe al menos 2 caracteres."
              : "Los resultados aparecerán aquí."}
          </p>
        )}

        {state.status === "loading" && <RecipeGridSkeleton count={6} />}

        {state.status === "error" && (
          <div role="alert" className="space-y-3 rounded-2xl border border-accent/40 bg-accent-soft p-6">
            <p className="font-semibold text-accent">No pudimos completar la búsqueda</p>
            <p className="text-sm">{state.message}</p>
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {state.status === "success" && state.recipes.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
            No encontramos recetas para “{state.query}”. Prueba con otra palabra en inglés.
          </p>
        )}

        {state.status === "success" && state.recipes.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {state.recipes.length} resultado{state.recipes.length === 1 ? "" : "s"} para “{state.query}”
            </p>
            <RecipeGrid>
              {state.recipes.map((r) => (
                <RecipeCard key={r.id} {...r} />
              ))}
            </RecipeGrid>
          </div>
        )}
      </div>
    </div>
  );
}
