export type OfficeLocation =
  | 'MAIN OFFICER MABOLO'
  | 'GTC OFFICE SM'
  | 'GRC DYNASTY MABOLO'
  | 'REMOTE FOR DAVAO'
  | 'AMANI'
  | 'PLDT / GLOBE (ISP OUTAGE)'
  | 'OTHER / FIELD LOCATION';

export type TicketCategory =
  | 'Printer & Scanner'
  | 'CCTV & Camera'
  | 'Laptop & Computer'
  | 'Firewall & Networking'
  | 'Server & Storage'
  | 'Internet & ISP Outage'
  | 'Software, Email & Accounts'
  | 'Other IT Work';

export type TicketPriority = 'Normal' | 'High (Work Stopped)' | 'Critical (Branch / Network Down)';

export type TicketStatus =
  | 'In Queue'
  | 'En Route / Traveling'
  | 'In Progress / Diagnosing'
  | 'Waiting for Parts / ISP'
  | 'Resolved'
  | 'Cancelled';

export interface Ticket {
  id: string; // e.g. "IT-101"
  queueNumber: number; // sequential number e.g. 1, 2, 3...
  name: string; // Requester Name
  departmentOrContact?: string; // Optional phone/extension/dept
  location: OfficeLocation;
  specificLocationDetails?: string; // e.g. "Accounting Dept, 2nd Floor"
  category: TicketCategory;
  priority: TicketPriority;
  issue: string; // Summary of issue
  remarks: string; // Detailed notes / error message / asset tag
  createdAt: string; // ISO string
  updatedAt: string;
  status: TicketStatus;
  
  // IT Officer resolution details
  resolutionNotes?: string;
  partsUsed?: string;
  ispReferenceNumber?: string;
  resolvedAt?: string;
  assignedTo?: string; // Default: "IT Officer"
}

export interface ITOfficerStatus {
  currentLocation: OfficeLocation | 'IN TRANSIT / ON THE ROAD';
  destinationLocation?: OfficeLocation | 'BACK TO MAIN OFFICE';
  statusNote: string;
  lastUpdated: string;
  contactNumber: string;
  availableForCall: boolean;
}
