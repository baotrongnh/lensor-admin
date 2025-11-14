'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Admin } from '@/types/auth';

interface AuthContextType {
     user: Admin | null;
     isLoading: boolean;
     logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
     user: null,
     isLoading: true,
     logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
     const [user, setUser] = useState<Admin | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const router = useRouter();
     const pathname = usePathname();

     useEffect(() => {
          const storedUser = authService.getStoredUser();
          const isAuthenticated = authService.isAuthenticated();

          setUser(storedUser);
          setIsLoading(false);

          const isLoginPage = pathname === '/';
          const isProtectedRoute = pathname.startsWith('/dashboard') ||
               pathname.startsWith('/user') ||
               pathname.startsWith('/post') ||
               pathname.startsWith('/marketplace');

          if (!isAuthenticated && isProtectedRoute) {
               router.push('/');
          } else if (isAuthenticated && isLoginPage) {
               router.push('/dashboard');
          }
     }, [pathname, router]);

     const logout = () => {
          authService.logout();
          setUser(null);
     };

     return (
          <AuthContext.Provider value={{ user, isLoading, logout }}>
               {children}
          </AuthContext.Provider>
     );
}

export const useAuth = () => useContext(AuthContext);
