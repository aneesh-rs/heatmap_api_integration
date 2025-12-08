import axiosClient from '../apiClient';
import { User } from '../types';

export interface ApiUser {
  _id: string;
  id: string;
  email: string;
  role: string;
  name: string;
  firstSurname?: string;
  secondSurname?: string;
  birthday: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  photoURL?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  try {
    const res = await axiosClient.get<ApiUser[]>('/users');
    
    // Transform API response to match User interface
    const users: User[] = res.data.map((apiUser) => ({
      id: apiUser.id,
      role: apiUser.role as 'Admin' | 'User',
      email: apiUser.email,
      birthday: apiUser.birthday,
      name: apiUser.name,
      firstSurname: apiUser.firstSurname,
      secondSurname: apiUser.secondSurname,
      photoURL: apiUser.photoURL || '',
    }));
    
    return { success: true, data: users };
  } catch (error: unknown) {
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || 'Failed to fetch users' };
  }
};

export const deleteUser = async (userId: string): Promise<ApiResponse<object>> => {
  try {
    await axiosClient.delete(`/users/${userId}`);
    return { success: true, data: {} };
  } catch (error: unknown) {
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || 'Failed to delete user' };
  }
};

