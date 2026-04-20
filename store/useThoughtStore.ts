// ============================================================
// FlowMind – Cognitive Dump & Mental Clarity System
// Store: Global thought state powered by Zustand
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Thought, ThoughtType, FilterType, PriorityType } from "@/types";

// ────────────────────────────────────────────────────────────
// 1. Store shape (state + actions)
// ────────────────────────────────────────────────────────────

interface ThoughtState {
  // ── Reactive state ──────────────────────────────────────
  thoughts: Thought[];
  filter: FilterType;
  searchQuery: string;
  mentalLoad: number;

  // ── Actions ─────────────────────────────────────────────
  addThought: (thought: Omit<Thought, "id" | "createdAt">) => void;
  removeThought: (id: string) => void;
  updateThought: (id: string, fields: Partial<Omit<Thought, "id">>) => void;
  toggleImportant: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  calculateMentalLoad: () => void;
}

// ────────────────────────────────────────────────────────────
// 2. Mental-load algorithm
// ────────────────────────────────────────────────────────────
//
// Each thought adds a base weight of 1.  Priority multiplies
// that weight so that high-priority items feel "heavier":
//
//   low    → ×1   (1 point)
//   medium → ×2   (2 points)
//   high   → ×3   (3 points)
//
// The final score is the simple sum.  This keeps the metric
// intuitive while still reflecting that a handful of urgent
// thoughts can weigh more than many trivial ones.
// ────────────────────────────────────────────────────────────

const PRIORITY_WEIGHT: Record<PriorityType, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function computeMentalLoad(thoughts: Thought[]): number {
  return thoughts.reduce((acc, t) => acc + PRIORITY_WEIGHT[t.priority], 0);
}

// ────────────────────────────────────────────────────────────
// 3. UUID helper (crypto-safe, no extra dependency)
// ────────────────────────────────────────────────────────────

function generateId(): string {
  // `crypto.randomUUID()` is available in all modern browsers and Node ≥ 19.
  // Fallback to a simple timestamp-based id for SSR / older runtimes.
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ────────────────────────────────────────────────────────────
// 4. Mock data (seeded so the store isn't empty on first run)
// ────────────────────────────────────────────────────────────

const MOCK_THOUGHTS: Thought[] = [
  {
    id: generateId(),
    content: "Investigar cómo integrar Web Workers para procesamiento en segundo plano",
    type: "idea",
    priority: "medium",
    createdAt: new Date("2026-04-18T09:15:00"),
    isImportant: false,
  },
  {
    id: generateId(),
    content: "Refactorizar el módulo de autenticación antes del sprint 12",
    type: "task",
    priority: "high",
    createdAt: new Date("2026-04-19T14:30:00"),
    isImportant: true,
  },
  {
    id: generateId(),
    content: "¿Estamos cubriendo suficientes edge-cases en los tests de API?",
    type: "concern",
    priority: "high",
    createdAt: new Date("2026-04-19T16:00:00"),
    isImportant: false,
  },
  {
    id: generateId(),
    content: "Esa canción que escuché hoy era buenísima, buscar el nombre",
    type: "noise",
    priority: "low",
    createdAt: new Date("2026-04-20T08:00:00"),
    isImportant: false,
  },
  {
    id: generateId(),
    content: "Diseñar el flujo de onboarding para nuevos usuarios",
    type: "task",
    priority: "medium",
    createdAt: new Date("2026-04-20T10:00:00"),
    isImportant: true,
  },
  {
    id: generateId(),
    content: "¿Y si usamos animaciones Lottie en la landing page?",
    type: "idea",
    priority: "low",
    createdAt: new Date("2026-04-20T11:00:00"),
    isImportant: false,
  },
];

// ────────────────────────────────────────────────────────────
// 5. Store creation
// ────────────────────────────────────────────────────────────

export const useThoughtStore = create<ThoughtState>()(
  persist(
    (set, get) => ({
      // ── Initial state ───────────────────────────────────
      thoughts: MOCK_THOUGHTS,
      filter: "all",
      searchQuery: "",
      mentalLoad: computeMentalLoad(MOCK_THOUGHTS),

      // ── Actions ─────────────────────────────────────────

      addThought: (input) => {
        const newThought: Thought = {
          ...input,
          id: generateId(),
          createdAt: new Date(),
        };

        set((state) => {
          const updated = [newThought, ...state.thoughts];
          return {
            thoughts: updated,
            mentalLoad: computeMentalLoad(updated),
          };
        });
      },

      removeThought: (id) => {
        set((state) => {
          const updated = state.thoughts.filter((t) => t.id !== id);
          return {
            thoughts: updated,
            mentalLoad: computeMentalLoad(updated),
          };
        });
      },

      updateThought: (id, fields) => {
        set((state) => {
          const updated = state.thoughts.map((t) =>
            t.id === id ? { ...t, ...fields } : t,
          );
          return {
            thoughts: updated,
            mentalLoad: computeMentalLoad(updated),
          };
        });
      },

      toggleImportant: (id) => {
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id ? { ...t, isImportant: !t.isImportant } : t,
          ),
        }));
      },

      setFilter: (filter) => set({ filter }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      calculateMentalLoad: () => {
        const load = computeMentalLoad(get().thoughts);
        set({ mentalLoad: load });
      },
    }),
    {
      // ── Persist configuration ─────────────────────────
      name: "flowmind-thoughts",

      storage: createJSONStorage(() => localStorage, {
        // Custom reviver: rehydrate `createdAt` strings back into Date objects.
        // Without this, dates would remain as plain ISO strings after reading
        // from localStorage, breaking any Date method calls downstream.
        reviver: (_key: string, value: unknown) => {
          if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
          ) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) return date;
          }
          return value;
        },

        // Custom replacer: serialise Dates to ISO-8601 strings.
        // (JSON.stringify already does this, but being explicit avoids
        // surprises with exotic Date subclasses.)
        replacer: (_key: string, value: unknown) => {
          if (value instanceof Date) return value.toISOString();
          return value;
        },
      }),

      // Only persist state that matters across sessions.
      // `filter` and `searchQuery` are ephemeral UI state.
      partialize: (state) => ({
        thoughts: state.thoughts,
        mentalLoad: state.mentalLoad,
      }),
    },
  ),
);
