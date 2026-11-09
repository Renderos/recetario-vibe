"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import type { Recipe } from "@/lib/types";
import { RecipeCard, RecipeGrid } from "./recipe-card";
import { RecipeGridSkeleton } from "./skeletons";

/**
 * Lee los ids guardados en localStorage y pide cada receta a /api/recipes/[id].
 * Mantiene un caché local (useState) para no repetir peticiones al quitar
 * un favorito.
 */
export function FavoritesClient() {
  const { favorites, ready } = useFavorites();
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
  const [failed, setFailed] = useState<string[]>([]);

  // Ids guardados que aún no hemos cargado (ni fallaron): estado derivado
  const pending = favorites.filter((id) => !recipes[id] && !failed.includes(id));
  const pendingKey = pending.join(",");

  useEffect(() => {
    if (!ready || !pendingKey) return;
    const missing = pendingKey.split(",");
    const controller = new AbortController();

    Promise.allSettled(
      missing.map(async (id) => {
        const res = await fetch(`/api/recipes/${id}`, { signal: controller.signal });
        if (!res.ok) throw new Error(id);
        return (await res.json()) as Recipe;
      }),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const loaded: Record<string, Recipe> = {};
      const errors: string[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled") loaded[r.value.id] = r.value;
        else errors.push(missing[i]);
      });
      setRecipes((prev) => ({ ...prev, ...loaded }));
      setFailed((prev) => [...prev, ...errors]);
    });

    return () => controller.abort();
  }, [ready, pendingKey]);

  if (!ready) return <RecipeGridSkeleton count={3} />;

  if (favorites.length === 0) {
    return (
      <div className="space-y-4 rounded-3xl border border-dashed border-border p-10 text-center">
        <p className="font-display text-2xl font-semibold">Aún no tienes favoritos</p>
        <p className="text-muted">
          Toca el corazón de cualquier receta para guardarla aquí.
        </p>
        <Link
          href="/buscar"
          className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Buscar recetas
        </Link>
      </div>
    );
  }

  const visible = favorites.map((id) => recipes[id]).filter(Boolean);
  const failedVisible = failed.filter((id) => favorites.includes(id));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        {favorites.length} receta{favorites.length === 1 ? "" : "s"} guardada
        {favorites.length === 1 ? "" : "s"}
      </p>

      {failedVisible.length > 0 && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-accent-soft p-4 text-sm">
          <span>
            No pudimos cargar {failedVisible.length} receta
            {failedVisible.length === 1 ? "" : "s"}.
          </span>
          <button
            type="button"
            onClick={() => setFailed([])}
            className="rounded-full bg-accent px-4 py-1.5 font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      <RecipeGrid>
        {visible.map((r) => (
          <RecipeCard key={r.id} {...r} />
        ))}
      </RecipeGrid>

      {pending.length > 0 && (
        <RecipeGridSkeleton count={Math.min(pending.length, 3)} />
      )}
    </div>
  );
}
