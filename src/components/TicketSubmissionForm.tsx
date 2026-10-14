import React, { useState } from 'react';
import { OfficeLocation, TicketCategory, TicketPriority, Ticket } from '../types/ticket';
import { OFFICE_LOCATIONS, TICKET_CATEGORIES } from '../data/constants';
import { 
  Send, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Laptop, 
  Camera, 
  Network, 
  Server, 
  WifiOff, 
  Mail, 
  Wrench,
  CheckCircle2,
  Sparkles,
  Phone,
  User,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime } from '../utils/audio';

interface TicketSubmissionFormProps {
  onSubmitTicket: (ticketData: Omit<Ticket, 'id' | 'queueNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Ticket;
  onTicketCreated: (ticket: Ticket) => void;
  soundEnabled: boolean;
  activeTicketsInQueue: number;
}

export const TicketSubmissionForm: React.FC<TicketSubmissionFormProps> = ({
  onSubmitTicket,
  onTicketCreated,
  soundEnabled,
  activeTicketsInQueue,
}) => {
  // Form fields as requested
  const [name, setName] = useState('');
  const [departmentOrContact, setDepartmentOrContact] = useState('');
  const [date, setDate] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local
    return now.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState<OfficeLocation>('MAIN OFFICER MABOLO');
  const [specificLocationDetails, setSpecificLocationDetails] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Printer & Scanner');
  const [priority, setPriority] = useState<TicketPriority>('Normal');
  const [issue, setIssue] = useState('');
  const [remarks, setRemarks] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick issue suggestions based on category
  const quickSuggestions: Record<TicketCategory, string[]> = {
    'Printer & Scanner': [
      'Paper jam in tray / paper feed sensor stuck',
      'Printer blinking red - cartridge error',
      'Cannot print from PC / Printer offline',
      'Scanner not detected over network',
    ],
    'Laptop & Computer': [
      'PC blue screen (BSOD) upon boot',
      'Extremely slow / freezing during work',
      'No display / CPU powers on but black screen',
      'Keyboard or mouse not responding',
    ],
    'CCTV & Camera': [
      'CCTV Camera video loss / black screen',
      'DVR/NVR monitor not showing feeds',
      'Need camera playback review / backup footage',
      'Camera lens blurred / night vision IR broken',
    ],
    'Firewall & Networking': [
      'LAN cable broken / need new RJ45 crimping',
      'Wi-Fi connected but "No Internet Access"',
      'Office network switch port unlinked',
      'Firewall blocking company web system',
    ],
    'Internet & ISP Outage': [
      'Modem PON/LOS light blinking RED (No fiber signal)',
      'Entire office cannot connect to internet',
      'Speed very slow / high packet loss',
      'Reported to PLDT / Globe hotline',
    ],
    'Server & Storage': [
      'Network shared drive (Z: or Server) unreachable',
      'File server reboot required',
      'Daily data backup check / disk space warning',
      'Domain controller account login failure',
    ],
    'Software, Email & Accounts': [
      'Outlook / Company email cannot send or receive',
      'Microsoft Office unlicensed product popup',
      'ERP / Accounting software login error',
      'Password reset request',
    ],
    'Other IT Work': [
      'New employee workstation setup & cabling',
      'Office desk relocation / PC transfer',
      'Biometric attendance machine sync error',
      'Projector or TV display setup in meeting room',
    ],
  };

  const getCategoryIcon = (cat: TicketCategory) => {
    switch (cat) {
      case 'Printer & Scanner': return <Printer className="w-5 h-5 text-blue-600" />;
      case 'Laptop & Computer': return <Laptop className="w-5 h-5 text-emerald-600" />;
      case 'CCTV & Camera': return <Camera className="w-5 h-5 text-purple-600" />;
      case 'Firewall & Networking': return <Network className="w-5 h-5 text-cyan-600" />;
      case 'Internet & ISP Outage': return <WifiOff className="w-5 h-5 text-rose-600" />;
      case 'Server & Storage': return <Server className="w-5 h-5 text-amber-600" />;
      case 'Software, Email & Accounts': return <Mail className="w-5 h-5 text-indigo-600" />;
      default: return <Wrench className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your Name so the IT Officer knows who requested the repair.');
      return;
    }
    if (!issue.trim()) {
      alert('Please enter a brief Issue title or select one from the quick options.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newTicket = onSubmitTicket({
        name: name.trim(),
        departmentOrContact: departmentOrContact.trim() || undefined,
        location,
        specificLocationDetails: specificLocationDetails.trim() || undefined,
        category,
        priority,
        issue: issue.trim(),
        remarks: remarks.trim(),
      });

      if (soundEnabled) {
        playSuccessChime();
      }

      // Confetti burst
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.65 },
        });
      } catch {
        // Ignore
      }

      onTicketCreated(newTicket);

      // Reset fields
      setIssue('');
      setRemarks('');
      setSpecificLocationDetails('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Wrench className="w-64 h-64 text-white transform rotate-12" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/40 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Zero Registration • Instant Ticket Number</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Need IT Assistance or Repair?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Fill in the details below to receive your official ticket number and queue spot. 
            The IT Officer serves tickets in order so nobody skips the line.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-blue-200">
            <span className="flex items-center gap-1.5 bg-blue-900/60 px-3 py-1.5 rounded-lg border border-blue-600/40">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              Active Queue: <strong className="text-white ml-1">{activeTicketsInQueue} ahead</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-blue-900/60 px-3 py-1.5 rounded-lg border border-blue-600/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              No login required
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">

          {/* Section 1: Who & When */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              1. Requester Information & Date
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Name */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Department / Contact (optional) */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Dept / Ext / Viber <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={departmentOrContact}
                    onChange={(e) => setDepartmentOrContact(e.target.value)}
                    placeholder="e.g. Accounting / Ext. 204"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date & Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Office Location Selection */}
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                2. Office Location <span className="text-red-500">*</span>
              </h3>
              <span className="text-xs text-slate-500">Pick which office needs repair</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
              {OFFICE_LOCATIONS.map((loc) => {
                const isSelected = location === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocation(loc.id)}
                    className={`text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${loc.badge}`}>
                        {loc.short}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {loc.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Room / Specific desk detail */}
            <div className="mt-3">
              <input
                type="text"
                value={specificLocationDetails}
                onChange={(e) => setSpecificLocationDetails(e.target.value)}
                placeholder="Specific room or desk (e.g. 2nd Floor Admin Room, Cashier Counter #2, Conference Room)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Section 3: IT Category / Equipment */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Wrench className="w-4 h-4 text-indigo-600" />
              3. Equipment & Service Category
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TICKET_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="shrink-0 p-2 bg-slate-100 rounded-lg">
                      {getCategoryIcon(cat.id)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {cat.id}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Urgency / Priority */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'Normal', label: 'Normal Priority', desc: 'Can wait in standard queue' },
                  { id: 'High (Work Stopped)', label: 'High - Work Stopped', desc: 'Cannot proceed with daily job' },
                  { id: 'Critical (Branch / Network Down)', label: 'Critical - Branch Down', desc: 'Entire office or server down' },
                ] as const
              ).map((p) => {
                const isSelected = priority === p.id;
                const isCritical = p.id.includes('Critical');
                const isHigh = p.id.includes('High');

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? isCritical
                          ? 'border-red-600 bg-red-50 ring-2 ring-red-400'
                          : isHigh
                          ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-400'
                          : 'border-blue-600 bg-blue-50 ring-2 ring-blue-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCritical && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      <span className="text-xs font-bold text-slate-900">{p.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Issue & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Issue Summary <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">Brief title of problem</span>
            </div>

            <input
              type="text"
              required
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. Printer feed roller jamming, CCTV Camera 4 black screen, No internet..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            {/* Quick Suggestions for Selected Category */}
            <div className="mt-2.5">
              <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Quick suggestions for {category}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions[category].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setIssue(sug)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition text-left"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Remarks & Extra Details */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Remarks / Additional Details
              </label>
              <span className="text-xs text-slate-400">What error codes? What steps were tried?</span>
            </div>

            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide any error message, device model (e.g. Epson L3110 or Dell Optiplex), asset tag number, or what happened right before it stopped working..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

        </div>

        {/* Form Footer / Submit */}
        <div className="bg-slate-50 px-6 sm:px-8 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Your ticket will be assigned a sequential queue number immediately.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Generate Ticket & Join Queue</span>
          </button>
        </div>
      </form>
    </div>
  );
};
