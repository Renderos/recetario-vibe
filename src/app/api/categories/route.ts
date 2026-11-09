import { getCategories } from "@/lib/mealdb";
import { errorResponse } from "@/lib/api-response";

/**
 * GET /api/categories
 * Lista de categorías (cacheada por días dentro del servicio).
 */
export async function GET() {
  try {
    const categories = await getCategories();
    return Response.json({ count: categories.length, categories });
  } catch (error) {
    return errorResponse(error);
  }
}
