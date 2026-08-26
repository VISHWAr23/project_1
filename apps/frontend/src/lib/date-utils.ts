export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export function formatShortDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Formats decimal hours (e.g. 8.5, 4.25, 1.5, 51, 0.5) into a human-readable work time string.
 * Example outputs:
 *  - 8.5   -> "8 hr 30 min"
 *  - 4.25  -> "4 hr 15 min"
 *  - 1.5   -> "1 hr 30 min"
 *  - 8     -> "8 hr"
 *  - 0.5   -> "30 min"
 *  - 51    -> "51 hr"
 *  - 0     -> "0 hr" (or custom zeroText)
 */
export function formatWorkHours(
  decimalHours?: number | string | null,
  options?: {
    zeroText?: string;
    showSign?: boolean;
    defaultFallback?: string;
  }
): string {
  if (decimalHours === null || decimalHours === undefined || decimalHours === '') {
    return options?.defaultFallback ?? '—';
  }

  const num = typeof decimalHours === 'string' ? parseFloat(decimalHours) : Number(decimalHours);
  if (isNaN(num)) {
    return options?.defaultFallback ?? '—';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Round total minutes to nearest integer to avoid precision issues
  const totalMinutes = Math.round(absNum * 60);

  if (totalMinutes === 0) {
    return options?.zeroText !== undefined ? options.zeroText : '0 hr';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} hr`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  const formatted = parts.join(' ');
  const sign = isNegative ? '-' : options?.showSign ? '+' : '';
  return `${sign}${formatted}`;
}

