import { apiClient } from './client';
import { 
    User, RFP, Workflow, TechnicalAnalysis, PricingAnalysis, 
    AnalyticsData, LoginResponse, RegisterRequest 
} from '../types';

export const authAPI = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Login failed');
    },

    register: async (userData: RegisterRequest): Promise<User> => {
        const response = await apiClient.post<User>('/auth/register', userData);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Registration failed');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/me');
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to get user');
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },
};

export const rfpAPI = {
    list: async (params?: any): Promise<RFP[]> => {
        const response = await apiClient.get<RFP[]>('/rfps', { params });
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch RFPs');
    },

    getById: async (id: string): Promise<RFP> => {
        const response = await apiClient.get<RFP>(`/rfps/${id}`);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch RFP');
    },

    create: async (data: Partial<RFP>): Promise<RFP> => {
        const response = await apiClient.post<RFP>('/rfps', data);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to create RFP');
    },

    update: async (id: string, data: Partial<RFP>): Promise<RFP> => {
        const response = await apiClient.put<RFP>(`/rfps/${id}`, data);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to update RFP');
    },

    delete: async (id: string): Promise<void> => {
        const response = await apiClient.delete(`/rfps/${id}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete RFP');
        }
    },

    startWorkflow: async (id: string, reason?: string): Promise<Workflow> => {
        const response = await apiClient.post<Workflow>(`/rfps/${id}/workflow`, { reason });
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to start workflow');
    },

    getWorkflowStatus: async (id: string): Promise<Workflow> => {
        const response = await apiClient.get<Workflow>(`/rfps/${id}/workflow/status`);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch workflow status');
    },

    getTechnicalAnalysis: async (id: string): Promise<TechnicalAnalysis> => {
        const response = await apiClient.get<TechnicalAnalysis>(`/rfps/${id}/technical-analysis`);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch technical analysis');
    },

    getPricingAnalysis: async (id: string): Promise<PricingAnalysis> => {
        const response = await apiClient.get<PricingAnalysis>(`/rfps/${id}/pricing-analysis`);
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch pricing analysis');
    },
};

export const analyticsAPI = {
    getDashboardData: async (): Promise<AnalyticsData> => {
        const response = await apiClient.get<AnalyticsData>('/analytics');
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch analytics data');
    },
};

export const userAPI = {
    list: async (): Promise<User[]> => {
        const response = await apiClient.get<User[]>('/users');
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch users');
    },

    toggleStatus: async (id: string, isActive: boolean): Promise<User> => {
        const response = await apiClient.put<User>(`/users/${id}/toggle-status`, { isActive });
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to toggle user status');
    },
};