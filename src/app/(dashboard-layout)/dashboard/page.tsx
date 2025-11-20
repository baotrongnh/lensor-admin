"use client"

import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { SectionCards } from '@/components/section-cards'
import React, { useEffect, useState } from 'react'
import { revenueService, RevenueStatistics } from '@/services/revenue.service'
import { toast } from 'sonner'

export default function Overview() {
     const [revenueData, setRevenueData] = useState<RevenueStatistics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          fetchRevenueData();
     }, []);

     const fetchRevenueData = async () => {
          try {
               setLoading(true);
               const response = await revenueService.getStatistics();
               setRevenueData(response.data);
          } catch (error) {
               console.error('Error fetching revenue statistics:', error);
               toast.error('Failed to fetch revenue statistics');
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="flex flex-1 flex-col">
               <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                         <SectionCards revenueData={revenueData} loading={loading} />
                         <div className="px-4 lg:px-6">
                              <ChartAreaInteractive revenueData={revenueData} loading={loading} />
                         </div>
                    </div>
               </div>
          </div>
     )
}
