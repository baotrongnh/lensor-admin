import { apiClient } from '@/lib/api-client';
import {
     Withdrawal,
     WithdrawalsResponse,
     WithdrawalActionPayload,
     WithdrawalActionResponse
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
          payload: WithdrawalActionPayload
     ): Promise<WithdrawalActionResponse> {
          const response = await apiClient.post<WithdrawalActionResponse>(
               `/admin/withdrawals/${withdrawalId}/action`,
               payload
          );
          return response.data;
     },
};
