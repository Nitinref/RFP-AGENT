import { apiClient } from './client';
import { 
    User, RFP, Workflow, TechnicalAnalysis, PricingAnalysis, 
    AnalyticsData, LoginResponse, RegisterRequest, ApiResponse 
} from '../types';

// Helper function to extract data from ApiResponse
const extractData = <T>(response: ApiResponse<T>): T => {
    if (response.success && response.data !== undefined) {
        return response.data;
    }
    throw new Error(response.error || 'Request failed');
};

export const authAPI = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
        return extractData(response);
    },

    register: async (userData: RegisterRequest): Promise<User> => {
        const response = await apiClient.post<ApiResponse<User>>('/auth/register', userData);
        return extractData(response);
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        return extractData(response);
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },
};

export const rfpAPI = {
    list: async (params?: any): Promise<RFP[]> => {
        const response = await apiClient.get<ApiResponse<RFP[]>>('/rfps', { params });
        return extractData(response);
    },

    getById: async (id: string): Promise<RFP> => {
        const response = await apiClient.get<ApiResponse<RFP>>(`/rfps/${id}`);
        return extractData(response);
    },

    create: async (data: Partial<RFP>): Promise<RFP> => {
        const response = await apiClient.post<ApiResponse<RFP>>('/rfps', data);
        return extractData(response);
    },

    update: async (id: string, data: Partial<RFP>): Promise<RFP> => {
        const response = await apiClient.put<ApiResponse<RFP>>(`/rfps/${id}`, data);
        return extractData(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/rfps/${id}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete RFP');
        }
    },

    startWorkflow: async (id: string, reason?: string): Promise<Workflow> => {
        const response = await apiClient.post<ApiResponse<Workflow>>(`/rfps/${id}/workflow`, { 
            triggerType: 'MANUAL',
            triggerReason: reason 
        });
        return extractData(response);
    },

    getWorkflowStatus: async (id: string): Promise<Workflow> => {
        const response = await apiClient.get<ApiResponse<Workflow>>(`/rfps/${id}/workflow/status`);
        return extractData(response);
    },

    getTechnicalAnalysis: async (id: string): Promise<TechnicalAnalysis> => {
        const response = await apiClient.get<ApiResponse<TechnicalAnalysis>>(`/rfps/${id}/technical-analysis`);
        return extractData(response);
    },

    getPricingAnalysis: async (id: string): Promise<PricingAnalysis> => {
        const response = await apiClient.get<ApiResponse<PricingAnalysis>>(`/rfps/${id}/pricing-analysis`);
        return extractData(response);
    },

    uploadDocument: async (id: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiClient.post<ApiResponse<any>>(`/rfps/${id}/document`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return extractData(response);
    },
};

export const analyticsAPI = {
    getDashboardData: async (): Promise<AnalyticsData> => {
        const response = await apiClient.get<AnalyticsData>('/analytics');
        // Analytics endpoint returns data directly, not wrapped in ApiResponse
        return response;
    },
};

export const userAPI = {
    list: async (): Promise<User[]> => {
        const response = await apiClient.get<ApiResponse<User[]>>('/users');
        return extractData(response);
    },

    toggleStatus: async (id: string, isActive: boolean): Promise<User> => {
        const response = await apiClient.put<ApiResponse<User>>(`/users/${id}/toggle-status`, { isActive });
        return extractData(response);
    },
};