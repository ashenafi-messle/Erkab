'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminUser, AdminRole } from '../lib/types/auth';
import { apiClient, setAuthToken, getAuthToken, ApiError } from '../lib/api/client';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  connectionError: string | null;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AdminUser | null>;
  isSuperAdmin: boolean;
  isSubAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-flight promise tracker to strictly prevent duplicate session requests
let inFlightSessionPromise: Promise<AdminUser | null> | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  // Default isLoading to true only for protected route guards, but unauthenticated routes do not block
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const initialCheckRef = useRef(false);

  const refreshUser = useCallback(async (): Promise<AdminUser | null> => {
    // If a request is already in flight, reuse the promise to prevent duplicate network calls
    if (inFlightSessionPromise) {
      return inFlightSessionPromise;
    }

    // If on login page and no stored token, immediately resolve unauthenticated state without network error
    const existingToken = getAuthToken();
    if (!existingToken && pathname === '/login') {
      setUser(null);
      setIsLoading(false);
      setConnectionError(null);
      return null;
    }

    inFlightSessionPromise = (async () => {
      try {
        setConnectionError(null);
        const response = await apiClient<{
          success?: boolean;
          user?: AdminUser;
          data?: { user: AdminUser };
        }>('/admin/auth/me');

        const userData = response?.data?.user || response?.user;
        if (userData) {
          // Normalize name/fullName
          const normalized: AdminUser = {
            ...userData,
            fullName: userData.fullName || (userData as any).name || userData.email,
          };
          setUser(normalized);
          setConnectionError(null);
          return normalized;
        }

        setUser(null);
        return null;
      } catch (err: any) {
        // If 401 Unauthorized or 403 Forbidden, user is simply not logged in
        if (err?.statusCode === 401 || err?.statusCode === 403) {
          setUser(null);
          setAuthToken(null);
          setConnectionError(null);
        } else {
          // Network or server connectivity issue
          setConnectionError(
            err?.message || 'Unable to connect to the central authentication service. Retrying in background...'
          );
        }
        return null;
      } finally {
        setIsLoading(false);
        inFlightSessionPromise = null;
      }
    })();

    return inFlightSessionPromise;
  }, [pathname]);

  useEffect(() => {
    // Avoid double initialization in React StrictMode
    if (initialCheckRef.current) return;
    initialCheckRef.current = true;
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<AdminUser> => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const response = await apiClient<{
        success?: boolean;
        message?: string;
        token?: string;
        user?: AdminUser;
        data?: { user: AdminUser; token: string };
      }>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const rawUser = response?.data?.user || response?.user;
      const rawToken = response?.data?.token || response?.token;

      if (!rawUser) {
        throw new Error('Authentication succeeded but received empty administrator profile.');
      }

      const loggedUser: AdminUser = {
        ...rawUser,
        fullName: rawUser.fullName || (rawUser as any).name || rawUser.email,
      };

      if (rawToken) {
        setAuthToken(rawToken);
      }

      setUser(loggedUser);
      setConnectionError(null);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient('/admin/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setAuthToken(null);
      setConnectionError(null);
      router.push('/login');
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isSubAdmin = user?.role === 'SUB_ADMIN';

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        connectionError,
        login,
        logout,
        refreshUser,
        isSuperAdmin,
        isSubAdmin,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
