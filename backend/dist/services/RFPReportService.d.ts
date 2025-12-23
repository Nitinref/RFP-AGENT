export declare class ReportService {
    generateReport({ rfpId, workflowRunId, technicalAnalysis, pricingAnalysis, finalResponse, }: {
        rfpId: string;
        workflowRunId: string;
        technicalAnalysis: any;
        pricingAnalysis: any;
        finalResponse: string;
    }): Promise<{
        id: string;
        rfpId: string;
        workflowRunId: string;
        technicalAnalysis: import("@prisma/client/runtime/client.js").JsonValue | null;
        pricingAnalysis: import("@prisma/client/runtime/client.js").JsonValue | null;
        finalResponse: string | null;
        summary: string | null;
        generatedAt: Date;
    }>;
}
