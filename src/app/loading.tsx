import { PageHeaderSkeleton, RecipeGridSkeleton } from "@/components/skeletons";

// Loading UI por defecto de toda la app (se muestra durante la navegación)
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <RecipeGridSkeleton />
    </>
  );
}
