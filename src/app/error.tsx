"use client"; // Los error boundaries deben ser Client Components

import { ErrorState } from "@/components/error-state";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorState error={error} retry={retry} />;
}
