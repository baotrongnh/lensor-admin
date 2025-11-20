import { apiClient } from '@/lib/api-client';
import {
     Ticket,
     TicketsResponse,
     TicketResponse,
     MessageResponse,
     UpdateTicketPayload,
     TicketStatus,
     TicketPriority,
} from '@/types/ticket';

export const ticketService = {
     /**
      * Get all tickets (Admin)
      */
     async getAllTickets(filters?: { status?: TicketStatus; priority?: TicketPriority }): Promise<Ticket[]> {
          const params = new URLSearchParams();
          if (filters?.status) params.append('status', filters.status);
          if (filters?.priority) params.append('priority', filters.priority);

          const response = await apiClient.get<TicketsResponse>(
               `/admin/tickets${params.toString() ? `?${params.toString()}` : ''}`
          );
          return response.data.data;
     },

     /**
      * Get ticket by ID (Admin)
      */
     async getTicketById(ticketId: string): Promise<Ticket> {
          const response = await apiClient.get<TicketResponse>(`/admin/tickets/${ticketId}`);
          return response.data.data;
     },

     /**
      * Update ticket details (Admin)
      */
     async updateTicket(ticketId: string, payload: UpdateTicketPayload): Promise<Ticket> {
          const response = await apiClient.patch<TicketResponse>(`/admin/tickets/${ticketId}`, payload);
          return response.data.data;
     },

     /**
      * Add admin reply to ticket
      */
     async addAdminReply(ticketId: string, message: string, attachments?: File[]): Promise<any> {
          const formData = new FormData();
          formData.append('message', message);

          if (attachments && attachments.length > 0) {
               attachments.forEach((file) => {
                    formData.append('attachments', file);
               });
          }

          const response = await apiClient.post<MessageResponse>(
               `/admin/tickets/${ticketId}/messages`,
               formData,
               {
                    headers: {
                         'Content-Type': 'multipart/form-data',
                    },
               }
          );
          return response.data.data;
     },

     /**
      * Close ticket (Admin)
      */
     async closeTicket(ticketId: string): Promise<Ticket> {
          const response = await apiClient.patch<TicketResponse>(`/admin/tickets/${ticketId}/close`);
          return response.data.data;
     },

     /**
      * Reopen ticket (Admin)
      */
     async reopenTicket(ticketId: string): Promise<Ticket> {
          const response = await apiClient.patch<TicketResponse>(`/admin/tickets/${ticketId}/reopen`);
          return response.data.data;
     },
};
