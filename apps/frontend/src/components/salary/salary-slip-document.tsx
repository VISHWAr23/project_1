import React from 'react';
import { Printer, Download, CheckCircle, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PayrollItem } from '@/types/salary.types';

interface SalarySlipDocumentProps {
  item: PayrollItem;
}

export function SalarySlipDocument({ item }: SalarySlipDocumentProps) {
  const emp = item.employee;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const payMonth = item.salarySlip ? `${monthNames[item.salarySlip.month - 1]} ${item.salarySlip.year}` : 'August 2026';
  const slipNo = item.salarySlip?.slipNumber || `SLIP-202608-${emp?.employeeCode}`;

  const basic = Number(item.basicSalary || 0);
  const bonus = Number(item.bonusAmount || 0);
  const incentive = Number(item.incentiveAmount || 0);
  const gross = Number(item.grossSalary || 0);

  const pt = Number(item.professionalTax || 0);
  const pf = Number(item.pfDeduction || 0);
  const esi = Number(item.esiDeduction || 0);
  const late = Number(item.lateDeduction || 0);
  const advance = Number(item.advanceDeduction || 0);
  const loan = Number(item.loanDeduction || 0);
  const otherDed = Number(item.otherDeductions || 0);
  const totalDeductions = Number(item.totalDeductions || 0);
  const netPay = Number(item.netSalary || 0);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border print:hidden">
        <div>
          <h2 className="text-base font-bold text-foreground">Employee Payslip Document</h2>
          <p className="text-xs text-muted-foreground">Official monthly earnings statement for {emp?.firstName} {emp?.lastName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Printable Payslip Card */}
      <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="border-b-2 border-emerald-600 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-lg font-bold text-xl tracking-wider">
                SurgicalERP
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Apex Surgical Products Manufacturing Ltd.</h1>
                <p className="text-xs text-slate-600">Plot 45, Industrial Development Area, Phase II, Tamil Nadu - 641001</p>
                <p className="text-[11px] text-slate-500 font-mono">GSTIN: 33AAACA1234F1Z9 • Lic No: MFG/MED-2024/092</p>
              </div>
            </div>
            <div className="text-right sm:border-l sm:pl-4 border-slate-200">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase rounded border border-emerald-200 mb-1">
                PAYSLIP
              </span>
              <p className="text-xs font-bold text-slate-900">Pay Period: {payMonth}</p>
              <p className="text-[11px] font-mono text-slate-600">Ref: {slipNo}</p>
            </div>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Employee ID</span>
            <span className="font-mono font-bold text-slate-900">{emp?.employeeCode}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Employee Name</span>
            <span className="font-bold text-slate-900">{emp?.firstName} {emp?.lastName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Department</span>
            <span className="font-semibold text-slate-900">{emp?.department?.name || 'Manufacturing'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Designation</span>
            <span className="font-semibold text-slate-900">{emp?.designation?.name || 'Staff'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Bank Name</span>
            <span className="font-mono font-medium text-slate-900">{emp?.bankName || 'HDFC Bank'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Bank A/C No</span>
            <span className="font-mono font-bold text-slate-900">{emp?.bankAccountNo || 'XXXXXX1234'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">IFSC Code</span>
            <span className="font-mono text-slate-900">{emp?.bankIfsc || 'HDFC0001234'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">PAN / Aadhaar</span>
            <span className="font-mono text-slate-900">{emp?.panNo || 'N/A'}</span>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Attendance Summary</h3>
          <div className="grid grid-cols-6 gap-2 text-center text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">Working Days</span>
              <span className="font-bold text-slate-900">{item.workingDaysInMonth}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Present Days</span>
              <span className="font-bold text-emerald-600">{Number(item.presentDays)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Absent Days</span>
              <span className="font-bold text-rose-600">{Number(item.absentDays)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Half Days</span>
              <span className="font-bold text-amber-600">{Number(item.halfDays)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Payable Days</span>
              <span className="font-bold text-slate-900">{Number(item.payableDays)}</span>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions Breakdown Table */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Earnings */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-emerald-50 border-b border-slate-200 p-2.5 flex justify-between items-center text-xs font-bold text-emerald-800 uppercase">
              <span>Earnings</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-3 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-700">
                <span>Basic / Regular Wage</span>
                <span>₹ {basic.toLocaleString('en-IN')}</span>
              </div>
              {Number(item.overtimeSalary || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Overtime ({Number(item.overtimeHours || 0)}h @ ₹{Number(item.overtimeRate || 0)}/h)</span>
                  <span>+₹ {Number(item.overtimeSalary || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              {bonus > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Performance Bonus</span>
                  <span>₹ {bonus.toLocaleString('en-IN')}</span>
                </div>
              )}
              {incentive > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Shift Incentive</span>
                  <span>₹ {incentive.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 font-bold flex justify-between text-slate-900">
                <span>Gross Earnings</span>
                <span>₹ {gross.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-rose-50 border-b border-slate-200 p-2.5 flex justify-between items-center text-xs font-bold text-rose-800 uppercase">
              <span>Deductions</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-3 text-xs space-y-2 font-mono">
              {advance > 0 && (
                <div className="flex justify-between text-amber-800 font-medium">
                  <span>Salary Advance Recovery</span>
                  <span>-₹ {advance.toLocaleString('en-IN')}</span>
                </div>
              )}
              {pt > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Professional Tax (PT)</span>
                  <span>₹ {pt.toLocaleString('en-IN')}</span>
                </div>
              )}
              {pf > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Provident Fund (PF)</span>
                  <span>₹ {pf.toLocaleString('en-IN')}</span>
                </div>
              )}
              {esi > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>ESI Deduction</span>
                  <span>₹ {esi.toLocaleString('en-IN')}</span>
                </div>
              )}
              {loan > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Loan Installment</span>
                  <span>₹ {loan.toLocaleString('en-IN')}</span>
                </div>
              )}
              {late > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Late Arrival Deduction</span>
                  <span>₹ {late.toLocaleString('en-IN')}</span>
                </div>
              )}
              {otherDed > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Other Deductions</span>
                  <span>₹ {otherDed.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 font-bold flex justify-between text-rose-700">
                <span>Total Deductions</span>
                <span>- ₹ {totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Banner */}
        <div className="p-4 rounded-xl bg-emerald-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
          <div>
            <span className="text-xs uppercase font-semibold text-emerald-100 block">Total Net Salary Payable</span>
            <p className="text-xs text-emerald-200">Disbursed into bank account on record</p>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight">
            ₹ {netPay.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Footer & QR Code Verification */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-slate-900 text-white p-1 rounded flex items-center justify-center font-mono text-[9px] text-center leading-tight">
              [QR VERIFIED]
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Digitally Verified Document</p>
              <p className="text-[10px] text-slate-500">System generated payslip. No physical signature required.</p>
              <p className="text-[10px] font-mono text-slate-400">Security Hash: {item.id.slice(0, 16)}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="h-10 border-b border-slate-300 w-36 mb-1"></div>
            <p className="font-bold text-slate-800">Authorized Signatory</p>
            <p className="text-[10px] text-slate-500">Apex Surgical Products ERP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
