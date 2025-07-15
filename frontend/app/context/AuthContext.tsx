/**
 * Authentication Context for managing user authentication state
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthStorage } from '../utils/authStorage';
import { AuthService } from '../api/auth';
import { User, TokenResponse } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password?: string) => Promise<void>;
  register: (userData: {
    full_name: string;
    phone_number: string;
    email?: string;
    password?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AuthStorage.getAccessToken();
      const userData = await AuthStorage.getUserData();

      if (token && userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phoneNumber: string, password?: string) => {
    try {
      const tokenResponse: TokenResponse = await AuthService.login({
        phone_number: phoneNumber,
        password,
      });

      // Store authentication data
      await AuthStorage.storeAuthData(tokenResponse);

      // Get and store user data
      const userData = await AuthService.getCurrentUser(tokenResponse.access_token);
      await AuthStorage.storeUserData(userData);

      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    full_name: string;
    phone_number: string;
    email?: string;
    password?: string;
  }) => {
    try {
      const tokenResponse: TokenResponse = await AuthService.register(userData);

      // Store authentication data
      await AuthStorage.storeAuthData(tokenResponse);

      // Get and store user data
      const userInfo = await AuthService.getCurrentUser(tokenResponse.access_token);
      await AuthStorage.storeUserData(userInfo);

      setUser(userInfo);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthStorage.clearAuthData();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const token = await AuthStorage.getAccessToken();
      if (token) {
        const userData = await AuthService.getCurrentUser(token);
        await AuthStorage.storeUserData(userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, logout the user
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
