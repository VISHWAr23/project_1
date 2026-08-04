import { apiClient } from './api-client';
import { LoginInput } from '@ims/validation';

export interface UserSession {
  id: string;
  email: string;
  role: string;
  employeeId?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: UserSession;
}

export const authService = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const data = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('ims_access_token', data.accessToken);
      localStorage.setItem('ims_user', JSON.stringify(data.user));
    }

    return data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ims_access_token');
      localStorage.removeItem('ims_user');
      window.location.href = '/login';
    }
  },

  getCurrentUser: async (): Promise<UserSession> => {
    return apiClient<UserSession>('/auth/me');
  },
};
