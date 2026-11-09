// TheMealDB está en inglés: traducimos los nombres de categoría para la UI.
// La URL sigue usando el nombre original (lo que espera la API).

const CATEGORY_LABELS: Record<string, string> = {
  Beef: "Res",
  Breakfast: "Desayuno",
  Chicken: "Pollo",
  Dessert: "Postres",
  Goat: "Cabra",
  Lamb: "Cordero",
  Miscellaneous: "Variado",
  Pasta: "Pasta",
  Pork: "Cerdo",
  Seafood: "Mariscos",
  Side: "Acompañamientos",
  Starter: "Entradas",
  Vegan: "Vegano",
  Vegetarian: "Vegetariano",
};

export function categoryLabel(name: string | null | undefined): string {
  if (!name) return "Sin categoría";
  return CATEGORY_LABELS[name] ?? name;
}
