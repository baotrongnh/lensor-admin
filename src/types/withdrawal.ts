export interface WithdrawalBankInfo {
     bankName: string
     accountNumber: string
     accountHolder: string
}

export interface Withdrawal {
     id: string
     userId: string
     bankCardId: string
     amount: string
     fee: string
     actualAmount: string
     status: 'pending' | 'approved' | 'rejected' | 'completed'
     orderIds: string[]
     bankInfo: WithdrawalBankInfo
     note: string | null
     adminId: string | null
     adminResponse: string | null
     paymentProofImageUrl: string[] | null
     processedAt: string | null
     createdAt: string
     updatedAt: string
}

export interface WithdrawalsResponse {
     data: Withdrawal[]
}

export interface WithdrawalActionPayload {
     action: 'approved' | 'rejected'
     adminResponse: string
}

export interface WithdrawalActionResponse {
     message: string
     data: Withdrawal
}

export interface WithdrawalStatisticsFilters {
     year: string
     month: string
}

export interface WithdrawalStatistics {
     totalWithdrawals: number
     totalAmount: number
     totalFee: number
     totalActualAmount: number
     formattedTotalAmount: string
     formattedTotalFee: string
     formattedTotalActualAmount: string
     filters: WithdrawalStatisticsFilters
}

export interface WithdrawalStatisticsResponse {
     data: WithdrawalStatistics
}
