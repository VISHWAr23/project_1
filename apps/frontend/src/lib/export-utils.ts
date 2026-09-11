/**
 * Client-side CSV export utility.
 * Generates properly escaped CSV and triggers browser download.
 */
export function exportToCsv(filename: string, rows: Record<string, any>[], headers?: { key: string; label: string }[]) {
  if (!rows || !rows.length) return;

  const resolvedHeaders = headers || Object.keys(rows[0]).map((k) => ({ key: k, label: k }));

  const csvRows: string[] = [];

  // Header line
  csvRows.push(
    resolvedHeaders
      .map((h) => `"${String(h.label || '').replace(/"/g, '""')}"`)
      .join(',')
  );

  // Data rows
  for (const row of rows) {
    const values = resolvedHeaders.map((h) => {
      const val = row[h.key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\r\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
