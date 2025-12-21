import { apiClient } from './client';
import { RFP, Workflow, TechnicalAnalysis, PricingAnalysis, ApiResponse } from '../types';

// Helper to safely extract data from API responses
const extractData = <T>(response: any): T => {
  // If response has success property and data
  if (response?.success && response.data !== undefined) {
    return response.data;
  }
  // If response is direct data
  return response;
};

export const rfpAPI = {
  list: async (params?: any): Promise<RFP[]> => {
    const response = await apiClient.get<ApiResponse<RFP[]>>('/rfps', { params });
    return extractData<RFP[]>(response);
  },

  getById: async (id: string): Promise<RFP> => {
    const response = await apiClient.get<ApiResponse<RFP>>(`/rfps/${id}`);
    return extractData<RFP>(response);
  },

  create: async (input: Partial<RFP>): Promise<RFP> => {
    const response = await apiClient.post<ApiResponse<RFP>>('/rfps', input);
    return extractData<RFP>(response);
  },

  update: async (id: string, updates: Partial<RFP>): Promise<RFP> => {
    const response = await apiClient.put<ApiResponse<RFP>>(`/rfps/${id}`, updates);
    return extractData<RFP>(response);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rfps/${id}`);
  },

  startWorkflow: async (id: string, triggerReason?: string): Promise<Workflow> => {
    const response = await apiClient.post<ApiResponse<Workflow>>(`/rfps/${id}/workflow`, {
      triggerType: 'MANUAL',
      triggerReason,
    });
    return extractData<Workflow>(response);
  },

  getWorkflowStatus: async (id: string): Promise<Workflow> => {
    const response = await apiClient.get<ApiResponse<Workflow>>(`/rfps/${id}/workflow/status`);
    return extractData<Workflow>(response);
  },

  getTechnicalAnalysis: async (id: string): Promise<TechnicalAnalysis> => {
    const response = await apiClient.get<ApiResponse<TechnicalAnalysis>>(`/rfps/${id}/technical-analysis`);
    return extractData<TechnicalAnalysis>(response);
  },

  getPricingAnalysis: async (id: string): Promise<PricingAnalysis> => {
    const response = await apiClient.get<ApiResponse<PricingAnalysis>>(`/rfps/${id}/pricing-analysis`);
    return extractData<PricingAnalysis>(response);
  },

  uploadDocument: async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<any>>(`/rfps/${id}/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData<any>(response);
  },
};