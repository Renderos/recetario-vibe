"use client";

import { ErrorState } from "@/components/error-state";

export default function RecipeError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorState error={error} retry={retry} title="No pudimos cargar la receta" />;
}
