-- CreateEnum
CREATE TYPE "RFPSource" AS ENUM ('EMAIL', 'PORTAL', 'UPLOAD', 'API', 'MANUAL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RFPStatus" AS ENUM ('NEW', 'ANALYZING', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'SUBMITTED', 'AWARDED', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequirementCategory" AS ENUM ('TECHNICAL', 'COMMERCIAL', 'TESTING', 'COMPLIANCE', 'LOGISTICS', 'DOCUMENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('SALES_SCOUT', 'ORCHESTRATOR', 'TECHNICAL_SPECIALIST', 'PRICING_SPECIALIST');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'SUBMITTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResponseOutcome" AS ENUM ('PENDING', 'WON', 'LOST', 'NO_BID');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'SALES', 'TECHNICAL', 'PRICING', 'USER');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('AUTO_SCAN', 'MANUAL', 'RETRY', 'SCHEDULED', 'API');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "Complexity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "RFP" (
    "id" TEXT NOT NULL,
    "rfpNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "issuer" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "source" "RFPSource" NOT NULL,
    "sourceUrl" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionDeadline" TIMESTAMP(3) NOT NULL,
    "clarificationDeadline" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "RFPStatus" NOT NULL DEFAULT 'NEW',
    "originalDocument" TEXT,
    "documentHash" TEXT,
    "parsedContent" JSONB,
    "estimatedValue" DECIMAL(15,2),
    "currency" TEXT DEFAULT 'USD',
    "region" TEXT,
    "tags" TEXT[],
    "assignedToUserId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFPRequirement" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "category" "RequirementCategory" NOT NULL,
    "section" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "specification" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "quantity" INTEGER,
    "unit" TEXT,
    "technicalParams" JSONB,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "matchedSKUId" TEXT,
    "matchScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFPRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "runNumber" INTEGER NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "triggerReason" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'RUNNING',
    "totalSteps" INTEGER,
    "completedSteps" INTEGER NOT NULL DEFAULT 0,
    "failedSteps" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "createdBy" TEXT,
    "error" TEXT,
    "canRetry" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFPDocumentChunk" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "section" TEXT,
    "sectionType" "RequirementCategory",
    "content" TEXT NOT NULL,
    "wordCount" INTEGER,
    "embedding" JSONB,
    "embeddingModel" TEXT,
    "pageNumber" INTEGER,
    "isTable" BOOLEAN NOT NULL DEFAULT false,
    "importance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RFPDocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSKU" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "specifications" JSONB NOT NULL,
    "datasheet" TEXT,
    "certifications" TEXT[],
    "standards" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "leadTimeDays" INTEGER,
    "moq" INTEGER,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "priceValidUntil" TIMESTAMP(3),
    "manufacturer" TEXT,
    "manufacturerPN" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSKU_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingTier" (
    "id" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentActivity" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "action" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "stepNumber" INTEGER,
    "inputData" JSONB,
    "outputData" JSONB,
    "modelUsed" TEXT,
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "fallbackReason" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "tokenUsage" JSONB,
    "costEstimate" DECIMAL(10,6),
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelDecision" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "agentActivityId" TEXT NOT NULL,
    "primaryModel" TEXT NOT NULL,
    "chosenModel" TEXT NOT NULL,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "decisionFactors" JSONB,
    "confidence" DOUBLE PRECISION,
    "taskType" TEXT,
    "taskComplexity" "Complexity",
    "estimatedTokens" INTEGER,
    "wasSuccessful" BOOLEAN,
    "actualTokensUsed" INTEGER,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalAnalysis" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "analysisVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "overallCompliance" DOUBLE PRECISION,
    "criticalGaps" TEXT[],
    "recommendations" JSONB,
    "agentActivityId" TEXT,
    "modelUsed" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TechnicalAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SKUMatch" (
    "id" TEXT NOT NULL,
    "technicalAnalysisId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "overallMatchScore" DOUBLE PRECISION NOT NULL,
    "specMatchScore" DOUBLE PRECISION NOT NULL,
    "certificationMatch" DOUBLE PRECISION,
    "availabilityScore" DOUBLE PRECISION,
    "rank" INTEGER NOT NULL,
    "complianceDetails" JSONB NOT NULL,
    "gaps" TEXT[],
    "risks" TEXT[],
    "justification" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SKUMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingAnalysis" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "analysisVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "totalBidPrice" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "validUntil" TIMESTAMP(3),
    "productsCost" DECIMAL(15,2) NOT NULL,
    "testingCost" DECIMAL(15,2),
    "logisticsCost" DECIMAL(15,2),
    "complianceCost" DECIMAL(15,2),
    "contingency" DECIMAL(15,2),
    "targetMargin" DECIMAL(5,2),
    "riskAdjustment" DECIMAL(5,2),
    "competitiveness" TEXT,
    "assumptions" TEXT[],
    "pricingRisks" TEXT[],
    "notes" TEXT,
    "agentActivityId" TEXT,
    "modelUsed" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PricingAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFPResponse" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ResponseStatus" NOT NULL DEFAULT 'DRAFT',
    "executiveSummary" TEXT,
    "complianceStatement" TEXT,
    "totalPrice" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "validityPeriod" INTEGER,
    "paymentTerms" TEXT,
    "deliveryTimeline" TEXT,
    "responseDocument" TEXT,
    "attachments" TEXT[],
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "submittedBy" TEXT,
    "submissionMethod" TEXT,
    "outcome" "ResponseOutcome",
    "outcomeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFPResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFPResponseItem" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(15,2) NOT NULL,
    "complianceNotes" TEXT,
    "certifications" TEXT[],
    "leadTimeDays" INTEGER,
    "deliveryTerms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFPResponseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RFP_rfpNumber_key" ON "RFP"("rfpNumber");

-- CreateIndex
CREATE INDEX "RFP_status_priority_idx" ON "RFP"("status", "priority");

-- CreateIndex
CREATE INDEX "RFP_submissionDeadline_idx" ON "RFP"("submissionDeadline");

-- CreateIndex
CREATE INDEX "RFP_industry_idx" ON "RFP"("industry");

-- CreateIndex
CREATE INDEX "RFP_receivedAt_idx" ON "RFP"("receivedAt");

-- CreateIndex
CREATE INDEX "RFPRequirement_rfpId_category_idx" ON "RFPRequirement"("rfpId", "category");

-- CreateIndex
CREATE INDEX "RFPRequirement_isMandatory_idx" ON "RFPRequirement"("isMandatory");

-- CreateIndex
CREATE INDEX "WorkflowRun_rfpId_status_idx" ON "WorkflowRun"("rfpId", "status");

-- CreateIndex
CREATE INDEX "WorkflowRun_triggerType_idx" ON "WorkflowRun"("triggerType");

-- CreateIndex
CREATE INDEX "WorkflowRun_startedAt_idx" ON "WorkflowRun"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRun_rfpId_runNumber_key" ON "WorkflowRun"("rfpId", "runNumber");

-- CreateIndex
CREATE INDEX "RFPDocumentChunk_rfpId_chunkIndex_idx" ON "RFPDocumentChunk"("rfpId", "chunkIndex");

-- CreateIndex
CREATE INDEX "RFPDocumentChunk_rfpId_sectionType_idx" ON "RFPDocumentChunk"("rfpId", "sectionType");

-- CreateIndex
CREATE INDEX "RFPDocumentChunk_section_idx" ON "RFPDocumentChunk"("section");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSKU_sku_key" ON "ProductSKU"("sku");

-- CreateIndex
CREATE INDEX "ProductSKU_category_isActive_idx" ON "ProductSKU"("category", "isActive");

-- CreateIndex
CREATE INDEX "ProductSKU_sku_idx" ON "ProductSKU"("sku");

-- CreateIndex
CREATE INDEX "PricingTier_skuId_idx" ON "PricingTier"("skuId");

-- CreateIndex
CREATE INDEX "AgentActivity_workflowRunId_stepNumber_idx" ON "AgentActivity"("workflowRunId", "stepNumber");

-- CreateIndex
CREATE INDEX "AgentActivity_agentType_status_idx" ON "AgentActivity"("agentType", "status");

-- CreateIndex
CREATE INDEX "AgentActivity_startedAt_idx" ON "AgentActivity"("startedAt");

-- CreateIndex
CREATE INDEX "ModelDecision_workflowRunId_idx" ON "ModelDecision"("workflowRunId");

-- CreateIndex
CREATE INDEX "ModelDecision_agentActivityId_idx" ON "ModelDecision"("agentActivityId");

-- CreateIndex
CREATE INDEX "ModelDecision_chosenModel_idx" ON "ModelDecision"("chosenModel");

-- CreateIndex
CREATE INDEX "TechnicalAnalysis_rfpId_analysisVersion_idx" ON "TechnicalAnalysis"("rfpId", "analysisVersion");

-- CreateIndex
CREATE INDEX "TechnicalAnalysis_agentActivityId_idx" ON "TechnicalAnalysis"("agentActivityId");

-- CreateIndex
CREATE INDEX "SKUMatch_technicalAnalysisId_rank_idx" ON "SKUMatch"("technicalAnalysisId", "rank");

-- CreateIndex
CREATE INDEX "SKUMatch_skuId_idx" ON "SKUMatch"("skuId");

-- CreateIndex
CREATE INDEX "PricingAnalysis_rfpId_analysisVersion_idx" ON "PricingAnalysis"("rfpId", "analysisVersion");

-- CreateIndex
CREATE INDEX "PricingAnalysis_agentActivityId_idx" ON "PricingAnalysis"("agentActivityId");

-- CreateIndex
CREATE INDEX "RFPResponse_rfpId_version_idx" ON "RFPResponse"("rfpId", "version");

-- CreateIndex
CREATE INDEX "RFPResponse_status_idx" ON "RFPResponse"("status");

-- CreateIndex
CREATE INDEX "RFPResponseItem_responseId_lineNumber_idx" ON "RFPResponseItem"("responseId", "lineNumber");

-- CreateIndex
CREATE INDEX "RFPResponseItem_skuId_idx" ON "RFPResponseItem"("skuId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- AddForeignKey
ALTER TABLE "RFP" ADD CONSTRAINT "RFP_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPRequirement" ADD CONSTRAINT "RFPRequirement_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPRequirement" ADD CONSTRAINT "RFPRequirement_matchedSKUId_fkey" FOREIGN KEY ("matchedSKUId") REFERENCES "ProductSKU"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPDocumentChunk" ADD CONSTRAINT "RFPDocumentChunk_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSKU"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentActivity" ADD CONSTRAINT "AgentActivity_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelDecision" ADD CONSTRAINT "ModelDecision_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelDecision" ADD CONSTRAINT "ModelDecision_agentActivityId_fkey" FOREIGN KEY ("agentActivityId") REFERENCES "AgentActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalAnalysis" ADD CONSTRAINT "TechnicalAnalysis_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKUMatch" ADD CONSTRAINT "SKUMatch_technicalAnalysisId_fkey" FOREIGN KEY ("technicalAnalysisId") REFERENCES "TechnicalAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKUMatch" ADD CONSTRAINT "SKUMatch_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingAnalysis" ADD CONSTRAINT "PricingAnalysis_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPResponse" ADD CONSTRAINT "RFPResponse_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPResponseItem" ADD CONSTRAINT "RFPResponseItem_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "RFPResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPResponseItem" ADD CONSTRAINT "RFPResponseItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
