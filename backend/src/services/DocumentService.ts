import { RequirementCategory } from '@prisma/client';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import config from '../config/environment.js';
import { sanitizeFilename, generateUniqueId } from '../utils/helpers.js';

export class DocumentService {
  async processDocument(rfpId: string, file: Express.Multer.File) {
    logger.info('Processing document', { rfpId, filename: file.originalname });

    try {
      const savedPath = await this.saveFile(file);

      const content = await this.extractText(file);

      const chunks = this.chunkDocument(content);

      const documentChunks = await Promise.all(
        chunks.map((chunk, index) =>
          prisma.rFPDocumentChunk.create({
            data: {
              rfpId,
              chunkIndex: index,
              section: chunk.section,
              sectionType: this.detectSectionType(chunk.section),
              content: chunk.content,
              wordCount: chunk.content.split(/\s+/).length,
            },
          })
        )
      );

      await prisma.rFP.update({
        where: { id: rfpId },
        data: {
          originalDocument: savedPath,
          status: 'ANALYZING',
        },
      });

      logger.info('Document processed successfully', {
        rfpId,
        chunksCreated: documentChunks.length,
      });

      return {
        path: savedPath,
        chunksCreated: documentChunks.length,
      };
    } catch (error) {
      logger.error('Document processing failed', { error, rfpId });
      throw error;
    }
  }

  private async saveFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = config.upload.uploadDir;
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${generateUniqueId()}-${sanitizeFilename(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);

    return filepath;
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    // Placeholder - integrate with PDF/DOCX parsing libraries
    // Use libraries like pdf-parse, mammoth, or textract
    const content = file.buffer.toString('utf-8');
    return content;
  }

  private chunkDocument(content: string): Array<{ section: string; content: string }> {
    const sections = content.split(/\n\n+/);
    const chunks: Array<{ section: string; content: string }> = [];

    let currentSection = 'Introduction';

    for (const section of sections) {
      if (section.trim().length < 50) continue;

      if (this.isSectionHeader(section)) {
        currentSection = section.trim();
        continue;
      }

      chunks.push({
        section: currentSection,
        content: section.trim(),
      });
    }

    return chunks;
  }

  private isSectionHeader(text: string): boolean {
    const headerPatterns = [
      /^[A-Z\s]{3,}$/,
      /^\d+\.\s+[A-Z]/,
      /^SECTION\s+\d+/i,
      /^PART\s+[A-Z]/i,
    ];

    return headerPatterns.some(pattern => pattern.test(text.trim()));
  }

  private detectSectionType(sectionName: string): RequirementCategory {
    const lowerSection = sectionName.toLowerCase();

    if (lowerSection.includes('technical') || lowerSection.includes('specification')) {
      return RequirementCategory.TECHNICAL;
    }
    if (lowerSection.includes('test') || lowerSection.includes('quality')) {
      return RequirementCategory.TESTING;
    }
    if (lowerSection.includes('compliance') || lowerSection.includes('certification')) {
      return RequirementCategory.COMPLIANCE;
    }
    if (lowerSection.includes('commercial') || lowerSection.includes('price')) {
      return RequirementCategory.COMMERCIAL;
    }
    if (lowerSection.includes('delivery') || lowerSection.includes('logistics')) {
      return RequirementCategory.LOGISTICS;
    }

    return RequirementCategory.OTHER;
  }
}

export default DocumentService;