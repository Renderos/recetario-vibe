// Placeholders de carga reutilizados por loading.tsx y por los Client Components

export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface" aria-hidden>
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Cargando recetas"
    >
      {Array.from({ length: count }, (_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 space-y-3" aria-hidden>
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-10 w-2/3 max-w-md rounded" />
      <div className="skeleton h-4 w-1/2 max-w-sm rounded" />
    </div>
  );
}
