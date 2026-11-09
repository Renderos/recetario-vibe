export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Hecho con Next.js 16 y Vibe Coding · Bootcamp FSJ35</p>
        <p>
          Datos de{" "}
          <a
            href="https://www.themealdb.com"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-4 hover:text-accent"
          >
            TheMealDB
          </a>
        </p>
      </div>
    </footer>
  );
}
