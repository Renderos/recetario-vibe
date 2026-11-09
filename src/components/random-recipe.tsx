"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ApiError, Recipe } from "@/lib/types";
import { categoryLabel } from "@/lib/categories-es";
import { FavoriteButton } from "./favorite-button";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; recipe: Recipe };

/**
 * "Sorpréndeme": consume nuestro Route Handler /api/random desde el cliente
 * con useState + useEffect, y maneja sus propios estados de carga y error.
 */
export function RandomRecipe() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    // El estado "loading" se fija en el evento que dispara la petición
    // (estado inicial o botón), no aquí: así el efecto solo sincroniza con la red.
    const controller = new AbortController();

    fetch("/api/random", { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        const data: Recipe | ApiError = await res.json();
        if (!res.ok || "error" in data) {
          throw new Error("error" in data ? data.error : "Error al cargar la receta");
        }
        setState({ status: "success", recipe: data });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Error desconocido",
        });
      });

    return () => controller.abort();
  }, [nonce]);

  const another = useCallback(() => {
    setState({ status: "loading" });
    setNonce((n) => n + 1);
  }, []);

  return (
    <section
      aria-labelledby="random-title"
      aria-busy={state.status === "loading"}
      className="overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-80">
          {state.status === "success" ? (
            <Image
              src={state.recipe.thumbnail}
              alt={state.recipe.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className={`absolute inset-0 ${state.status === "loading" ? "skeleton" : "bg-accent-soft"}`} />
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Receta sorpresa
          </p>

          {state.status === "loading" && (
            <div className="space-y-3" role="status" aria-label="Cargando receta sorpresa">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          )}

          {state.status === "error" && (
            <div role="alert" className="space-y-2">
              <h2 id="random-title" className="font-display text-2xl font-semibold">
                No pudimos traer una receta
              </h2>
              <p className="text-muted">{state.message}</p>
            </div>
          )}

          {state.status === "success" && (
            <>
              <h2 id="random-title" className="font-display text-2xl font-semibold text-balance sm:text-3xl">
                {state.recipe.name}
              </h2>
              <p className="text-muted">
                {[categoryLabel(state.recipe.category), state.recipe.area]
                  .filter(Boolean)
                  .join(" · ")}{" "}
                · {state.recipe.ingredients.length} ingredientes
              </p>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {state.status === "success" && (
              <>
                <Link
                  href={`/recetas/${state.recipe.id}`}
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Ver receta
                </Link>
                <FavoriteButton id={state.recipe.id} name={state.recipe.name} />
              </>
            )}
            <button
              type="button"
              onClick={another}
              disabled={state.status === "loading"}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {state.status === "error" ? "Reintentar" : "Otra receta"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
