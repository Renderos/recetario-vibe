import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchClient } from "@/components/search-client";
import { RecipeGridSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Buscar" };

// El encabezado es estático; el buscador es un Client Component que lee
// ?q= de la URL, por eso va dentro de <Suspense>.
export default function SearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Buscador"
        title="Busca una receta"
        description="Escribe el nombre de un plato o ingrediente principal (en inglés): pasta, chicken, cake…"
      />
      <Suspense fallback={<RecipeGridSkeleton count={3} />}>
        <SearchClient />
      </Suspense>
    </>
  );
}
