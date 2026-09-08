const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Tiempo transcurrido en texto corto y relativo, ej. "Hace 5 min" (bandejas de tasks, MOV-07). */
export function formatElapsedTime(date: Date, now: Date = new Date()): string {
  const diffMs = Math.max(0, now.getTime() - date.getTime());

  if (diffMs < MINUTE_MS) return 'Hace un momento';
  if (diffMs < HOUR_MS) return `Hace ${Math.floor(diffMs / MINUTE_MS)} min`;
  if (diffMs < DAY_MS) return `Hace ${Math.floor(diffMs / HOUR_MS)} h`;
  return `Hace ${Math.floor(diffMs / DAY_MS)} d`;
}
