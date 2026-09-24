import axios from 'axios';
import { Pet } from './petsApi';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const fetchAdminUsersApi = async (): Promise<AdminUser[]> => {
  const response = await axios.get<AdminUser[]>('/api/admin/users');
  return response.data;
};

export const fetchAdminPetsApi = async (): Promise<Pet[]> => {
  const response = await axios.get<Pet[]>('/api/admin/pets');
  return response.data;
};
