import PDFDocument from "pdfkit";
import { prisma } from "../prisma/index.js";
export class RFPReportPDFService {
    async generatePDF(rfpId) {
        const report = await prisma.rFPReport.findFirst({
            where: { rfpId },
            orderBy: { generatedAt: "desc" },
        });
        if (!report) {
            throw new Error("Report not found");
        }
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);
            /* ---------- TITLE ---------- */
            doc.fontSize(20).text("RFP Report", { align: "center" });
            doc.moveDown();
            /* ---------- SUMMARY ---------- */
            doc.fontSize(14).text("Summary", { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(11).text(report.summary ?? "—");
            doc.moveDown();
            /* ---------- FINAL RESPONSE ---------- */
            doc.fontSize(14).text("Final Proposal", { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(11).text(report.finalResponse ?? "—");
            doc.moveDown();
            /* ---------- TECHNICAL ANALYSIS ---------- */
            doc.fontSize(14).text("Technical Analysis", { underline: true });
            doc.moveDown(0.5);
            const tech = report.technicalAnalysis;
            tech?.topMatches?.forEach((m, i) => {
                doc.fontSize(11).text(`${i + 1}. ${m.sku} | Score: ${m.matchScore}% | Confidence: ${Math.round((m.confidence ?? 0) * 100)}%`);
                if (m.risks?.length) {
                    doc.fontSize(10).text(`Risks: ${m.risks.join(", ")}`);
                }
                doc.moveDown(0.5);
            });
            /* ---------- PRICING ---------- */
            doc.moveDown();
            doc.fontSize(14).text("Pricing Summary", { underline: true });
            doc.moveDown(0.5);
            const pricing = report.pricingAnalysis;
            doc.fontSize(11).text(`Total Bid Price: $${pricing?.pricing?.totalBidPrice ?? "N/A"}`);
            doc.text(`Competitiveness: ${pricing?.competitiveness ?? "N/A"}`);
            doc.end(); // 🔥 MUST
        });
    }
}
//# sourceMappingURL=RFPReportPDFService.js.map