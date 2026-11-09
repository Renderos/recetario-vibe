import type { NextRequest } from "next/server";
import { searchRecipes } from "@/lib/mealdb";
import { errorResponse } from "@/lib/api-response";
import type { ApiError } from "@/lib/types";

/**
 * GET /api/recipes?q=pasta
 * Busca recetas por nombre en TheMealDB.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json(
      { error: "Escribe al menos 2 caracteres para buscar." } satisfies ApiError,
      { status: 400 },
    );
  }
  if (query.length > 60) {
    return Response.json(
      { error: "La búsqueda es demasiado larga." } satisfies ApiError,
      { status: 400 },
    );
  }

  try {
    const recipes = await searchRecipes(query);
    return Response.json({ query, count: recipes.length, recipes });
  } catch (error) {
    return errorResponse(error);
  }
}
