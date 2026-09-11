/**
 * Safe numeric and currency formatting utilities.
 * Handles undefined, null, NaN, and string inputs gracefully.
 */

export function formatCurrency(val?: number | string | null): string {
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return (isNaN(n) ? 0 : n).toLocaleString('en-IN');
}

export function formatNumber(val?: number | string | null, maximumFractionDigits: number = 2): string {
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return (isNaN(n) ? 0 : n).toLocaleString(undefined, { maximumFractionDigits });
}

export function formatPercent(val?: number | string | null): string {
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return `${isNaN(n) ? 0 : Math.round(n * 10) / 10}%`;
}
