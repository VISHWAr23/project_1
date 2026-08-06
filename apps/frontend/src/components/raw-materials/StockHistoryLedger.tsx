import React from 'react';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { InventoryTransactionItem } from '@/types/raw-materials.types';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Truck, RotateCcw, Shuffle, FileText } from 'lucide-react';

interface StockHistoryLedgerProps {
  items: InventoryTransactionItem[];
}

export function StockHistoryLedger({ items }: StockHistoryLedgerProps) {
  const getTransactionBadge = (type: InventoryTransactionItem['transactionType']) => {
    switch (type) {
      case 'PURCHASE_RECEIPT':
        return (
          <Badge variant="success" icon={<ArrowDownLeft className="h-3 w-3" />}>
            Purchase Receipt
          </Badge>
        );
      case 'ADJUSTMENT_ADD':
        return (
          <Badge variant="success" icon={<ArrowDownLeft className="h-3 w-3" />}>
            Stock Add
          </Badge>
        );
      case 'JOB_WORK_RETURN':
        return (
          <Badge variant="info" icon={<RotateCcw className="h-3 w-3" />}>
            Job Work Return
          </Badge>
        );
      case 'WORK_ORDER_ISSUE':
        return (
          <Badge variant="warning" icon={<ArrowUpRight className="h-3 w-3" />}>
            Work Order Issue
          </Badge>
        );
      case 'JOB_WORK_DISPATCH':
        return (
          <Badge variant="warning" icon={<Truck className="h-3 w-3" />}>
            Job Work Dispatch
          </Badge>
        );
      case 'ADJUSTMENT_SUBTRACT':
        return (
          <Badge variant="error" icon={<ArrowUpRight className="h-3 w-3" />}>
            Stock Subtract
          </Badge>
        );
      case 'TRANSFER':
        return (
          <Badge variant="info" icon={<Shuffle className="h-3 w-3" />}>
            Transfer
          </Badge>
        );
      case 'MANUAL_CORRECTION':
      default:
        return (
          <Badge variant="neutral" icon={<RefreshCw className="h-3 w-3" />}>
            Correction
          </Badge>
        );
    }
  };

  const columns: Column<InventoryTransactionItem>[] = [
    {
      key: 'createdAt',
      header: 'Date & Time',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      ),
    },
    {
      key: 'referenceNumber',
      header: 'Reference No.',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#2563EB]">
          {row.referenceNumber || 'N/A'}
        </span>
      ),
    },
    {
      key: 'transactionType',
      header: 'Transaction Type',
      render: (row) => getTransactionBadge(row.transactionType),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'right',
      render: (row) => {
        const isAddition = ['PURCHASE_RECEIPT', 'ADJUSTMENT_ADD', 'JOB_WORK_RETURN'].includes(row.transactionType);
        return (
          <span
            className={`font-mono font-bold text-xs ${
              isAddition ? 'text-[#2563EB]' : 'text-rose-400'
            }`}
          >
            {isAddition ? '+' : '-'}{row.quantity}
          </span>
        );
      },
    },
    {
      key: 'previousStock',
      header: 'Prev Stock',
      align: 'right',
      render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.previousStock}</span>,
    },
    {
      key: 'newStock',
      header: 'New Stock',
      align: 'right',
      render: (row) => <span className="font-mono text-xs font-bold text-foreground">{row.newStock}</span>,
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (row) => (
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {row.createdBy?.email?.split('@')[0] || 'System Admin'}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Remarks / Notes',
      render: (row) => (
        <span className="text-xs text-muted-foreground italic truncate max-w-[180px]">
          {row.notes || '-'}
        </span>
      ),
    },
  ];

  return <Table columns={columns} data={items} keyExtractor={(row) => row.id} />;
}
