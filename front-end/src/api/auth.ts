import { User } from '../types';
import { api } from './api';

export const updateUserProfile = async (userId: number, userData: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
}; 