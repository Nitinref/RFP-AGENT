import { RFPService } from '../../services/RFPService.js';
import { DocumentService } from '../../services/DocumentService.js';
import { WorkflowOrchestrator } from '../../orchestration/WorkflowOrchestrator.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { TriggerType } from '@prisma/client';
import { rfpIngestionService } from '../../services/RFPIngestionService.js';
import { prisma } from '../../prisma/index.js';
import { RFPReportPDFService } from "../../services/RFPReportPDFService.js";
const rfpService = new RFPService();
const documentService = new DocumentService();
const orchestrator = WorkflowOrchestrator.getInstance();
const pdfService = new RFPReportPDFService();
export class RFPController {
    // =========================
    // CREATE RFP
    // =========================
    async create(req, res) {
        const data = req.body;
        const rfp = await rfpService.createRFP(data);
        res.status(201).json({
            success: true,
            data: rfp,
        });
    }
    // =========================
    // LIST RFPs
    // =========================
    async list(req, res) {
        const { status, priority, industry, limit, offset } = req.query;
        const result = await rfpService.listRFPs({
            status: status,
            priority: priority,
            industry: industry,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        res.json({
            success: true,
            data: result.rfps,
            pagination: {
                total: result.total,
                limit: result.limit,
                offset: result.offset,
            },
        });
    }
    // =========================
    // GET RFP BY ID
    // =========================
    async getById(req, res) {
        const { id } = req.params;
        const rfp = await rfpService.getRFPById(id);
        res.json({
            success: true,
            data: rfp,
        });
    }
    // =========================
    // UPDATE RFP STATUS
    // =========================
    async update(req, res) {
        const { id } = req.params;
        const data = req.body;
        const rfp = await rfpService.updateRFPStatus(id, data.status);
        res.json({
            success: true,
            data: rfp,
        });
    }
    // =========================
    // DELETE RFP
    // =========================
    async delete(req, res) {
        const { id } = req.params;
        await rfpService.deleteRFP(id);
        res.json({
            success: true,
            message: 'RFP deleted successfully',
        });
    }
    // =========================
    // UPLOAD DOCUMENT + INGEST
    // =========================
    async uploadDocument(req, res) {
        const { id } = req.params;
        const file = req.file;
        if (!file) {
            throw new ValidationError('No file uploaded');
        }
        // 1️⃣ Process + chunk document
        const result = await documentService.processDocument(id, file);
        // 2️⃣ Ingest into vector DB (Qdrant)
        await rfpIngestionService.ingestRFP(id);
        res.json({
            success: true,
            data: result,
        });
    }
    // =========================
    // START WORKFLOW
    // =========================
    async startWorkflow(req, res) {
        const { id } = req.params;
        const { triggerType, triggerReason } = req.body;
        const result = await orchestrator.startWorkflow(id, triggerType || TriggerType.MANUAL, triggerReason, req.user?.id);
        res.json({
            success: true,
            data: result,
        });
    }
    // =========================
    // WORKFLOW STATUS
    // =========================
    async getWorkflowStatus(req, res) {
        const { id } = req.params;
        const rfp = await rfpService.getRFPById(id);
        if (!rfp.workflowRuns || rfp.workflowRuns.length === 0) {
            throw new NotFoundError('No workflow runs found');
        }
        const latestRun = rfp.workflowRuns[0];
        const status = await orchestrator.getWorkflowStatus(latestRun.id);
        res.json({
            success: true,
            data: status,
        });
    }
    // =========================
    // TECHNICAL ANALYSIS
    // =========================
    async getTechnicalAnalysis(req, res) {
        const { id } = req.params;
        const rfp = await rfpService.getRFPById(id);
        if (!rfp.technicalAnalyses || rfp.technicalAnalyses.length === 0) {
            throw new NotFoundError('No technical analysis found');
        }
        res.json({
            success: true,
            data: rfp.technicalAnalyses[0],
        });
    }
    // =========================
    // PRICING ANALYSIS
    // =========================
    async getPricingAnalysis(req, res) {
        const { id } = req.params;
        const rfp = await rfpService.getRFPById(id);
        if (!rfp.pricingAnalyses || rfp.pricingAnalyses.length === 0) {
            throw new NotFoundError('No pricing analysis found');
        }
        res.json({
            success: true,
            data: rfp.pricingAnalyses[0],
        });
    }
    // =========================
    // FINAL RESPONSE
    // =========================
    async getResponse(req, res) {
        const { id } = req.params;
        const rfp = await rfpService.getRFPById(id);
        if (!rfp.responses || rfp.responses.length === 0) {
            throw new NotFoundError('No response found');
        }
        res.json({
            success: true,
            data: rfp.responses[0],
        });
    }
    // =========================
    // 🔥 FINAL RFP REPORT (IMPORTANT)
    // =========================
    async getReport(req, res) {
        const { id } = req.params;
        const report = await prisma.rFPReport.findFirst({
            where: { rfpId: id },
            orderBy: { generatedAt: 'desc' },
        });
        if (!report) {
            throw new NotFoundError('Report not generated yet');
        }
        res.json({
            success: true,
            data: report,
        });
    }
    async downloadReportPDF(req, res) {
        const { id } = req.params;
        const pdfBuffer = await pdfService.generatePDF(id);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Content-Disposition", `inline; filename=RFP-${id}.pdf`);
        res.status(200).send(pdfBuffer);
    }
}
//# sourceMappingURL=RFPController.js.map