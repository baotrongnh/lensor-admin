"use client";

import React, { useState, useEffect } from 'react';
import { ticketService } from '@/services/ticket.service';
import { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';
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
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, MessageSquare, Eye, X, FileIcon, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

export default function SupportTicketsPage() {
     const [tickets, setTickets] = useState<Ticket[]>([]);
     const [loading, setLoading] = useState(false);
     const [activeTab, setActiveTab] = useState<'all' | TicketStatus>('all');
     const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
     const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
     const [replyMessage, setReplyMessage] = useState('');
     const [isReplying, setIsReplying] = useState(false);
     const [selectedImage, setSelectedImage] = useState<string | null>(null);
     const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
     const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
     const [editingTicket, setEditingTicket] = useState<{ priority: TicketPriority; status: TicketStatus } | null>(null);

     const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

     useEffect(() => {
          fetchTickets();
     }, [activeTab]);

     const fetchTickets = async () => {
          try {
               setLoading(true);
               const filters = activeTab !== 'all' ? { status: activeTab } : undefined;
               const data = await ticketService.getAllTickets(filters);
               setTickets(data);
          } catch (error) {
               console.error('Error fetching tickets:', error);
               toast.error('Failed to fetch tickets');
          } finally {
               setLoading(false);
          }
     };

     const handleViewTicket = async (ticket: Ticket) => {
          try {
               const fullTicket = await ticketService.getTicketById(ticket.id);
               setSelectedTicket(fullTicket);
               setEditingTicket({ priority: fullTicket.priority, status: fullTicket.status });
               setIsDetailDialogOpen(true);
          } catch (error) {
               console.error('Error fetching ticket details:', error);
               toast.error('Failed to load ticket details');
          }
     };

     const handleSendReply = async () => {
          if (!selectedTicket || !replyMessage.trim()) {
               toast.error('Please enter a message');
               return;
          }

          try {
               setIsReplying(true);
               await ticketService.addAdminReply(
                    selectedTicket.id,
                    replyMessage,
                    replyAttachments.length > 0 ? replyAttachments : undefined
               );

               toast.success('Reply sent successfully');
               setReplyMessage('');
               setReplyAttachments([]);

               // Refresh ticket details
               const updatedTicket = await ticketService.getTicketById(selectedTicket.id);
               setSelectedTicket(updatedTicket);
          } catch (error: any) {
               console.error('Error sending reply:', error);
               toast.error(error.response?.data?.message || 'Failed to send reply');
          } finally {
               setIsReplying(false);
          }
     };

     const handleUpdateTicket = async () => {
          if (!selectedTicket || !editingTicket) return;

          try {
               await ticketService.updateTicket(selectedTicket.id, {
                    priority: editingTicket.priority,
                    status: editingTicket.status,
               });

               toast.success('Ticket updated successfully');
               fetchTickets();

               const updatedTicket = await ticketService.getTicketById(selectedTicket.id);
               setSelectedTicket(updatedTicket);
          } catch (error: any) {
               console.error('Error updating ticket:', error);
               toast.error(error.response?.data?.message || 'Failed to update ticket');
          }
     };

     const handleCloseTicket = async (ticketId: string) => {
          try {
               await ticketService.closeTicket(ticketId);
               toast.success('Ticket closed successfully');
               fetchTickets();
               if (selectedTicket?.id === ticketId) {
                    const updatedTicket = await ticketService.getTicketById(ticketId);
                    setSelectedTicket(updatedTicket);
               }
          } catch (error: any) {
               console.error('Error closing ticket:', error);
               toast.error(error.response?.data?.message || 'Failed to close ticket');
          }
     };

     const handleReopenTicket = async (ticketId: string) => {
          try {
               await ticketService.reopenTicket(ticketId);
               toast.success('Ticket reopened successfully');
               fetchTickets();
               if (selectedTicket?.id === ticketId) {
                    const updatedTicket = await ticketService.getTicketById(ticketId);
                    setSelectedTicket(updatedTicket);
               }
          } catch (error: any) {
               console.error('Error reopening ticket:', error);
               toast.error(error.response?.data?.message || 'Failed to reopen ticket');
          }
     };

     const handleViewImage = (imagePath: string) => {
          setSelectedImage(`${baseUrl}${imagePath}`);
          setIsImageDialogOpen(true);
     };

     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(e.target.files || []);
          if (replyAttachments.length + files.length > 5) {
               toast.error('Maximum 5 files allowed');
               return;
          }
          setReplyAttachments([...replyAttachments, ...files]);
     };

     const removeFile = (index: number) => {
          setReplyAttachments(replyAttachments.filter((_, i) => i !== index));
     };

     const getStatusBadge = (status: TicketStatus) => {
          const variants: Record<TicketStatus, { className: string; label: string }> = {
               open: { className: 'bg-blue-500 hover:bg-blue-600', label: 'Open' },
               in_progress: { className: 'bg-yellow-500 hover:bg-yellow-600', label: 'In Progress' },
               resolved: { className: 'bg-green-500 hover:bg-green-600', label: 'Resolved' },
               closed: { className: 'bg-gray-500 hover:bg-gray-600', label: 'Closed' },
          };

          const { className, label } = variants[status];
          return <Badge className={`${className} text-white`}>{label}</Badge>;
     };

     const getPriorityBadge = (priority: TicketPriority) => {
          const variants: Record<TicketPriority, { className: string; label: string }> = {
               low: { className: 'bg-gray-500', label: 'Low' },
               medium: { className: 'bg-blue-500', label: 'Medium' },
               high: { className: 'bg-orange-500', label: 'High' },
               urgent: { className: 'bg-red-500', label: 'Urgent' },
          };

          const { className, label } = variants[priority];
          return <Badge className={className}>{label}</Badge>;
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
                                   <h1 className="text-3xl font-bold">Support Tickets</h1>
                                   <p className="text-muted-foreground mt-1">
                                        Manage and respond to customer support requests
                                   </p>
                              </div>
                         </div>

                         <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                              <TabsList>
                                   <TabsTrigger value="all">All Tickets</TabsTrigger>
                                   <TabsTrigger value="open">Open</TabsTrigger>
                                   <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                                   <TabsTrigger value="resolved">Resolved</TabsTrigger>
                                   <TabsTrigger value="closed">Closed</TabsTrigger>
                              </TabsList>

                              <TabsContent value={activeTab} className="mt-4">
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>
                                                  {activeTab === 'all' ? 'All Tickets' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')} Tickets`}
                                             </CardTitle>
                                             <CardDescription>
                                                  {loading ? 'Loading...' : `Total: ${tickets.length} ticket(s)`}
                                             </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             {loading ? (
                                                  <div className="flex justify-center items-center py-8">
                                                       <Loader2 className="h-8 w-8 animate-spin" />
                                                  </div>
                                             ) : tickets.length === 0 ? (
                                                  <div className="text-center py-8 text-muted-foreground">
                                                       No tickets found
                                                  </div>
                                             ) : (
                                                  <div className="overflow-x-auto">
                                                       <Table>
                                                            <TableHeader>
                                                                 <TableRow>
                                                                      <TableHead>Ticket ID</TableHead>
                                                                      <TableHead>User</TableHead>
                                                                      <TableHead>Title</TableHead>
                                                                      <TableHead>Category</TableHead>
                                                                      <TableHead>Priority</TableHead>
                                                                      <TableHead>Status</TableHead>
                                                                      <TableHead>Created</TableHead>
                                                                      <TableHead>Actions</TableHead>
                                                                 </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                 {tickets.map((ticket) => (
                                                                      <TableRow key={ticket.id}>
                                                                           <TableCell className="font-mono text-xs">
                                                                                {ticket.id.substring(0, 8)}...
                                                                           </TableCell>
                                                                           <TableCell>{ticket.userName}</TableCell>
                                                                           <TableCell className="max-w-xs truncate font-medium">
                                                                                {ticket.title}
                                                                           </TableCell>
                                                                           <TableCell>{ticket.category}</TableCell>
                                                                           <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                                                           <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                                                           <TableCell className="text-sm">
                                                                                {formatDate(ticket.createdAt)}
                                                                           </TableCell>
                                                                           <TableCell>
                                                                                <div className="flex gap-2">
                                                                                     <Button
                                                                                          size="sm"
                                                                                          variant="outline"
                                                                                          onClick={() => handleViewTicket(ticket)}
                                                                                     >
                                                                                          <Eye className="h-4 w-4 mr-1" />
                                                                                          View
                                                                                     </Button>
                                                                                     {ticket.status !== 'closed' ? (
                                                                                          <Button
                                                                                               size="sm"
                                                                                               variant="outline"
                                                                                               onClick={() => handleCloseTicket(ticket.id)}
                                                                                          >
                                                                                               Close
                                                                                          </Button>
                                                                                     ) : (
                                                                                          <Button
                                                                                               size="sm"
                                                                                               variant="outline"
                                                                                               onClick={() => handleReopenTicket(ticket.id)}
                                                                                          >
                                                                                               Reopen
                                                                                          </Button>
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

               {/* Ticket Detail Dialog */}
               <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                    <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                   <MessageSquare className="h-5 w-5" />
                                   Ticket Details
                              </DialogTitle>
                              <DialogDescription>View and respond to support ticket</DialogDescription>
                         </DialogHeader>

                         {selectedTicket && (
                              <div className="space-y-4">
                                   {/* Ticket Info */}
                                   <Card>
                                        <CardHeader>
                                             <CardTitle className="text-lg">{selectedTicket.title}</CardTitle>
                                             <CardDescription>
                                                  <div className="flex items-center gap-2 mt-2">
                                                       <span className="font-mono text-xs">{selectedTicket.id}</span>
                                                       <span>•</span>
                                                       <span>by {selectedTicket.userName}</span>
                                                       <span>•</span>
                                                       <span>{formatDate(selectedTicket.createdAt)}</span>
                                                  </div>
                                             </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                       <Label>Priority</Label>
                                                       <Select
                                                            value={editingTicket?.priority}
                                                            onValueChange={(val) => setEditingTicket(prev => prev ? { ...prev, priority: val as TicketPriority } : null)}
                                                       >
                                                            <SelectTrigger>
                                                                 <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                 <SelectItem value="low">Low</SelectItem>
                                                                 <SelectItem value="medium">Medium</SelectItem>
                                                                 <SelectItem value="high">High</SelectItem>
                                                                 <SelectItem value="urgent">Urgent</SelectItem>
                                                            </SelectContent>
                                                       </Select>
                                                  </div>
                                                  <div className="space-y-2">
                                                       <Label>Status</Label>
                                                       <Select
                                                            value={editingTicket?.status}
                                                            onValueChange={(val) => setEditingTicket(prev => prev ? { ...prev, status: val as TicketStatus } : null)}
                                                       >
                                                            <SelectTrigger>
                                                                 <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                 <SelectItem value="open">Open</SelectItem>
                                                                 <SelectItem value="in_progress">In Progress</SelectItem>
                                                                 <SelectItem value="resolved">Resolved</SelectItem>
                                                                 <SelectItem value="closed">Closed</SelectItem>
                                                            </SelectContent>
                                                       </Select>
                                                  </div>
                                             </div>
                                             {(editingTicket?.priority !== selectedTicket.priority || editingTicket?.status !== selectedTicket.status) && (
                                                  <Button size="sm" onClick={handleUpdateTicket}>
                                                       Save Changes
                                                  </Button>
                                             )}
                                             <div>
                                                  <Label>Category</Label>
                                                  <p className="text-sm mt-1">{selectedTicket.category}</p>
                                             </div>
                                             <div>
                                                  <Label>Description</Label>
                                                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
                                             </div>
                                             {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                                  <div>
                                                       <Label>Attachments</Label>
                                                       <div className="flex flex-wrap gap-2 mt-2">
                                                            {selectedTicket.attachments.map((img, idx) => (
                                                                 <div
                                                                      key={idx}
                                                                      className="relative group cursor-pointer"
                                                                      onClick={() => handleViewImage(img)}
                                                                 >
                                                                      <div className="relative w-20 h-20 rounded-md overflow-hidden border border-border hover:border-primary transition-colors">
                                                                           <Image
                                                                                src={`${baseUrl}${img}`}
                                                                                alt={`Attachment ${idx + 1}`}
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
                                        </CardContent>
                                   </Card>

                                   {/* Messages */}
                                   {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                                        <div className="space-y-3">
                                             <Label>Conversation</Label>
                                             {selectedTicket.messages.map((msg) => (
                                                  <Card key={msg.id} className={msg.senderRole === 'admin' ? 'bg-blue-50 dark:bg-blue-950' : ''}>
                                                       <CardContent className="p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                 <div>
                                                                      <p className="font-medium text-sm">{msg.senderName}</p>
                                                                      <p className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</p>
                                                                 </div>
                                                                 <Badge variant={msg.senderRole === 'admin' ? 'default' : 'secondary'}>
                                                                      {msg.senderRole === 'admin' ? 'Admin' : 'User'}
                                                                 </Badge>
                                                            </div>
                                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                            {msg.attachments && msg.attachments.length > 0 && (
                                                                 <div className="flex flex-wrap gap-2 mt-3">
                                                                      {msg.attachments.map((img, idx) => (
                                                                           <div
                                                                                key={idx}
                                                                                className="relative group cursor-pointer"
                                                                                onClick={() => handleViewImage(img)}
                                                                           >
                                                                                <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                                                                                     <Image
                                                                                          src={`${baseUrl}${img}`}
                                                                                          alt={`Attachment ${idx + 1}`}
                                                                                          fill
                                                                                          className="object-cover"
                                                                                     />
                                                                                </div>
                                                                           </div>
                                                                      ))}
                                                                 </div>
                                                            )}
                                                       </CardContent>
                                                  </Card>
                                             ))}
                                        </div>
                                   )}

                                   {/* Reply Section */}
                                   {selectedTicket.status !== 'closed' && (
                                        <div className="space-y-3">
                                             <Label>Send Reply</Label>
                                             <textarea
                                                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                  placeholder="Type your response here..."
                                                  value={replyMessage}
                                                  onChange={(e) => setReplyMessage(e.target.value)}
                                             />
                                             <div className="flex items-center gap-2">
                                                  <Input
                                                       type="file"
                                                       id="reply-file-upload"
                                                       className="hidden"
                                                       multiple
                                                       accept="image/*,.pdf,.doc,.docx,.txt"
                                                       onChange={handleFileChange}
                                                       disabled={replyAttachments.length >= 5}
                                                  />
                                                  <Button
                                                       type="button"
                                                       variant="outline"
                                                       size="sm"
                                                       onClick={() => document.getElementById('reply-file-upload')?.click()}
                                                       disabled={replyAttachments.length >= 5}
                                                  >
                                                       <Upload className="h-4 w-4 mr-2" />
                                                       Attach Files
                                                  </Button>
                                                  <span className="text-sm text-muted-foreground">
                                                       {replyAttachments.length}/5 files
                                                  </span>
                                             </div>
                                             {replyAttachments.length > 0 && (
                                                  <div className="space-y-2">
                                                       {replyAttachments.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                                                 <div className="flex items-center gap-2">
                                                                      <FileIcon className="h-4 w-4" />
                                                                      <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                                                                 </div>
                                                                 <Button
                                                                      type="button"
                                                                      variant="ghost"
                                                                      size="sm"
                                                                      onClick={() => removeFile(index)}
                                                                 >
                                                                      <X className="h-4 w-4" />
                                                                 </Button>
                                                            </div>
                                                       ))}
                                                  </div>
                                             )}
                                             <Button onClick={handleSendReply} disabled={isReplying || !replyMessage.trim()}>
                                                  {isReplying ? (
                                                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                  ) : (
                                                       <Send className="mr-2 h-4 w-4" />
                                                  )}
                                                  Send Reply
                                             </Button>
                                        </div>
                                   )}
                              </div>
                         )}

                         <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                                   Close
                              </Button>
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
                                             alt="Attachment"
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
