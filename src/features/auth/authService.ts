import { apiClient } from '../../lib/axiosClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types/auth';

// POST /api/auth/login
export const login = (data: LoginRequest): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/login', data).then((r) => r.data);

// POST /api/auth/register
export const register = (data: RegisterRequest): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/register', data).then((r) => r.data);
