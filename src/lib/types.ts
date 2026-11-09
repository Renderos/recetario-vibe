// Tipos de dominio que usa la app (independientes de la forma cruda de TheMealDB)

export type Ingredient = {
  name: string;
  measure: string;
};

/** Versión resumida: lo que devuelven los listados (filtro por categoría). */
export type RecipeSummary = {
  id: string;
  name: string;
  thumbnail: string;
};

/** Receta completa con ingredientes e instrucciones. */
export type Recipe = RecipeSummary & {
  category: string | null;
  area: string | null;
  instructions: string[];
  ingredients: Ingredient[];
  tags: string[];
  youtube: string | null;
  source: string | null;
};

export type Category = {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
};

/** Forma estándar de error que devuelven nuestros Route Handlers. */
export type ApiError = {
  error: string;
};
