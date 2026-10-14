import React from 'react';
import { Ticket, ITOfficerStatus } from '../types/ticket';
import { Printer, X, FileText, CheckCircle2, Building2, Wrench } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  itStatus: ITOfficerStatus;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  tickets,
  itStatus,
}) => {
  if (!isOpen) return null;

  const resolved = tickets.filter((t) => t.status === 'Resolved');
  const active = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Cancelled');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h4 className="font-bold text-sm">IT Officer Work Accomplishment Report</h4>
              <p className="text-[11px] text-slate-400">Multi-Branch Service & Repair Summary</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 space-y-6 text-slate-800 text-xs printable-report">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                IT Service & Equipment Repair Accomplishment Report
              </h1>
              <p className="text-slate-500 font-medium mt-0.5">
                Covering Main Mabolo, GTC SM, GRC Dynasty, Davao Remote, Amani, & External Dispatches
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">Generated: {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</div>
              <div className="text-slate-500">Prepared by: <strong>IT Officer</strong></div>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-500">Total Work Requests</span>
              <div className="text-2xl font-black text-slate-900">{tickets.length}</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Resolved / Completed</span>
              <div className="text-2xl font-black text-emerald-700">{resolved.length}</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-amber-700">Active / In Queue</span>
              <div className="text-2xl font-black text-amber-700">{active.length}</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-blue-700">Branches Served</span>
              <div className="text-2xl font-black text-blue-700">6 Locations</div>
            </div>
          </div>

          {/* Resolved Tickets Table */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Completed Repairs & Maintenance Log
            </h3>
            <table className="w-full border-collapse border border-slate-200 text-left text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <th className="border border-slate-200 p-2">Ticket #</th>
                  <th className="border border-slate-200 p-2">Requester / Branch</th>
                  <th className="border border-slate-200 p-2">Category</th>
                  <th className="border border-slate-200 p-2">Issue Reported</th>
                  <th className="border border-slate-200 p-2">Fix Details & Parts / ISP Ref</th>
                  <th className="border border-slate-200 p-2">Date Resolved</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map((t) => (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="border border-slate-200 p-2 font-bold text-blue-700">#{t.id}</td>
                    <td className="border border-slate-200 p-2">
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.location}</div>
                    </td>
                    <td className="border border-slate-200 p-2 font-medium">{t.category}</td>
                    <td className="border border-slate-200 p-2">{t.issue}</td>
                    <td className="border border-slate-200 p-2 text-slate-700">
                      <div>{t.resolutionNotes || 'Serviced and verified functional.'}</div>
                      {t.partsUsed && <div className="text-[10px] text-slate-500">Parts: {t.partsUsed}</div>}
                      {t.ispReferenceNumber && <div className="text-[10px] text-blue-600 font-semibold">ISP Ref: {t.ispReferenceNumber}</div>}
                    </td>
                    <td className="border border-slate-200 p-2 text-slate-500">
                      {t.resolvedAt ? new Date(t.resolvedAt).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))}
                {resolved.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-slate-400">
                      No resolved tickets recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pending Active Work Order */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" />
              Active Queue / Work in Progress
            </h3>
            <table className="w-full border-collapse border border-slate-200 text-left text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <th className="border border-slate-200 p-2">Ticket #</th>
                  <th className="border border-slate-200 p-2">Requester / Branch</th>
                  <th className="border border-slate-200 p-2">Category</th>
                  <th className="border border-slate-200 p-2">Issue</th>
                  <th className="border border-slate-200 p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {active.map((t) => (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="border border-slate-200 p-2 font-bold text-blue-700">#{t.id}</td>
                    <td className="border border-slate-200 p-2">
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.location}</div>
                    </td>
                    <td className="border border-slate-200 p-2">{t.category}</td>
                    <td className="border border-slate-200 p-2">{t.issue}</td>
                    <td className="border border-slate-200 p-2 font-semibold text-amber-700">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-xs">
            <div>
              <div className="border-b border-slate-400 w-48 mb-1"></div>
              <div className="font-bold text-slate-900">IT Officer / System Administrator</div>
              <div className="text-[11px] text-slate-500">Signature Over Printed Name</div>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-400 w-48 ml-auto mb-1"></div>
              <div className="font-bold text-slate-900">Operations / Branch Manager</div>
              <div className="text-[11px] text-slate-500">Noted / Acknowledged By</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
