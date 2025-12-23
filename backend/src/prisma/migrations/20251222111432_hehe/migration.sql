-- CreateTable
CREATE TABLE "RFPReport" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "summary" TEXT,
    "technicalAnalysis" JSONB,
    "pricingAnalysis" JSONB,
    "finalResponse" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RFPReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RFPReport_rfpId_idx" ON "RFPReport"("rfpId");

-- CreateIndex
CREATE INDEX "RFPReport_workflowRunId_idx" ON "RFPReport"("workflowRunId");

-- AddForeignKey
ALTER TABLE "RFPReport" ADD CONSTRAINT "RFPReport_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPReport" ADD CONSTRAINT "RFPReport_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
