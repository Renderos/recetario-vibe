import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "./favorite-button";
import { categoryLabel } from "@/lib/categories-es";

type Props = {
  id: string;
  name: string;
  thumbnail: string;
  category?: string | null;
  area?: string | null;
  priority?: boolean;
};

/**
 * Tarjeta de receta. Es un Server Component que incrusta un
 * Client Component (FavoriteButton) solo donde hace falta interactividad.
 */
export function RecipeCard({ id, name, thumbnail, category, area, priority }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg">
      <Link href={`/recetas/${id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={`${thumbnail}/medium`}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-1 p-4">
          {(category || area) && (
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {[category && categoryLabel(category), area].filter(Boolean).join(" · ")}
            </p>
          )}
          <h3 className="font-display text-lg leading-snug font-semibold">{name}</h3>
        </div>
      </Link>
      <div className="absolute top-3 right-3">
        <FavoriteButton id={id} name={name} />
      </div>
    </article>
  );
}

export function RecipeGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}
