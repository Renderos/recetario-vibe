"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/categorias", label: "Categorías" },
  { href: "/buscar", label: "Buscar" },
  { href: "/favoritos", label: "Favoritos" },
];

/**
 * Con Cache Components, leer la URL (usePathname) fuera de <Suspense> bloquea
 * el prerender de rutas dinámicas. La vista se renderiza primero sin ruta
 * activa (fallback estático) y luego se resalta el enlace actual.
 */
export function Navbar({ appName }: { appName: string }) {
  return (
    <Suspense fallback={<NavbarView appName={appName} pathname={null} />}>
      <NavbarWithPathname appName={appName} />
    </Suspense>
  );
}

function NavbarWithPathname({ appName }: { appName: string }) {
  return <NavbarView appName={appName} pathname={usePathname()} />;
}

function NavbarView({
  appName,
  pathname,
}: {
  appName: string;
  pathname: string | null;
}) {
  const [open, setOpen] = useState(false);
  const { favorites } = useFavorites();

  const isActive = (href: string) =>
    pathname !== null &&
    (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight"
        >
          {appName}
          <span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
                {link.href === "/favoritos" && favorites.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-xs text-white">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </li>
          ))}
          <li className="ml-3 flex items-center">
            <ThemeToggle />
          </li>
        </ul>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-accent-soft"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <ul
          id="mobile-menu"
          className="border-t border-border bg-background px-4 py-3 md:hidden"
          onClick={(e) => {
            // Cierra el menú al elegir un enlace
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium ${
                  isActive(link.href)
                    ? "bg-accent-soft text-accent"
                    : "text-foreground"
                }`}
              >
                {link.label}
                {link.href === "/favoritos" && favorites.length > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
