import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { RecipeCard, RecipeGrid } from "@/components/recipe-card";
import { getCategories, getRecipesByCategory } from "@/lib/mealdb";
import { categoryLabel } from "@/lib/categories-es";

// Prerenderiza todas las categorías conocidas en el build
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ nombre: c.name }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categorias/[nombre]">): Promise<Metadata> {
  const { nombre } = await params;
  return { title: categoryLabel(decodeURIComponent(nombre)) };
}

export default async function CategoryPage({
  params,
}: PageProps<"/categorias/[nombre]">) {
  const name = decodeURIComponent((await params).nombre);

  const categories = await getCategories();
  if (!categories.some((c) => c.name === name)) notFound();

  const recipes = await getRecipesByCategory(name);

  return (
    <>
      <nav aria-label="Ruta de navegación" className="mb-4 text-sm text-muted">
        <Link href="/categorias" className="hover:text-accent">
          Categorías
        </Link>{" "}
        / <span className="text-foreground">{categoryLabel(name)}</span>
      </nav>
      <PageHeader
        eyebrow={`${recipes.length} recetas`}
        title={categoryLabel(name)}
        description={`Todas las recetas de la categoría ${categoryLabel(name).toLowerCase()}.`}
      />
      <RecipeGrid>
        {recipes.map((recipe, i) => (
          <RecipeCard key={recipe.id} {...recipe} priority={i < 3} />
        ))}
      </RecipeGrid>
    </>
  );
}
