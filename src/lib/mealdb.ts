import "server-only";

import { cacheLife } from "next/cache";
import type { Category, Ingredient, Recipe, RecipeSummary } from "./types";

/**
 * Servicio de acceso a TheMealDB.
 * Solo se ejecuta en el servidor: la API key vive en .env.local y nunca
 * llega al navegador. Lo consumen los Server Components y los Route Handlers.
 */

const BASE_URL =
  process.env.MEALDB_API_URL ?? "https://www.themealdb.com/api/json/v1";
const API_KEY = process.env.MEALDB_API_KEY ?? "1";

export class MealDbError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
    this.name = "MealDbError";
  }
}

// ── Formas crudas de la API ───────────────────────────────────────────────

type RawMeal = Record<string, string | null> & {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

type RawCategory = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────

async function request<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}/${API_KEY}/${endpoint}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    throw new MealDbError("No se pudo conectar con TheMealDB.");
  }
  if (!res.ok) {
    throw new MealDbError(`TheMealDB respondió con estado ${res.status}.`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new MealDbError("TheMealDB devolvió una respuesta inválida.");
  }
}

function toSummary(meal: RawMeal): RecipeSummary {
  return { id: meal.idMeal, name: meal.strMeal, thumbnail: meal.strMealThumb };
}

function toRecipe(meal: RawMeal): Recipe {
  // La API expone strIngredient1..20 y strMeasure1..20 como campos sueltos
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    if (name) {
      ingredients.push({ name, measure: meal[`strMeasure${i}`]?.trim() ?? "" });
    }
  }

  const instructions = (meal.strInstructions ?? "")
    .split(/\r?\n/)
    .map((step) => step.replace(/^\s*(step\s*)?\d+[.):-]?\s*/i, "").trim())
    .filter((step) => step.length > 3);

  return {
    ...toSummary(meal),
    category: meal.strCategory,
    area: meal.strArea,
    instructions,
    ingredients,
    tags: (meal.strTags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    youtube: meal.strYoutube || null,
    source: meal.strSource || null,
  };
}

// ── API pública del servicio ──────────────────────────────────────────────

/** Lista de categorías. Cambia muy poco, así que se cachea por días. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  const data = await request<{ categories: RawCategory[] | null }>(
    "categories.php",
  );
  return (data.categories ?? []).map((c) => ({
    id: c.idCategory,
    name: c.strCategory,
    thumbnail: c.strCategoryThumb,
    description: c.strCategoryDescription,
  }));
}

/** Recetas de una categoría (solo nombre + foto). */
export async function getRecipesByCategory(
  category: string,
): Promise<RecipeSummary[]> {
  "use cache";
  cacheLife("hours");
  const data = await request<{ meals: RawMeal[] | null }>(
    `filter.php?c=${encodeURIComponent(category)}`,
  );
  return (data.meals ?? []).map(toSummary);
}

/** Receta completa por id. Devuelve null si no existe. */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  "use cache";
  cacheLife("hours");
  if (!/^\d+$/.test(id)) return null;
  const data = await request<{ meals: RawMeal[] | null }>(
    `lookup.php?i=${id}`,
  );
  const meal = data.meals?.[0];
  return meal ? toRecipe(meal) : null;
}

/** Búsqueda por nombre. */
export async function searchRecipes(query: string): Promise<Recipe[]> {
  "use cache";
  cacheLife("hours");
  const data = await request<{ meals: RawMeal[] | null }>(
    `search.php?s=${encodeURIComponent(query)}`,
  );
  return (data.meals ?? []).map(toRecipe);
}

/** Receta aleatoria. No se cachea: cada llamada debe ser distinta. */
export async function getRandomRecipe(): Promise<Recipe> {
  const data = await request<{ meals: RawMeal[] | null }>("random.php");
  const meal = data.meals?.[0];
  if (!meal) throw new MealDbError("TheMealDB no devolvió ninguna receta.");
  return toRecipe(meal);
}
