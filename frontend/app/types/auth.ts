/**
 * Authentication-related TypeScript types
 */

export interface UserLogin {
  phone_number: string;
  password?: string;
}

export interface UserRegister {
  phone_number: string;
  email?: string;
  full_name: string;
  password?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: number;
  role: string;
}

export interface GoogleAuthRequest {
  code: string;
}

export interface User {
  id: number;
  phone_number: string;
  email?: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  is_active: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  establishment_id?: number;
}

export interface GoogleAuthUrl {
  auth_url: string;
}
