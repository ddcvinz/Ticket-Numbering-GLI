import React, { useState } from 'react';
import { Ticket, ITOfficerStatus, OfficeLocation, TicketStatus, TicketCategory } from '../types/ticket';
import { OFFICE_LOCATIONS, TICKET_CATEGORIES } from '../data/constants';
import { 
  Laptop, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Download, 
  Printer as PrintIcon, 
  PhoneCall, 
  Search, 
  Plus, 
  Radio, 
  Check, 
  Trash2, 
  RotateCcw, 
  ChevronRight,
  Truck,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  WifiOff
} from 'lucide-react';
import { playQueueChime, playSuccessChime } from '../utils/audio';

interface ITOfficerDashboardProps {
  tickets: Ticket[];
  itStatus: ITOfficerStatus;
  onUpdateITStatus: (status: ITOfficerStatus) => void;
  onUpdateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    resolutionNotes?: string,
    ispReferenceNumber?: string,
    partsUsed?: string
  ) => void;
  onCreateWalkInTicket: (ticketData: Omit<Ticket, 'id' | 'queueNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Ticket;
  onResetSeedData: () => void;
  onExportCSV: () => void;
  onOpenReportModal: () => void;
  soundEnabled: boolean;
}

export const ITOfficerDashboard: React.FC<ITOfficerDashboardProps> = ({
  tickets,
  itStatus,
  onUpdateITStatus,
  onUpdateTicketStatus,
  onCreateWalkInTicket,
  onResetSeedData,
  onExportCSV,
  onOpenReportModal,
  soundEnabled,
}) => {
  // IT Location Broadcast edit state
  const [currentLoc, setCurrentLoc] = useState<OfficeLocation | 'IN TRANSIT / ON THE ROAD'>(itStatus.currentLocation);
  const [destinationLoc, setDestinationLoc] = useState<OfficeLocation | 'BACK TO MAIN OFFICE' | undefined>(itStatus.destinationLocation);
  const [statusNote, setStatusNote] = useState(itStatus.statusNote);
  const [contactNumber, setContactNumber] = useState(itStatus.contactNumber);
  const [locationBroadcastSaved, setLocationBroadcastSaved] = useState(false);

  // Filters
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE'); // ACTIVE, ALL, In Queue, In Progress, Resolved
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution Modal / Drawer state
  const [resolvingTicket, setResolvingTicket] = useState<Ticket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [ispReferenceNumber, setIspReferenceNumber] = useState('');

  // New Walk-in / Phone ticket modal
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInContact, setWalkInContact] = useState('');
  const [walkInLocation, setWalkInLocation] = useState<OfficeLocation>('MAIN OFFICER MABOLO');
  const [walkInCategory, setWalkInCategory] = useState<TicketCategory>('Printer & Scanner');
  const [walkInIssue, setWalkInIssue] = useState('');
  const [walkInRemarks, setWalkInRemarks] = useState('');

  // Active / Currently serving ticket
  const currentActive =
    tickets.find((t) => t.status === 'In Progress / Diagnosing') ||
    tickets.find((t) => t.status === 'En Route / Traveling') ||
    null;

  // Next ticket in line
  const nextInLine = tickets.find((t) => t.status === 'In Queue');

  // Stats calculation
  const waitingTickets = tickets.filter((t) => t.status === 'In Queue');
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'In Progress / Diagnosing' || t.status === 'En Route / Traveling' || t.status === 'Waiting for Parts / ISP'
  );
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved');
  const criticalTickets = tickets.filter(
    (t) => t.priority.includes('Critical') && t.status !== 'Resolved'
  );

  const handleSaveLocationBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateITStatus({
      currentLocation: currentLoc,
      destinationLocation: destinationLoc,
      statusNote: statusNote.trim(),
      contactNumber: contactNumber.trim(),
      lastUpdated: new Date().toISOString(),
      availableForCall: true,
    });
    setLocationBroadcastSaved(true);
    setTimeout(() => setLocationBroadcastSaved(false), 2500);
  };

  const handleCallNext = () => {
    if (!nextInLine) {
      alert('There are no waiting tickets in queue.');
      return;
    }
    if (soundEnabled) {
      playQueueChime();
    }
    onUpdateTicketStatus(nextInLine.id, 'In Progress / Diagnosing');
  };

  const handleQuickStatusChange = (ticketId: string, status: TicketStatus) => {
    if (status === 'Resolved') {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        setResolvingTicket(ticket);
        setResolutionNotes(ticket.resolutionNotes || '');
        setPartsUsed(ticket.partsUsed || '');
        setIspReferenceNumber(ticket.ispReferenceNumber || '');
        return;
      }
    }

    if (soundEnabled && (status === 'In Progress / Diagnosing' || status === 'En Route / Traveling')) {
      playQueueChime();
    }

    onUpdateTicketStatus(ticketId, status);
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    if (soundEnabled) {
      playSuccessChime();
    }

    onUpdateTicketStatus(
      resolvingTicket.id,
      'Resolved',
      resolutionNotes.trim(),
      ispReferenceNumber.trim(),
      partsUsed.trim()
    );

    setResolvingTicket(null);
  };

  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInIssue.trim()) {
      alert('Please enter Name and Issue.');
      return;
    }

    onCreateWalkInTicket({
      name: walkInName.trim(),
      departmentOrContact: walkInContact.trim() || undefined,
      location: walkInLocation,
      category: walkInCategory,
      priority: 'Normal',
      issue: walkInIssue.trim(),
      remarks: walkInRemarks.trim() || 'Logged directly via IT Officer walk-in / phone call',
    });

    if (soundEnabled) {
      playSuccessChime();
    }

    setShowWalkInModal(false);
    setWalkInName('');
    setWalkInIssue('');
    setWalkInRemarks('');
    setWalkInContact('');
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    // Status filter
    if (selectedStatus === 'ACTIVE') {
      if (t.status === 'Resolved' || t.status === 'Cancelled') return false;
    } else if (selectedStatus !== 'ALL') {
      if (t.status !== selectedStatus) return false;
    }

    // Location filter
    if (selectedLocation !== 'ALL' && t.location !== selectedLocation) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.issue.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        (t.remarks && t.remarks.toLowerCase().includes(q)) ||
        (t.resolutionNotes && t.resolutionNotes.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Officer Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              IT Officer Command Center
            </h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Managing repairs across Mabolo Main, GTC SM, GRC Dynasty, Davao Remote, Amani & ISP dispatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-700/20"
          >
            <Plus className="w-4 h-4" />
            <span>Walk-in / Phone Ticket</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
          >
            <PrintIcon className="w-4 h-4 text-blue-400" />
            <span>Print Work Report</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onResetSeedData}
            title="Reset to sample multi-office tickets"
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Waiting in Queue
            </span>
            <div className="text-3xl font-black text-blue-600 mt-1">
              {waitingTickets.length}
            </div>
            <span className="text-[11px] text-slate-500">Next tickets to serve</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              In Progress / En Route
            </span>
            <div className="text-3xl font-black text-amber-600 mt-1">
              {inProgressTickets.length}
            </div>
            <span className="text-[11px] text-slate-500">Currently active work</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resolved Today
            </span>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              {resolvedTickets.length}
            </div>
            <span className="text-[11px] text-slate-500">Completed jobs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Critical Urgency
            </span>
            <div className="text-3xl font-black text-rose-600 mt-1">
              {criticalTickets.length}
            </div>
            <span className="text-[11px] text-slate-500">ISP / branch down</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Active Workbench + Live Location Broadcaster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 Cols): Active Ticket Spotlight & Call Next Button */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Laptop className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Active IT Workbench
                  </h3>
                  <p className="text-xs text-slate-500">Current ticket on your bench or on-site</p>
                </div>
              </div>

              {/* Call Next Button */}
              <button
                onClick={handleCallNext}
                disabled={!nextInLine}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-extrabold text-xs rounded-xl shadow-md transition"
              >
                <Radio className="w-4 h-4" />
                <span>Call Next Ticket {nextInLine ? `(#${nextInLine.id})` : ''}</span>
              </button>
            </div>

            {currentActive ? (
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-slate-900">
                      #{currentActive.id}
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      {currentActive.name}
                    </span>
                    {currentActive.departmentOrContact && (
                      <span className="text-xs text-slate-500">
                        ({currentActive.departmentOrContact})
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      currentActive.status === 'In Progress / Diagnosing'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : currentActive.status === 'En Route / Traveling'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {currentActive.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-medium">Branch Location:</span>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {currentActive.location}
                      {currentActive.specificLocationDetails && ` (${currentActive.specificLocationDetails})`}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Category / Work:</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {currentActive.category}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-medium">Reported Issue:</span>
                    <div className="font-bold text-slate-900 mt-0.5 text-sm">
                      {currentActive.issue}
                    </div>
                    {currentActive.remarks && (
                      <p className="text-slate-600 mt-1 italic">
                        "{currentActive.remarks}"
                      </p>
                    )}
                  </div>

                  {currentActive.resolutionNotes && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200 text-emerald-800 font-medium">
                      <strong>Current Working Note:</strong> {currentActive.resolutionNotes}
                    </div>
                  )}
                </div>

                {/* Status action buttons */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Update Active Status:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleQuickStatusChange(currentActive.id, 'En Route / Traveling')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        currentActive.status === 'En Route / Traveling'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>En Route / Traveling</span>
                    </button>

                    <button
                      onClick={() => handleQuickStatusChange(currentActive.id, 'In Progress / Diagnosing')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        currentActive.status === 'In Progress / Diagnosing'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Diagnosing / Repairing</span>
                    </button>

                    <button
                      onClick={() => handleQuickStatusChange(currentActive.id, 'Waiting for Parts / ISP')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        currentActive.status === 'Waiting for Parts / ISP'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Waiting for Parts / ISP</span>
                    </button>

                    <button
                      onClick={() => handleQuickStatusChange(currentActive.id, 'Resolved')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 ml-auto"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Resolved & Complete</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <Laptop className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-base">
                  No Active Ticket on Bench
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Click "Call Next Ticket" above or select any waiting ticket from the queue list below to start servicing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right (1 Col): Broadcast Current IT Officer Location */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Broadcast My Location
                </h3>
                <p className="text-xs text-slate-500">So employees know where you are</p>
              </div>
            </div>

            <form onSubmit={handleSaveLocationBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Where Are You Right Now?
                </label>
                <select
                  value={currentLoc}
                  onChange={(e) => setCurrentLoc(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="IN TRANSIT / ON THE ROAD">🚗 IN TRANSIT / ON THE ROAD</option>
                  {OFFICE_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      📍 {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Next Destination Office
                </label>
                <select
                  value={destinationLoc || ''}
                  onChange={(e) => setDestinationLoc(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BACK TO MAIN OFFICE">🏢 Back to Main Mabolo</option>
                  {OFFICE_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      → {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Status Note / ETA for Staff
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Inspecting server at Mabolo. Proceeding to GTC SM at 2:30 PM."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Emergency Phone / Extension
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. Ext 104 or Mobile"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {locationBroadcastSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Location Broadcasted!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Update Live Location</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Ticket List & Filtering Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              All Tickets ({filteredTickets.length})
            </h3>
            <p className="text-xs text-slate-500">
              Complete log of equipment repairs, network fixes, and branch visits.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, name, issue, notes..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Filter Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none"
            >
              <option value="ACTIVE">⚡ Active Only (In Queue & In Progress)</option>
              <option value="ALL">📋 All Tickets (Including Resolved)</option>
              <option value="In Queue">⏳ In Queue (Waiting)</option>
              <option value="In Progress / Diagnosing">🔧 In Progress / Diagnosing</option>
              <option value="En Route / Traveling">🚗 En Route / Traveling</option>
              <option value="Waiting for Parts / ISP">📦 Waiting for Parts / ISP</option>
              <option value="Resolved">✅ Resolved Only</option>
            </select>
          </div>

          {/* Location filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Filter Branch / Location:
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">🏢 All Branch Offices</option>
              {OFFICE_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Filter IT Work Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">🛠️ All Equipment & Categories</option>
              {TICKET_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tickets Table / List */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-3 pt-2">
            {filteredTickets.map((t) => {
              const isResolved = t.status === 'Resolved';
              return (
                <div
                  key={t.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isResolved
                      ? 'bg-slate-50/60 border-slate-200 opacity-80'
                      : t.status === 'In Progress / Diagnosing'
                      ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: ID & Main Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-slate-900">
                          #{t.id}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {t.name}
                        </span>
                        {t.departmentOrContact && (
                          <span className="text-xs text-slate-500">
                            ({t.departmentOrContact})
                          </span>
                        )}
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {t.location}
                        </span>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                        {t.priority.includes('Critical') && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            CRITICAL
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-slate-900">
                        {t.issue}
                      </div>

                      {t.remarks && (
                        <div className="text-xs text-slate-600 italic">
                          "{t.remarks}"
                        </div>
                      )}

                      {/* Resolution Log Display */}
                      {t.resolutionNotes && (
                        <div className="text-xs text-emerald-800 font-medium bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 mt-2">
                          <strong>Fix Applied:</strong> {t.resolutionNotes}
                          {t.partsUsed && <span> • <strong>Parts:</strong> {t.partsUsed}</span>}
                          {t.ispReferenceNumber && <span> • <strong>ISP Ref#:</strong> {t.ispReferenceNumber}</span>}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Status Badges & Quick Action Dropdown */}
                      <select
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t.id, e.target.value as TicketStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition ${
                          t.status === 'Resolved'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : t.status === 'In Progress / Diagnosing'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : t.status === 'En Route / Traveling'
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        <option value="In Queue">⏳ In Queue</option>
                        <option value="En Route / Traveling">🚗 En Route / Traveling</option>
                        <option value="In Progress / Diagnosing">🔧 Diagnosing / Repairing</option>
                        <option value="Waiting for Parts / ISP">📦 Waiting Parts / ISP</option>
                        <option value="Resolved">✅ Resolved & Complete</option>
                        <option value="Cancelled">❌ Cancelled</option>
                      </select>

                      {/* If not resolved, quick Resolve button */}
                      {!isResolved && (
                        <button
                          onClick={() => handleQuickStatusChange(t.id, 'Resolved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {/* Edit resolution notes */}
                      <button
                        onClick={() => {
                          setResolvingTicket(t);
                          setResolutionNotes(t.resolutionNotes || '');
                          setPartsUsed(t.partsUsed || '');
                          setIspReferenceNumber(t.ispReferenceNumber || '');
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                        title="Add/Edit Fix Notes or ISP details"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p>No tickets matched your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Modal: Add Resolution Notes & Parts Replaced */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm">
                    IT Officer Resolution & Fix Log
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Ticket #{resolvingTicket.id} - {resolvingTicket.name} ({resolvingTicket.location})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResolvingTicket(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  How was the issue resolved? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Cleared paper feed obstruction and cleaned roller sensor. Test print page passed. Re-crimped RJ45 Cat6 connector. Configured static IP address..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Parts / Materials Used (Optional)
                </label>
                <input
                  type="text"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                  placeholder="e.g. 1x RJ45 jack, 3m Cat6 patch cord, 1x Canon 810 Black Ink"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  ISP Reference # (If PLDT / Globe Visit)
                </label>
                <input
                  type="text"
                  value={ispReferenceNumber}
                  onChange={(e) => setIspReferenceNumber(e.target.value)}
                  placeholder="e.g. PLDT Ticket #10928374 or Globe Job Order #CEB-88"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Mark Resolved</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fast Walk-In / Phone Ticket by IT Officer */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm">Log Walk-In or Phone Repair</h4>
                  <p className="text-[11px] text-slate-400">Quick entry directly from IT Officer bench</p>
                </div>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Requester Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="e.g. Sir Robert"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Dept / Extension
                  </label>
                  <input
                    type="text"
                    value={walkInContact}
                    onChange={(e) => setWalkInContact(e.target.value)}
                    placeholder="e.g. Davao Remote"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Branch Office
                </label>
                <select
                  value={walkInLocation}
                  onChange={(e) => setWalkInLocation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                >
                  {OFFICE_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Equipment / Category
                </label>
                <select
                  value={walkInCategory}
                  onChange={(e) => setWalkInCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                >
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Issue Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={walkInIssue}
                  onChange={(e) => setWalkInIssue(e.target.value)}
                  placeholder="e.g. CCTV Camera 2 blinking, Laptop reinstall Windows"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={walkInRemarks}
                  onChange={(e) => setWalkInRemarks(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
