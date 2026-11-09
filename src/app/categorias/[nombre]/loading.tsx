import { PageHeaderSkeleton, RecipeGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <div className="skeleton mb-4 h-4 w-40 rounded" aria-hidden />
      <PageHeaderSkeleton />
      <RecipeGridSkeleton count={9} />
    </>
  );
}
