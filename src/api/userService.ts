import { api } from './client';
import type { AuthResponse, User } from '@/types';

/**
 * User Service integration layer.
 * Endpoints (expected on the API gateway):
 *   POST /api/users/register  -> { token, user }
 *   POST /api/users/login     -> { token, user }
 *   GET  /api/users/me        -> user profile
 */
export const userService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/users/register', {
      name,
      email,
      password,
    });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/users/login', {
      email,
      password,
    });
    return data;
  },

  async getProfile(): Promise<Omit<User, 'token'>> {
    const { data } = await api.get<Omit<User, 'token'>>('/api/users/me');
    return data;
  },
};
