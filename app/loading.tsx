import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-ink-50 p-4 dark:bg-ink-900">
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-80 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </main>
  );
}
