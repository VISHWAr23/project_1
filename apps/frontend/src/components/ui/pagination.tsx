'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-border/80 text-xs text-muted-foreground">
      <div>
        {totalRecords !== undefined && pageSize !== undefined && (
          <span>
            Showing <strong className="text-foreground font-mono">{Math.min((currentPage - 1) * pageSize + 1, totalRecords)}</strong> to{' '}
            <strong className="text-foreground font-mono">{Math.min(currentPage * pageSize, totalRecords)}</strong> of{' '}
            <strong className="text-foreground font-mono">{totalRecords}</strong> results
          </span>
        )}
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
          className="min-h-[36px] flex-1 sm:flex-initial"
        >
          Previous
        </Button>
        <span className="font-mono px-2 text-foreground font-medium text-center shrink-0">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
          className="min-h-[36px] flex-1 sm:flex-initial"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
