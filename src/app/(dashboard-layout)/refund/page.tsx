"use client";

import React, { useState, useEffect } from 'react';
import { reportService } from '@/services/report.service';
import { Report, ReportStatus } from '@/types/report';
import { Checkbox } from '@/components/ui/checkbox';
import {
     Card,
     CardContent,
     CardDescription,
     CardHeader,
     CardTitle,
} from '@/components/ui/card';
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from '@/components/ui/dialog';
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, AlertCircle, Loader2, MoreVertical, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

type ActionType = 'approved' | 'rejected' | 'need_more_info' | null;

export default function RefundPage() {
     const [reports, setReports] = useState<Report[]>([]);
     const [loading, setLoading] = useState(false);
     const [activeTab, setActiveTab] = useState<'all' | ReportStatus>('all');
     const [selectedReport, setSelectedReport] = useState<Report | null>(null);
     const [actionType, setActionType] = useState<ActionType>(null);
     const [adminResponse, setAdminResponse] = useState('');
     const [isDialogOpen, setIsDialogOpen] = useState(false);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [selectedImage, setSelectedImage] = useState<string | null>(null);
     const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
     const [blockProduct, setBlockProduct] = useState(false);

     const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

     useEffect(() => {
          fetchReports();
     }, [activeTab]);

     const fetchReports = async () => {
          try {
               setLoading(true);
               let data: Report[];

               if (activeTab === 'all') {
                    data = await reportService.getAllReports();
               } else {
                    data = await reportService.getReportsByStatus(activeTab);
               }

               setReports(data);
          } catch (error) {
               console.error('Error fetching reports:', error);
               toast.error('Failed to fetch reports');
          } finally {
               setLoading(false);
          }
     };

     const handleActionClick = (report: Report, action: ActionType) => {
          setSelectedReport(report);
          setActionType(action);
          setAdminResponse('');
          setBlockProduct(false);
          setIsDialogOpen(true);
     };

     const handleViewImage = (imagePath: string) => {
          setSelectedImage(`${baseUrl}${imagePath}`);
          setIsImageDialogOpen(true);
     };

     const handleConfirmAction = async () => {
          if (!selectedReport || !actionType) return;

          if (!adminResponse.trim()) {
               toast.error('Please provide an admin response');
               return;
          }

          try {
               setIsSubmitting(true);

               let result;
               switch (actionType) {
                    case 'approved':
                         result = await reportService.approveReport(selectedReport.id, adminResponse, blockProduct);
                         if (blockProduct) {
                              toast.success('Report approved successfully. Refund processed and product blocked.');
                         } else {
                              toast.success('Report approved successfully. Refund processed for buyer.');
                         }
                         break;
                    case 'rejected':
                         result = await reportService.rejectReport(selectedReport.id, adminResponse);
                         toast.success('Report rejected successfully. Order restored to seller.');
                         break;
                    case 'need_more_info':
                         result = await reportService.requestMoreInfo(selectedReport.id, adminResponse);
                         toast.success('Additional information requested from reporter.');
                         break;
               }

               setIsDialogOpen(false);
               setAdminResponse('');
               setSelectedReport(null);
               setActionType(null);
               fetchReports();
          } catch (error: any) {
               console.error('Error performing action:', error);
               toast.error(error.response?.data?.message || 'Failed to perform action');
          } finally {
               setIsSubmitting(false);
          }
     };

     const getStatusBadge = (status: ReportStatus) => {
          const variants: Record<ReportStatus, { variant: any; label: string; icon: React.ReactNode }> = {
               pending: {
                    variant: 'default',
                    label: 'Pending',
                    icon: <AlertCircle className="h-3 w-3" />,
               },
               approved: {
                    variant: 'default',
                    label: 'Approved',
                    icon: <CheckCircle className="h-3 w-3" />,
               },
               rejected: {
                    variant: 'destructive',
                    label: 'Rejected',
                    icon: <XCircle className="h-3 w-3" />,
               },
               need_more_info: {
                    variant: 'secondary',
                    label: 'Need More Info',
                    icon: <AlertCircle className="h-3 w-3" />,
               },
          };

          const { variant, label, icon } = variants[status];

          return (
               <Badge variant={variant} className="flex items-center gap-1">
                    {icon}
                    {label}
               </Badge>
          );
     };

     const getActionTitle = (action: ActionType) => {
          switch (action) {
               case 'approved':
                    return 'Approve Report';
               case 'rejected':
                    return 'Reject Report';
               case 'need_more_info':
                    return 'Request More Information';
               default:
                    return 'Confirm Action';
          }
     };

     const getActionDescription = (action: ActionType) => {
          switch (action) {
               case 'approved':
                    return 'This action will process a refund to the buyer. Please provide your verification notes.';
               case 'rejected':
                    return 'This action will restore the order to the seller. Please explain why the report is invalid.';
               case 'need_more_info':
                    return 'Request additional evidence from the reporter. Please specify what information is needed.';
               default:
                    return '';
          }
     };

     const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleString('en-US', {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit',
          });
     };

     return (
          <div className="flex flex-1 flex-col">
               <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                         <div className="flex items-center justify-between mb-4">
                              <div>
                                   <h1 className="text-3xl font-bold">Refund Management</h1>
                                   <p className="text-muted-foreground mt-1">
                                        Manage and review refund reports from buyers
                                   </p>
                              </div>
                         </div>

                         <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                              <TabsList>
                                   <TabsTrigger value="all">All Reports</TabsTrigger>
                                   <TabsTrigger value="pending">Pending</TabsTrigger>
                                   <TabsTrigger value="approved">Approved</TabsTrigger>
                                   <TabsTrigger value="rejected">Rejected</TabsTrigger>
                                   <TabsTrigger value="need_more_info">Need More Info</TabsTrigger>
                              </TabsList>

                              <TabsContent value={activeTab} className="mt-4">
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>
                                                  {activeTab === 'all' ? 'All Reports' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports`}
                                             </CardTitle>
                                             <CardDescription>
                                                  {loading ? 'Loading...' : `Total: ${reports.length} report(s)`}
                                             </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <div className="flex justify-center items-center py-8">
                                                       <Loader2 className="h-8 w-8 animate-spin" />
                                                  </div>
                                             ) : reports.length === 0 ? (
                                                  <div className="text-center py-8 text-muted-foreground">
                                                       No reports found
                                                  </div>
                                             ) : (
                                                  <div className="overflow-x-auto">
                                                       <Table>
                                                            <TableHeader>
                                                                 <TableRow>
                                                                      <TableHead>Report ID</TableHead>
                                                                      <TableHead>Order ID</TableHead>
                                                                      <TableHead>Status</TableHead>
                                                                      <TableHead>Reason</TableHead>
                                                                      <TableHead>Created At</TableHead>
                                                                      <TableHead>Actions</TableHead>
                                                                 </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                 {reports.map((report) => (
                                                                      <TableRow key={report.id}>
                                                                           <TableCell className="font-mono text-xs">
                                                                                {report.id.substring(0, 8)}...
                                                                           </TableCell>
                                                                           <TableCell className="font-mono text-xs">
                                                                                {report.orderId.substring(0, 8)}...
                                                                           </TableCell>
                                                                           <TableCell>{getStatusBadge(report.status)}</TableCell>
                                                                           <TableCell className="max-w-xs truncate">
                                                                                {report.reason}
                                                                           </TableCell>
                                                                           <TableCell className="text-sm">
                                                                                {formatDate(report.createdAt)}
                                                                           </TableCell>
                                                                           <TableCell>
                                                                                <div className="flex gap-2">
                                                                                     {/* View Evidence Button */}
                                                                                     {report.evidence && report.evidence.length > 0 && (
                                                                                          <Button
                                                                                               size="sm"
                                                                                               variant="outline"
                                                                                               onClick={() => handleActionClick(report, null)}
                                                                                          >
                                                                                               <Eye className="h-4 w-4 mr-1" />
                                                                                               View ({report.evidence.length})
                                                                                          </Button>
                                                                                     )}

                                                                                     {report.status === 'pending' || report.status === 'need_more_info' ? (
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
                                                                                                         onClick={() => handleActionClick(report, 'approved')}
                                                                                                         className="cursor-pointer"
                                                                                                    >
                                                                                                         <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                                                         Approve Report
                                                                                                    </DropdownMenuItem>
                                                                                                    <DropdownMenuItem
                                                                                                         onClick={() => handleActionClick(report, 'rejected')}
                                                                                                         className="cursor-pointer"
                                                                                                    >
                                                                                                         <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                                                         Reject Report
                                                                                                    </DropdownMenuItem>
                                                                                                    <DropdownMenuItem
                                                                                                         onClick={() => handleActionClick(report, 'need_more_info')}
                                                                                                         className="cursor-pointer"
                                                                                                    >
                                                                                                         <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                                                                                                         Request More Info
                                                                                                    </DropdownMenuItem>
                                                                                               </DropdownMenuContent>
                                                                                          </DropdownMenu>
                                                                                     ) : (
                                                                                          <span className="text-sm text-muted-foreground">
                                                                                               {report.adminResponse || 'No response'}
                                                                                          </span>
                                                                                     )}
                                                                                </div>
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
                    </div>
               </div>

               {/* Confirmation Dialog */}
               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                         <DialogHeader>
                              <DialogTitle>{getActionTitle(actionType)}</DialogTitle>
                              <DialogDescription>{getActionDescription(actionType)}</DialogDescription>
                         </DialogHeader>

                         {selectedReport && (
                              <div className="grid gap-4 py-4">
                                   <div className="grid gap-2">
                                        <Label className="text-sm font-medium">Report Details</Label>
                                        <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                                             <p><span className="font-medium">Report ID:</span> {selectedReport.id}</p>
                                             <p><span className="font-medium">Order ID:</span> {selectedReport.orderId}</p>
                                             <p><span className="font-medium">Reason:</span> {selectedReport.reason}</p>
                                             <p><span className="font-medium">Status:</span> {selectedReport.status}</p>
                                        </div>
                                   </div>

                                   {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                                        <div className="grid gap-2">
                                             <Label className="text-sm font-medium">Evidence ({selectedReport.evidence.length})</Label>
                                             <div className="flex flex-wrap gap-2">
                                                  {selectedReport.evidence.map((img, idx) => (
                                                       <div
                                                            key={idx}
                                                            className="relative group cursor-pointer"
                                                            onClick={() => handleViewImage(img)}
                                                       >
                                                            <div className="relative w-20 h-20 rounded-md overflow-hidden border border-border hover:border-primary transition-colors">
                                                                 <Image
                                                                      src={`${baseUrl}${img}`}
                                                                      alt={`Evidence ${idx + 1}`}
                                                                      fill
                                                                      className="object-cover"
                                                                 />
                                                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                      <Eye className="h-6 w-6 text-white" />
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        </div>
                                   )}

                                   {actionType && (
                                        <>
                                             <div className="grid gap-2">
                                                  <Label htmlFor="adminResponse">Admin Response *</Label>
                                                  <textarea
                                                       id="adminResponse"
                                                       className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                       placeholder={
                                                            actionType === 'approved'
                                                                 ? 'Verified evidence. Product does not match description, preset files are corrupted. Refund processed for buyer.'
                                                                 : actionType === 'rejected'
                                                                      ? 'After reviewing evidence, product matches description. Report is invalid. Order restored to seller.'
                                                                      : 'Evidence is not clear enough. Please provide:\n- Detailed error screenshots\n- Video demo of preset not working\n- Log files if available'
                                                       }
                                                       value={adminResponse}
                                                       onChange={(e) => setAdminResponse(e.target.value)}
                                                  />
                                             </div>

                                             {actionType === 'approved' && (
                                                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                                                       <Checkbox
                                                            id="blockProduct"
                                                            checked={blockProduct}
                                                            onCheckedChange={(checked) => setBlockProduct(checked as boolean)}
                                                       />
                                                       <Label
                                                            htmlFor="blockProduct"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                       >
                                                            Block this product (Prevent future sales)
                                                       </Label>
                                                  </div>
                                             )}
                                        </>
                                   )}
                              </div>
                         )}

                         <DialogFooter>
                              <Button
                                   variant="outline"
                                   onClick={() => setIsDialogOpen(false)}
                                   disabled={isSubmitting}
                              >
                                   Cancel
                              </Button>
                              {actionType && (
                                   <Button
                                        onClick={handleConfirmAction}
                                        disabled={isSubmitting || !adminResponse.trim()}
                                   >
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Confirm {actionType === 'approved' ? 'Approval' : actionType === 'rejected' ? 'Rejection' : 'Request'}
                                   </Button>
                              )}
                         </DialogFooter>
                    </DialogContent>
               </Dialog>

               {/* Image Preview Dialog */}
               <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                    <DialogContent className="sm:max-w-[800px] p-0">
                         <div className="relative">
                              <Button
                                   size="icon"
                                   variant="ghost"
                                   className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
                                   onClick={() => setIsImageDialogOpen(false)}
                              >
                                   <X className="h-4 w-4" />
                              </Button>
                              {selectedImage && (
                                   <div className="relative w-full h-[600px]">
                                        <Image
                                             src={selectedImage}
                                             alt="Evidence"
                                             fill
                                             className="object-contain"
                                        />
                                   </div>
                              )}
                         </div>
                    </DialogContent>
               </Dialog>
          </div>
     );
}
