'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Calendar, Truck, User, FileText, AlertCircle, Layers } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useUpdateJobWorkOrder, useJobWorkCompanies, useJobWorkMaterials } from '@/hooks/useJobWork';
import { JobWorkOrder } from '@/types/job-work.types';

interface JobWorkEditModalProps {
  order: JobWorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JobWorkEditModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: JobWorkEditModalProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateJobWorkOrder();
  const { data: companies = [] } = useJobWorkCompanies();
  const { data: materials = [] } = useJobWorkMaterials();

  const [companyId, setCompanyId] = useState('');
  const [rawMaterialId, setRawMaterialId] = useState('');
  const [finishedProductId, setFinishedProductId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [remarks, setRemarks] = useState('');

  const isCreatedStage = order?.status === 'CREATED';

  useEffect(() => {
    if (order) {
      setCompanyId(order.jobWorkCompanyId || '');
      setRawMaterialId(order.rawMaterialId || '');
      setFinishedProductId(order.finishedProductId || '');
      setExpectedReturnDate(
        order.expectedReturnDate
          ? new Date(order.expectedReturnDate).toISOString().split('T')[0]
          : ''
      );
      setVehicleNumber(order.vehicleNumber || '');
      setDriverName(order.driverName || '');
      setRemarks(order.remarks || '');
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!companyId) {
      toast('Validation Error', 'Please select a job working vendor company', 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: order.id,
        payload: {
          jobWorkCompanyId: companyId,
          rawMaterialId: isCreatedStage ? rawMaterialId : undefined,
          finishedProductId: isCreatedStage ? finishedProductId || undefined : undefined,
          expectedReturnDate: expectedReturnDate || undefined,
          vehicleNumber: vehicleNumber.trim() || undefined,
          driverName: driverName.trim() || undefined,
          remarks: remarks.trim() || undefined,
        },
      });

      toast('Order Updated', `Job Work Order ${order.jobWorkNumber} has been updated successfully`, 'success');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast('Update Failed', error?.message || 'Failed to update job work order', 'error');
    }
  };

  const isFinishedProduct = (m: any) => {
    if (m.sku?.startsWith('FP-') || m.sku?.startsWith('FG-')) return true;
    if (m.sku?.startsWith('RM-')) return false;
    const cat = m.category?.name?.toLowerCase() || '';
    return (
      cat.includes('dressing') ||
      cat.includes('surgical') ||
      cat.includes('patient') ||
      cat.includes('hygienic') ||
      cat.includes("women's care") ||
      cat.includes('adult care') ||
      cat.includes('baby care') ||
      cat.includes('mosquito') ||
      cat.includes('finished')
    );
  };

  const rawMaterialsOptions = materials
    .filter((m: any) => !isFinishedProduct(m))
    .map((m: any) => ({ label: `${m.name} (${m.sku})`, value: m.id }));

  const finishedGoodsOptions = [
    { label: '-- None / Same Raw Material Type --', value: '' },
    ...materials
      .filter((m: any) => isFinishedProduct(m))
      .map((m: any) => ({ label: `${m.name} (${m.sku}) [${m.unit?.abbreviation || 'Units'}]`, value: m.id })),
  ];

  const vendorOptions = companies.map((c: any) => ({
    label: `${c.companyName} (${c.contactPerson || 'Vendor'})`,
    value: c.id,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Job Work Order - ${order?.jobWorkNumber || ''}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isCreatedStage && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Materials have already been dispatched for this order. Core material references are locked to preserve warehouse ledger integrity, but vendor details, return schedule, and transport info can be edited.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Job Working Subcontractor *
            </label>
            <Select
              options={vendorOptions}
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              disabled={vendorOptions.length === 0}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Expected Return Date
            </label>
            <Input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
            />
          </div>
        </div>

        {isCreatedStage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Raw Material to Issue *
              </label>
              <Select
                options={rawMaterialsOptions}
                value={rawMaterialId}
                onChange={(e) => setRawMaterialId(e.target.value)}
                disabled={!isCreatedStage}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Target Finished Product
              </label>
              <Select
                options={finishedGoodsOptions}
                value={finishedProductId}
                onChange={(e) => setFinishedProductId(e.target.value)}
                disabled={!isCreatedStage}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Vehicle Registration #
            </label>
            <Input
              placeholder="e.g. TN-38-BZ-4412"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Driver Name
            </label>
            <Input
              placeholder="e.g. Muthu Kumar"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Work Order Remarks / Instructions
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Special processing requirements or bleaching notes..."
            className="w-full bg-secondary/50 text-foreground text-xs p-2.5 rounded-lg border border-border focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={updateMutation.isPending}
            leftIcon={<Edit3 className="h-3.5 w-3.5" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
