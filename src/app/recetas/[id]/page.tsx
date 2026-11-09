import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { getRecipeById } from "@/lib/mealdb";
import { categoryLabel } from "@/lib/categories-es";

export async function generateMetadata({
  params,
}: PageProps<"/recetas/[id]">): Promise<Metadata> {
  const recipe = await getRecipeById((await params).id);
  if (!recipe) return { title: "Receta no encontrada" };
  return {
    title: recipe.name,
    description: `${recipe.name}: ${recipe.ingredients.length} ingredientes, ${categoryLabel(recipe.category)}.`,
    openGraph: { images: [recipe.thumbnail] },
  };
}

function youtubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/[?&]v=([\w-]{11})/);
  return match ? match[1] : null;
}

// Server Component: obtiene la receta en el servidor (cacheada por horas)
export default async function RecipePage({ params }: PageProps<"/recetas/[id]">) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  const videoId = youtubeId(recipe.youtube);

  return (
    <article className="space-y-10">
      <nav aria-label="Ruta de navegación" className="text-sm text-muted">
        {recipe.category ? (
          <>
            <Link href="/categorias" className="hover:text-accent">
              Categorías
            </Link>{" "}
            /{" "}
            <Link
              href={`/categorias/${encodeURIComponent(recipe.category)}`}
              className="hover:text-accent"
            >
              {categoryLabel(recipe.category)}
            </Link>{" "}
            / <span className="text-foreground">{recipe.name}</span>
          </>
        ) : (
          <Link href="/" className="hover:text-accent">
            ← Inicio
          </Link>
        )}
      </nav>

      <header className="grid items-center gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border">
          <Image
            src={recipe.thumbnail}
            alt={recipe.name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {[categoryLabel(recipe.category), recipe.area].filter(Boolean).join(" · ")}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {recipe.name}
          </h1>
          <dl className="flex flex-wrap gap-6 text-sm">
            <div>
              <dt className="text-muted">Ingredientes</dt>
              <dd className="font-display text-2xl font-semibold">{recipe.ingredients.length}</dd>
            </div>
            <div>
              <dt className="text-muted">Pasos</dt>
              <dd className="font-display text-2xl font-semibold">{recipe.instructions.length}</dd>
            </div>
          </dl>
          {recipe.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Etiquetas">
              {recipe.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  #{tag}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-3">
            <FavoriteButton id={recipe.id} name={recipe.name} variant="full" />
            {recipe.source && (
              <a
                href={recipe.source}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                Fuente original ↗
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section aria-labelledby="ingredients-title" className="h-fit rounded-3xl border border-border bg-surface p-6 lg:sticky lg:top-24">
          <h2 id="ingredients-title" className="mb-4 font-display text-2xl font-semibold">
            Ingredientes
          </h2>
          <ul className="divide-y divide-border">
            {recipe.ingredients.map((ing, i) => (
              <li key={`${ing.name}-${i}`} className="flex justify-between gap-4 py-2.5 text-sm">
                <span className="font-medium">{ing.name}</span>
                <span className="text-right text-muted">{ing.measure}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="steps-title" className="space-y-6">
          <h2 id="steps-title" className="font-display text-2xl font-semibold">
            Preparación
          </h2>
          <ol className="space-y-5">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 leading-relaxed text-pretty">{step}</p>
              </li>
            ))}
          </ol>

          {videoId && (
            <div className="space-y-3 pt-4">
              <h2 className="font-display text-2xl font-semibold">Video</h2>
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                  title={`Video de ${recipe.name}`}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
