/**
 * Storage utility for handling authentication tokens and user data
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenResponse, User } from '../types/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@auth_access_token',
  USER_DATA: '@auth_user_data',
  TOKEN_EXPIRY: '@auth_token_expiry',
} as const;

export class AuthStorage {
  /**
   * Store authentication data
   */
  static async storeAuthData(tokenResponse: TokenResponse): Promise<void> {
    try {
      const expiryTime = new Date(Date.now() + tokenResponse.expires_in * 1000);
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toISOString()),
      ]);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Get stored access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // Check if token is expired
      if (token) {
        const expiry = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
        if (expiry && new Date(expiry) <= new Date()) {
          // Token is expired, remove it
          await this.clearAuthData();
          return null;
        }
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Store user data
   */
  static async storeUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  /**
   * Get stored user data
   */
  static async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  /**
   * Clear all authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }
}
