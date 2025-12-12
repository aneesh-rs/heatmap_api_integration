import axiosClient from '../apiClient';
import { Roles, User } from '../types';

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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
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

// API user profile shape
export interface ApiUserProfile {
  id: string;
  email: string;
  role: 'Admin' | 'User' | string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  birthday: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleLoginResponse {
  access_token: string;
  user: { id: string; email: string; role: Roles };
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

    const { access_token } = response.data;

    // Store token only
    localStorage.setItem('access_token', access_token);

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

    const { access_token } = response.data;

    // Store token only
    localStorage.setItem('access_token', access_token);

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

// Map API profile payload to app User
const mapProfileToUser = (p: ApiUserProfile): User => ({
  id: p.id,
  email: p.email,
  role: (p.role as 'Admin' | 'User') || 'User',
  name: p.name ?? '',
  firstSurname: p.firstSurname ?? '',
  secondSurname: p.secondSurname ?? '',
  birthday: p.birthday ?? '',
  photoURL: p.photoURL ?? undefined,
});

// Fetch current user profile from API
export const fetchUserProfile = async (): Promise<ApiResponse<User>> => {
  try {
    const res = await axiosClient.get<ApiUserProfile>('/users/profile');
    return { success: true, data: mapProfileToUser(res.data) };
  } catch (error: unknown) {
    console.error('Fetch profile failed:', error);
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || 'Unable to fetch profile' };
  }
};

// Update current user profile
export interface UpdateProfileRequest {
  email: string;
  name: string;
  firstSurname?: string;
  secondSurname?: string;
  birthday: string;
  photoURL: string;
}

export const updateUserProfile = async (
  payload: UpdateProfileRequest
): Promise<ApiResponse<User>> => {
  try {
    const res = await axiosClient.put<ApiUserProfile>(
      '/users/profile',
      payload
    );
    return { success: true, data: mapProfileToUser(res.data) };
  } catch (error: unknown) {
    console.error('Update profile failed:', error);
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || 'Unable to update profile' };
  }
};

// Deprecated: localStorage user
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

// Forgot password function
export const forgotPassword = async (
  email: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await axiosClient.post<{ message: string }>(
      '/auth/forgot-password',
      { email }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('Forgot password failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Forgot password failed';
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return {
      success: false,
      error: apiError || errorMessage,
    };
  }
};

// Reset password function
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await axiosClient.post<{ message: string }>(
      '/auth/reset-password',
      { token, newPassword }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('Reset password failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Reset password failed';
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return {
      success: false,
      error: apiError || errorMessage,
    };
  }
};

// Token presence check
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

export const googleLogin = async (
  googleToken: string,
  invitationId?: string | null
): Promise<ApiResponse<GoogleLoginResponse>> => {
  try {
    const response = await axiosClient.post<GoogleLoginResponse>(
      '/auth/google-login',
      { idToken: googleToken, invitationId }
    );

    const { access_token } = response.data;

    // Store token in localStorage (same as email/password login)
    localStorage.setItem('access_token', access_token);

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('Google login failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Google login failed';

    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;

    return {
      success: false,
      error: apiError || errorMessage,
    };
  }
};
