import { apiClient } from '@/lib/api-client'

export interface DiscountRateResponse {
     success: boolean
     data: {
          discountRate: string
     }
}

export interface UpdateDiscountRateRequest {
     value: string
}

export interface UpdateDiscountRateResponse {
     data: {
          discountRate: string
     }
     statusCode: number
}

/**
 * Settings Service
 * Handles all settings-related API calls
 */
export class SettingsService {
     /**
      * Get current discount rate
      * @returns Current discount rate value
      */
     static async getDiscountRate(): Promise<DiscountRateResponse> {
          const response = await apiClient.get<DiscountRateResponse>('/system-variables/discount-rate')
          return response.data
     }

     /**
      * Update discount rate
      * @param value - New discount rate value (as string, e.g., "17")
      * @returns Updated discount rate
      */
     static async updateDiscountRate(value: string): Promise<UpdateDiscountRateResponse> {
          const response = await apiClient.post<UpdateDiscountRateResponse>('/admin/discount-rate', {
               value,
          })
          return response.data
     }
}
