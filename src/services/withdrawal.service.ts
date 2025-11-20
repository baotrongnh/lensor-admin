import { apiClient } from '@/lib/api-client';
import {
     Withdrawal,
     WithdrawalsResponse,
     WithdrawalActionPayload,
     WithdrawalActionResponse,
     WithdrawalStatisticsResponse
} from '@/types/withdrawal';

export const withdrawalService = {
     // Get all withdrawals
     async getAllWithdrawals(): Promise<WithdrawalsResponse> {
          const response = await apiClient.get<WithdrawalsResponse>('/admin/withdrawals');
          return response.data;
     },

     // Get withdrawals by status
     async getWithdrawalsByStatus(status: string): Promise<WithdrawalsResponse> {
          const response = await apiClient.get<WithdrawalsResponse>(`/admin/withdrawals?status=${status}`);
          return response.data;
     },

     // Process withdrawal action (approve/reject)
     async processWithdrawalAction(
          withdrawalId: string,
          payload: WithdrawalActionPayload,
          paymentProof?: File
     ): Promise<WithdrawalActionResponse> {
          // Use form-data when approving with payment proof
          if (payload.action === 'approved' && paymentProof) {
               const formData = new FormData();
               formData.append('action', payload.action);
               formData.append('adminResponse', payload.adminResponse);
               formData.append('paymentProof', paymentProof);

               const response = await apiClient.post<WithdrawalActionResponse>(
                    `/admin/withdrawals/${withdrawalId}/action`,
                    formData,
                    {
                         headers: {
                              'Content-Type': 'multipart/form-data',
                         },
                    }
               );
               return response.data;
          }

          // Use regular JSON for rejection or approval without payment proof
          const response = await apiClient.post<WithdrawalActionResponse>(
               `/admin/withdrawals/${withdrawalId}/action`,
               payload
          );
          return response.data;
     },

     // Get withdrawal statistics with optional filters
     async getStatistics(year?: string, month?: string): Promise<WithdrawalStatisticsResponse> {
          const params = new URLSearchParams();
          if (year) params.append('year', year);
          if (month) params.append('month', month);

          const queryString = params.toString();
          const url = `/admin/withdrawals/statistics${queryString ? `?${queryString}` : ''}`;

          const response = await apiClient.get<WithdrawalStatisticsResponse>(url);
          return response.data;
     },
};
