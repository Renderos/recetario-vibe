import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FavoritesClient } from "@/components/favorites-client";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tu colección"
        title="Recetas favoritas"
        description="Se guardan en este navegador, sin necesidad de crear una cuenta."
      />
      <FavoritesClient />
    </>
  );
}
