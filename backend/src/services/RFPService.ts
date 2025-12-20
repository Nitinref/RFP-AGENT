import { RFPStatus, Priority } from '@prisma/client';
import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';
import { RFPCreateInput } from '../utils/validators.js';

export class RFPService {
  async createRFP(data: RFPCreateInput) {
    logger.info('Creating new RFP', { rfpNumber: data.rfpNumber });

    const rfp = await prisma.rFP.create({
      data: {
        rfpNumber: data.rfpNumber,
        title: data.title,
        issuer: data.issuer,
        industry: data.industry,
        source: data.source,
        sourceUrl: data.sourceUrl,
        submissionDeadline: new Date(data.submissionDeadline),
        clarificationDeadline: data.clarificationDeadline ? new Date(data.clarificationDeadline) : undefined,
        priority: (data.priority as Priority) || Priority.MEDIUM,
        estimatedValue: data.estimatedValue,
        currency: data.currency || 'USD',
        region: data.region,
        tags: data.tags || [],
        status: RFPStatus.NEW,
      },
    });

    logger.info('RFP created successfully', { rfpId: rfp.id });
    return rfp;
  }

  async listRFPs(filters: {
    status?: string;
    priority?: string;
    industry?: string;
    limit: number;
    offset: number;
  }) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.industry) where.industry = filters.industry;

    const [rfps, total] = await Promise.all([
      prisma.rFP.findMany({
        where,
        take: filters.limit,
        skip: filters.offset,
        orderBy: { receivedAt: 'desc' },
        include: {
          workflowRuns: {
            orderBy: { startedAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.rFP.count({ where }),
    ]);

    return { rfps, total, limit: filters.limit, offset: filters.offset };
  }

  async getRFPById(id: string) {
    const rfp = await prisma.rFP.findUnique({
      where: { id },
      include: {
        requirements: true,
        workflowRuns: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
        technicalAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { skuMatches: true },
        },
        pricingAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { items: true },
        },
        documentChunks: true,
      },
    });

    if (!rfp) {
      throw new NotFoundError('RFP');
    }

    return rfp;
  }

  async updateRFPStatus(id: string, status: RFPStatus) {
    const rfp = await prisma.rFP.update({
      where: { id },
      data: { status },
    });

    logger.info('RFP status updated', { rfpId: id, status });
    return rfp;
  }

  async deleteRFP(id: string) {
    await prisma.rFP.delete({
      where: { id },
    });

    logger.info('RFP deleted', { rfpId: id });
  }
}

export default RFPService;