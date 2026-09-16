/**
 * Convierte una fecha civil `"YYYY-MM-DD"` (sin hora, ej. `check_in`/
 * `check_out` de `booking`) a un `Date` a medianoche **local**, nunca UTC.
 * `new Date("2026-09-10")` se interpreta como medianoche UTC; en Guatemala
 * (UTC-6) cualquier lectura en hora local de ese `Date` muestra el día
 * anterior. docs/HANDOFF-MOVIL.md sección 2 documenta la misma trampa del
 * lado de la web (`toDomainCalendarDate`) — nunca usar `new Date(value)`
 * directo sobre una fecha civil.
 */
export function toDomainCalendarDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

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
