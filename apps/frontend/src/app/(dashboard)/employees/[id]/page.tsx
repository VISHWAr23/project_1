'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  AlertCircle,
  ArrowLeft,
  Edit,
  DollarSign,
  Zap,
  Clock,
  IndianRupee,
  Receipt,
  Plus,
  PiggyBank,
  CheckCircle2,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import {
  useEmployeeDetail,
  useUpdateEmployee,
  useDepartments,
  useDesignations,
  useEmployeeFinancialSummary,
  useCreateAdvance,
  useRepayAdvance,
  useSettlePayment,
  useEmployeePaymentHistory,
} from '@/hooks/useEmployees';
import { formatWorkHours } from '@/lib/date-utils';
import { EmployeeReportModal } from '@/components/employee/employee-report-modal';
import { EmployeeReportTab } from '@/components/employee/employee-report-tab';

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const empId = resolvedParams?.id;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'financial' | 'report' | 'history' | 'personal' | 'salary'>('financial');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string>('');

  // Fetch Data
  const { data: employee, isLoading } = useEmployeeDetail(empId);
  const { data: financialSummary, isLoading: isFinLoading, refetch: refetchFin } = useEmployeeFinancialSummary(empId);
  const { data: paymentHistory, isLoading: isHistLoading, refetch: refetchHist } = useEmployeePaymentHistory(empId);
  const { data: departments = [] } = useDepartments();
  const { data: designations = [] } = useDesignations();

  const updateMutation = useUpdateEmployee();
  const settleMutation = useSettlePayment();
  const createAdvanceMutation = useCreateAdvance();
  const repayAdvanceMutation = useRepayAdvance();

  // Edit Form State
  const [editForm, setEditForm] = useState<any>({});

  // Settle Payment Form State (with customizable advance deduction)
  const [settleForm, setSettleForm] = useState<{
    paymentType: 'NORMAL_SALARY' | 'OVERTIME_SALARY' | 'ADVANCE_DISBURSEMENT' | 'ADVANCE_REPAYMENT' | 'FULL_SETTLEMENT';
    grossAmount: number;
    advanceDeduction: number;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
    transactionRef?: string;
    remarks?: string;
    advanceId?: string;
  }>({
    paymentType: 'FULL_SETTLEMENT',
    grossAmount: 0,
    advanceDeduction: 0,
    paymentMethod: 'CASH',
    transactionRef: '',
    remarks: '',
  });

  // New Advance Form State
  const [advanceForm, setAdvanceForm] = useState({
    amount: 5000,
    weeklyDeduction: 500,
    reason: '',
  });

  // Repay Advance Form State
  const [repayForm, setRepayForm] = useState({
    amount: 500,
    paymentMethod: 'CASH' as const,
    notes: '',
  });

  const openEditModal = () => {
    if (!employee) return;
    setEditForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      phone: employee.phone || '',
      alternatePhone: employee.alternatePhone || '',
      email: employee.email || '',
      gender: employee.gender || '',
      dob: employee.dob ? employee.dob.split('T')[0] : '',
      bloodGroup: employee.bloodGroup || '',
      address: employee.address || '',
      city: employee.city || '',
      state: employee.state || '',
      pinCode: employee.pinCode || '',
      emergencyContact: employee.emergencyContact || '',
      emergencyPhone: employee.emergencyPhone || '',
      aadhaarNo: employee.aadhaarNo || '',
      panNo: employee.panNo || '',
      joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
      salaryType: employee.salaryType || 'Daily Wage',
      salaryCycle: employee.salaryCycle || 'MONTHLY',
      baseWage: Number(employee.baseWage || 0),
      otRatePerHour: Number(employee.otRatePerHour || 0),
      bankName: employee.bankName || '',
      bankAccountNo: employee.bankAccountNo || '',
      bankIfsc: employee.bankIfsc || '',
      upiId: employee.upiId || '',
      departmentId: employee.departmentId || '',
      designationId: employee.designationId || '',
    });
    setIsEditModalOpen(true);
  };

  const openSettleModal = (type: typeof settleForm.paymentType = 'FULL_SETTLEMENT', defaultAmt?: number) => {
    const baseEarned = financialSummary?.settlementSummary?.baseSalaryEarned || 0;
    const otEarned = financialSummary?.settlementSummary?.otSalaryEarned || 0;
    const grossTotal = baseEarned + otEarned;
    const outstandingAdv = financialSummary?.advances?.outstandingBalance || 0;
    const defaultWeeklyDed = financialSummary?.advances?.weeklyDeductionTotal || 0;
    const defaultAdvanceDed = Math.min(outstandingAdv, defaultWeeklyDed > 0 ? defaultWeeklyDed : outstandingAdv);

    let initialGross = 0;
    let initialDed = 0;

    if (type === 'NORMAL_SALARY') {
      initialGross = defaultAmt !== undefined ? defaultAmt : baseEarned;
      initialDed = 0;
    } else if (type === 'OVERTIME_SALARY') {
      initialGross = defaultAmt !== undefined ? defaultAmt : otEarned;
      initialDed = 0;
    } else if (type === 'FULL_SETTLEMENT') {
      initialGross = defaultAmt !== undefined ? defaultAmt : grossTotal;
      initialDed = defaultAdvanceDed;
    } else if (type === 'ADVANCE_DISBURSEMENT') {
      initialGross = 5000;
      initialDed = 0;
    }

    setSettleForm({
      paymentType: type,
      grossAmount: initialGross,
      advanceDeduction: initialDed,
      paymentMethod: 'CASH',
      transactionRef: '',
      remarks: '',
    });
    setIsSettleModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: empId,
        payload: editForm,
      });
      toast('Profile Updated', 'Employee details saved successfully', 'success');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast('Update Failed', err?.message || 'Could not update profile', 'error');
    }
  };

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settleForm.grossAmount <= 0 && settleForm.paymentType !== 'ADVANCE_REPAYMENT') {
      toast('Invalid Amount', 'Please enter a valid gross amount greater than ₹0', 'error');
      return;
    }

    const netAmount = Math.max(0, settleForm.grossAmount - (settleForm.advanceDeduction || 0));

    try {
      await settleMutation.mutateAsync({
        employeeId: empId,
        payload: {
          paymentType: settleForm.paymentType,
          amount: settleForm.grossAmount,
          advanceDeduction: settleForm.advanceDeduction,
          netAmount,
          paymentMethod: settleForm.paymentMethod,
          transactionRef: settleForm.transactionRef,
          remarks: settleForm.remarks,
        },
      });
      toast(
        'Payment Settled',
        `Recorded ₹${netAmount} net payout (Gross: ₹${settleForm.grossAmount}, Ded: ₹${settleForm.advanceDeduction})`,
        'success'
      );
      setIsSettleModalOpen(false);
      refetchFin();
      refetchHist();
    } catch (err: any) {
      toast('Settlement Failed', err?.message || 'Could not process payment', 'error');
    }
  };

  const handleAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (advanceForm.amount <= 0) {
      toast('Invalid Amount', 'Please enter an advance amount greater than ₹0', 'error');
      return;
    }

    try {
      await createAdvanceMutation.mutateAsync({
        employeeId: empId,
        payload: advanceForm,
      });
      toast('Advance Disbursed', `Successfully recorded Advance of ₹${advanceForm.amount}`, 'success');
      setIsAdvanceModalOpen(false);
      refetchFin();
      refetchHist();
    } catch (err: any) {
      toast('Advance Failed', err?.message || 'Could not record advance', 'error');
    }
  };

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (repayForm.amount <= 0) {
      toast('Invalid Amount', 'Please enter a repayment amount greater than ₹0', 'error');
      return;
    }

    try {
      await repayAdvanceMutation.mutateAsync({
        employeeId: empId,
        payload: {
          advanceId: selectedAdvanceId,
          amount: repayForm.amount,
          paymentMethod: repayForm.paymentMethod,
          notes: repayForm.notes,
        },
      });
      toast('Repayment Logged', `Successfully recorded installment of ₹${repayForm.amount}`, 'success');
      setIsRepayModalOpen(false);
      refetchFin();
      refetchHist();
    } catch (err: any) {
      toast('Repayment Failed', err?.message || 'Could not record repayment', 'error');
    }
  };

  const handleStatusToggle = async () => {
    if (!employee) return;
    const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateMutation.mutateAsync({
        id: empId,
        payload: { status: newStatus },
      });
      toast('Status Changed', `Employee set to ${newStatus}`, newStatus === 'ACTIVE' ? 'success' : 'warning');
    } catch (err: any) {
      toast('Status Update Failed', err?.message || 'Could not change status', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground bg-card border border-border rounded-xl">
        Fetching Employee Profile details...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center space-y-4 bg-card border border-border rounded-xl">
        <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
        <div className="text-base font-bold text-foreground">Employee Profile Not Found</div>
        <Link href="/employees">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const fin = financialSummary;
  const outstandingAdvanceBalance = fin?.advances?.outstandingBalance || 0;
  const calculatedNetPayout = Math.max(0, settleForm.grossAmount - (settleForm.advanceDeduction || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/employees"
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employee Directory
        </Link>
        <span className="text-xs font-mono text-muted-foreground">EMP: {employee.employeeCode}</span>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Avatar
              name={`${employee.firstName} ${employee.lastName}`}
              src={employee.avatarUrl || undefined}
              size="lg"
              className="h-14 w-14 sm:h-16 sm:w-16 text-lg font-bold border-2 border-blue-500 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground font-mono">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30">
                  {employee.employeeCode}
                </span>
                <span className="font-mono text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/30">
                  {employee.salaryCycle === 'WEEKLY' ? 'Weekly Pay' : 'Monthly Cycle'}
                </span>
                <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {employee.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span>{employee.designation?.name || 'Staff'}</span>
                <span>•</span>
                <span className="text-foreground">{employee.department?.name || 'Unassigned'}</span>
                <span>•</span>
                <span>OT: <strong className="text-blue-500">₹{employee.otRatePerHour || 0}/hr</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full lg:w-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => openSettleModal('FULL_SETTLEMENT')}
              leftIcon={<Zap className="h-4 w-4 text-amber-300" />}
              className="col-span-2 sm:col-span-1 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md font-bold justify-center"
            >
              Pay / Settle
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportModalOpen(true)}
              leftIcon={<FileText className="h-4 w-4 text-blue-500" />}
              className="font-bold border-blue-500/30 text-blue-500 hover:bg-blue-500/10 justify-center"
            >
              Report
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvanceModalOpen(true)}
              leftIcon={<PiggyBank className="h-4 w-4 text-emerald-500" />}
              className="justify-center"
            >
              Advance
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={openEditModal}
              leftIcon={<Edit className="h-3.5 w-3.5" />}
              className="justify-center"
            >
              Edit
            </Button>

            <Button
              variant={employee.status === 'ACTIVE' ? 'outline' : 'primary'}
              size="sm"
              onClick={handleStatusToggle}
              className={employee.status === 'ACTIVE' ? 'border-amber-500/40 text-amber-500 justify-center' : 'justify-center'}
              isLoading={updateMutation.isPending}
            >
              {employee.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </div>

      {/* 4 KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 font-mono text-xs">
        {/* Card 1: Base Salary (Per Day) */}
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] truncate">Base (₹/Day)</span>
            <DollarSign className="h-4 w-4 text-blue-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-foreground">
            ₹{Number(employee.baseWage || 0).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">/d</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
            <span>Cycle:</span>
            <strong className="text-emerald-500">₹{fin?.settlementSummary?.baseSalaryEarned || 0}</strong>
          </div>
        </div>

        {/* Card 2: Overtime Salary */}
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] truncate">Overtime</span>
            <Zap className="h-4 w-4 text-purple-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-purple-500">
            ₹{fin?.settlementSummary?.otSalaryEarned || 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
            <span>OT Hrs:</span>
            <strong className="text-foreground">{formatWorkHours(fin?.currentCycle?.totalOvertimeHours, { zeroText: '0 hr' })}</strong>
          </div>
        </div>

        {/* Card 3: Advance Balance */}
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] truncate">Advance Due</span>
            <PiggyBank className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-amber-500">
            ₹{fin?.advances?.outstandingBalance || 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
            <span>Weekly Ded:</span>
            <strong className="text-foreground">₹{fin?.advances?.weeklyDeductionTotal || 0}</strong>
          </div>
        </div>

        {/* Card 4: Net Estimated Payout */}
        <div className="bg-gradient-to-br from-emerald-950/30 to-blue-950/30 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] font-bold truncate">Est. Payout</span>
            <IndianRupee className="h-4 w-4 shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-emerald-500">
            ₹{fin?.settlementSummary?.estimatedNetPayout || 0}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
            <span>Net Payable</span>
            <button
              onClick={() => openSettleModal('FULL_SETTLEMENT')}
              className="text-blue-500 font-bold hover:underline"
            >
              Settle &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto touch-scroll no-scrollbar font-mono text-xs">
        {[
          { key: 'financial', label: 'Financial Summary' },
          { key: 'report', label: 'Work & Attendance Report' },
          { key: 'history', label: 'Payment History & Settlements' },
          { key: 'personal', label: 'Personal Details' },
          { key: 'salary', label: 'Bank & Structure' },
        ].map((tab) => (
          <button
            key={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Financial Summary */}
      {activeTab === 'financial' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Current Cycle Attendance & Compensation */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Current Cycle Earnings Breakdown
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openSettleModal('NORMAL_SALARY', fin?.settlementSummary?.baseSalaryEarned)}
                >
                  Pay Base (₹{fin?.settlementSummary?.baseSalaryEarned || 0})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openSettleModal('OVERTIME_SALARY', fin?.settlementSummary?.otSalaryEarned)}
                  className="text-purple-500 border-purple-500/30"
                >
                  Pay OT (₹{fin?.settlementSummary?.otSalaryEarned || 0})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-secondary/30 rounded-xl">
                <div className="text-muted-foreground text-[10px]">Present / Half Days</div>
                <div className="text-base font-bold text-foreground mt-0.5">
                  {fin?.currentCycle?.presentDays || 0} Full / {fin?.currentCycle?.halfDays || 0} Half
                </div>
              </div>

              <div className="p-3 bg-secondary/30 rounded-xl">
                <div className="text-muted-foreground text-[10px]">Regular Worked Hours</div>
                <div className="text-base font-bold text-foreground mt-0.5">
                  {formatWorkHours(fin?.currentCycle?.totalWorkingHours, { zeroText: '0 hr' })}
                </div>
              </div>

              <div className="p-3 bg-secondary/30 rounded-xl">
                <div className="text-muted-foreground text-[10px]">Overtime Worked</div>
                <div className="text-base font-bold text-purple-500 mt-0.5">
                  {fin?.currentCycle?.totalOvertimeHours > 0 ? `+${formatWorkHours(fin?.currentCycle?.totalOvertimeHours)}` : '0 hr'}
                </div>
              </div>

              <div className="p-3 bg-secondary/30 rounded-xl">
                <div className="text-muted-foreground text-[10px]">Total Gross Earned</div>
                <div className="text-base font-bold text-emerald-500 mt-0.5">
                  ₹{fin?.settlementSummary?.totalGrossEarned || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Advance Loans Tracker */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-amber-500" />
                  Salary Advance & Emergency Loan Accounts
                </h3>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsAdvanceModalOpen(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Disburse Advance
              </Button>
            </div>

            {fin?.advances?.activeAdvances?.length ? (
              <div className="divide-y divide-border/40">
                {fin.advances.activeAdvances.map((adv: any) => {
                  const pct = Math.min(100, Math.round((adv.repaidAmount / adv.amount) * 100));
                  return (
                    <div key={`adv-${adv.id}`} className="py-4 space-y-2.5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-foreground text-sm flex items-center gap-2">
                            <span>₹{adv.amount.toLocaleString()}</span>
                            <span className="text-[11px] text-muted-foreground font-normal">
                              ({adv.reason || 'Salary Advance'})
                            </span>
                            <Badge variant={adv.status === 'ACTIVE' ? 'warning' : 'success'}>
                              {adv.status}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Issued: {new Date(adv.issueDate).toLocaleDateString()} • Weekly deduction:{' '}
                            <strong className="text-foreground">₹{adv.weeklyDeduction || 0}/wk</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[10px] text-muted-foreground">Remaining Balance</div>
                            <div className="text-sm font-bold text-amber-500">₹{adv.balanceAmount.toLocaleString()}</div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdvanceId(adv.id);
                              setRepayForm({
                                amount: adv.weeklyDeduction || adv.balanceAmount,
                                paymentMethod: 'CASH',
                                notes: `Installment for Advance ${adv.id.slice(0, 6)}`,
                              });
                              setIsRepayModalOpen(true);
                            }}
                          >
                            Repay Installment
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Repaid: ₹{adv.repaidAmount.toLocaleString()} ({pct}%)</span>
                          <span>Remaining: ₹{adv.balanceAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No active advance loans for this employee.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Work & Attendance Report */}
      {activeTab === 'report' && (
        <EmployeeReportTab employeeId={empId} employee={employee} />
      )}

      {/* Tab 2: Payment History & Settlements */}
      {activeTab === 'history' && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-500" />
                Payment & Settlement Ledger
              </h3>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => openSettleModal('FULL_SETTLEMENT')}
              leftIcon={<Zap className="h-3.5 w-3.5" />}
            >
              New Settlement
            </Button>
          </div>

          {paymentHistory?.payments?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground bg-secondary/30">
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Net Amount Paid (₹)</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Transaction Ref</th>
                    <th className="p-2.5">Deductions & Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {paymentHistory.payments.map((p: any) => (
                    <tr key={`payment-row-${p.id}`} className="hover:bg-secondary/30">
                      <td className="p-2.5 whitespace-nowrap text-muted-foreground">
                        {new Date(p.paymentDate).toLocaleString()}
                      </td>
                      <td className="p-2.5 font-bold">
                        <Badge
                          variant={
                            p.paymentType === 'ADVANCE_DISBURSEMENT'
                              ? 'warning'
                              : p.paymentType === 'ADVANCE_REPAYMENT'
                              ? 'success'
                              : p.paymentType === 'OVERTIME_SALARY'
                              ? 'info'
                              : 'neutral'
                          }
                        >
                          {p.paymentType ? p.paymentType.replace('_', ' ') : 'SALARY PAYOUT'}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-500">
                        ₹{Number(p.amount).toLocaleString()}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px]">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-2.5 text-muted-foreground">{p.transactionRef || '—'}</td>
                      <td className="p-2.5 text-foreground">
                        {p.remarks || 'Direct Settlement'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No payment history recorded yet.</div>
          )}
        </div>
      )}

      {/* Tab 3: Personal & Role Details */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Identity & Department Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="text-foreground font-semibold">{employee.firstName} {employee.lastName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Department:</span>
                <span className="text-foreground font-semibold">{employee.department?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Designation:</span>
                <span className="text-foreground font-semibold">{employee.designation?.name || 'Staff'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Salary Cycle:</span>
                <span className="text-foreground font-bold">{employee.salaryCycle || 'MONTHLY'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">OT Rate:</span>
                <span className="text-blue-500 font-bold">₹{employee.otRatePerHour || 0}/hour</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Joining Date:</span>
                <span className="text-foreground">{new Date(employee.joiningDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Gender:</span>
                <span className="text-foreground">{employee.gender || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Date of Birth:</span>
                <span className="text-foreground">{employee.dob ? new Date(employee.dob).toLocaleDateString() : 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Blood Group:</span>
                <span className="text-foreground font-bold text-red-400">{employee.bloodGroup || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Aadhaar Card No:</span>
                <span className="text-foreground">{employee.aadhaarNo || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">PAN Card No:</span>
                <span className="text-foreground">{employee.panNo || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" />
              Contact Details & Address
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Primary Phone:</span>
                <span className="text-foreground font-bold">{employee.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Alternate Phone:</span>
                <span className="text-foreground">{employee.alternatePhone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground">{employee.email || 'Optional / Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Address:</span>
                <span className="text-foreground text-right">{employee.address ? `${employee.address}, ${employee.city || ''}` : 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Emergency Contact:</span>
                <span className="text-foreground font-semibold">{employee.emergencyContact || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Emergency Phone:</span>
                <span className="text-foreground">{employee.emergencyPhone || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Salary & Bank */}
      {activeTab === 'salary' && (
        <div className="bg-card border border-border rounded-xl p-5 font-mono text-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
            Salary Structure & Payment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Salary Type:</span>
                <span className="text-foreground font-bold">{employee.salaryType || 'Daily Wage'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Salary Cycle:</span>
                <span className="text-foreground font-bold">{employee.salaryCycle || 'MONTHLY'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Base Salary (₹ / Day):</span>
                <span className="text-emerald-500 font-bold">₹{Number(employee.baseWage || 0).toFixed(2)} / day</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">OT Rate (per hour):</span>
                <span className="text-purple-500 font-bold">₹{Number(employee.otRatePerHour || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="text-foreground">{employee.bankName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Bank Account No:</span>
                <span className="text-foreground font-mono">{employee.bankAccountNo || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">IFSC Code:</span>
                <span className="text-foreground font-mono">{employee.bankIfsc || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">UPI ID:</span>
                <span className="text-foreground font-mono">{employee.upiId || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Settle Payment Modal */}
      <Modal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        title="Settle & Pay Salary"
      >
        <form onSubmit={handleSettleSubmit} className="space-y-4 pt-2 font-mono text-xs">
          <div>
            <label className="block text-muted-foreground mb-1">Settlement Category *</label>
            <select
              value={settleForm.paymentType}
              onChange={(e) => {
                const type = e.target.value as any;
                const baseEarned = fin?.settlementSummary?.baseSalaryEarned || 0;
                const otEarned = fin?.settlementSummary?.otSalaryEarned || 0;
                const grossTotal = baseEarned + otEarned;
                const outstandingAdv = fin?.advances?.outstandingBalance || 0;
                const defaultWeeklyDed = fin?.advances?.weeklyDeductionTotal || 0;
                const defaultAdvanceDed = Math.min(outstandingAdv, defaultWeeklyDed > 0 ? defaultWeeklyDed : outstandingAdv);

                let initialGross = 0;
                let initialDed = 0;

                if (type === 'NORMAL_SALARY') {
                  initialGross = baseEarned;
                  initialDed = 0;
                } else if (type === 'OVERTIME_SALARY') {
                  initialGross = otEarned;
                  initialDed = 0;
                } else if (type === 'FULL_SETTLEMENT') {
                  initialGross = grossTotal;
                  initialDed = defaultAdvanceDed;
                } else if (type === 'ADVANCE_DISBURSEMENT') {
                  initialGross = 5000;
                  initialDed = 0;
                }

                setSettleForm({
                  ...settleForm,
                  paymentType: type,
                  grossAmount: initialGross,
                  advanceDeduction: initialDed,
                });
              }}
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="FULL_SETTLEMENT">Full Settlement (Base + OT with Advance Deduction)</option>
              <option value="NORMAL_SALARY">Normal / Base Salary Only</option>
              <option value="OVERTIME_SALARY">Overtime (OT) Salary Only</option>
              <option value="ADVANCE_DISBURSEMENT">Disburse New Advance Loan</option>
            </select>
          </div>

          {settleForm.paymentType !== 'ADVANCE_DISBURSEMENT' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {/* Gross Amount */}
                <div>
                  <label className="block text-muted-foreground mb-1">
                    {settleForm.paymentType === 'OVERTIME_SALARY' ? 'OT Amount (₹) *' : 'Gross Earnings (₹) *'}
                  </label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={settleForm.grossAmount}
                    onChange={(e) =>
                      setSettleForm({ ...settleForm, grossAmount: Number(e.target.value) })
                    }
                  />
                </div>

                {/* Advance Deduction Option */}
                <div>
                  <label className="block text-muted-foreground mb-1 flex items-center justify-between">
                    <span>Advance Deduction (₹)</span>
                    {outstandingAdvanceBalance > 0 && (
                      <span className="text-[10px] text-amber-500">Max: ₹{outstandingAdvanceBalance}</span>
                    )}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={outstandingAdvanceBalance > 0 ? outstandingAdvanceBalance : 0}
                    disabled={outstandingAdvanceBalance <= 0}
                    placeholder={outstandingAdvanceBalance > 0 ? 'e.g. 500' : 'No active advance'}
                    value={settleForm.advanceDeduction}
                    onChange={(e) =>
                      setSettleForm({
                        ...settleForm,
                        advanceDeduction: Math.min(outstandingAdvanceBalance, Number(e.target.value)),
                      })
                    }
                  />
                </div>
              </div>


              {/* Net Payout Summary Card */}
              <div className="p-3.5 bg-secondary/50 border border-border rounded-xl space-y-1.5">
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Gross Salary:</span>
                  <span className="font-semibold text-foreground">₹{settleForm.grossAmount.toLocaleString()}</span>
                </div>
                {settleForm.advanceDeduction > 0 && (
                  <div className="flex justify-between text-rose-500 text-[11px]">
                    <span>Advance Repayment Deduction:</span>
                    <span className="font-semibold">-₹{settleForm.advanceDeduction.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border text-xs">
                  <span className="font-bold text-foreground">Net Payout to Employee:</span>
                  <span className="text-base font-bold text-emerald-500">
                    ₹{calculatedNetPayout.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-muted-foreground mb-1">Advance Disbursement Amount (₹) *</label>
              <Input
                type="number"
                required
                min={100}
                value={settleForm.grossAmount}
                onChange={(e) => setSettleForm({ ...settleForm, grossAmount: Number(e.target.value) })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Payment Method *</label>
              <select
                value={settleForm.paymentMethod}
                onChange={(e) => setSettleForm({ ...settleForm, paymentMethod: e.target.value as any })}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                <option value="UPI">UPI Payment</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Transaction Ref / Cheque No</label>
              <Input
                placeholder="e.g. UTR / Ref No..."
                value={settleForm.transactionRef || ''}
                onChange={(e) => setSettleForm({ ...settleForm, transactionRef: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Notes / Remarks</label>
            <Input
              placeholder="e.g. Weekly salary settlement"
              value={settleForm.remarks || ''}
              onChange={(e) => setSettleForm({ ...settleForm, remarks: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsSettleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={settleMutation.isPending}>
              Confirm & Pay ₹{calculatedNetPayout.toLocaleString()}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Disburse Advance Modal */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title="Disburse Salary Advance / Loan"
      >
        <form onSubmit={handleAdvanceSubmit} className="space-y-4 pt-2 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Advance Amount (INR) *</label>
              <Input
                type="number"
                required
                min={100}
                value={advanceForm.amount}
                onChange={(e) => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Weekly Deduction Installment (INR)</label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 500"
                value={advanceForm.weeklyDeduction}
                onChange={(e) => setAdvanceForm({ ...advanceForm, weeklyDeduction: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Reason / Purpose</label>
            <Input
              placeholder="e.g. Festival advance / Medical emergency"
              value={advanceForm.reason}
              onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAdvanceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createAdvanceMutation.isPending}>
              Disburse Advance
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Repay Advance Modal */}
      <Modal
        isOpen={isRepayModalOpen}
        onClose={() => setIsRepayModalOpen(false)}
        title="Record Advance Repayment"
      >
        <form onSubmit={handleRepaySubmit} className="space-y-4 pt-2 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Repayment Amount (INR) *</label>
              <Input
                type="number"
                required
                min={1}
                value={repayForm.amount}
                onChange={(e) => setRepayForm({ ...repayForm, amount: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Payment Method</label>
              <select
                value={repayForm.paymentMethod}
                onChange={(e) => setRepayForm({ ...repayForm, paymentMethod: e.target.value as any })}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Notes / Remarks</label>
            <Input
              placeholder="e.g. Weekly cash repayment"
              value={repayForm.notes}
              onChange={(e) => setRepayForm({ ...repayForm, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsRepayModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={repayAdvanceMutation.isPending}>
              Record Repayment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Edit Staff Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Staff Profile: ${employee.employeeCode}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 font-mono text-xs">
          {/* Section 1: Basic Identity */}
          <div className="border-b border-border pb-3 space-y-3">
            <h4 className="font-bold text-blue-500 text-[11px] uppercase">1. Basic Identity & Contact</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">First Name *</label>
                <Input
                  required
                  value={editForm.firstName || ''}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Last Name *</label>
                <Input
                  required
                  value={editForm.lastName || ''}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Primary Phone</label>
                <Input
                  placeholder="+91 98765..."
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Alternate Phone</label>
                <Input
                  placeholder="Alt Phone"
                  value={editForm.alternatePhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, alternatePhone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="Optional"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Department & Joining */}
          <div className="border-b border-border pb-3 space-y-3">
            <h4 className="font-bold text-blue-500 text-[11px] uppercase">2. Role, Department & Cycle</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Department</label>
                <select
                  value={editForm.departmentId || ''}
                  onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                  className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={`edit-dept-${d.id}`} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Designation</label>
                <select
                  value={editForm.designationId || ''}
                  onChange={(e) => setEditForm({ ...editForm, designationId: e.target.value })}
                  className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Designation</option>
                  {designations.map((d) => (
                    <option key={`edit-desig-${d.id}`} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Joining Date</label>
                <Input
                  type="date"
                  value={editForm.joiningDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Salary Cycle, Wage & OT Rate */}
          <div className="border-b border-border pb-3 space-y-3">
            <h4 className="font-bold text-blue-500 text-[11px] uppercase">3. Compensation & Overtime Rates</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Salary Cycle *</label>
                <select
                  value={editForm.salaryCycle || 'MONTHLY'}
                  onChange={(e) => setEditForm({ ...editForm, salaryCycle: e.target.value })}
                  className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly (Saturday Pay)</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Base Salary (₹ / Day) *</label>
                <Input
                  type="number"
                  placeholder="e.g. 850"
                  value={editForm.baseWage || ''}
                  onChange={(e) => setEditForm({ ...editForm, baseWage: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">OT Rate Per Hour (₹) *</label>
                <Input
                  type="number"
                  placeholder="e.g. 150"
                  value={editForm.otRatePerHour || ''}
                  onChange={(e) => setEditForm({ ...editForm, otRatePerHour: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-blue-500 text-[11px] uppercase">4. Bank & Settlement Account</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Bank Name</label>
                <Input
                  placeholder="e.g. HDFC Bank"
                  value={editForm.bankName || ''}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Bank Account Number</label>
                <Input
                  placeholder="Account Number"
                  value={editForm.bankAccountNo || ''}
                  onChange={(e) => setEditForm({ ...editForm, bankAccountNo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">IFSC Code</label>
                <Input
                  placeholder="HDFC0001234"
                  value={editForm.bankIfsc || ''}
                  onChange={(e) => setEditForm({ ...editForm, bankIfsc: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">UPI ID</label>
                <Input
                  placeholder="staff@upi"
                  value={editForm.upiId || ''}
                  onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border sticky bottom-0 bg-card py-2">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
              Save All Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 5: Generate Report Modal */}
      <EmployeeReportModal

        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        employeeId={empId}
        employeeName={`${employee?.firstName || ''} ${employee?.lastName || ''}`}
      />
    </motion.div>
  );
}

