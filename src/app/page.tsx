import Image from "next/image";
import Link from "next/link";
import { RandomRecipe } from "@/components/random-recipe";
import { getCategories } from "@/lib/mealdb";
import { categoryLabel } from "@/lib/categories-es";

// Server Component: el hero y las categorías se prerenderizan;
// la receta sorpresa es un Client Component que llama a /api/random.
export default async function HomePage() {
  const categories = await getCategories();
  const featured = categories.slice(0, 8);

  return (
    <div className="space-y-14">
      <section className="space-y-5 pt-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Recetario del mundo
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          ¿Qué vamos a cocinar hoy?
        </h1>
        <p className="max-w-xl text-lg text-muted text-pretty">
          Más de 300 recetas de {categories.length} categorías. Búscalas por
          nombre, explóralas por tipo de plato y guarda tus favoritas.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/buscar"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Buscar una receta
          </Link>
          <Link
            href="/categorias"
            className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            Ver categorías
          </Link>
        </div>
      </section>

      <RandomRecipe />

      <section aria-labelledby="featured-title" className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 id="featured-title" className="font-display text-2xl font-semibold sm:text-3xl">
            Explora por categoría
          </h2>
          <Link href="/categorias" className="shrink-0 text-sm font-semibold text-accent hover:underline">
            Ver todas →
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {featured.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categorias/${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-colors hover:border-accent"
              >
                <Image
                  src={category.thumbnail}
                  alt=""
                  width={120}
                  height={75}
                  className="h-16 w-auto object-contain"
                />
                <span className="font-semibold">{categoryLabel(category.name)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
