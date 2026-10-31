export type JobStatus = 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface JobRecord {
  id: string;
  company: string;
  position: string;
  location: string | null;
  salary: string | null;
  status: JobStatus;
  applicationDate: Date;
  jobUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobFormPayload {
  company: string;
  position: string;
  location?: string;
  salary?: string;
  status: JobStatus;
  applicationDate?: string;
  jobUrl?: string;
  notes?: string;
}

export interface JobFilterParams {
  searchQuery?: string;
  statusFilter?: JobStatus | 'All';
  sortBy?: 'applicationDate' | 'company' | 'position' | 'status';
  sortOrder?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
  viewMode?: 'kanban' | 'grid' | 'table';
}

export interface JobMetricsSummary {
  totalCount: number;
  wishlistCount: number;
  appliedCount: number;
  interviewingCount: number;
  offerCount: number;
  rejectedCount: number;
  activeCount: number;
}
