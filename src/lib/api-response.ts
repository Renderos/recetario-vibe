import "server-only";

import { MealDbError } from "./mealdb";
import type { ApiError } from "./types";

/** Convierte cualquier excepción en una respuesta JSON uniforme. */
export function errorResponse(error: unknown): Response {
  if (error instanceof MealDbError) {
    return Response.json({ error: error.message } satisfies ApiError, { status: error.status });
  }
  console.error("[api] error inesperado", error);
  return Response.json(
    { error: "Ocurrió un error inesperado en el servidor." } satisfies ApiError,
    { status: 500 },
  );
}
