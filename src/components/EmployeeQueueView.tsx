import React, { useState } from 'react';
import { Ticket, OfficeLocation, ITOfficerStatus } from '../types/ticket';
import { OFFICE_LOCATIONS } from '../data/constants';
import { 
  Clock, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  User, 
  FileText, 
  ArrowRight,
  Printer,
  Laptop,
  Camera,
  Network,
  Server,
  WifiOff,
  Mail,
  Wrench,
  CheckCircle,
  Truck,
  Sparkles
} from 'lucide-react';

interface EmployeeQueueViewProps {
  tickets: Ticket[];
  myTicketIds: string[];
  itStatus: ITOfficerStatus;
  onOpenTicketSlip: (ticket: Ticket) => void;
  onGoToSubmit: () => void;
}

export const EmployeeQueueView: React.FC<EmployeeQueueViewProps> = ({
  tickets,
  myTicketIds,
  itStatus,
  onOpenTicketSlip,
  onGoToSubmit,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active tickets in queue or in progress
  const activeQueue = tickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Cancelled'
  );

  // Currently serving ticket (first one with In Progress or En Route, or top of queue)
  const nowServing =
    tickets.find((t) => t.status === 'In Progress / Diagnosing') ||
    tickets.find((t) => t.status === 'En Route / Traveling') ||
    tickets.find((t) => t.status === 'Waiting for Parts / ISP') ||
    null;

  // Filtered queue
  const waitingList = activeQueue.filter((t) => {
    // If it's now serving, keep in active list or let user see full order
    const matchesLocation =
      selectedLocation === 'ALL' || t.location === selectedLocation;
    const matchesQuery =
      searchQuery.trim() === '' ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.departmentOrContact && t.departmentOrContact.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesLocation && matchesQuery;
  });

  // User's own tickets
  const myTickets = tickets.filter((t) => myTicketIds.includes(t.id));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Printer & Scanner': return <Printer className="w-4 h-4 text-blue-600" />;
      case 'Laptop & Computer': return <Laptop className="w-4 h-4 text-emerald-600" />;
      case 'CCTV & Camera': return <Camera className="w-4 h-4 text-purple-600" />;
      case 'Firewall & Networking': return <Network className="w-4 h-4 text-cyan-600" />;
      case 'Internet & ISP Outage': return <WifiOff className="w-4 h-4 text-rose-600" />;
      case 'Server & Storage': return <Server className="w-4 h-4 text-amber-600" />;
      case 'Software, Email & Accounts': return <Mail className="w-4 h-4 text-indigo-600" />;
      default: return <Wrench className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'In Progress / Diagnosing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Diagnosing / In Progress
          </span>
        );
      case 'En Route / Traveling':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            IT En Route to Office
          </span>
        );
      case 'Waiting for Parts / ISP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Waiting for Parts / ISP
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            In Queue (Waiting)
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* "Now Serving" Display Screen Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main "Now Serving" Billboard */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/80 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Radio className="w-48 h-48 text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Live Queue Display
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeQueue.length} tickets currently in line
              </span>
            </div>

            {nowServing ? (
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Currently Being Repaired / Attended
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-3">
                  <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    #{nowServing.id}
                  </h3>
                  <span className="text-lg font-bold text-slate-300">
                    {nowServing.name}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-blue-600/30 border border-blue-400/40 text-blue-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-300" />
                    {nowServing.location}
                  </span>
                  <span className="bg-slate-700/60 border border-slate-600 text-slate-200 px-3 py-1 rounded-lg font-medium">
                    {nowServing.category}
                  </span>
                  {getStatusBadge(nowServing.status)}
                </div>

                <p className="mt-3 text-sm text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  <strong className="text-white">Issue:</strong> {nowServing.issue}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center lg:text-left">
                <div className="text-2xl font-bold text-white mb-1">
                  Queue is clear!
                </div>
                <p className="text-sm text-slate-300 max-w-md">
                  No tickets are currently being diagnosed. Submit a ticket now and you'll be #1 next in line!
                </p>
                <button
                  onClick={onGoToSubmit}
                  className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  <span>Submit Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* IT Officer Status note */}
          <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>
                <strong>IT Officer Location:</strong> {itStatus.currentLocation}
              </span>
            </div>
            {itStatus.statusNote && (
              <span className="text-amber-300 italic">
                "{itStatus.statusNote}"
              </span>
            )}
          </div>
        </div>

        {/* Quick Submit or My Tickets Panel */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Your Tickets
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {myTickets.length} submitted
              </span>
            </div>

            {myTickets.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {myTickets.map((t) => {
                  const pos = activeQueue.findIndex((q) => q.id === t.id) + 1;
                  return (
                    <div
                      key={t.id}
                      onClick={() => onOpenTicketSlip(t)}
                      className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 rounded-2xl cursor-pointer transition text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">
                          #{t.id}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>
                      <div className="text-slate-800 font-semibold truncate">
                        {t.issue}
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>{t.location}</span>
                        {t.status === 'In Queue' && (
                          <span className="font-bold text-blue-700">
                            #{pos} in line
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p>You haven't submitted any tickets in this browser session.</p>
              </div>
            )}
          </div>

          <button
            onClick={onGoToSubmit}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>+ Submit New Ticket</span>
          </button>
        </div>
      </div>

      {/* Queue Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Waiting Queue (In Order of Request)
            </h3>
            <p className="text-xs text-slate-500">
              All tickets are handled sequentially so everyone gets fair service.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Ticket # or Name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Office Location Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedLocation('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedLocation === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Offices ({activeQueue.length})
          </button>

          {OFFICE_LOCATIONS.map((loc) => {
            const count = activeQueue.filter((t) => t.location === loc.id).length;
            const isSelected = selectedLocation === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{loc.short}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-slate-300 text-slate-800'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Queue List Cards */}
      {waitingList.length > 0 ? (
        <div className="space-y-3">
          {waitingList.map((ticket, index) => {
            const queuePos = activeQueue.findIndex((t) => t.id === ticket.id) + 1;
            const isNowServingThis =
              nowServing && nowServing.id === ticket.id;

            return (
              <div
                key={ticket.id}
                onClick={() => onOpenTicketSlip(ticket)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isNowServingThis
                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                {/* Left: Queue Position & Ticket ID */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Line
                    </span>
                    <span className="text-xl font-black">
                      #{queuePos}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-black text-blue-700">
                        #{ticket.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {ticket.name}
                      </span>
                      {ticket.departmentOrContact && (
                        <span className="text-xs text-slate-500">
                          ({ticket.departmentOrContact})
                        </span>
                      )}
                      {ticket.priority.includes('Critical') && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          CRITICAL
                        </span>
                      )}
                      {ticket.priority.includes('High') && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          HIGH
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      {ticket.issue}
                    </h4>

                    {ticket.remarks && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        "{ticket.remarks}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Location, Category, Status & Action */}
                <div className="flex flex-wrap items-center sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{ticket.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {getCategoryIcon(ticket.category)}
                    <span>{ticket.category}</span>
                  </div>

                  {getStatusBadge(ticket.status)}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTicketSlip(ticket);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2"
                  >
                    View Slip →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">No Tickets Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No tickets match "${searchQuery}". Try clearing search.`
              : 'There are currently no active tickets waiting for this branch location.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs text-blue-600 font-bold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};
