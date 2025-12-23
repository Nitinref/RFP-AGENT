import { RequirementCategory } from "@prisma/client";
import { prisma } from "../prisma/index.js";
import { logger } from "../utils/logger.js";
import * as fs from "fs/promises";
import * as path from "path";
import config from "../config/environment.js";
import { sanitizeFilename, generateUniqueId } from "../utils/helpers.js";
import mammoth from "mammoth";
import { openaiChunk } from "./OpenAIChunkingService.js";

// silence pdfjs font warning
process.env.PDFJS_DISABLE_FONT_FACE = "true";

export class DocumentService {
  async processDocument(rfpId: string, file: Express.Multer.File) {
    logger.info("Processing document", { rfpId, filename: file.originalname });

    try {
      // 1️⃣ Save file
      const savedPath = await this.saveFile(file);

      // 2️⃣ Extract text
      const text = await this.extractText(file);

      // 3️⃣ ✅ OpenAI semantic chunking
      const chunks = await openaiChunk(text);

      if (!chunks.length) {
        throw new Error("No chunks returned by OpenAI");
      }

      // 4️⃣ Save chunks
      await prisma.rFPDocumentChunk.createMany({
        data: chunks.map((chunk, index) => ({
          rfpId,
          chunkIndex: index,
          section: chunk.title,
          sectionType: chunk.category.toUpperCase() as RequirementCategory,
          content: chunk.content,
          wordCount: chunk.content.split(/\s+/).length,
        })),
      });

      // 5️⃣ Update RFP
      await prisma.rFP.update({
        where: { id: rfpId },
        data: {
          originalDocument: savedPath,
          status: "ANALYZING",
        },
      });

      logger.info("Document processed successfully", {
        rfpId,
        chunksCreated: chunks.length,
      });

      return {
        path: savedPath,
        chunksCreated: chunks.length,
      };
    } catch (error) {
      logger.error("Document processing failed", { error, rfpId });
      throw error;
    }
  }

  // ---------------- HELPERS ----------------

  private async saveFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = config.upload.uploadDir;
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${generateUniqueId()}-${sanitizeFilename(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);
    return filepath;
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    if (file.mimetype === "application/pdf") {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(file.buffer),
      });

      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((i: any) => i.str).join(" ") + "\n\n";
      }

      return fullText.trim();
    }

    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value.trim();
    }

    if (file.mimetype === "text/plain") {
      return file.buffer.toString("utf-8").trim();
    }

    throw new Error("Unsupported document type");
  }
}

export default DocumentService;
