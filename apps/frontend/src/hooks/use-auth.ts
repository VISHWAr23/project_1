'use client';

import { useState, useEffect } from 'react';
import { UserSession, authService } from '@/services/auth-service';

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ims_user');
    const token = localStorage.getItem('ims_access_token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('ims_user');
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}
