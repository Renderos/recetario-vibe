import "server-only";

import { MealDbError } from "./mealdb";
import type { ApiError } from "./types";

const UPSTREAM_MESSAGE =
  "No pudimos obtener los datos de TheMealDB. Intenta de nuevo en unos segundos.";

/**
 * Convierte cualquier excepción en una respuesta JSON uniforme.
 *
 * Ojo: los errores lanzados dentro de funciones con 'use cache' se serializan
 * y, en producción, llegan redactados (pierden la clase y el mensaje). Como en
 * nuestros handlers la única fuente de fallo es TheMealDB, cualquier error se
 * responde como 502 (Bad Gateway) con un mensaje genérico y seguro.
 */
export function errorResponse(error: unknown): Response {
  if (error instanceof MealDbError) {
    return Response.json({ error: error.message } satisfies ApiError, {
      status: error.status,
    });
  }
  console.error("[api] fallo al consultar TheMealDB", error);
  return Response.json({ error: UPSTREAM_MESSAGE } satisfies ApiError, {
    status: 502,
  });
}
