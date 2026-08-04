import React from 'react';
import { Plus, Trash2, Scale, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface RollIssueRow {
  id: string;
  rollNumber: string;
  issuedWeight: number;
  issuedQty: number;
  remarks: string;
}

interface MultiRollIssueTableProps {
  rows: RollIssueRow[];
  onChange: (rows: RollIssueRow[]) => void;
  maxAvailableStock?: number;
}

export function MultiRollIssueTable({ rows, onChange, maxAvailableStock }: MultiRollIssueTableProps) {
  const addRow = () => {
    const nextIndex = rows.length + 1;
    const newRow: RollIssueRow = {
      id: Math.random().toString(36).substring(2, 9),
      rollNumber: `ROLL-RM-${1000 + nextIndex}`,
      issuedWeight: 50,
      issuedQty: 1,
      remarks: '',
    };
    onChange([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    onChange(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof RollIssueRow, value: any) => {
    onChange(
      rows.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      }),
    );
  };

  const totalWeight = rows.reduce((sum, r) => sum + (Number(r.issuedWeight) || 0), 0);
  const totalQty = rows.reduce((sum, r) => sum + (Number(r.issuedQty) || 0), 0);

  const isExceedingStock = maxAvailableStock !== undefined && totalQty > maxAvailableStock;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Raw Material Rolls Dispatch Table
        </h4>
        <Button variant="outline" size="sm" type="button" onClick={addRow} leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Add Roll
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
            <tr>
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3">Roll Number / Identifier</th>
              <th className="p-3 w-32">Weight (Kg)</th>
              <th className="p-3 w-32">Quantity</th>
              <th className="p-3">Remarks</th>
              <th className="p-3 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-center text-muted-foreground font-mono">{index + 1}</td>
                <td className="p-3">
                  <Input
                    value={row.rollNumber}
                    onChange={(e) => updateRow(row.id, 'rollNumber', e.target.value)}
                    placeholder="e.g. ROLL-RM-1001"
                    required
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={row.issuedWeight || ''}
                    onChange={(e) => updateRow(row.id, 'issuedWeight', parseFloat(e.target.value) || 0)}
                    placeholder="50.0"
                    required
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={row.issuedQty || ''}
                    onChange={(e) => updateRow(row.id, 'issuedQty', parseFloat(e.target.value) || 0)}
                    placeholder="1"
                    required
                  />
                </td>
                <td className="p-3">
                  <Input
                    value={row.remarks}
                    onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
                    placeholder="Grade / Lot notes"
                  />
                </td>
                <td className="p-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    className="text-muted-foreground hover:text-red-400 p-1 h-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30 border-t border-border font-semibold text-foreground">
            <tr>
              <td colSpan={2} className="p-3 text-right">
                Totals ({rows.length} rolls):
              </td>
              <td className="p-3 font-mono text-emerald-400 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" />
                {totalWeight.toFixed(2)} Kg
              </td>
              <td className="p-3 font-mono">{totalQty} Units</td>
              <td colSpan={2} className="p-3">
                {isExceedingStock && (
                  <span className="text-red-400 text-[11px]">
                    Exceeds available stock balance ({maxAvailableStock} available)
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
