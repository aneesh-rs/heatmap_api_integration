import axiosClient from '../apiClient';
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  birthday: string;
  invitationId: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Login function
export const login = async (
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await axiosClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    const { access_token, user } = response.data;

    // Store token and user data
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('Login failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return {
      success: false,
      error: apiError || errorMessage,
    };
  }
};

// Signup function
export const signUp = async (
  email: string,
  password: string,
  name: string = '',
  firstSurname: string = '',
  secondSurname: string = '',
  birthday: string = '',
  invitationId: string = ''
): Promise<ApiResponse<unknown>> => {
  try {
    const response = await axiosClient.post('/auth/signup', {
      email,
      password,
      name,
      firstSurname,
      secondSurname,
      birthday,
      invitationId,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('Signup failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Signup failed';
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return {
      success: false,
      error: apiError || errorMessage,
    };
  }
};

// Verify email function
export const verifyEmail = async (
  token: string
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await axiosClient.post<AuthResponse>(
      '/auth/verify-email',
      {
        token,
      }
    );

    const { access_token, user } = response.data;

    // Store token and user data
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('Email verification failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Email verification failed';
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return {
      success: false,
      error: apiError || errorMessage,
    };
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      return {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name || '',
        firstSurname: userData.firstSurname || '',
        secondSurname: userData.secondSurname || '',
        birthday: userData.birthday || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};
