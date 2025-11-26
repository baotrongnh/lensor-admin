"use client";

import { useEffect, useState } from "react";
import { withdrawalService } from "@/services/withdrawal.service";
import { Withdrawal, WithdrawalStatistics } from "@/types/withdrawal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "@/components/ui/table";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
     DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, XCircle, Clock, CreditCard, Calendar, DollarSign, MoreVertical, Eye, Upload, Image as ImageIcon, TrendingUp, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function WithdrawalManagementPage() {
     const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
     const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
     const [loading, setLoading] = useState(false);
     const [activeTab, setActiveTab] = useState<"overview" | "all" | "pending" | "approved" | "rejected" | "statistics">("overview");
     const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
     const [actionDialogOpen, setActionDialogOpen] = useState(false);
     const [actionType, setActionType] = useState<"approved" | "rejected">("approved");
     const [adminResponse, setAdminResponse] = useState("");
     const [paymentProof, setPaymentProof] = useState<File | null>(null);
     const [processing, setProcessing] = useState(false);
     const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
     const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
     const [statistics, setStatistics] = useState<WithdrawalStatistics | null>(null);
     const [statsLoading, setStatsLoading] = useState(false);
     const [selectedYear, setSelectedYear] = useState('all');
     const [selectedMonth, setSelectedMonth] = useState('all');
     const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
     const [detailsWithdrawal, setDetailsWithdrawal] = useState<Withdrawal | null>(null);

     useEffect(() => {
          fetchWithdrawals();
     }, []);

     useEffect(() => {
          filterWithdrawals();
     }, [activeTab, withdrawals]);

     useEffect(() => {
          if (activeTab === 'statistics') {
               fetchStatistics();
          }
     }, [activeTab, selectedYear, selectedMonth]);

     const fetchWithdrawals = async () => {
          try {
               setLoading(true);
               const response = await withdrawalService.getAllWithdrawals();
               setWithdrawals(response.data);
          } catch (error) {
               console.error("Error fetching withdrawals:", error);
               toast.error(error instanceof Error ? error.message : "Failed to fetch withdrawals");
          } finally {
               setLoading(false);
          }
     };

     const filterWithdrawals = () => {
          if (activeTab === "all" || activeTab === "overview" || activeTab === "statistics") {
               setFilteredWithdrawals(withdrawals);
          } else {
               setFilteredWithdrawals(withdrawals.filter((w) => w.status === activeTab));
          }
     };

     const fetchStatistics = async () => {
          try {
               setStatsLoading(true);
               const yearParam = selectedYear !== 'all' ? selectedYear : undefined;
               const monthParam = selectedMonth !== 'all' ? selectedMonth : undefined;
               const response = await withdrawalService.getStatistics(yearParam, monthParam);
               setStatistics(response.data);
          } catch (error) {
               console.error('Failed to fetch statistics:', error);
               toast.error('Failed to fetch statistics');
          } finally {
               setStatsLoading(false);
          }
     };

     const handleOpenActionDialog = (withdrawal: Withdrawal, action: "approved" | "rejected") => {
          setSelectedWithdrawal(withdrawal);
          setActionType(action);
          setAdminResponse(
               action === "approved"
                    ? "Đã xác nhận thông tin thẻ và chuyển khoản. Tiền sẽ được chuyển trong 1-3 ngày làm việc."
                    : "Thông tin thẻ ngân hàng không khớp. Vui lòng kiểm tra lại tên chủ thẻ và số tài khoản."
          );
          setPaymentProof(null);
          setActionDialogOpen(true);
     };

     const handleProcessAction = async () => {
          if (!selectedWithdrawal || !adminResponse.trim()) {
               toast.error("Please provide admin response");
               return;
          }

          // Validate payment proof for approval
          if (actionType === "approved" && !paymentProof) {
               toast.error("Please upload payment proof (transfer screenshot)");
               return;
          }

          try {
               setProcessing(true);
               await withdrawalService.processWithdrawalAction(
                    selectedWithdrawal.id,
                    {
                         action: actionType,
                         adminResponse: adminResponse.trim(),
                    },
                    paymentProof || undefined
               );
               toast.success(`Withdrawal ${actionType} successfully!`);
               setActionDialogOpen(false);
               setSelectedWithdrawal(null);
               setAdminResponse("");
               setPaymentProof(null);
               fetchWithdrawals();
          } catch (error) {
               console.error("Error processing withdrawal:", error);
               const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
               toast.error(message || "Failed to process withdrawal");
          } finally {
               setProcessing(false);
          }
     };

     const formatCurrency = (amount: string | number) => {
          const num = typeof amount === "string" ? parseFloat(amount) : amount;
          return new Intl.NumberFormat("vi-VN", {
               style: "currency",
               currency: "VND",
          }).format(num);
     };

     const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleString("en-US", {
               year: "numeric",
               month: "short",
               day: "numeric",
               hour: "2-digit",
               minute: "2-digit",
          });
     };

     const calculateFeePercentage = (amount: string | number, fee: string | number): string => {
          const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
          const feeNum = typeof fee === "string" ? parseFloat(fee) : fee;
          if (amountNum === 0) return "0.00";
          return ((feeNum / amountNum) * 100).toFixed(2);
     };

     const getImageUrl = (imagePath: string) => {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://14.169.52.232:3005';
          return `${baseUrl}${imagePath}`;
     };

     const handleViewImage = (imageUrl: string) => {
          setPreviewImageUrl(getImageUrl(imageUrl));
          setImagePreviewOpen(true);
     };

     const handleViewDetails = (withdrawal: Withdrawal) => {
          setDetailsWithdrawal(withdrawal);
          setDetailsDialogOpen(true);
     };

     const getStatusBadge = (status: string) => {
          const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode; className?: string }> = {
               pending: {
                    variant: "secondary",
                    label: "Pending",
                    icon: <Clock className="h-3 w-3" />,
                    className: "bg-yellow-500 hover:bg-yellow-600",
               },
               approved: {
                    variant: "default",
                    label: "Approved",
                    icon: <CheckCircle className="h-3 w-3" />,
                    className: "bg-green-500 hover:bg-green-600",
               },
               rejected: {
                    variant: "destructive",
                    label: "Rejected",
                    icon: <XCircle className="h-3 w-3" />,
               },
               completed: {
                    variant: "default",
                    label: "Completed",
                    icon: <CheckCircle className="h-3 w-3" />,
                    className: "bg-blue-500 hover:bg-blue-600",
               },
          };

          const item = config[status] || config.pending;
          return (
               <Badge variant={item.variant} className={`flex items-center gap-1 ${item.className || ""}`}>
                    {item.icon}
                    {item.label}
               </Badge>
          );
     };

     const stats = {
          total: withdrawals.length,
          pending: withdrawals.filter((w) => w.status === "pending").length,
          approved: withdrawals.filter((w) => w.status === "approved").length,
          rejected: withdrawals.filter((w) => w.status === "rejected").length,
          totalAmount: withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0),
     };

     return (
          <div className="container mx-auto py-6 space-y-6 p-8">
               <div>
                    <h1 className="text-3xl font-bold">Withdrawal Management</h1>
                    <p className="text-muted-foreground mt-1">Manage seller withdrawal requests</p>
               </div>

               {/* Stats Cards */}
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                              <Wallet className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{stats.total}</div>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Pending</CardTitle>
                              <Clock className="h-4 w-4 text-yellow-500" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{stats.pending}</div>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Approved</CardTitle>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{stats.approved}</div>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                              <Wallet className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                         </CardContent>
                    </Card>
               </div>

               {/* Withdrawals Table */}
               <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList>
                         <TabsTrigger value="overview">Overview</TabsTrigger>
                         <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                         <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                         <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                         <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                         <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4">
                         <Card>
                              <CardHeader>
                                   <CardTitle>Withdrawal Requests</CardTitle>
                                   <CardDescription>
                                        {loading ? "Loading..." : `${filteredWithdrawals.length} request(s)`}
                                   </CardDescription>
                              </CardHeader>
                              <CardContent>
                                   {loading ? (
                                        <div className="flex justify-center items-center py-12">
                                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                   ) : filteredWithdrawals.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                             No withdrawal requests found
                                        </div>
                                   ) : (
                                        <div className="overflow-x-auto">
                                             <Table>
                                                  <TableHeader>
                                                       <TableRow>
                                                            <TableHead>ID</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead>Bank Info</TableHead>
                                                            <TableHead>Amount</TableHead>
                                                            <TableHead>Fee</TableHead>
                                                            <TableHead>Actual Amount</TableHead>
                                                            <TableHead>Orders</TableHead>
                                                            <TableHead>Payment Proof</TableHead>
                                                            <TableHead>Created At</TableHead>
                                                            <TableHead>Actions</TableHead>
                                                       </TableRow>
                                                  </TableHeader>
                                                  <TableBody>
                                                       {filteredWithdrawals.map((withdrawal) => (
                                                            <TableRow key={withdrawal.id}>
                                                                 <TableCell className="font-mono text-xs">
                                                                      {withdrawal.id.substring(0, 8)}...
                                                                 </TableCell>
                                                                 <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                                                                 <TableCell>
                                                                      <div className="space-y-1">
                                                                           <div className="flex items-center gap-1 text-sm font-medium">
                                                                                <CreditCard className="h-3 w-3" />
                                                                                {withdrawal.bankInfo.bankName}
                                                                           </div>
                                                                           <div className="text-xs text-muted-foreground">
                                                                                {withdrawal.bankInfo.accountNumber}
                                                                           </div>
                                                                           <div className="text-xs text-muted-foreground">
                                                                                {withdrawal.bankInfo.accountHolder}
                                                                           </div>
                                                                      </div>
                                                                 </TableCell>
                                                                 <TableCell className="font-semibold">
                                                                      {formatCurrency(withdrawal.amount)}
                                                                 </TableCell>
                                                                 <TableCell className="text-red-500">
                                                                      <div className="space-y-1">
                                                                           <div className="font-semibold">-{formatCurrency(withdrawal.fee)}</div>
                                                                           <div className="text-xs text-muted-foreground">({calculateFeePercentage(withdrawal.amount, withdrawal.fee)}%)</div>
                                                                      </div>
                                                                 </TableCell>
                                                                 <TableCell className="font-bold text-green-600">
                                                                      {formatCurrency(withdrawal.actualAmount)}
                                                                 </TableCell>
                                                                 <TableCell>
                                                                      <Badge variant="outline">
                                                                           {withdrawal.orderIds.length} order(s)
                                                                      </Badge>
                                                                 </TableCell>
                                                                 <TableCell>
                                                                      {withdrawal.paymentProofImageUrl && withdrawal.paymentProofImageUrl.length > 0 ? (
                                                                           <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8"
                                                                                onClick={() => handleViewImage(withdrawal.paymentProofImageUrl![0])}
                                                                           >
                                                                                <ImageIcon className="h-3 w-3 mr-1" />
                                                                                View
                                                                           </Button>
                                                                      ) : (
                                                                           <span className="text-xs text-muted-foreground">No proof</span>
                                                                      )}
                                                                 </TableCell>
                                                                 <TableCell className="text-sm">
                                                                      {formatDate(withdrawal.createdAt)}
                                                                 </TableCell>
                                                                 <TableCell>
                                                                      <DropdownMenu>
                                                                           <DropdownMenuTrigger asChild>
                                                                                <Button
                                                                                     size="sm"
                                                                                     variant="ghost"
                                                                                     className="h-8 w-8 p-0"
                                                                                >
                                                                                     <MoreVertical className="h-4 w-4" />
                                                                                </Button>
                                                                           </DropdownMenuTrigger>
                                                                           <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem
                                                                                     className="cursor-pointer"
                                                                                     onClick={() => handleViewDetails(withdrawal)}
                                                                                >
                                                                                     <Eye className="mr-2 h-4 w-4" />
                                                                                     View Details
                                                                                </DropdownMenuItem>
                                                                                {withdrawal.status === "pending" && (
                                                                                     <>
                                                                                          <DropdownMenuSeparator />
                                                                                          <DropdownMenuItem
                                                                                               className="cursor-pointer text-green-600 focus:text-green-600"
                                                                                               onClick={() =>
                                                                                                    handleOpenActionDialog(withdrawal, "approved")
                                                                                               }
                                                                                          >
                                                                                               <CheckCircle className="mr-2 h-4 w-4" />
                                                                                               Approve
                                                                                          </DropdownMenuItem>
                                                                                          <DropdownMenuItem
                                                                                               className="cursor-pointer text-red-600 focus:text-red-600"
                                                                                               onClick={() =>
                                                                                                    handleOpenActionDialog(withdrawal, "rejected")
                                                                                               }
                                                                                          >
                                                                                               <XCircle className="mr-2 h-4 w-4" />
                                                                                               Reject
                                                                                          </DropdownMenuItem>
                                                                                     </>
                                                                                )}
                                                                                {withdrawal.status !== "pending" && withdrawal.processedAt && (
                                                                                     <>
                                                                                          <DropdownMenuSeparator />
                                                                                          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                                                                               <Calendar className="mr-2 h-3 w-3" />
                                                                                               Processed: {formatDate(withdrawal.processedAt)}
                                                                                          </DropdownMenuItem>
                                                                                     </>
                                                                                )}
                                                                           </DropdownMenuContent>
                                                                      </DropdownMenu>
                                                                 </TableCell>
                                                            </TableRow>
                                                       ))}
                                                  </TableBody>
                                             </Table>
                                        </div>
                                   )}
                              </CardContent>
                         </Card>
                    </TabsContent>

                    {/* Statistics Tab */}
                    <TabsContent value="statistics" className="mt-4 space-y-6">
                         {statsLoading ? (
                              <div className="flex items-center justify-center h-[600px]">
                                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                         ) : !statistics ? (
                              <div className="flex items-center justify-center h-[600px]">
                                   <p className="text-muted-foreground">Unable to load statistics data</p>
                              </div>
                         ) : (
                              <>
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
                                                                 {Array.from({ length: 5 }, (_, i) => {
                                                                      const year = (new Date().getFullYear() - i).toString();
                                                                      return (
                                                                           <SelectItem key={year} value={year}>
                                                                                {year}
                                                                           </SelectItem>
                                                                      );
                                                                 })}
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
                                                                 {[
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
                                                                 ].map((month) => (
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
                                                  <Wallet className="h-4 w-4 text-muted-foreground" />
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
                                                       <BarChart data={[
                                                            { name: 'Total Amount', value: statistics.totalAmount, formatted: statistics.formattedTotalAmount },
                                                            { name: 'Withdrawal Fee', value: statistics.totalFee, formatted: statistics.formattedTotalFee },
                                                            { name: 'Actual Amount', value: statistics.totalActualAmount, formatted: statistics.formattedTotalActualAmount },
                                                       ]}>
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
                                                                 data={[
                                                                      { name: 'Actual Amount', value: statistics.totalActualAmount },
                                                                      { name: 'Withdrawal Fee', value: statistics.totalFee },
                                                                 ]}
                                                                 cx="50%"
                                                                 cy="50%"
                                                                 labelLine={false}
                                                                 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                                                 outerRadius={80}
                                                                 fill="#8884d8"
                                                                 dataKey="value"
                                                            >
                                                                 {[0, 1].map((index) => (
                                                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                              </>
                         )}
                    </TabsContent>
               </Tabs>

               {/* Action Dialog */}
               <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                         <DialogHeader>
                              <DialogTitle>
                                   {actionType === "approved" ? "Approve Withdrawal" : "Reject Withdrawal"}
                              </DialogTitle>
                              <DialogDescription>
                                   Please provide a response message for the seller
                              </DialogDescription>
                         </DialogHeader>

                         {selectedWithdrawal && (
                              <div className="space-y-4">
                                   <div className="p-4 bg-muted rounded-md space-y-2">
                                        <div className="flex justify-between text-sm">
                                             <span className="text-muted-foreground">Withdrawal ID:</span>
                                             <span className="font-mono">{selectedWithdrawal.id.substring(0, 12)}...</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                             <span className="text-muted-foreground">Amount:</span>
                                             <span className="font-semibold">{formatCurrency(selectedWithdrawal.amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                             <span className="text-muted-foreground">Actual Amount:</span>
                                             <span className="font-bold text-green-600">
                                                  {formatCurrency(selectedWithdrawal.actualAmount)}
                                             </span>
                                        </div>
                                        <div className="pt-2 border-t">
                                             <div className="text-sm font-medium mb-1">Bank Information:</div>
                                             <div className="text-sm space-y-1">
                                                  <div>{selectedWithdrawal.bankInfo.bankName}</div>
                                                  <div>{selectedWithdrawal.bankInfo.accountNumber}</div>
                                                  <div>{selectedWithdrawal.bankInfo.accountHolder}</div>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="space-y-2">
                                        <Label htmlFor="adminResponse">Admin Response</Label>
                                        <Textarea
                                             id="adminResponse"
                                             value={adminResponse}
                                             onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminResponse(e.target.value)}
                                             placeholder="Enter your response message..."
                                             rows={4}
                                        />
                                   </div>

                                   {actionType === "approved" && (
                                        <div className="space-y-2">
                                             <Label htmlFor="paymentProof">Payment Proof (Required) *</Label>
                                             <div className="flex items-center gap-2">
                                                  <Input
                                                       id="paymentProof"
                                                       type="file"
                                                       accept="image/*"
                                                       onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                 setPaymentProof(file);
                                                            }
                                                       }}
                                                       className="cursor-pointer"
                                                  />
                                             </div>
                                             {paymentProof && (
                                                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-md text-sm text-green-700 dark:text-green-300">
                                                       <ImageIcon className="h-4 w-4" />
                                                       <span>{paymentProof.name}</span>
                                                       <span className="text-xs text-muted-foreground">({(paymentProof.size / 1024).toFixed(1)} KB)</span>
                                                  </div>
                                             )}
                                             <p className="text-xs text-muted-foreground">
                                                  Upload screenshot of bank transfer. Required for approval.
                                             </p>
                                        </div>
                                   )}
                              </div>
                         )}

                         <DialogFooter>
                              <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={processing}>
                                   Cancel
                              </Button>
                              <Button
                                   onClick={handleProcessAction}
                                   disabled={processing || !adminResponse.trim()}
                                   className={
                                        actionType === "approved"
                                             ? "bg-green-600 hover:bg-green-700"
                                             : "bg-red-600 hover:bg-red-700"
                                   }
                              >
                                   {processing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                                   Confirm {actionType === "approved" ? "Approval" : "Rejection"}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>

               {/* Image Preview Dialog */}
               <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
                         <DialogHeader>
                              <DialogTitle>Payment Proof</DialogTitle>
                              <DialogDescription>
                                   Bank transfer screenshot
                              </DialogDescription>
                         </DialogHeader>
                         <div className="flex justify-center items-center p-4 bg-muted/30 rounded-lg overflow-hidden">
                              <img
                                   src={previewImageUrl}
                                   alt="Payment Proof"
                                   className="max-w-full max-h-[70vh] object-contain rounded-md"
                                   onError={(e) => {
                                        e.currentTarget.src = '/placeholder-image.png';
                                   }}
                              />
                         </div>
                         <DialogFooter>
                              <Button onClick={() => setImagePreviewOpen(false)}>Close</Button>
                              <Button
                                   variant="outline"
                                   onClick={() => window.open(previewImageUrl, '_blank')}
                              >
                                   Open in New Tab
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>

               {/* Withdrawal Details Dialog */}
               <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                              <DialogTitle>Withdrawal Request Details</DialogTitle>
                              <DialogDescription>
                                   Complete information about this withdrawal request
                              </DialogDescription>
                         </DialogHeader>

                         {detailsWithdrawal && (
                              <div className="space-y-6">
                                   {/* Basic Information */}
                                   <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Basic Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                  <p className="text-sm text-muted-foreground">Withdrawal ID</p>
                                                  <p className="text-sm font-mono">{detailsWithdrawal.id}</p>
                                             </div>
                                             <div>
                                                  <p className="text-sm text-muted-foreground">Status</p>
                                                  {getStatusBadge(detailsWithdrawal.status)}
                                             </div>
                                             <div>
                                                  <p className="text-sm text-muted-foreground">Created At</p>
                                                  <p className="text-sm">{formatDate(detailsWithdrawal.createdAt)}</p>
                                             </div>
                                             {detailsWithdrawal.processedAt && (
                                                  <div>
                                                       <p className="text-sm text-muted-foreground">Processed At</p>
                                                       <p className="text-sm">{formatDate(detailsWithdrawal.processedAt)}</p>
                                                  </div>
                                             )}
                                        </div>
                                   </div>

                                   {/* Financial Information */}
                                   <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Financial Information</h3>
                                        <div className="p-4 bg-muted rounded-lg space-y-3">
                                             <div className="flex justify-between items-center">
                                                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                                                  <span className="text-base font-semibold">{formatCurrency(detailsWithdrawal.amount)}</span>
                                             </div>
                                             <div className="flex justify-between items-center text-red-600">
                                                  <span className="text-sm">Withdrawal Fee ({calculateFeePercentage(detailsWithdrawal.amount, detailsWithdrawal.fee)}%):</span>
                                                  <span className="text-base font-semibold">-{formatCurrency(detailsWithdrawal.fee)}</span>
                                             </div>
                                             <div className="border-t pt-3">
                                                  <div className="flex justify-between items-center">
                                                       <span className="text-sm font-medium">Actual Amount to Transfer:</span>
                                                       <span className="text-xl font-bold text-green-600">{formatCurrency(detailsWithdrawal.actualAmount)}</span>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Bank Information */}
                                   <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Bank Information</h3>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
                                             <div className="flex items-center gap-2">
                                                  <CreditCard className="h-4 w-4 text-blue-600" />
                                                  <span className="font-medium text-blue-900 dark:text-blue-100">
                                                       {detailsWithdrawal.bankInfo.bankName}
                                                  </span>
                                             </div>
                                             <div className="ml-6 space-y-1 text-sm">
                                                  <div>
                                                       <span className="text-muted-foreground">Account Number: </span>
                                                       <span className="font-mono font-semibold">{detailsWithdrawal.bankInfo.accountNumber}</span>
                                                  </div>
                                                  <div>
                                                       <span className="text-muted-foreground">Account Holder: </span>
                                                       <span className="font-semibold">{detailsWithdrawal.bankInfo.accountHolder}</span>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Orders Information */}
                                   <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Orders Included ({detailsWithdrawal.orderIds.length})</h3>
                                        <div className="p-4 bg-muted rounded-lg">
                                             <div className="space-y-2">
                                                  {detailsWithdrawal.orderIds.map((orderId, index) => (
                                                       <div key={orderId} className="flex items-center justify-between p-2 bg-background rounded border">
                                                            <div className="flex items-center gap-2">
                                                                 <span className="text-xs font-medium text-muted-foreground">Order {index + 1}:</span>
                                                                 <span className="text-sm font-mono">{orderId}</span>
                                                            </div>
                                                            <Button
                                                                 variant="ghost"
                                                                 size="sm"
                                                                 className="h-7 text-xs"
                                                                 onClick={() => {
                                                                      navigator.clipboard.writeText(orderId);
                                                                      toast.success('Order ID copied to clipboard');
                                                                 }}
                                                            >
                                                                 Copy
                                                            </Button>
                                                       </div>
                                                  ))}
                                             </div>
                                        </div>
                                   </div>

                                   {/* Note */}
                                   {detailsWithdrawal.note && (
                                        <div className="space-y-4">
                                             <h3 className="font-semibold text-lg">Seller's Note</h3>
                                             <div className="p-4 bg-muted rounded-lg">
                                                  <p className="text-sm">{detailsWithdrawal.note}</p>
                                             </div>
                                        </div>
                                   )}

                                   {/* Admin Response */}
                                   {detailsWithdrawal.adminResponse && (
                                        <div className="space-y-4">
                                             <h3 className="font-semibold text-lg">Admin Response</h3>
                                             <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                  <p className="text-sm text-blue-900 dark:text-blue-100">{detailsWithdrawal.adminResponse}</p>
                                             </div>
                                        </div>
                                   )}

                                   {/* Payment Proof */}
                                   {detailsWithdrawal.paymentProofImageUrl && detailsWithdrawal.paymentProofImageUrl.length > 0 && (
                                        <div className="space-y-4">
                                             <h3 className="font-semibold text-lg">Payment Proof</h3>
                                             <div className="flex items-center gap-4">
                                                  <div className="relative group">
                                                       <img
                                                            src={getImageUrl(detailsWithdrawal.paymentProofImageUrl[0])}
                                                            alt="Payment Proof Thumbnail"
                                                            className="h-32 w-32 object-cover rounded-md border cursor-pointer"
                                                            onClick={() => handleViewImage(detailsWithdrawal.paymentProofImageUrl![0])}
                                                       />
                                                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center cursor-pointer"
                                                            onClick={() => handleViewImage(detailsWithdrawal.paymentProofImageUrl![0])}
                                                       >
                                                            <Eye className="h-8 w-8 text-white" />
                                                       </div>
                                                  </div>
                                                  <Button
                                                       variant="outline"
                                                       onClick={() => handleViewImage(detailsWithdrawal.paymentProofImageUrl![0])}
                                                  >
                                                       <ImageIcon className="h-4 w-4 mr-2" />
                                                       View Full Image
                                                  </Button>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         )}

                         <DialogFooter>
                              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                                   Close
                              </Button>
                              {detailsWithdrawal?.status === "pending" && (
                                   <>
                                        <Button
                                             variant="default"
                                             className="bg-green-600 hover:bg-green-700"
                                             onClick={() => {
                                                  setDetailsDialogOpen(false);
                                                  handleOpenActionDialog(detailsWithdrawal, "approved");
                                             }}
                                        >
                                             <CheckCircle className="mr-2 h-4 w-4" />
                                             Approve
                                        </Button>
                                        <Button
                                             variant="destructive"
                                             onClick={() => {
                                                  setDetailsDialogOpen(false);
                                                  handleOpenActionDialog(detailsWithdrawal, "rejected");
                                             }}
                                        >
                                             <XCircle className="mr-2 h-4 w-4" />
                                             Reject
                                        </Button>
                                   </>
                              )}
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     );
}
