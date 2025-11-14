import { apiClient } from '@/lib/api-client';
import { LoginPayload, LoginResponse } from '@/types/auth';

export const authService = {
     async login(payload: LoginPayload): Promise<LoginResponse> {
          const response = await apiClient.post<LoginResponse>('/admin/login', payload);
          return response.data;
     },

     logout() {
          if (typeof window !== 'undefined') {
               localStorage.removeItem('access_token');
               localStorage.removeItem('refresh_token');
               localStorage.removeItem('admin_user');
               window.location.href = '/';
          }
     },

     getStoredUser() {
          if (typeof window !== 'undefined') {
               const userStr = localStorage.getItem('admin_user');
               return userStr ? JSON.parse(userStr) : null;
          }
          return null;
     },

     getStoredToken() {
          if (typeof window !== 'undefined') {
               return localStorage.getItem('access_token');
          }
          return null;
     },

     isAuthenticated() {
          return !!this.getStoredToken();
     },
};
