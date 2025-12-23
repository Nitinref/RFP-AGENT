import { prisma } from "../prisma/index.js";

export class ReportService {
  async generateReport({
    rfpId,
    workflowRunId,
    technicalAnalysis,
    pricingAnalysis,
    finalResponse,
  }: {
    rfpId: string;
    workflowRunId: string;
    technicalAnalysis: any;
    pricingAnalysis: any;
    finalResponse: string;
  }) {
    return prisma.rFPReport.create({
      data: {
        rfpId,
        workflowRunId,
        summary: finalResponse?.slice(0, 500),
        technicalAnalysis,
        pricingAnalysis,
        finalResponse,
      },
    });
  }
}
