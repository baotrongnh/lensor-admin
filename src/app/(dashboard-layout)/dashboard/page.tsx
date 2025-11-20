"use client"

import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { SectionCards } from '@/components/section-cards'
import React, { useEffect, useState } from 'react'
import { revenueService, RevenueStatistics } from '@/services/revenue.service'
import { withdrawalService } from '@/services/withdrawal.service'
import { WithdrawalStatistics } from '@/types/withdrawal'
import { UserService } from '@/services/user.service'
import { ProductService } from '@/services/product.service'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Loader2, Users, ShoppingBag, Wallet, TrendingUp, DollarSign, CreditCard, Package } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

interface OverallStatistics {
     revenue: RevenueStatistics | null
     withdrawals: WithdrawalStatistics | null
     totalUsers: number
     totalProducts: number
}

export default function Overview() {
     const [stats, setStats] = useState<OverallStatistics>({
          revenue: null,
          withdrawals: null,
          totalUsers: 0,
          totalProducts: 0,
     })
     const [loading, setLoading] = useState(true)
     const [selectedYear, setSelectedYear] = useState('all')
     const [selectedMonth, setSelectedMonth] = useState('all')

     const currentYear = new Date().getFullYear()
     const years = ['all', ...Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())]
     const months = [
          { value: 'all', label: 'All Months' },
          { value: '1', label: 'January' },
          { value: '2', label: 'February' },
          { value: '3', label: 'March' },
          { value: '4', label: 'April' },
          { value: '5', label: 'May' },
          { value: '6', label: 'June' },
          { value: '7', label: 'July' },
          { value: '8', label: 'August' },
          { value: '9', label: 'September' },
          { value: '10', label: 'October' },
          { value: '11', label: 'November' },
          { value: '12', label: 'December' },
     ]

     useEffect(() => {
          fetchAllData()
     }, [selectedYear, selectedMonth])

     const fetchAllData = async () => {
          try {
               setLoading(true)

               // Fetch all data in parallel
               const [revenueRes, withdrawalRes, usersRes, productsRes] = await Promise.allSettled([
                    revenueService.getStatistics(),
                    withdrawalService.getStatistics(
                         selectedYear !== 'all' ? selectedYear : undefined,
                         selectedMonth !== 'all' ? selectedMonth : undefined
                    ),
                    UserService.getAllUsers(1, 1000),
                    ProductService.getAllProducts(1, 1000),
               ])

               setStats({
                    revenue: revenueRes.status === 'fulfilled' ? revenueRes.value.data : null,
                    withdrawals: withdrawalRes.status === 'fulfilled' ? withdrawalRes.value.data : null,
                    totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data.users.length : 0,
                    totalProducts: productsRes.status === 'fulfilled' ? productsRes.value.data.length : 0,
               })
          } catch (error) {
               console.error('Error fetching statistics:', error)
               toast.error('Failed to fetch some statistics')
          } finally {
               setLoading(false)
          }
     }

     const formatCurrency = (amount: number) => {
          return new Intl.NumberFormat('vi-VN', {
               style: 'currency',
               currency: 'VND',
          }).format(amount)
     }

     // Prepare chart data
     const revenueBreakdownData = stats.revenue ? [
          { name: 'Platform Revenue', value: stats.revenue.platformRevenue, percentage: stats.revenue.platformRevenuePercentage },
          { name: 'Seller Revenue', value: stats.revenue.sellerRevenue, percentage: stats.revenue.sellerRevenuePercentage },
     ] : []

     const withdrawalBreakdownData = stats.withdrawals ? [
          { name: 'Actual Amount', value: stats.withdrawals.totalActualAmount },
          { name: 'Fees', value: stats.withdrawals.totalFee },
     ] : []

     const overviewData = [
          { name: 'Users', value: stats.totalUsers, color: CHART_COLORS[0] },
          { name: 'Products', value: stats.totalProducts, color: CHART_COLORS[1] },
          { name: 'Orders', value: stats.revenue?.totalOrders || 0, color: CHART_COLORS[2] },
          { name: 'Withdrawals', value: stats.withdrawals?.totalWithdrawals || 0, color: CHART_COLORS[3] },
     ]

     return (
          <div className="flex flex-1 flex-col">
               <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                         {/* Header */}
                         <div className="px-4 lg:px-6">
                              <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                              <p className="text-muted-foreground">
                                   Comprehensive statistics and analytics for your platform
                              </p>
                         </div>

                         {/* Filters */}
                         <div className="px-4 lg:px-6">
                              <Card>
                                   <CardHeader>
                                        <CardTitle>Time Period Filter</CardTitle>
                                        <CardDescription>Select time range for withdrawal statistics</CardDescription>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="flex flex-wrap gap-4">
                                             <div className="w-[200px]">
                                                  <label className="text-sm font-medium mb-2 block">Year</label>
                                                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                       <SelectTrigger>
                                                            <SelectValue />
                                                       </SelectTrigger>
                                                       <SelectContent>
                                                            <SelectItem value="all">All Years</SelectItem>
                                                            {years.slice(1).map((year) => (
                                                                 <SelectItem key={year} value={year}>
                                                                      {year}
                                                                 </SelectItem>
                                                            ))}
                                                       </SelectContent>
                                                  </Select>
                                             </div>
                                             <div className="w-[200px]">
                                                  <label className="text-sm font-medium mb-2 block">Month</label>
                                                  <Select
                                                       value={selectedMonth}
                                                       onValueChange={setSelectedMonth}
                                                       disabled={selectedYear === 'all'}
                                                  >
                                                       <SelectTrigger>
                                                            <SelectValue />
                                                       </SelectTrigger>
                                                       <SelectContent>
                                                            {months.map((month) => (
                                                                 <SelectItem key={month.value} value={month.value}>
                                                                      {month.label}
                                                                 </SelectItem>
                                                            ))}
                                                       </SelectContent>
                                                  </Select>
                                             </div>
                                        </div>
                                   </CardContent>
                              </Card>
                         </div>

                         {/* Overview Stats Cards */}
                         <div className="px-4 lg:px-6">
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                   <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                             <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                             <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-8 w-24" />
                                             ) : (
                                                  <>
                                                       <div className="text-2xl font-bold">{stats.totalUsers}</div>
                                                       <p className="text-xs text-muted-foreground">Registered users</p>
                                                  </>
                                             )}
                                        </CardContent>
                                   </Card>
                                   <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                             <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                                             <Package className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-8 w-24" />
                                             ) : (
                                                  <>
                                                       <div className="text-2xl font-bold">{stats.totalProducts}</div>
                                                       <p className="text-xs text-muted-foreground">Available products</p>
                                                  </>
                                             )}
                                        </CardContent>
                                   </Card>
                                   <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-8 w-24" />
                                             ) : (
                                                  <>
                                                       <div className="text-2xl font-bold">{stats.revenue?.totalOrders || 0}</div>
                                                       <p className="text-xs text-muted-foreground">Completed transactions</p>
                                                  </>
                                             )}
                                        </CardContent>
                                   </Card>
                                   <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                             <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                                             <Wallet className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-8 w-24" />
                                             ) : (
                                                  <>
                                                       <div className="text-2xl font-bold">{stats.withdrawals?.totalWithdrawals || 0}</div>
                                                       <p className="text-xs text-muted-foreground">Withdrawal requests</p>
                                                  </>
                                             )}
                                        </CardContent>
                                   </Card>
                              </div>
                         </div>

                         {/* Revenue Section */}
                         <SectionCards revenueData={stats.revenue} loading={loading} />

                         {/* Withdrawal Statistics */}
                         <div className="px-4 lg:px-6">
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                   <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                             <CardTitle className="text-sm font-medium">Withdrawal Amount</CardTitle>
                                             <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-8 w-32" />
                                             ) : (
                                                  <>
                                                       <div className="text-2xl font-bold">
                                                            {stats.withdrawals?.formattedTotalAmount || '0 ₫'}
                                                       </div>
                                                       <p className="text-xs text-muted-foreground">Total requested</p>
                                                  </>
                                             )}
                                        </CardContent>
                                   </Card>
                                   <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                             <CardTitle className="text-sm font-medium">Withdrawal Fees</CardTitle>
                                             <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-8 w-32" />
                                             ) : (
                                                  <>
                                                       <div className="text-2xl font-bold">
                                                            {stats.withdrawals?.formattedTotalFee || '0 ₫'}
                                                       </div>
                                                       <p className="text-xs text-muted-foreground">Processing fees</p>
                                                  </>
                                             )}
                                        </CardContent>
                                   </Card>
                                   <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                             <CardTitle className="text-sm font-medium">Actual Paid</CardTitle>
                                             <Wallet className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-8 w-32" />
                                             ) : (
                                                  <>
                                                       <div className="text-2xl font-bold">
                                                            {stats.withdrawals?.formattedTotalActualAmount || '0 ₫'}
                                                       </div>
                                                       <p className="text-xs text-muted-foreground">Paid to users</p>
                                                  </>
                                             )}
                                        </CardContent>
                                   </Card>
                                   <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                             <CardTitle className="text-sm font-medium">Fee Rate</CardTitle>
                                             <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-8 w-24" />
                                             ) : (
                                                  <>
                                                       <div className="text-2xl font-bold">
                                                            {stats.withdrawals && stats.withdrawals.totalAmount > 0
                                                                 ? ((stats.withdrawals.totalFee / stats.withdrawals.totalAmount) * 100).toFixed(2)
                                                                 : 0}%
                                                       </div>
                                                       <p className="text-xs text-muted-foreground">Average fee percentage</p>
                                                  </>
                                             )}
                                        </CardContent>
                                   </Card>
                              </div>
                         </div>

                         {/* Charts Section */}
                         <div className="px-4 lg:px-6">
                              <div className="grid gap-4 md:grid-cols-2">
                                   {/* Platform Overview Chart */}
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>Platform Overview</CardTitle>
                                             <CardDescription>Key metrics at a glance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-[300px] w-full" />
                                             ) : (
                                                  <ResponsiveContainer width="100%" height={300}>
                                                       <BarChart data={overviewData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="value" fill="#8b5cf6" name="Count" />
                                                       </BarChart>
                                                  </ResponsiveContainer>
                                             )}
                                        </CardContent>
                                   </Card>

                                   {/* Revenue Distribution */}
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>Revenue Distribution</CardTitle>
                                             <CardDescription>Platform vs Seller earnings</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-[300px] w-full" />
                                             ) : (
                                                  <ResponsiveContainer width="100%" height={300}>
                                                       <PieChart>
                                                            <Pie
                                                                 data={revenueBreakdownData}
                                                                 cx="50%"
                                                                 cy="50%"
                                                                 labelLine={false}
                                                                 label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                                 outerRadius={80}
                                                                 fill="#8884d8"
                                                                 dataKey="value"
                                                            >
                                                                 {revenueBreakdownData.map((entry, index) => (
                                                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                                                                 ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                                       </PieChart>
                                                  </ResponsiveContainer>
                                             )}
                                        </CardContent>
                                   </Card>

                                   {/* Withdrawal Analysis */}
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>Withdrawal Analysis</CardTitle>
                                             <CardDescription>Amount vs Fees breakdown</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-[300px] w-full" />
                                             ) : (
                                                  <ResponsiveContainer width="100%" height={300}>
                                                       <PieChart>
                                                            <Pie
                                                                 data={withdrawalBreakdownData}
                                                                 cx="50%"
                                                                 cy="50%"
                                                                 labelLine={false}
                                                                 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                                                 outerRadius={80}
                                                                 fill="#8884d8"
                                                                 dataKey="value"
                                                            >
                                                                 {withdrawalBreakdownData.map((entry, index) => (
                                                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index + 2]} />
                                                                 ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                                       </PieChart>
                                                  </ResponsiveContainer>
                                             )}
                                        </CardContent>
                                   </Card>

                                   {/* Financial Summary */}
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>Financial Summary</CardTitle>
                                             <CardDescription>Total monetary flow</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <Skeleton className="h-[300px] w-full" />
                                             ) : (
                                                  <div className="space-y-4">
                                                       <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                            <span className="font-medium">Total Order Value</span>
                                                            <span className="font-bold text-lg">
                                                                 {stats.revenue?.formattedTotalOrderValue || '0 ₫'}
                                                            </span>
                                                       </div>
                                                       <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                            <span className="font-medium">Platform Revenue</span>
                                                            <span className="font-bold text-lg text-green-600">
                                                                 {stats.revenue?.formattedPlatformRevenue || '0 ₫'}
                                                            </span>
                                                       </div>
                                                       <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                            <span className="font-medium">Seller Revenue</span>
                                                            <span className="font-bold text-lg text-blue-600">
                                                                 {stats.revenue?.formattedSellerRevenue || '0 ₫'}
                                                            </span>
                                                       </div>
                                                       <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                            <span className="font-medium">Withdrawn Amount</span>
                                                            <span className="font-bold text-lg text-orange-600">
                                                                 {stats.withdrawals?.formattedTotalActualAmount || '0 ₫'}
                                                            </span>
                                                       </div>
                                                       <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                            <span className="font-medium">Pending Seller Balance</span>
                                                            <span className="font-bold text-lg text-purple-600">
                                                                 {formatCurrency(
                                                                      (stats.revenue?.sellerRevenue || 0) -
                                                                      (stats.withdrawals?.totalActualAmount || 0)
                                                                 )}
                                                            </span>
                                                       </div>
                                                  </div>
                                             )}
                                        </CardContent>
                                   </Card>
                              </div>
                         </div>

                         {/* Revenue Timeline Chart */}
                         <div className="px-4 lg:px-6">
                              <ChartAreaInteractive revenueData={stats.revenue} loading={loading} />
                         </div>
                    </div>
               </div>
          </div>
     )
}
