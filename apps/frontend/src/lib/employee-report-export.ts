'use client';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatWorkHours } from './date-utils';
import { EmployeeReportData, EmployeeReportDailyLog } from '@/types/employee.types';

/**
 * Clean text for Excel/PDF exports (replaces special unicode dashes/chars that cause mojibake)
 */
function cleanText(val: any): string {
  if (val === null || val === undefined || val === '') return '-';
  const str = String(val);
  return str.replace(/—/g, '-').replace(/–/g, '-').trim();
}

/**
 * Format status code to human readable string (e.g. WEEKLY_OFF -> Weekly Off)
 */
function formatStatus(status: string): string {
  if (!status) return '-';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Professional Styled Excel Export (.xlsx) with proper column widths and formatting
 */
export function exportEmployeeReportToExcel(report: EmployeeReportData) {
  if (!report) return;

  const emp = report.employee;
  const summary = report.attendanceSummary;
  const fin = report.financialSummary;

  // Build structured 2D sheet data
  const data: (string | number)[][] = [
    ['APEX SURGICAL PRODUCTS MANUFACTURING LTD.'],
    ['EMPLOYEE WORK & ATTENDANCE REPORT'],
    [''],
    ['EMPLOYEE DETAILS', '', 'REPORT PERIOD', ''],
    ['Employee Code:', emp.employeeCode, 'From Date:', report.period.startDate],
    ['Employee Name:', `${emp.firstName} ${emp.lastName}`, 'To Date:', report.period.endDate],
    ['Department:', emp.department || 'Production', 'Total Days in Period:', report.period.totalCalendarDays],
    ['Designation:', emp.designation || 'Operator', 'Generated On:', new Date().toLocaleDateString('en-IN')],
    ['Base Daily Wage (INR):', Number(emp.baseWage || 0), 'OT Rate / Hour (INR):', Number(emp.otRatePerHour || 0)],
    [''],
    ['ATTENDANCE & EARNINGS SUMMARY', '', '', ''],
    ['Present Days (Full):', summary.presentDays, 'Regular Hours Worked:', formatWorkHours(summary.totalWorkingHours)],
    ['Half Days:', summary.halfDays, 'Overtime Hours Worked:', formatWorkHours(summary.totalOvertimeHours)],
    ['Absent Days:', summary.absentDays, 'Regular Base Salary (INR):', Number(fin.baseSalaryEarned || 0)],
    ['Leave Days:', summary.leaveDays, 'Overtime Salary (INR):', Number(fin.otSalaryEarned || 0)],
    ['Total Payable Days:', summary.payableDays, 'TOTAL GROSS EARNED (INR):', Number(fin.totalGrossEarned || 0)],
    [''],
    ['DAILY ATTENDANCE & PUNCH LOGS'],
    [
      'Date',
      'Day',
      'Status',
      'Check In (IST)',
      'Check Out (IST)',
      'Regular Work Hours',
      'Overtime Hours',
      'OT Earned (INR)',
      'Remarks',
    ],
  ];

  // Append Daily Logs
  report.dailyLogs.forEach((log: EmployeeReportDailyLog) => {
    const checkInTime = log.checkIn
      ? new Date(log.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '-';
    const checkOutTime = log.checkOut
      ? new Date(log.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '-';

    data.push([
      log.date,
      log.dayOfWeek,
      formatStatus(log.status),
      checkInTime,
      checkOutTime,
      formatWorkHours(log.workingHours),
      log.overtimeHours > 0 ? formatWorkHours(log.overtimeHours) : '0 hr',
      Number(log.otAmount || 0),
      cleanText(log.remarks),
    ]);
  });

  // Create Worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set explicit column widths to prevent '########' cutoffs
  ws['!cols'] = [
    { wch: 18 }, // Date / Label col 1
    { wch: 25 }, // Day / Value col 1
    { wch: 20 }, // Status / Label col 2
    { wch: 22 }, // Check In / Value col 2
    { wch: 18 }, // Check Out
    { wch: 20 }, // Regular Work Hours
    { wch: 18 }, // Overtime Hours
    { wch: 18 }, // OT Earned
    { wch: 30 }, // Remarks
  ];

  // Create Workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

  // Generate filename and trigger download
  const filename = `Report_${emp.employeeCode}_${report.period.startDate}_to_${report.period.endDate}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Professional Vector PDF Generation (.pdf)
 */
export function exportEmployeeReportToPDF(report: EmployeeReportData) {
  if (!report) return;

  const emp = report.employee;
  const summary = report.attendanceSummary;
  const fin = report.financialSummary;

  // Create PDF in Portrait orientation
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header Banner
  doc.setFillColor(30, 58, 138); // Deep Navy/Blue #1E3A8A
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('APEX SURGICAL PRODUCTS MANUFACTURING LTD.', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Employee Work, Attendance & Performance Report', 14, 16);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - 14, 16, { align: 'right' });

  // 2. Employee Info & Report Period Cards
  let yPos = 30;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 18, yPos + 6);
  doc.text('Period Details', pageWidth / 2 + 10, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.text(`Name: ${emp.firstName} ${emp.lastName}`, 18, yPos + 12);
  doc.text(`Code: ${emp.employeeCode}`, 18, yPos + 17);
  doc.text(`Department: ${emp.department || 'Production'} | Role: ${emp.designation || 'Operator'}`, 18, yPos + 22);

  // Column 2
  doc.text(`Period: ${report.period.startDate} to ${report.period.endDate}`, pageWidth / 2 + 10, yPos + 12);
  doc.text(`Total Days: ${report.period.totalCalendarDays} Days`, pageWidth / 2 + 10, yPos + 17);
  doc.text(`Base Wage: Rs. ${emp.baseWage || 0}/day | OT Rate: Rs. ${emp.otRatePerHour || 0}/hr`, pageWidth / 2 + 10, yPos + 22);

  // 3. KPI Summary Table
  yPos += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Performance & Financial Summary', 14, yPos);

  autoTable(doc, {
    startY: yPos + 2,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Present Days', 'Half Days', 'Absent Days', 'Leave Days', 'Payable Days', 'Total Work Hours', 'Total OT Hours', 'Gross Salary']],
    body: [
      [
        String(summary.presentDays),
        String(summary.halfDays),
        String(summary.absentDays),
        String(summary.leaveDays),
        String(summary.payableDays),
        formatWorkHours(summary.totalWorkingHours),
        formatWorkHours(summary.totalOvertimeHours),
        `Rs. ${Number(fin.totalGrossEarned || 0).toLocaleString('en-IN')}`,
      ],
    ],
    headStyles: {
      fillColor: [59, 130, 246], // Blue 500
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [30, 41, 59],
    },
  });

  // 4. Daily Attendance Table
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Daily Punch Logs & Attendance Records', 14, finalY);

  const tableRows = report.dailyLogs.map((log) => [
    log.date,
    log.dayOfWeek,
    formatStatus(log.status),
    log.checkIn ? new Date(log.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
    log.checkOut ? new Date(log.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
    formatWorkHours(log.workingHours),
    log.overtimeHours > 0 ? formatWorkHours(log.overtimeHours) : '0 hr',
    log.otAmount > 0 ? `Rs. ${log.otAmount}` : '-',
    cleanText(log.remarks),
  ]);

  autoTable(doc, {
    startY: finalY + 3,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['Date', 'Day', 'Status', 'In (IST)', 'Out (IST)', 'Work Time', 'Overtime', 'OT Pay', 'Remarks']],
    body: tableRows,
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Date
      1: { cellWidth: 12 }, // Day
      2: { cellWidth: 22 }, // Status
      3: { cellWidth: 18 }, // In
      4: { cellWidth: 18 }, // Out
      5: { cellWidth: 20 }, // Work Time
      6: { cellWidth: 18 }, // OT Time
      7: { cellWidth: 18 }, // OT Pay
      8: { cellWidth: 'auto' }, // Remarks
    },
    didDrawPage: (data) => {
      // Page Footer
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()} | Apex IMS`;
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    },
  });

  // Save PDF
  const filename = `Report_${emp.employeeCode}_${report.period.startDate}_to_${report.period.endDate}.pdf`;
  doc.save(filename);
}
