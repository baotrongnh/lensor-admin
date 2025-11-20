'use client'

import { useState, useEffect } from 'react'
import { withdrawalService } from '@/services/withdrawal.service'
import { WithdrawalStatistics } from '@/types/withdrawal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Loader2, TrendingUp, DollarSign, CreditCard, Wallet } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function WithdrawalStatisticsPage() {
     const [statistics, setStatistics] = useState<WithdrawalStatistics | null>(null)
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
          fetchStatistics()
     }, [selectedYear, selectedMonth])

     const fetchStatistics = async () => {
          try {
               setLoading(true)
               const yearParam = selectedYear !== 'all' ? selectedYear : undefined
               const monthParam = selectedMonth !== 'all' ? selectedMonth : undefined
               const response = await withdrawalService.getStatistics(yearParam, monthParam)
               setStatistics(response.data)
          } catch (error) {
               console.error('Failed to fetch statistics:', error)
          } finally {
               setLoading(false)
          }
     }

     if (loading) {
          return (
               <div className="flex items-center justify-center h-[600px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
          )
     }

     if (!statistics) {
          return (
               <div className="flex items-center justify-center h-[600px]">
                    <p className="text-muted-foreground">Unable to load statistics data</p>
               </div>
          )
     }

     // Data for charts
     const barChartData = [
          {
               name: 'Total Amount',
               value: statistics.totalAmount,
               formatted: statistics.formattedTotalAmount
          },
          {
               name: 'Withdrawal Fee',
               value: statistics.totalFee,
               formatted: statistics.formattedTotalFee
          },
          {
               name: 'Actual Amount',
               value: statistics.totalActualAmount,
               formatted: statistics.formattedTotalActualAmount
          },
     ]

     const pieChartData = [
          {
               name: 'Actual Amount',
               value: statistics.totalActualAmount,
          },
          {
               name: 'Withdrawal Fee',
               value: statistics.totalFee,
          },
     ]

     return (
          <div className="space-y-6 p-4">
               {/* Header */}
               <div>
                    <h1 className="text-3xl font-bold tracking-tight">Withdrawal Statistics</h1>
                    <p className="text-muted-foreground">
                         View overview and analyze withdrawal data
                    </p>
               </div>

               {/* Filters */}
               <Card>
                    <CardHeader>
                         <CardTitle>Filters</CardTitle>
                         <CardDescription>Select time period to view statistics</CardDescription>
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

               {/* Stats Cards */}
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{statistics.totalWithdrawals}</div>
                              <p className="text-xs text-muted-foreground">
                                   Number of withdrawal requests
                              </p>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{statistics.formattedTotalAmount}</div>
                              <p className="text-xs text-muted-foreground">
                                   Total withdrawal requested
                              </p>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Withdrawal Fee</CardTitle>
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{statistics.formattedTotalFee}</div>
                              <p className="text-xs text-muted-foreground">
                                   Total transaction fee
                              </p>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Actual Amount</CardTitle>
                              <Wallet className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{statistics.formattedTotalActualAmount}</div>
                              <p className="text-xs text-muted-foreground">
                                   Amount users received
                              </p>
                         </CardContent>
                    </Card>
               </div>

               {/* Charts */}
               <div className="grid gap-4 md:grid-cols-2">
                    {/* Bar Chart */}
                    <Card>
                         <CardHeader>
                              <CardTitle>Amount Analysis</CardTitle>
                              <CardDescription>Compare total amount, fees and actual amount</CardDescription>
                         </CardHeader>
                         <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                   <BarChart data={barChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                             formatter={(value, name, props) => [props.payload.formatted, name]}
                                        />
                                        <Legend />
                                        <Bar dataKey="value" fill="#8884d8" name="Amount (VND)" />
                                   </BarChart>
                              </ResponsiveContainer>
                         </CardContent>
                    </Card>

                    {/* Pie Chart */}
                    <Card>
                         <CardHeader>
                              <CardTitle>Money Distribution</CardTitle>
                              <CardDescription>Ratio between actual amount and fees</CardDescription>
                         </CardHeader>
                         <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                   <PieChart>
                                        <Pie
                                             data={pieChartData}
                                             cx="50%"
                                             cy="50%"
                                             labelLine={false}
                                             label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                             outerRadius={80}
                                             fill="#8884d8"
                                             dataKey="value"
                                        >
                                             {pieChartData.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                             ))}
                                        </Pie>
                                        <Tooltip />
                                   </PieChart>
                              </ResponsiveContainer>
                         </CardContent>
                    </Card>
               </div>

               {/* Additional Info Card */}
               <Card>
                    <CardHeader>
                         <CardTitle>Detailed Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <span className="font-medium">Average fee per transaction:</span>
                              <span className="font-bold">
                                   {statistics.totalWithdrawals > 0
                                        ? Math.round(statistics.totalFee / statistics.totalWithdrawals).toLocaleString('vi-VN')
                                        : 0} ₫
                              </span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <span className="font-medium">Fee rate:</span>
                              <span className="font-bold">
                                   {statistics.totalAmount > 0
                                        ? ((statistics.totalFee / statistics.totalAmount) * 100).toFixed(2)
                                        : 0}%
                              </span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                              <span className="font-medium">Average amount per transaction:</span>
                              <span className="font-bold">
                                   {statistics.totalWithdrawals > 0
                                        ? Math.round(statistics.totalAmount / statistics.totalWithdrawals).toLocaleString('vi-VN')
                                        : 0} ₫
                              </span>
                         </div>
                    </CardContent>
               </Card>
          </div>
     )
}
