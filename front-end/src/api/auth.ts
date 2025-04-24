import { User } from '../types';
import axiosInstance from './axios';

export const updateUserProfile = async (userId: number, userData: Partial<User>): Promise<User> => {
  const response = await axiosInstance.put(`/users/${userId}`, userData);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: any) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}; 