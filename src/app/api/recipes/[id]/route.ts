import type { NextRequest } from "next/server";
import { getRecipeById } from "@/lib/mealdb";
import { errorResponse } from "@/lib/api-response";
import type { ApiError } from "@/lib/types";

/**
 * GET /api/recipes/52772
 * Devuelve una receta completa por su id.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/recipes/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return Response.json(
        { error: `No existe ninguna receta con id ${id}.` } satisfies ApiError,
        { status: 404 },
      );
    }
    return Response.json(recipe);
  } catch (error) {
    return errorResponse(error);
  }
}
