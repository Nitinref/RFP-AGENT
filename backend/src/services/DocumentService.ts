import { RequirementCategory } from "@prisma/client";
import { prisma } from "../prisma/index.js";
import { logger } from "../utils/logger.js";
import * as fs from "fs/promises";
import * as path from "path";
import config from "../config/environment.js";
import { sanitizeFilename, generateUniqueId } from "../utils/helpers.js";
import mammoth from "mammoth";
import { openaiChunk } from "./OpenAIChunkingService.js";
import { ragService } from "../services/RAGService.js";

process.env.PDFJS_DISABLE_FONT_FACE = "true";

export class DocumentService {
  async processDocument(rfpId: string, file: Express.Multer.File) {
    logger.info("📄 Processing document", {
      rfpId,
      filename: file.originalname,
    });

    try {
      /* 1️⃣ Save file */
      const savedPath = await this.saveFile(file);

      /* 2️⃣ Extract text */
      const text = await this.extractText(file);

      if (!text || text.length < 50) {
        throw new Error("Extracted text is empty or too small");
      }

      /* 3️⃣ Semantic chunking */
      const chunks = await openaiChunk(text);

      if (!chunks?.length) {
        throw new Error("No chunks returned by OpenAI");
      }

      /* 4️⃣ Save chunks to DB */
      await prisma.rFPDocumentChunk.createMany({
        data: chunks.map((chunk, index) => ({
          rfpId,
          chunkIndex: index,
          section: chunk.title,
          sectionType: chunk.category as RequirementCategory,
          content: chunk.content,
          wordCount: chunk.content.split(/\s+/).length,
        })),
      });

      /* 4️⃣.5️⃣ Embed + store in Qdrant (PARALLEL, SAFE) */
      await Promise.all(
        chunks.map(async (chunk, index) => {
          const embedding = await ragService.embed(chunk.content);

          await ragService.upsertRFPChunk({
            id: `${rfpId}-${index}`,
            vector: embedding,
            payload: {
              rfpId,
              sectionType: chunk.category,
              chunkIndex: index,
            },
          });

          logger.info("🧠 Chunk embedded", {
            rfpId,
            chunkIndex: index,
          });
        })
      );

      /* 5️⃣ Update RFP status */
      await prisma.rFP.update({
        where: { id: rfpId },
        data: {
          originalDocument: savedPath,
          status: "ANALYZING",
        },
      });

      logger.info("✅ Document fully processed", {
        rfpId,
        chunksCreated: chunks.length,
      });

      return {
        path: savedPath,
        chunksCreated: chunks.length,
      };
    } catch (error) {
      logger.error("❌ Document processing failed", {
        rfpId,
        error,
      });
      throw error;
    }
  }

  /* ================= HELPERS ================= */

  private async saveFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = config.upload.uploadDir;
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${generateUniqueId()}-${sanitizeFilename(
      file.originalname
    )}`;
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

    throw new Error(`Unsupported document type: ${file.mimetype}`);
  }
}

export default DocumentService;
