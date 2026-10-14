/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Ticket, ITOfficerStatus, TicketStatus } from './types/ticket';
import { 
  getTickets, 
  saveTickets, 
  getITOfficerStatus, 
  saveITOfficerStatus, 
  getMyTicketIds, 
  createNewTicket, 
  updateTicketStatus,
  resetToSeedData,
  exportTicketsToCSV
} from './utils/storage';
import { playQueueChime } from './utils/audio';
import { Navbar } from './components/Navbar';
import { TicketSubmissionForm } from './components/TicketSubmissionForm';
import { EmployeeQueueView } from './components/EmployeeQueueView';
import { ITOfficerDashboard } from './components/ITOfficerDashboard';
import { TicketSlipModal } from './components/TicketSlipModal';
import { PrintReportModal } from './components/PrintReportModal';
import { TroubleshootGuideModal } from './components/TroubleshootGuideModal';
import { Building, Shield, Sparkles, Phone, Radio, MapPin, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'portal' | 'queue' | 'dashboard'>('portal');
  const [tickets, setTickets] = useState<Ticket[]>(() => getTickets());
  const [itStatus, setITStatus] = useState<ITOfficerStatus>(() => getITOfficerStatus());
  const [myTicketIds, setMyTicketIds] = useState<string[]>(() => getMyTicketIds());
  
  // Modals
  const [activeTicketSlip, setActiveTicketSlip] = useState<Ticket | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTroubleshootModalOpen, setIsTroubleshootModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync across tabs via BroadcastChannel or storage event
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('it_queue_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'TICKETS_UPDATED') {
            setTickets(event.data.tickets);
          } else if (event.data?.type === 'IT_STATUS_UPDATED') {
            setITStatus(event.data.status);
          }
        };
      }
    } catch {
      // Ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'it_officer_tickets_v1' && e.newValue) {
        try {
          setTickets(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
      if (e.key === 'it_officer_location_status_v1' && e.newValue) {
        try {
          setITStatus(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
      if (e.key === 'it_officer_my_submitted_tickets_v1' && e.newValue) {
        try {
          setMyTicketIds(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      bc?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Handlers
  const handleCreateTicket = (ticketData: Omit<Ticket, 'id' | 'queueNumber' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newTicket = createNewTicket(ticketData);
    setTickets(getTickets());
    setMyTicketIds(getMyTicketIds());
    return newTicket;
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    setActiveTicketSlip(newTicket);
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    status: TicketStatus,
    resolutionNotes?: string,
    ispReferenceNumber?: string,
    partsUsed?: string
  ) => {
    const updated = updateTicketStatus(
      ticketId,
      status,
      resolutionNotes,
      ispReferenceNumber,
      partsUsed
    );
    setTickets(updated);
  };

  const handleUpdateITStatus = (status: ITOfficerStatus) => {
    saveITOfficerStatus(status);
    setITStatus(status);
  };

  const handleResetSeedData = () => {
    if (confirm('Reset tickets to default sample multi-office data?')) {
      const reset = resetToSeedData();
      setTickets(reset);
      setITStatus(getITOfficerStatus());
    }
  };

  const handleExportCSV = () => {
    exportTicketsToCSV(tickets);
  };

  // Counts
  const waitingCount = tickets.filter((t) => t.status === 'In Queue').length;
  const inProgressCount = tickets.filter(
    (t) => t.status === 'In Progress / Diagnosing' || t.status === 'En Route / Traveling'
  ).length;

  const activeQueue = tickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Cancelled'
  );
  const ticketSlipQueuePos = activeTicketSlip
    ? activeQueue.findIndex((t) => t.id === activeTicketSlip.id) + 1
    : 1;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Navbar with live ticker */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        itStatus={itStatus}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenTroubleshoot={() => setIsTroubleshootModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        waitingCount={waitingCount}
        inProgressCount={inProgressCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'portal' && (
          <TicketSubmissionForm
            onSubmitTicket={handleCreateTicket}
            onTicketCreated={handleTicketCreated}
            soundEnabled={soundEnabled}
            activeTicketsInQueue={waitingCount}
          />
        )}

        {currentTab === 'queue' && (
          <EmployeeQueueView
            tickets={tickets}
            myTicketIds={myTicketIds}
            itStatus={itStatus}
            onOpenTicketSlip={(ticket) => setActiveTicketSlip(ticket)}
            onGoToSubmit={() => setCurrentTab('portal')}
          />
        )}

        {currentTab === 'dashboard' && (
          <ITOfficerDashboard
            tickets={tickets}
            itStatus={itStatus}
            onUpdateITStatus={handleUpdateITStatus}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onCreateWalkInTicket={handleCreateTicket}
            onResetSeedData={handleResetSeedData}
            onExportCSV={handleExportCSV}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Modals */}
      <TicketSlipModal
        ticket={activeTicketSlip}
        onClose={() => setActiveTicketSlip(null)}
        queuePosition={ticketSlipQueuePos > 0 ? ticketSlipQueuePos : 1}
        onViewInQueue={() => setCurrentTab('queue')}
      />

      <PrintReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        tickets={tickets}
        itStatus={itStatus}
      />

      <TroubleshootGuideModal
        isOpen={isTroubleshootModalOpen}
        onClose={() => setIsTroubleshootModalOpen(false)}
      />

      {/* Footer / Quick Branch Info */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-200">Supported Offices:</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">MAIN OFFICER MABOLO</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">GTC OFFICE SM</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">GRC DYNASTY MABOLO</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">REMOTE FOR DAVAO</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">AMANI</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">PLDT / GLOBE ISP</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="hover:text-blue-400 font-semibold underline transition"
            >
              IT Officer Workbench
            </button>
            <span>•</span>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-blue-400 transition"
            >
              Accomplishment Report
            </button>
            <span>•</span>
            <button
              onClick={() => setIsTroubleshootModalOpen(true)}
              className="hover:text-blue-400 transition"
            >
              Self-Help Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
