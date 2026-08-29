'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MasterDropdown } from './master-dropdown';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import { useSendToBleaching, useGauzeMasters } from '@/hooks/useGauzeProduction';
import { useJobWorkCompanies } from '@/hooks/useJobWork';
import { GauzeProductionBatch } from '@/types/gauze-production.types';
import { Truck, Calculator, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface SendBleachingModalProps {
  batch: GauzeProductionBatch;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendBleachingModal({ batch, isOpen, onClose, onSuccess }: SendBleachingModalProps) {
  const { toast } = useToast();
  const { data: companies = [] } = useJobWorkCompanies();
  const { data: masters } = useGauzeMasters();
  const sendMutation = useSendToBleaching();

  const [vendorId, setVendorId] = useState('');
  const [bleachingTypeId, setBleachingTypeId] = useState(masters?.bleachingTypes?.[0]?.id || '');
  const [quantitySent, setQuantitySent] = useState(Number(batch.currentQuantity) || Number(batch.inputQuantity) || 1000);
  const [uom, setUom] = useState(batch.currentUom || 'meter');
  const [sentDate, setSentDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [rate, setRate] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const estimatedCost = rate && quantitySent ? (rate * quantitySent).toFixed(2) : null;
  const availableQty = Number(batch.currentQuantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      toast('Required Field', 'Please select an external bleaching vendor', 'warning');
      return;
    }
    if (!bleachingTypeId) {
      toast('Required Field', 'Please select a bleaching process type', 'warning');
      return;
    }
    if (quantitySent <= 0) {
      toast('Invalid Quantity', 'Quantity to send must be greater than 0', 'warning');
      return;
    }
    if (quantitySent > availableQty) {
      toast('Stock Error', `Cannot send ${quantitySent} ${uom}. Maximum available is ${availableQty} ${batch.currentUom}.`, 'error');
      return;
    }

    try {
      await sendMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          vendorId,
          bleachingTypeId,
          quantitySent: Number(quantitySent),
          uom,
          sentDate,
          expectedReturnDate: expectedReturnDate || undefined,
          rate: rate ? Number(rate) : undefined,
          notes: notes || undefined,
        },
      });

      toast('Dispatched', `Dispatched ${quantitySent} ${uom} to bleaching vendor successfully!`, 'success');
      onClose();
    } catch (err: any) {
      toast('Error', err.message || 'Failed to dispatch material to bleaching', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Material to External Bleaching / Job Work"
      description={`Batch ${batch.batchNumber} — Available in Warehouse: ${availableQty} ${batch.currentUom}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Batch Info Summary */}
        <div className="p-3 bg-secondary/40 rounded-lg border border-border flex items-center justify-between text-xs">
          <div>
            <span className="text-muted-foreground block">Product & Material:</span>
            <strong className="text-foreground">{batch.product.name}</strong>
          </div>
          <div className="text-right font-mono">
            <span className="text-muted-foreground block">Available Stock:</span>
            <strong className="text-blue-600 dark:text-blue-400 font-bold">{availableQty} {batch.currentUom}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MasterEntityDropdown
            label="Bleaching Vendor (Subcontractor)"
            entityType="jobWorkCompany"
            placeholder="-- Select Bleaching Company --"
            options={companies.map((c: any) => ({
              value: c.id,
              label: `${c.companyName} (${c.contactPerson || 'Vendor'})`,
              raw: c,
            }))}
            value={vendorId}
            onChange={(val) => setVendorId(val)}
            required
          />

          <MasterDropdown
            label="Bleaching Process Type"
            value={bleachingTypeId}
            onChange={(val) => setBleachingTypeId(val)}
            type="bleachingType"
            mastersList={masters?.bleachingTypes || []}
            options={(masters?.bleachingTypes || []).map((b) => ({
              value: b.id,
              label: b.name,
            }))}
            placeholder="-- Select Bleaching Type --"
            required
          />

          <Input
            label="Quantity to Send"
            type="number"
            value={quantitySent}
            onChange={(e) => setQuantitySent(Number(e.target.value))}
            min={1}
            max={availableQty}
            step="any"
            required
          />

          <Input
            label="Unit of Measure (UOM)"
            value={uom}
            onChange={(e) => setUom(e.target.value)}
            required
          />

          <Input
            label="Sent Date"
            type="date"
            value={sentDate}
            onChange={(e) => setSentDate(e.target.value)}
            required
          />

          <Input
            label="Expected Return Date"
            type="date"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
          />

          <Input
            label="Agreed Rate / Unit (₹) (Optional)"
            type="number"
            value={rate || ''}
            onChange={(e) => setRate(e.target.value ? Number(e.target.value) : undefined)}
            min={0}
            step="any"
            placeholder="e.g. 4.50"
          />

          <div className="flex flex-col justify-end">
            {estimatedCost ? (
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs font-mono">
                <span className="text-muted-foreground block text-[10px]">Estimated Job Work Cost:</span>
                <strong className="text-blue-600 dark:text-blue-400 text-sm">₹{Number(estimatedCost).toLocaleString()}</strong>
              </div>
            ) : (
              <div className="p-2.5 bg-secondary/30 rounded-md text-xs text-muted-foreground">
                Enter rate to calculate estimated job-work expenditure automatically.
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={sendMutation.isPending} className="gap-1.5">
            <Truck className="h-4 w-4" />
            Dispatch to Bleaching
          </Button>
        </div>
      </form>
    </Modal>
  );
}
