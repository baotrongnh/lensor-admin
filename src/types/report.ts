export type ReportStatus = 'pending' | 'approved' | 'rejected' | 'need_more_info';

export type ReportAction = 'approved' | 'rejected' | 'need_more_info';

export interface Report {
     id: string;
     orderId: string;
     buyerId: string;
     sellerId: string;
     productId: string;
     status: ReportStatus;
     reason: string;
     evidence: string[];
     adminResponse: string | null;
     adminId: string | null;
     resolvedAt: string | null;
     createdAt: string;
     updatedAt: string;
}

export interface ReportsResponse {
     data: Report[];
}

export interface ReportActionPayload {
     action: ReportAction;
     adminResponse: string;
}

export interface ReportActionResponse {
     message: string;
     data: Report;
}
