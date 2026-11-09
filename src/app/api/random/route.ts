import { connection } from "next/server";
import { getRandomRecipe } from "@/lib/mealdb";
import { errorResponse } from "@/lib/api-response";

/**
 * GET /api/random
 * Una receta aleatoria. connection() fuerza a que se ejecute en cada
 * petición (nunca se prerenderiza en el build).
 */
export async function GET() {
  await connection();
  try {
    const recipe = await getRandomRecipe();
    return Response.json(recipe, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
