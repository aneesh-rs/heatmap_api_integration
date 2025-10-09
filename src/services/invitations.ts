import axiosClient from '../apiClient';
import { Roles } from '../types';

export interface CreateInvitationRequest {
  inviterId: string;
  role: Roles;
  reservedEmail?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const createInvitation = async (
  payload: CreateInvitationRequest
): Promise<ApiResponse<{ id: string; invitationLink: string }>> => {
  try {
    const res = await axiosClient.post<{ id: string; invitationLink: string }>(
      '/invitations',
      payload
    );
    return { success: true, data: res.data };
  } catch (error: unknown) {
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || 'Failed to create invitation' };
  }
};
