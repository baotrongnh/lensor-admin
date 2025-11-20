import { apiClient } from '@/lib/api-client';
import {
     Report,
     ReportsResponse,
     ReportStatus,
     ReportActionPayload,
     ReportActionResponse,
} from '@/types/report';

export const reportService = {
     /**
      * Get all reports
      */
     async getAllReports(): Promise<Report[]> {
          const response = await apiClient.get<ReportsResponse>('/admin/reports');
          return response.data.data;
     },

     /**
      * Get reports by status
      */
     async getReportsByStatus(status: ReportStatus): Promise<Report[]> {
          const response = await apiClient.get<ReportsResponse>('/admin/reports', {
               params: { status },
          });
          return response.data.data;
     },

     /**
      * Get pending reports
      */
     async getPendingReports(): Promise<Report[]> {
          return this.getReportsByStatus('pending');
     },

     /**
      * Get approved reports
      */
     async getApprovedReports(): Promise<Report[]> {
          return this.getReportsByStatus('approved');
     },

     /**
      * Get rejected reports
      */
     async getRejectedReports(): Promise<Report[]> {
          return this.getReportsByStatus('rejected');
     },

     /**
      * Get reports that need more information
      */
     async getNeedMoreInfoReports(): Promise<Report[]> {
          return this.getReportsByStatus('need_more_info');
     },

     /**
      * Perform action on a report (approve, reject, or request more info)
      */
     async performAction(
          reportId: string,
          payload: ReportActionPayload
     ): Promise<ReportActionResponse> {
          const response = await apiClient.post<ReportActionResponse>(
               `/admin/reports/${reportId}/action`,
               payload
          );
          return response.data;
     },

     /**
      * Approve a report (refund to buyer)
      * @param blockProduct - Optional: Block the product after approving refund
      */
     async approveReport(reportId: string, adminResponse: string, blockProduct?: boolean): Promise<ReportActionResponse> {
          return this.performAction(reportId, {
               action: 'approved',
               adminResponse,
               blockProduct,
          });
     },

     /**
      * Reject a report (restore order to seller)
      */
     async rejectReport(reportId: string, adminResponse: string): Promise<ReportActionResponse> {
          return this.performAction(reportId, {
               action: 'rejected',
               adminResponse,
          });
     },

     /**
      * Request more information from the reporter
      */
     async requestMoreInfo(reportId: string, adminResponse: string): Promise<ReportActionResponse> {
          return this.performAction(reportId, {
               action: 'need_more_info',
               adminResponse,
          });
     },
};
