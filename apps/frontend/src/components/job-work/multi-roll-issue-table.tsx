import React from 'react';
import { Plus, Trash2, Scale, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface RollIssueRow {
  id: string;
  rollNumber: string;
  unitWeight?: number;
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
      unitWeight: 50,
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
          if (field === 'issuedQty') {
            const newQty = Math.max(0, Number(value) || 0);
            const unitWeight = r.unitWeight && r.unitWeight > 0 ? r.unitWeight : 50;
            const newWeight = Number((newQty * unitWeight).toFixed(2));
            return {
              ...r,
              issuedQty: newQty,
              issuedWeight: newWeight,
            };
          }
          if (field === 'issuedWeight') {
            const newWeight = Math.max(0, Number(value) || 0);
            const currentQty = Number(r.issuedQty) || 1;
            const newUnitWeight = currentQty > 0 ? Number((newWeight / currentQty).toFixed(2)) : newWeight;
            return {
              ...r,
              issuedWeight: newWeight,
              unitWeight: newUnitWeight > 0 ? newUnitWeight : (r.unitWeight || 50),
            };
          }
          return { ...r, [field]: value };
        }
        return r;
      }),
    );
  };

  const generateMultipleRolls = (count: number, weightPerRoll: number = 50) => {
    const generated: RollIssueRow[] = [];
    for (let i = 1; i <= count; i++) {
      generated.push({
        id: Math.random().toString(36).substring(2, 9),
        rollNumber: `ROLL-RM-${1000 + i}`,
        unitWeight: weightPerRoll,
        issuedWeight: weightPerRoll,
        issuedQty: 1,
        remarks: '',
      });
    }
    onChange(generated);
  };

  const totalWeight = rows.reduce((sum, r) => sum + (Number(r.issuedWeight) || 0), 0);
  const totalQty = rows.reduce((sum, r) => sum + (Number(r.issuedQty) || 0), 0);

  const isExceedingStock = maxAvailableStock !== undefined && totalQty > maxAvailableStock;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Raw Material Rolls Dispatch Table
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Changing Quantity automatically scales roll weight proportionally.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              const count = prompt('How many rolls to auto-generate?', '5');
              const num = parseInt(count || '', 10);
              if (num && num > 0) {
                generateMultipleRolls(num, 50);
              }
            }}
            className="text-xs"
          >
            Auto-Generate N Rolls
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={addRow}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Roll
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
            <tr>
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3 min-w-[160px]">Roll Number / Identifier</th>
              <th className="p-3 w-32">Weight (Kg)</th>
              <th className="p-3 w-28">Quantity</th>
              <th className="p-3 min-w-[180px]">Remarks</th>
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
                    value={row.issuedWeight !== undefined ? row.issuedWeight : ''}
                    onChange={(e) => updateRow(row.id, 'issuedWeight', parseFloat(e.target.value) || 0)}
                    placeholder="50.0"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
                    required
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={row.issuedQty !== undefined ? row.issuedQty : ''}
                    onChange={(e) => updateRow(row.id, 'issuedQty', parseFloat(e.target.value) || 0)}
                    placeholder="1"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
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
                Totals ({rows.length} roll entries):
              </td>
              <td className="p-3 font-mono text-emerald-400">
                <span className="flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" />
                  {totalWeight.toFixed(2)} Kg
                </span>
              </td>
              <td className="p-3 font-mono text-blue-600 dark:text-blue-400 font-bold">
                {totalQty} Units
              </td>
              <td colSpan={2} className="p-3">
                {isExceedingStock ? (
                  <span className="text-red-400 text-[11px] font-semibold">
                    Exceeds available stock balance ({maxAvailableStock} available)
                  </span>

                ) : (
                  <span className="text-muted-foreground text-[11px]">
                    Available stock balance: {maxAvailableStock} units
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
