// ============================================================
// FlowMind – Cognitive Dump & Mental Clarity System
// Types: Thought domain model
// ============================================================

/**
 * The four cognitive categories a thought can belong to.
 *
 * • idea     – creative sparks, things to explore later
 * • task     – actionable items that require doing
 * • concern  – worries, blockers, or emotional weight
 * • noise    – fleeting thoughts with no real signal
 */
export type ThoughtType = "idea" | "task" | "concern" | "noise";

/**
 * Urgency / importance weight used for mental-load scoring.
 */
export type PriorityType = "low" | "medium" | "high";

/**
 * Used by the UI to filter the thought list.
 * "all" is a convenience value that means "no filter applied".
 */
export type FilterType = "all" | ThoughtType;

/**
 * Core domain entity – a single captured thought.
 *
 * Design decisions:
 *  - `id` is a plain string (UUID v4 generated at creation time) so we stay
 *    framework-agnostic and don't couple to any DB layer.
 *  - `createdAt` is stored as a Date but will be serialised to ISO-8601
 *    when persisted via Zustand's `persist` middleware, so we configure a
 *    custom `storage` reviver in the store.
 *  - `isImportant` is an explicit boolean flag (not derived) because the user
 *    can manually pin thoughts regardless of priority.
 */
export interface Thought {
  /** Unique identifier (UUID v4). */
  id: string;

  /** Raw text the user typed – the actual "brain dump". */
  content: string;

  /** Cognitive category. */
  type: ThoughtType;

  /** Urgency weight – feeds into the mental-load algorithm. */
  priority: PriorityType;

  /** Timestamp of creation. */
  createdAt: Date;

  /** User-toggled flag to pin / highlight a thought. */
  isImportant: boolean;
}

/**
 * A single daily mental-load snapshot.
 * Stored as a time-series array for trend analysis and charting.
 *
 * `date` is an ISO-8601 date string (YYYY-MM-DD) — timezone-stable,
 * sortable, and de-serialisable without a reviver.
 */
export interface DailySnapshot {
  /** ISO date string: "2026-04-20" */
  date: string;
  /** Mental load score for that day. */
  load: number;
  /** Total thought count at that point in time. */
  thoughtCount: number;
  /** Breakdown by type for richer analytics. */
  breakdown: Record<ThoughtType, number>;
}
