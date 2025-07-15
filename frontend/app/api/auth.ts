/**
 * Authentication API service
 */
import { API_CONFIG, ApiErrorHandler, makeApiRequest } from './api';
import { 
  UserLogin, 
  UserRegister, 
  TokenResponse, 
  GoogleAuthRequest, 
  User, 
  GoogleAuthUrl 
} from '../types/auth';

export class AuthService {
  private static readonly BASE_PATH = '/auth';

  /**
   * Register a new user
   */
  static async register(userData: UserRegister): Promise<TokenResponse> {
    try {
      const response = await makeApiRequest<TokenResponse>(
        `${this.BASE_PATH}/register`,
        'POST',
        userData
      );
      return response.data;
    } catch (error: any) {
      throw new ApiErrorHandler(
        'Registration failed. Please try again.',
        error.status || 500,
        'REGISTRATION_ERROR',
        error
      );
    }
  }

  /**
   * Login user with phone number and password
   */
  static async login(credentials: UserLogin): Promise<TokenResponse> {
    try {
      const response = await makeApiRequest<TokenResponse>(
        `${this.BASE_PATH}/login`,
        'POST',
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw new ApiErrorHandler(
        'Login failed. Please check your credentials.',
        error.status || 500,
        'LOGIN_ERROR',
        error
      );
    }
  }

  /**
   * Get Google OAuth authorization URL
   */
  static async getGoogleAuthUrl(): Promise<GoogleAuthUrl> {
    try {
      const response = await makeApiRequest<GoogleAuthUrl>(
        `${this.BASE_PATH}/google/url`,
        'GET'
      );
      return response.data;
    } catch (error: any) {
      throw new ApiErrorHandler(
        'Failed to get Google authorization URL.',
        error.status || 500,
        'GOOGLE_AUTH_URL_ERROR',
        error
      );
    }
  }

  /**
   * Handle Google OAuth callback
   */
  static async googleAuthCallback(authData: GoogleAuthRequest): Promise<TokenResponse> {
    try {
      const response = await makeApiRequest<TokenResponse>(
        `${this.BASE_PATH}/google/callback`,
        'POST',
        authData
      );
      return response.data;
    } catch (error: any) {
      throw new ApiErrorHandler(
        'Google authentication failed.',
        error.status || 500,
        'GOOGLE_AUTH_ERROR',
        error
      );
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await makeApiRequest<User>(
        `${this.BASE_PATH}/me`,
        'GET',
        undefined,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      throw new ApiErrorHandler(
        'Failed to get user information.',
        error.status || 500,
        'GET_USER_ERROR',
        error
      );
    }
  }
}
