import React from 'react';
import { Ticket } from '../types/ticket';
import { 
  CheckCircle, 
  Printer, 
  X, 
  Clock, 
  MapPin, 
  Tag, 
  AlertCircle, 
  Share2, 
  Copy, 
  FileText,
  Building,
  Check
} from 'lucide-react';
import { useState } from 'react';

interface TicketSlipModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  queuePosition: number;
  onViewInQueue: () => void;
}

export const TicketSlipModal: React.FC<TicketSlipModalProps> = ({
  ticket,
  onClose,
  queuePosition,
  onViewInQueue,
}) => {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`IT Ticket: ${ticket.id} (${ticket.issue}) - ${ticket.location}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide">IT Service Ticket Issued</h4>
              <p className="text-[11px] text-slate-400">Keep this number to track your repair</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Receipt Area */}
        <div id="printable-ticket" className="p-6 bg-gradient-to-b from-blue-50/40 to-white">
          {/* Ticket Header & Large Number */}
          <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              Queue Number
            </span>
            <div className="mt-2 text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              #{ticket.id}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              Queue Sequence #{ticket.queueNumber}
            </div>

            {/* Position in line */}
            <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>
                {queuePosition <= 1
                  ? 'You are next or currently being served!'
                  : `Position in Queue: #${queuePosition} in line`}
              </span>
            </div>
          </div>

          {/* Ticket Details Grid */}
          <div className="py-4 space-y-3 text-xs">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Requester:</span>
              <span className="font-bold text-slate-900 text-right">
                {ticket.name}
                {ticket.departmentOrContact && (
                  <span className="block text-[11px] text-slate-500 font-normal">
                    {ticket.departmentOrContact}
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Office Location:</span>
              <span className="font-bold text-blue-800 text-right max-w-[200px]">
                {ticket.location}
                {ticket.specificLocationDetails && (
                  <span className="block text-[11px] text-slate-500 font-normal">
                    {ticket.specificLocationDetails}
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Category:</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {ticket.category}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Priority:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  ticket.priority.includes('Critical')
                    ? 'bg-red-100 text-red-800'
                    : ticket.priority.includes('High')
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {ticket.priority}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Date & Time:</span>
              <span className="font-medium text-slate-700">
                {new Date(ticket.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Issue summary box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Reported Issue:
              </div>
              <div className="font-bold text-slate-900 text-sm">{ticket.issue}</div>
              {ticket.remarks && (
                <div className="text-slate-600 text-xs mt-1 italic">
                  "{ticket.remarks}"
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-400 italic">
            Please keep your unit plugged in and accessible for the IT Officer.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Ticket'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onViewInQueue();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/20"
          >
            <span>Track in Live Queue →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
