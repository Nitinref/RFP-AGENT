import { ReactNode } from "react";

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
    department?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RFP {
    workflowActive: any;
    aiStatus: any;
    id: string;
    rfpNumber: string;
    title: string;
    issuer: string;
    industry: string;
    source: 'MANUAL' | 'EMAIL' | 'PORTAL';
    submissionDeadline: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedValue?: number;
    currency: string;
    description?: string;
    status: 'NEW' | 'ANALYZING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';
    region?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Workflow {
    triggerType: any;
    triggerReason: ReactNode;
    canRetry: any;
    id: string;
    rfpId: string;
    runNumber: number;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    totalSteps: number;
    completedSteps: number;
    startedAt?: string;
    completedAt?: string;
    durationMs?: number;
    error?: string;
}

export interface TechnicalAnalysis {
    overallCompliance: number;
    skuMatches: Array<{
        id: string;
        productName: string;
        matchScore: number;
        overallMatchScore: number;
        justification: string;
    }>;
}

export interface PricingAnalysis {
    totalBidPrice: string;
    productsCost: string;
    testingCost?: string;
    markupPercentage: number;
    profit: string;
}

export interface AnalyticsData {
    totalRFPs: number;
    activeWorkflows: number;
    avgResponseTime: number;
    totalValue: number;
    recentRFPs: Array<{
        id: string;
        title: string;
        status: string;
        value: number;
    }>;
}

export interface ApiResponse<T> {
    overallCompliance: undefined;
    totalBidPrice: any;
    id: ApiResponse<any>;
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
}

// REMOVE THESE DUPLICATES - They're already defined above
// export interface Workflow { ... } // DUPLICATE - REMOVE
// export interface ApiWorkflowResponse { ... } // You don't need this if using ApiResponse<T>

// Instead, use ApiResponse<T> for all API responses
export type ApiWorkflowResponse = ApiResponse<Workflow>;
export type ApiTechnicalAnalysisResponse = ApiResponse<TechnicalAnalysis>;
export type ApiPricingAnalysisResponse = ApiResponse<PricingAnalysis>;
export type ApiRFPResponse = ApiResponse<RFP>;
export type ApiRFPsResponse = ApiResponse<RFP[]>;