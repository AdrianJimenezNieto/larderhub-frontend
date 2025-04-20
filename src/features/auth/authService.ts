import { apiClient } from '../../lib/axiosClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types/auth';

// el backend devuelve un objeto user anidado desde el fix del contrato
interface BackendAuthResponse {
  token: string;
  username: string;
  email: string;
  user?: { id: number; name: string; email: string; avatarUrl?: string | null };
}

function toAuthResponse(raw: BackendAuthResponse): AuthResponse {
  return {
    token: raw.token,
    user: raw.user ?? { id: 0, name: raw.username, email: raw.email },
  };
}

export const login = (data: LoginRequest): Promise<AuthResponse> =>
  apiClient.post<BackendAuthResponse>('/api/auth/login', data).then((r) => toAuthResponse(r.data));

export const register = (data: RegisterRequest): Promise<AuthResponse> =>
  apiClient.post<BackendAuthResponse>('/api/auth/register', data).then((r) => toAuthResponse(r.data));
