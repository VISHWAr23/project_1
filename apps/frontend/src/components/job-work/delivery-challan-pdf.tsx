import React from 'react';
import { JobWorkOrder } from '@/types/job-work.types';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DeliveryChallanPDFProps {
  order: JobWorkOrder;
}

export function DeliveryChallanPDF({ order }: DeliveryChallanPDFProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const challanNo = order.challanNumber || `DC-${new Date().getFullYear()}-0012`;
  const dispatchDate = order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : new Date().toLocaleDateString();
  const returnDate = order.expectedReturnDate ? new Date(order.expectedReturnDate).toLocaleDateString() : '-';

  // Retrieve notebook parameters from order or localStorage
  let meta: any = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`ims_job_work_meta_${order.id}`);
      if (raw) meta = JSON.parse(raw);
    } catch (e) {}
  }

  const dcNo = (order as any).dcNo || meta.dcNo || '05';
  const dcDate = (order as any).dcDate || meta.dcDate || dispatchDate;
  const ends = (order as any).ends || meta.ends || '1140';
  const itemType = (order as any).itemType || meta.itemType || '22x14';
  const outputProductWidth = (order as any).outputProductWidth || meta.outputProductWidth || '30cm x 30cm - 8 ply';
  const deliveryPerson = (order as any).deliveryPerson || order.driverName || meta.deliveryPerson || 'Ramesh Kumar';
  const vehicleNumber = order.vehicleNumber || meta.vehicleNumber || 'TN-38-BZ-4412';

  // SVG Barcode representation generator
  const renderBarcodeSVG = (text: string) => {
    return (
      <svg className="w-48 h-12" viewBox="0 0 200 50">
        <rect width="200" height="50" fill="#ffffff" />
        {/* Simulating Code128 bars */}
        {[
          10, 14, 16, 22, 26, 32, 34, 40, 42, 48, 54, 58, 64, 66, 72, 78, 82, 88,
          94, 98, 104, 108, 114, 120, 124, 130, 134, 140, 144, 150, 156, 162, 168, 174, 180, 186
        ].map((x, i) => (
          <rect key={i} x={x} y="5" width={i % 2 === 0 ? 3 : 1.5} height="32" fill="#000000" />
        ))}
        <text x="100" y="46" fontSize="10" fontFamily="monospace" textAnchor="middle" fill="#000000">
          *{text}*
        </text>
      </svg>
    );
  };

  // SVG QR Code representation generator
  const renderQRCodeSVG = (data: string) => {
    return (
      <svg className="w-20 h-20 border border-gray-300" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#ffffff" />
        {/* Top Left Finder */}
        <rect x="5" y="5" width="30" height="30" fill="#000" />
        <rect x="10" y="10" width="20" height="20" fill="#fff" />
        <rect x="15" y="15" width="10" height="10" fill="#000" />
        {/* Top Right Finder */}
        <rect x="65" y="5" width="30" height="30" fill="#000" />
        <rect x="70" y="10" width="20" height="20" fill="#fff" />
        <rect x="75" y="15" width="10" height="10" fill="#000" />
        {/* Bottom Left Finder */}
        <rect x="5" y="65" width="30" height="30" fill="#000" />
        <rect x="10" y="70" width="20" height="20" fill="#fff" />
        <rect x="15" y="75" width="10" height="10" fill="#000" />
        {/* Random QR Pattern Dots */}
        {[
          [40, 10], [45, 15], [50, 10], [55, 20], [40, 25], [50, 25],
          [10, 45], [20, 50], [25, 40], [30, 55], [45, 45], [55, 50],
          [65, 45], [75, 40], [85, 50], [70, 60], [80, 65], [90, 75],
          [40, 70], [50, 80], [45, 90], [60, 85], [75, 85], [85, 90]
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="5" height="5" fill="#000" />
        ))}
      </svg>
    );
  };

  const totalIssuedWeight = Number(order.totalIssuedWeight) || 0;
  const totalIssuedQty = Number(order.totalIssuedQty) || 0;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex items-center justify-between bg-card border border-border p-4 rounded-xl shadow-sm">
        <Link href={`/job-work/${order.id}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Work Order
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
            Print Delivery Challan
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} leftIcon={<Download className="h-4 w-4" />}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Delivery Challan Printable Document (A4 format) */}
      <div id="printable-challan" className="bg-white text-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto font-sans text-xs print:shadow-none print:border-none print:p-0 print:m-0">
        
        {/* Header Block */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-xl tracking-wider">
              IMS
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">SHRI LATHIKKA SURGICALS</h1>
              <p className="text-[11px] text-gray-600">Samsigapuram, Rajapalayam, Tamil Nadu - 626102</p>
              <p className="text-[11px] text-gray-600">GSTIN: 33AAACL1234F1Z9 | Manufacturers of Medical Gauze & Surgical Dressing</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-extrabold text-blue-900 uppercase tracking-widest border border-blue-900 px-3 py-1 inline-block">
              DELIVERY CHALLAN
            </h2>
            <p className="text-[11px] text-gray-500 mt-1">(Outward Job Work Roll Movement)</p>
          </div>
        </div>

        {/* Challan Metadata Row */}
        <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <div className="space-y-1">
            <p><span className="font-semibold text-gray-700">Challan Number:</span> <span className="font-mono font-bold text-gray-900">{challanNo}</span></p>
            <p><span className="font-semibold text-gray-700">Job Work Order No:</span> <span className="font-mono text-gray-900">{order.jobWorkNumber}</span></p>
            <p><span className="font-semibold text-gray-700">Dispatch Date:</span> {dispatchDate}</p>
            <p><span className="font-semibold text-gray-700">Expected Return Date:</span> {returnDate}</p>
          </div>
          <div className="flex flex-col items-end justify-between">
            {renderBarcodeSVG(challanNo)}
          </div>
        </div>

        {/* Notebook Jobwork Parameters (Top 4 Red Circle Data) */}
        <div className="my-4 p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-lg">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1.5 mb-2.5">
            <h3 className="font-bold text-amber-950 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <span>Job Work Parameters (Notebook Specifications)</span>
            </h3>
            <span className="text-[11px] font-mono font-bold bg-amber-200 px-2 py-0.5 rounded text-amber-900 border border-amber-300">
              D.C. No. {dcNo}, dt: {dcDate}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-white rounded border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">1. D.C. No. & Date</span>
              <span className="font-mono font-bold text-gray-900 text-sm">D.C. #{dcNo}</span>
              <span className="block text-[10px] text-gray-600 font-mono mt-0.5">{dcDate}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">2. Ends</span>
              <span className="font-mono font-bold text-gray-900 text-sm">{ends} Ends</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">Warp thread count</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">3. Item Type</span>
              <span className="font-mono font-bold text-gray-900 text-sm">{itemType}</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">Mesh weave construction</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-amber-300 shadow-2xs bg-amber-50/40">
              <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">4. Width (Moping Pad)</span>
              <span className="font-mono font-bold text-amber-900 text-xs">{outputProductWidth}</span>
              <span className="block text-[10px] text-amber-700 mt-0.5 font-medium">Finished output width</span>
            </div>
          </div>
        </div>

        {/* Vendor & Vehicle Information Box */}
        <div className="grid grid-cols-2 gap-4 my-4">
          {/* Vendor Details */}
          <div className="border border-gray-300 p-3 rounded space-y-1">
            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1 text-[11px] uppercase tracking-wider">
              Consigned To (Job Working Company)
            </h3>
            <p className="font-bold text-gray-900">{order.jobWorkCompany?.companyName}</p>
            <p className="text-gray-700">{order.jobWorkCompany?.address || 'GIDC Industrial Area, Factory Premises'}</p>
            <p><span className="font-semibold">GSTIN:</span> {order.jobWorkCompany?.gstin || '27AAACA12341Z5'}</p>
            <p><span className="font-semibold">Contact Person:</span> {order.jobWorkCompany?.contactPerson || 'Store Manager'}</p>
            <p><span className="font-semibold">Phone:</span> {order.jobWorkCompany?.phone || '+91 98765 43210'}</p>
          </div>

          {/* Transport & Carrier Details */}
          <div className="border border-gray-300 p-3 rounded space-y-1">
            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1 text-[11px] uppercase tracking-wider">
              Transport & Dispatch Particulars (Job Working Carrier)
            </h3>
            <p><span className="font-semibold text-gray-700">Delivery Person:</span> <span className="font-bold text-gray-900">{deliveryPerson}</span></p>
            <p><span className="font-semibold text-gray-700">Vehicle Number:</span> <span className="font-mono font-bold text-gray-900">{vehicleNumber}</span></p>
            <p><span className="font-semibold text-gray-700">Dispatch Purpose:</span> Job Work Process (Outsourcing)</p>
            <p><span className="font-semibold text-gray-700">E-Way Bill No:</span> EWB-8899-2026-1122</p>
            <div className="pt-2 flex items-center justify-end">
              {renderQRCodeSVG(JSON.stringify({ challanNo, orderNo: order.jobWorkNumber, company: order.jobWorkCompany?.companyName, deliveryPerson, vehicleNumber }))}
            </div>
          </div>
        </div>

        {/* Issued Material Table */}
        <div className="my-4">
          <h3 className="font-bold text-gray-900 mb-2 uppercase text-[11px]">Issued Material & Roll Particulars</h3>
          <table className="w-full border-collapse border border-gray-300 text-left text-xs">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-300 text-gray-900">
                <th className="border border-gray-300 p-2 text-center w-10">S.N.</th>
                <th className="border border-gray-300 p-2">Material Description / HSN Code</th>
                <th className="border border-gray-300 p-2 w-32">Roll Number / Batch</th>
                <th className="border border-gray-300 p-2 w-24 text-right">Net Weight (Kg)</th>
                <th className="border border-gray-300 p-2 w-24 text-right">Quantity</th>
                <th className="border border-gray-300 p-2">Process / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {order.issueItems && order.issueItems.length > 0 ? (
                order.issueItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="border border-gray-300 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-gray-300 p-2">
                      <span className="font-semibold">{order.rawMaterial?.name}</span>
                      <span className="block text-[10px] text-gray-500">HSN: {order.rawMaterial?.hsnCode || '72201200'} | SKU: {order.rawMaterial?.sku}</span>
                    </td>
                    <td className="border border-gray-300 p-2 font-mono font-bold">{item.rollNumber}</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{Number(item.issuedWeight).toFixed(2)} Kg</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{item.issuedQty} {order.rawMaterial?.unit?.abbreviation || 'Pcs'}</td>
                    <td className="border border-gray-300 p-2 text-gray-600">{item.remarks || order.remarks || 'Standard Processing'}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-200">
                  <td className="border border-gray-300 p-2 text-center font-mono">1</td>
                  <td className="border border-gray-300 p-2">
                    <span className="font-semibold">{order.rawMaterial?.name || 'Raw Material Roll'}</span>
                    <span className="block text-[10px] text-gray-500">SKU: {order.rawMaterial?.sku || 'RM-101'}</span>
                  </td>
                  <td className="border border-gray-300 p-2 font-mono font-bold">ROLL-RM-1001</td>
                  <td className="border border-gray-300 p-2 text-right font-mono">{totalIssuedWeight.toFixed(2)} Kg</td>
                  <td className="border border-gray-300 p-2 text-right font-mono">{totalIssuedQty} Pcs</td>
                  <td className="border border-gray-300 p-2 text-gray-600">{order.remarks || 'Job work processing'}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-400">
                <td colSpan={3} className="border border-gray-300 p-2 text-right">Total Dispatched Quantity & Weight:</td>
                <td className="border border-gray-300 p-2 text-right font-mono text-blue-900">{totalIssuedWeight.toFixed(2)} Kg</td>
                <td className="border border-gray-300 p-2 text-right font-mono">{totalIssuedQty} Units</td>
                <td className="border border-gray-300 p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Declaration & Terms */}
        <div className="my-4 p-3 border border-gray-300 bg-gray-50 rounded text-[10px] space-y-1 text-gray-700">
          <p className="font-bold text-gray-900 uppercase">Declaration & Job Work Conditions:</p>
          <p>1. The goods dispatched herewith are sent for job work process only and not for sale.</p>
          <p>2. The returned processed goods must be delivered within the expected return date specified above as per GST rules.</p>
          <p>3. Stock movement is tracked automatically under Rule 55 of CGST Rules, 2017.</p>
        </div>

        {/* Signature Blocks */}
        <div className="grid grid-cols-3 gap-6 pt-10 mt-6 border-t border-gray-300 text-center text-xs">
          <div>
            <div className="h-12 border-b border-gray-400"></div>
            <p className="font-bold text-gray-900 mt-1">Prepared By</p>
            <p className="text-[10px] text-gray-500">Store / Inventory Officer</p>
          </div>
          <div>
            <div className="h-12 border-b border-gray-400"></div>
            <p className="font-bold text-gray-900 mt-1">Driver / Transporter Signature</p>
            <p className="text-[10px] text-gray-500">Vehicle Carrier Acknowledgement</p>
          </div>
          <div>
            <div className="h-12 border-b border-gray-400"></div>
            <p className="font-bold text-gray-900 mt-1">For SHRI LATHIKKA SURGICALS</p>
            <p className="text-[10px] text-gray-500">Authorized Signatory</p>
          </div>
        </div>

      </div>
    </div>
  );
}
