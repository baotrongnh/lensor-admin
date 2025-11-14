import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://14.169.52.232:3005';

export const apiClient = axios.create({
     baseURL: API_BASE_URL,
     timeout: 30000,
     headers: {
          'Content-Type': 'application/json',
     },
});

apiClient.interceptors.request.use(
     (config) => {
          if (typeof window !== 'undefined') {
               const token = localStorage.getItem('access_token');
               if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
               }
          }
          return config;
     },
     (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
     (response) => response,
     async (error: AxiosError) => {
          if (error.response?.status === 401) {
               if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('admin_user');
                    window.location.href = '/';
               }
          }
          return Promise.reject(error);
     }
);
