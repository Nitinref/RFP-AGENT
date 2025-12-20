import { apiClient } from './client';
import { RFP, Workflow, TechnicalAnalysis, PricingAnalysis } from '../types';

// Helper function to extract data from different response formats
const extractData = <T>(response: any): T => {
  console.log('📦 Extracting data from:', response);
  
  // Case 1: Direct data
  if (response && (response.id || response.overallCompliance || response.totalBidPrice)) {
    return response;
  }
  
  // Case 2: Wrapped in data property
  if (response?.data && (response.data.id || response.data.overallCompliance || response.data.totalBidPrice)) {
    return response.data;
  }
  
  // Case 3: ApiResponse format { success: true, data: {...} }
  if (response?.success && response.data && (response.data.id || response.data.overallCompliance || response.data.totalBidPrice)) {
    return response.data;
  }
  
  // Case 4: Response is already what we need
  return response;
};

export const rfpAPI = {
  // GET methods
  list: async (params?: any): Promise<RFP[]> => {
    const response = await apiClient.get<any>('/rfps', { params });
    const data = extractData<RFP[]>(response);
    
    if (!Array.isArray(data)) {
      throw new Error('Expected array of RFPs');
    }
    
    return data;
  },

  getById: async (id: string): Promise<RFP> => {
    const response = await apiClient.get<any>(`/rfps/${id}`);
    const data = extractData<RFP>(response);
    
    if (!data.id) {
      throw new Error('RFP not found');
    }
    
    return data;
  },

  // Workflow methods
  getWorkflowStatus: async (id: string): Promise<Workflow> => {
    const response = await apiClient.get<any>(`/rfps/${id}/workflow/status`);
    const data = extractData<Workflow>(response);
    
    if (!data.id) {
      throw new Error('Workflow not found');
    }
    
    return data;
  },

  getTechnicalAnalysis: async (id: string): Promise<TechnicalAnalysis> => {
    const response = await apiClient.get<any>(`/rfps/${id}/technical-analysis`);
    const data = extractData<TechnicalAnalysis>(response);
    
    if (data.overallCompliance === undefined) {
      throw new Error('Invalid technical analysis response');
    }
    
    return data;
  },

  getPricingAnalysis: async (id: string): Promise<PricingAnalysis> => {
    const response = await apiClient.get<any>(`/rfps/${id}/pricing-analysis`);
    const data = extractData<PricingAnalysis>(response);
    
    if (!data.totalBidPrice) {
      throw new Error('Invalid pricing analysis response');
    }
    
    return data;
  },

  // POST methods
  create: async (input: any): Promise<RFP> => {
    const response = await apiClient.post<any>('/rfps', input);
    const data = extractData<RFP>(response);
    
    if (!data.id) {
      throw new Error('Failed to create RFP');
    }
    
    return data;
  },

  startWorkflow: async (id: string, triggerReason?: string): Promise<Workflow> => {
    const response = await apiClient.post<any>(`/rfps/${id}/workflow`, {
      triggerType: 'MANUAL',
      triggerReason,
    });
    
    const data = extractData<Workflow>(response);
    
    if (!data.id) {
      throw new Error('Failed to start workflow');
    }
    
    return data;
  },

  // PUT methods
  update: async (id: string, updates: any): Promise<RFP> => {
    const response = await apiClient.put<any>(`/rfps/${id}`, updates);
    const data = extractData<RFP>(response);
    
    if (!data.id) {
      throw new Error('Failed to update RFP');
    }
    
    return data;
  },

  // DELETE methods
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rfps/${id}`);
  },

  // Document upload
  uploadDocument: async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<any>(`/rfps/${id}/document`, formData);
    return extractData<any>(response);
  },
};