"use client";

import { useThoughtStore } from "@/store";
import type { FilterType } from "@/types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Lightbulb, CheckSquare, AlertTriangle, CloudFog, LayoutGrid } from "lucide-react";

const FILTERS: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "Todos", icon: <LayoutGrid className="size-3.5" /> },
  { value: "idea", label: "Ideas", icon: <Lightbulb className="size-3.5" /> },
  { value: "task", label: "Tareas", icon: <CheckSquare className="size-3.5" /> },
  { value: "concern", label: "Preocupaciones", icon: <AlertTriangle className="size-3.5" /> },
  { value: "noise", label: "Ruido", icon: <CloudFog className="size-3.5" /> },
];

export function FilterBar() {
  const filter = useThoughtStore((s) => s.filter);
  const setFilter = useThoughtStore((s) => s.setFilter);
  const searchQuery = useThoughtStore((s) => s.searchQuery);
  const setSearchQuery = useThoughtStore((s) => s.setSearchQuery);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            id={`filter-${f.value}`}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className="gap-1.5"
          >
            {f.icon}
            <span className="hidden sm:inline">{f.label}</span>
          </Button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="search-thoughts"
          type="search"
          placeholder="Buscar pensamientos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
