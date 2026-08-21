import { User } from './user.model';

/**
 * Authentication login request payload.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Account registration request payload.
 */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

/**
 * Authentication response containing JWT token and authenticated user details.
 */
export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
