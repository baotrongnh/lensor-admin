"use client";

import { useEffect, useState } from "react";
import { withdrawalService } from "@/services/withdrawal.service";
import { Withdrawal } from "@/types/withdrawal";
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
import { CheckCircle, XCircle, Clock, CreditCard, Calendar, DollarSign, MoreVertical, Eye, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function WithdrawalManagementPage() {
     const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
     const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
     const [loading, setLoading] = useState(false);
     const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
     const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
     const [actionDialogOpen, setActionDialogOpen] = useState(false);
     const [actionType, setActionType] = useState<"approved" | "rejected">("approved");
     const [adminResponse, setAdminResponse] = useState("");
     const [paymentProof, setPaymentProof] = useState<File | null>(null);
     const [processing, setProcessing] = useState(false);
     const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
     const [previewImageUrl, setPreviewImageUrl] = useState<string>("");

     useEffect(() => {
          fetchWithdrawals();
     }, []);

     useEffect(() => {
          filterWithdrawals();
     }, [activeTab, withdrawals]);

     const fetchWithdrawals = async () => {
          try {
               setLoading(true);
               const response = await withdrawalService.getAllWithdrawals();
               setWithdrawals(response.data);
          } catch (error: any) {
               console.error("Error fetching withdrawals:", error);
               toast.error(error.message || "Failed to fetch withdrawals");
          } finally {
               setLoading(false);
          }
     };

     const filterWithdrawals = () => {
          if (activeTab === "all") {
               setFilteredWithdrawals(withdrawals);
          } else {
               setFilteredWithdrawals(withdrawals.filter((w) => w.status === activeTab));
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
          } catch (error: any) {
               console.error("Error processing withdrawal:", error);
               toast.error(error.response?.data?.message || "Failed to process withdrawal");
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

     const getImageUrl = (imagePath: string) => {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://14.169.52.232:3005';
          return `${baseUrl}${imagePath}`;
     };

     const handleViewImage = (imageUrl: string) => {
          setPreviewImageUrl(getImageUrl(imageUrl));
          setImagePreviewOpen(true);
     };

     const getStatusBadge = (status: string) => {
          const config: Record<string, { variant: any; label: string; icon: React.ReactNode; className?: string }> = {
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
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                         </CardContent>
                    </Card>
               </div>

               {/* Withdrawals Table */}
               <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList>
                         <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                         <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                         <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                         <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
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
                                                            <TableHead>Fee (17%)</TableHead>
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
                                                                      -{formatCurrency(withdrawal.fee)}
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
                                                                                     onClick={() => {
                                                                                          // View details logic if needed
                                                                                     }}
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
          </div>
     );
}
