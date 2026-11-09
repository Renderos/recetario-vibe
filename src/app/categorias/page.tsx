import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getCategories } from "@/lib/mealdb";
import { categoryLabel } from "@/lib/categories-es";

export const metadata: Metadata = { title: "Categorías" };

// Server Component: datos cacheados con 'use cache' → se prerenderiza en el build
export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        eyebrow={`${categories.length} categorías`}
        title="Categorías"
        description="Elige un tipo de plato para ver todas sus recetas."
      />
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categorias/${encodeURIComponent(category.name)}`}
              className="flex h-full gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent"
            >
              <Image
                src={category.thumbnail}
                alt=""
                width={96}
                height={60}
                className="h-16 w-24 shrink-0 object-contain"
              />
              <div className="min-w-0 space-y-1">
                <h2 className="font-display text-xl font-semibold">
                  {categoryLabel(category.name)}
                </h2>
                <p className="line-clamp-3 text-sm text-muted">
                  {category.description.replace(/\[\d+\]/g, "")}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
