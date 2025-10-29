/**
 * Authentication Service
 * Handles user authentication with the backend
 */

import { api } from '../api';

export interface User {
  id: string;
  email: string;
  full_name?: string;  // Backend uses full_name
  name?: string;  // Keep for backward compatibility
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type?: string;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  return api.get<User>('/auth/me');
}

/**
 * Mock login (since backend uses mock auth mode)
 * In production with Supabase, this would call the real auth endpoint
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  // Call backend login endpoint
  const tokenResp = await api.post<{ access_token: string; token_type: string }>(
    '/login',
    { email, password }
  );

  // Store token
  localStorage.setItem('auth_token', tokenResp.access_token);

  // Fetch current user info
  const user = await getCurrentUser();
  localStorage.setItem('user', JSON.stringify(user));

  return { user, access_token: tokenResp.access_token, token_type: tokenResp.token_type };
}

/**
 * Logout user
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  return !!(localStorage.getItem('auth_token') && localStorage.getItem('user'));
}

/**
 * Register a new user with the backend
 */
export async function register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
  const resp = await api.post<{ user: User; access_token: string; token_type: string }>(
    '/register',
    { email, password, full_name: fullName }
  );

  // Persist token and user
  localStorage.setItem('auth_token', resp.access_token);
  localStorage.setItem('user', JSON.stringify(resp.user));

  return { user: resp.user, access_token: resp.access_token, token_type: resp.token_type };
}
