// ============================================================
// FlowMind – Formatting utilities
// ============================================================

/**
 * Returns a human-friendly relative date string.
 * "Hace 5 min", "Hace 2 h", "Ayer", etc.
 */
function relativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Justo ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHour < 24) return `Hace ${diffHour} h`;
  if (diffDay === 1) return "Ayer";
  if (diffDay < 7) return `Hace ${diffDay} días`;

  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export const format = { relativeDate };
