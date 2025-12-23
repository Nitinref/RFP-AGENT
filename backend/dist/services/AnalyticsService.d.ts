export declare class AnalyticsService {
    /**
     * Get RFP statistics
     */
    getRFPStatistics(startDate?: Date, endDate?: Date): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        topIndustries: {
            industry: string;
            count: number;
        }[];
        avgProcessingTime: number;
    }>;
    /**
     * Get workflow performance metrics
     */
    getWorkflowMetrics(startDate?: Date, endDate?: Date): Promise<{
        totalWorkflows: number;
        successRate: number;
        avgDurationMs: number;
        modelUsage: Record<string, number>;
        fallbackRate: number;
    }>;
    /**
     * Get agent performance metrics
     */
    getAgentMetrics(): Promise<Record<string, any>>;
    /**
     * Get cost analysis
     */
    getCostAnalysis(startDate?: Date, endDate?: Date): Promise<{
        totalCost: number;
        avgCostPerWorkflow: number;
        byModel: Record<string, any>;
    }>;
    /**
     * Get compliance analysis
     */
    getComplianceAnalysis(): Promise<{
        avgCompliance: number;
        distribution: {
            high: number;
            medium: number;
            low: number;
        };
        totalAnalyses: number;
    }>;
    /**
     * Calculate average processing time
     */
    private calculateAverageProcessingTime;
    /**
     * Get dashboard overview
     */
    getDashboardOverview(): Promise<{
        period: string;
        rfpStats: {
            total: number;
            byStatus: Record<string, number>;
            byPriority: Record<string, number>;
            topIndustries: {
                industry: string;
                count: number;
            }[];
            avgProcessingTime: number;
        };
        workflowMetrics: {
            totalWorkflows: number;
            successRate: number;
            avgDurationMs: number;
            modelUsage: Record<string, number>;
            fallbackRate: number;
        };
        agentMetrics: Record<string, any>;
        costAnalysis: {
            totalCost: number;
            avgCostPerWorkflow: number;
            byModel: Record<string, any>;
        };
        complianceAnalysis: {
            avgCompliance: number;
            distribution: {
                high: number;
                medium: number;
                low: number;
            };
            totalAnalyses: number;
        };
        upcomingDeadlines: {
            rfpNumber: string;
            title: string;
            issuer: string;
            industry: string;
            source: import(".prisma/client").$Enums.RFPSource;
            sourceUrl: string | null;
            submissionDeadline: Date;
            clarificationDeadline: Date | null;
            priority: import(".prisma/client").$Enums.Priority;
            estimatedValue: import("@prisma/client-runtime-utils").Decimal | null;
            currency: string | null;
            region: string | null;
            tags: string[];
            description: string | null;
            id: string;
            receivedAt: Date;
            status: import(".prisma/client").$Enums.RFPStatus;
            originalDocument: string | null;
            documentHash: string | null;
            parsedContent: import("@prisma/client/runtime/client.js").JsonValue | null;
            assignedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            assignedToUserId: string | null;
        }[];
    }>;
    /**
     * Get upcoming deadlines
     */
    getUpcomingDeadlines(days?: number): Promise<{
        rfpNumber: string;
        title: string;
        issuer: string;
        industry: string;
        source: import(".prisma/client").$Enums.RFPSource;
        sourceUrl: string | null;
        submissionDeadline: Date;
        clarificationDeadline: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedValue: import("@prisma/client-runtime-utils").Decimal | null;
        currency: string | null;
        region: string | null;
        tags: string[];
        description: string | null;
        id: string;
        receivedAt: Date;
        status: import(".prisma/client").$Enums.RFPStatus;
        originalDocument: string | null;
        documentHash: string | null;
        parsedContent: import("@prisma/client/runtime/client.js").JsonValue | null;
        assignedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        assignedToUserId: string | null;
    }[]>;
}
declare const _default: AnalyticsService;
export default _default;
