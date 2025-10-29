import axiosClient from "../apiClient";
import { ReportFormData, ReportStatus } from "../types";

export interface ApiReport extends ReportFormData {
  id: string;
  reportStatus: ReportStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getReports = async (): Promise<ApiResponse<ApiReport[]>> => {
  try {
    const res = await axiosClient.get<ApiReport[]>("/reports");
    console.log("res.data : ", res.data);

    return { success: true, data: res.data };
  } catch (error: unknown) {
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || "Failed to fetch reports" };
  }
};

export const createReport = async (
  payload: ReportFormData
): Promise<ApiResponse<{ id: string }>> => {
  try {
    const res = await axiosClient.post<{ id: string }>("/reports", payload);
    return { success: true, data: res.data };
  } catch (error: unknown) {
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || "Failed to create report" };
  }
};

export const updateReportStatus = async (
  reportId: string,
  reportStatus: ReportStatus
): Promise<ApiResponse<object>> => {
  try {
    console.log("reportStatus and ID : ", reportStatus, reportId);
    await axiosClient.put(`/reports/${reportId}/status`, { reportStatus });
    return { success: true, data: {} };
  } catch (error: unknown) {
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || "Failed to update status" };
  }
};

export const deleteReport = async (
  reportId: string
): Promise<ApiResponse<object>> => {
  try {
    await axiosClient.delete(`/reports/${reportId}`);
    return { success: true, data: {} };
  } catch (error: unknown) {
    const apiError = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return { success: false, error: apiError || "Failed to delete report" };
  }
};
