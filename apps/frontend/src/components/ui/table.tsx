'use client';

import React from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, Loader2, Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  sortColumn,
  sortDirection,
  onSort,
  isLoading = false,
  emptyMessage = 'No records found',
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-border bg-card shadow-sm scrollbar-thin relative min-h-[140px]">
      <table className="w-full text-left text-xs border-collapse min-w-[600px] sm:min-w-full">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono">
            {columns.map((col) => {
              const alignClass =
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
              return (
                <th
                  key={col.key}
                  style={{ width: col.width, minWidth: col.width }}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                  className={`p-2.5 sm:p-3 font-medium tracking-wide uppercase text-[10px] select-none ${alignClass} ${
                    col.sortable ? 'cursor-pointer hover:text-foreground' : ''
                  }`}
                >
                  <div className={`inline-flex items-center gap-1 ${alignClass}`}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-muted-foreground/60">
                        {sortColumn === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-foreground">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="animate-pulse">
                {columns.map((col, colIdx) => (
                  <td key={`sk-${col.key}-${colIdx}`} className="p-2.5 sm:p-3">
                    <div
                      className={`h-3.5 bg-muted/70 rounded-md ${
                        colIdx === 0 ? 'w-3/5' : colIdx === 1 ? 'w-4/5' : 'w-1/2'
                      }`}
                    ></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Inbox className="h-8 w-8 text-muted-foreground/40 stroke-1" />
                  <p className="text-xs font-mono">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-secondary/40 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                  return (
                    <td
                      key={col.key}
                      style={{ width: col.width, minWidth: col.width }}
                      className={`p-2.5 sm:p-3 align-middle ${alignClass}`}
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isLoading && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/95 border border-border shadow-lg text-xs font-medium text-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span>Loading records...</span>
          </div>
        </div>
      )}
    </div>
  );
}
