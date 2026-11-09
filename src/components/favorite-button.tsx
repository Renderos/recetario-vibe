"use client";

import { useFavorites } from "@/hooks/use-favorites";

type Props = {
  id: string;
  name: string;
  variant?: "icon" | "full";
};

export function FavoriteButton({ id, name, variant = "icon" }: Props) {
  const { isFavorite, toggle, ready } = useFavorites();
  const active = ready && isFavorite(id);
  const label = active
    ? `Quitar ${name} de favoritos`
    : `Guardar ${name} en favoritos`;

  const heart = (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2 0 3.6 1.1 4.8 2.7C13.2 5.1 14.8 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
          active
            ? "border-accent bg-accent text-white"
            : "border-border bg-surface text-foreground hover:border-accent hover:text-accent"
        }`}
      >
        {heart}
        {active ? "En favoritos" : "Guardar en favoritos"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        // El botón vive dentro de una tarjeta enlazada: no navegar al hacer clic
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors ${
        active
          ? "bg-accent text-white"
          : "bg-surface/90 text-foreground hover:text-accent"
      }`}
    >
      {heart}
    </button>
  );
}
