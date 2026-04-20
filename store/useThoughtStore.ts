// ============================================================
// FlowMind – Cognitive Dump & Mental Clarity System
// Store: Global thought state powered by Zustand
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  Thought,
  ThoughtType,
  FilterType,
  PriorityType,
  DailySnapshot,
} from "@/types";
import { buildSnapshot, toDateKey } from "@/lib/analytics";

// ────────────────────────────────────────────────────────────
// 1. Store shape (state + actions)
// ────────────────────────────────────────────────────────────

interface ThoughtState {
  // ── Reactive state ──────────────────────────────────────
  thoughts: Thought[];
  filter: FilterType;
  searchQuery: string;
  mentalLoad: number;

  // ── Analytics state ─────────────────────────────────────
  /** Persisted daily snapshots — oldest first. */
  dailySnapshots: DailySnapshot[];

  // ── Actions ─────────────────────────────────────────────
  addThought: (thought: Omit<Thought, "id" | "createdAt">) => void;
  removeThought: (id: string) => void;
  updateThought: (id: string, fields: Partial<Omit<Thought, "id">>) => void;
  toggleImportant: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  calculateMentalLoad: () => void;

  /** Records (or updates) today's snapshot. Call on mount and after mutations. */
  recordDailySnapshot: () => void;
}

// ────────────────────────────────────────────────────────────
// 2. Mental-load algorithm
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
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ────────────────────────────────────────────────────────────
// 4. Mock data
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
// 5. Seed snapshots — 6 days of history for a realistic chart
// ────────────────────────────────────────────────────────────

function seedSnapshots(): DailySnapshot[] {
  const seeds: Array<{
    daysAgo: number;
    load: number;
    thoughtCount: number;
    breakdown: Record<ThoughtType, number>;
  }> = [
    { daysAgo: 6, load: 8,  thoughtCount: 4, breakdown: { idea: 1, task: 2, concern: 0, noise: 1 } },
    { daysAgo: 5, load: 11, thoughtCount: 5, breakdown: { idea: 1, task: 2, concern: 1, noise: 1 } },
    { daysAgo: 4, load: 7,  thoughtCount: 4, breakdown: { idea: 2, task: 1, concern: 0, noise: 1 } },
    { daysAgo: 3, load: 14, thoughtCount: 6, breakdown: { idea: 1, task: 3, concern: 1, noise: 1 } },
    { daysAgo: 2, load: 10, thoughtCount: 5, breakdown: { idea: 2, task: 2, concern: 1, noise: 0 } },
    { daysAgo: 1, load: 9,  thoughtCount: 5, breakdown: { idea: 1, task: 2, concern: 1, noise: 1 } },
  ];

  return seeds.map(({ daysAgo, load, thoughtCount, breakdown }) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return { date: toDateKey(d), load, thoughtCount, breakdown };
  });
}

// ────────────────────────────────────────────────────────────
// 6. Snapshot upsert helper
// ────────────────────────────────────────────────────────────

function upsertSnapshot(
  existing: DailySnapshot[],
  next: DailySnapshot,
): DailySnapshot[] {
  const idx = existing.findIndex((s) => s.date === next.date);
  if (idx === -1) return [...existing, next];
  const updated = [...existing];
  updated[idx] = next;
  return updated;
}

// ────────────────────────────────────────────────────────────
// 7. Store creation
// ────────────────────────────────────────────────────────────

export const useThoughtStore = create<ThoughtState>()(
  persist(
    (set, get) => ({
      // ── Initial state ───────────────────────────────────
      thoughts: MOCK_THOUGHTS,
      filter: "all",
      searchQuery: "",
      mentalLoad: computeMentalLoad(MOCK_THOUGHTS),
      dailySnapshots: seedSnapshots(),

      // ── Actions ─────────────────────────────────────────

      addThought: (input) => {
        const newThought: Thought = {
          ...input,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => {
          const updated = [newThought, ...state.thoughts];
          const snapshot = buildSnapshot(updated);
          return {
            thoughts: updated,
            mentalLoad: computeMentalLoad(updated),
            dailySnapshots: upsertSnapshot(state.dailySnapshots, snapshot),
          };
        });
      },

      removeThought: (id) => {
        set((state) => {
          const updated = state.thoughts.filter((t) => t.id !== id);
          const snapshot = buildSnapshot(updated);
          return {
            thoughts: updated,
            mentalLoad: computeMentalLoad(updated),
            dailySnapshots: upsertSnapshot(state.dailySnapshots, snapshot),
          };
        });
      },

      updateThought: (id, fields) => {
        set((state) => {
          const updated = state.thoughts.map((t) =>
            t.id === id ? { ...t, ...fields } : t,
          );
          const snapshot = buildSnapshot(updated);
          return {
            thoughts: updated,
            mentalLoad: computeMentalLoad(updated),
            dailySnapshots: upsertSnapshot(state.dailySnapshots, snapshot),
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

      recordDailySnapshot: () => {
        const { thoughts, dailySnapshots } = get();
        const snapshot = buildSnapshot(thoughts);
        set({ dailySnapshots: upsertSnapshot(dailySnapshots, snapshot) });
      },
    }),
    {
      name: "flowmind-thoughts",

      storage: createJSONStorage(() => localStorage, {
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
        replacer: (_key: string, value: unknown) => {
          if (value instanceof Date) return value.toISOString();
          return value;
        },
      }),

      // dailySnapshots now persisted alongside thoughts
      partialize: (state) => ({
        thoughts: state.thoughts,
        mentalLoad: state.mentalLoad,
        dailySnapshots: state.dailySnapshots,
      }),
    },
  ),
);
