import { apiClient } from '@/lib/api-client';

export interface OrderRevenue {
     id: string;
     totalAmount: number;
     platformFee: number;
     sellerReceived: number;
     createdAt: string;
     itemCount: number;
}

export interface RevenueStatistics {
     totalOrders: number;
     totalOrderValue: number;
     platformRevenue: number;
     platformRevenuePercentage: number;
     sellerRevenue: number;
     sellerRevenuePercentage: number;
     formattedPlatformRevenue: string;
     formattedSellerRevenue: string;
     formattedTotalOrderValue: string;
     orders: OrderRevenue[];
}

export interface RevenueResponse {
     data: RevenueStatistics;
}

export const revenueService = {
     getStatistics: async (): Promise<RevenueResponse> => {
          const response = await apiClient.get<RevenueResponse>('/admin/revenue/statistics');
          return response.data;
     },
};
