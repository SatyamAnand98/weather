"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 p-6 text-ink-900 dark:bg-ink-900 dark:text-ink-50">
      <section className="max-w-lg rounded-[8px] border border-black/10 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-ink-800">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-weather-coral">Dashboard error</p>
        <h1 className="mt-3 text-2xl font-semibold">Weather data could not be displayed.</h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-200">{error.message}</p>
        <Button className="mt-5" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </section>
    </main>
  );
}
