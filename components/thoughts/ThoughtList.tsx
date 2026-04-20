"use client";

import { useMemo } from "react";
import { useThoughtStore } from "@/store";
import { ThoughtCard } from "./ThoughtCard";
import { Brain } from "lucide-react";

export function ThoughtList() {
  const thoughts = useThoughtStore((s) => s.thoughts);
  const filter = useThoughtStore((s) => s.filter);
  const searchQuery = useThoughtStore((s) => s.searchQuery);

  const filtered = useMemo(() => {
    let result = thoughts;

    // Apply type filter
    if (filter !== "all") {
      result = result.filter((t) => t.type === filter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.content.toLowerCase().includes(q));
    }

    return result;
  }, [thoughts, filter, searchQuery]);

  // ── Empty state ───────────────────────────────────────

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Brain className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {searchQuery || filter !== "all"
              ? "Sin resultados"
              : "Tu mente está vacía"}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || filter !== "all"
              ? "Intenta con otro filtro o término de búsqueda."
              : "Haz un brain dump — captura lo que sea que esté en tu cabeza."}
          </p>
        </div>
      </div>
    );
  }

  // ── List ──────────────────────────────────────────────

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((thought) => (
        <ThoughtCard key={thought.id} thought={thought} />
      ))}
    </div>
  );
}
