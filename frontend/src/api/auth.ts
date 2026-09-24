import axios from 'axios';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Global Axios request interceptor to attach JWT token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('petsafe_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

export const registerApi = async (data: RegisterPayload): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>('/api/auth/register', data);
  return response.data;
};

export const fetchMeApi = async (): Promise<UserDto> => {
  const response = await axios.get<UserDto>('/api/auth/me');
  return response.data;
};
