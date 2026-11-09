// Skeleton con la misma forma que la página de detalle
export default function Loading() {
  return (
    <div className="space-y-10" role="status" aria-label="Cargando receta">
      <div className="skeleton h-4 w-56 rounded" />
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-12 w-4/5 rounded" />
          <div className="skeleton h-12 w-1/2 rounded" />
          <div className="skeleton h-10 w-48 rounded-full" />
        </div>
      </div>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="skeleton h-80 rounded-3xl" />
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-5 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
