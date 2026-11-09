import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-5 py-16 text-center">
      <p className="font-display text-7xl font-semibold text-accent">404</p>
      <h1 className="font-display text-3xl font-semibold">Esta receta no está en el menú</h1>
      <p className="text-muted">La página que buscas no existe o fue movida.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
          Ir al inicio
        </Link>
        <Link href="/buscar" className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent">
          Buscar recetas
        </Link>
      </div>
    </div>
  );
}
