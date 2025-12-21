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
    id: string;
    rfpNumber: string;
    title: string;
    issuer: string;
    industry: string;
    source: 'MANUAL' | 'EMAIL' | 'PORTAL' | 'UPLOAD' | 'API';
    submissionDeadline: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedValue?: number;
    currency: string;
    description?: string;
    status: 'NEW' | 'ANALYZING' | 'IN_PROGRESS' | 'REVIEW' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';
    region?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Workflow {
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
    agentActivities?: any[];
    modelDecisions?: any[];
}

export interface TechnicalAnalysis {
    id: string;
    overallCompliance: number;
    confidence: number;
    status: string;
    criticalGaps: string[];
    skuMatches?: Array<{
        id: string;
        skuId: string;
        overallMatchScore: number;
        justification: string;
    }>;
}

export interface PricingAnalysis {
    id: string;
    totalBidPrice: string;
    productsCost: string;
    testingCost?: string;
    logisticsCost?: string;
    contingency?: string;
    competitiveness: string;
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
    role?: 'ADMIN' | 'MANAGER' | 'USER';
    department?: string;
}