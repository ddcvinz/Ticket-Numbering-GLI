import { Ticket, ITOfficerStatus, TicketStatus, OfficeLocation } from '../types/ticket';
import { SEED_TICKETS, INITIAL_IT_STATUS } from '../data/constants';

const TICKETS_KEY = 'it_officer_tickets_v1';
const IT_STATUS_KEY = 'it_officer_location_status_v1';
const MY_TICKETS_KEY = 'it_officer_my_submitted_tickets_v1';

// BroadcastChannel for instant cross-tab sync
let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel('it_queue_channel');
  } catch {
    channel = null;
  }
}

export function getTickets(): Ticket[] {
  if (typeof window === 'undefined') return SEED_TICKETS;
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(SEED_TICKETS));
      return SEED_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_TICKETS;
  }
}

export function saveTickets(tickets: Ticket[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    channel?.postMessage({ type: 'TICKETS_UPDATED', tickets });
  } catch (err) {
    console.error('Failed to save tickets:', err);
  }
}

export function getITOfficerStatus(): ITOfficerStatus {
  if (typeof window === 'undefined') return INITIAL_IT_STATUS;
  try {
    const raw = localStorage.getItem(IT_STATUS_KEY);
    if (!raw) {
      localStorage.setItem(IT_STATUS_KEY, JSON.stringify(INITIAL_IT_STATUS));
      return INITIAL_IT_STATUS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_IT_STATUS;
  }
}

export function saveITOfficerStatus(status: ITOfficerStatus): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(IT_STATUS_KEY, JSON.stringify(status));
    channel?.postMessage({ type: 'IT_STATUS_UPDATED', status });
  } catch (err) {
    console.error('Failed to save IT officer status:', err);
  }
}

export function getMyTicketIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MY_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMyTicketId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getMyTicketIds();
    if (!existing.includes(id)) {
      const updated = [id, ...existing];
      localStorage.setItem(MY_TICKETS_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to record ticket id:', err);
  }
}

export function getNextQueueNumber(tickets: Ticket[]): number {
  if (!tickets.length) return 101;
  const max = Math.max(...tickets.map((t) => t.queueNumber || 100));
  return max + 1;
}

export function createNewTicket(
  ticketData: Omit<Ticket, 'id' | 'queueNumber' | 'createdAt' | 'updatedAt' | 'status'>
): Ticket {
  const currentTickets = getTickets();
  const nextNum = getNextQueueNumber(currentTickets);
  const now = new Date().toISOString();

  const newTicket: Ticket = {
    ...ticketData,
    id: `IT-${nextNum}`,
    queueNumber: nextNum,
    createdAt: now,
    updatedAt: now,
    status: 'In Queue',
    assignedTo: 'IT Officer',
  };

  const updatedTickets = [newTicket, ...currentTickets];
  saveTickets(updatedTickets);
  saveMyTicketId(newTicket.id);
  return newTicket;
}

export function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  resolutionNotes?: string,
  ispReferenceNumber?: string,
  partsUsed?: string
): Ticket[] {
  const currentTickets = getTickets();
  const now = new Date().toISOString();

  const updatedTickets = currentTickets.map((t) => {
    if (t.id === ticketId) {
      return {
        ...t,
        status,
        updatedAt: now,
        resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : t.resolutionNotes,
        ispReferenceNumber: ispReferenceNumber !== undefined ? ispReferenceNumber : t.ispReferenceNumber,
        partsUsed: partsUsed !== undefined ? partsUsed : t.partsUsed,
        resolvedAt: status === 'Resolved' ? (t.resolvedAt || now) : undefined,
      };
    }
    return t;
  });

  saveTickets(updatedTickets);
  return updatedTickets;
}

export function resetToSeedData(): Ticket[] {
  saveTickets(SEED_TICKETS);
  saveITOfficerStatus(INITIAL_IT_STATUS);
  return SEED_TICKETS;
}

export function clearAllTickets(): Ticket[] {
  saveTickets([]);
  return [];
}

export function exportTicketsToCSV(tickets: Ticket[]): void {
  const headers = [
    'Ticket ID',
    'Queue No',
    'Date Submitted',
    'Requester Name',
    'Office Location',
    'Specific Location',
    'Category',
    'Priority',
    'Issue Summary',
    'Remarks / Details',
    'Status',
    'Resolution Notes',
    'ISP Reference',
    'Parts Used',
    'Resolved Date',
  ];

  const rows = tickets.map((t) => [
    `"${t.id}"`,
    t.queueNumber,
    `"${new Date(t.createdAt).toLocaleString()}"`,
    `"${(t.name || '').replace(/"/g, '""')}"`,
    `"${(t.location || '').replace(/"/g, '""')}"`,
    `"${(t.specificLocationDetails || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.priority || '').replace(/"/g, '""')}"`,
    `"${(t.issue || '').replace(/"/g, '""')}"`,
    `"${(t.remarks || '').replace(/"/g, '""')}"`,
    `"${t.status}"`,
    `"${(t.resolutionNotes || '').replace(/"/g, '""')}"`,
    `"${(t.ispReferenceNumber || '').replace(/"/g, '""')}"`,
    `"${(t.partsUsed || '').replace(/"/g, '""')}"`,
    t.resolvedAt ? `"${new Date(t.resolvedAt).toLocaleString()}"` : '""',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `IT_Tickets_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
