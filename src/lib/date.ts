// Date formatting helpers. Dates are formatted in UTC to avoid off-by-one day
// shifts (posts carry ISO timestamps; the site builds on a UTC runner).

/** "%Y-%m-%d" -> e.g. "2026-03-29" (home/post/related display + every <time datetime="…">) */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "%b %d" -> e.g. "Jan 01" (archive row dates) */
export function monthDay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  });
}
