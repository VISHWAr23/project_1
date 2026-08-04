const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ims_access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ims_access_token');
      localStorage.removeItem('ims_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while communicating with the server');
  }

  return data as T;
}
