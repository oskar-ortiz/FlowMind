"use client";

import {
  FilterBar,
  AddThoughtDialog,
  ThoughtList,
  MentalLoadMeter,
} from "@/components/thoughts";
import { Brain } from "lucide-react";

/**
 * Top-level client boundary for FlowMind.
 * Kept as a separate component so that `app/page.tsx` can remain a
 * server component (required for Next.js `metadata` export).
 */
export function FlowMindApp() {
  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ──────────────────────────────────── */}
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
              <Brain className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                FlowMind
              </h1>
              <p className="text-xs text-muted-foreground">
                Vaciado cognitivo · Claridad mental
              </p>
            </div>
          </div>

          <AddThoughtDialog />
        </div>

        {/* Mental load indicator */}
        <MentalLoadMeter />

        {/* Filters */}
        <FilterBar />
      </header>

      {/* ── Content ─────────────────────────────────── */}
      <main className="flex-1">
        <ThoughtList />
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
        FlowMind — Captura. Clasifica. Aclara.
      </footer>
    </div>
  );
}
