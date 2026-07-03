// Date formatting helpers that mirror the Jekyll templates exactly.
// Jekyll builds on a UTC runner with no `timezone:` set, so all dates are
// formatted in UTC to avoid off-by-one day shifts.

/** "%b %d, %Y" -> e.g. "Mar 29, 2026" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "%b %d" -> e.g. "Mar 29" (used by the archive) */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  });
}

/** "%Y-%m-%d" -> e.g. "2026-03-29" (used for <time datetime="…">) */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
