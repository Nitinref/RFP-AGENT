import {prisma} from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import { addDays, startOfDay, endOfDay } from 'date-fns';

export class AnalyticsService {
  /**
   * Get RFP statistics
   */
  async getRFPStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.receivedAt = {};
      if (startDate) where.receivedAt.gte = startDate;
      if (endDate) where.receivedAt.lte = endDate;
    }

    const [
      total,
      byStatus,
      byPriority,
      byIndustry,
      avgProcessingTime,
    ] = await Promise.all([
      prisma.rFP.count({ where }),

      prisma.rFP.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      prisma.rFP.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),

      prisma.rFP.groupBy({
        by: ['industry'],
        where,
        _count: true,
        orderBy: { _count: { industry: 'desc' } },
        take: 10,
      }),

      this.calculateAverageProcessingTime(where),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      topIndustries: byIndustry.map(item => ({
        industry: item.industry,
        count: item._count,
      })),
      avgProcessingTime,
    };
  }

  /**
   * Get workflow performance metrics
   */
  async getWorkflowMetrics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = startDate;
      if (endDate) where.startedAt.lte = endDate;
    }

    const workflows = await prisma.workflowRun.findMany({
      where,
      include: {
        agentActivities: true,
        modelDecisions: true,
      },
    });

    const successRate = workflows.filter(w => w.status === 'COMPLETED').length / workflows.length;
    const avgDuration = workflows
      .filter(w => w.durationMs)
      .reduce((sum, w) => sum + (w.durationMs || 0), 0) / workflows.length;

    const modelUsage = workflows.reduce((acc, w) => {
      w.modelDecisions.forEach(md => {
        if (!acc[md.chosenModel]) acc[md.chosenModel] = 0;
        acc[md.chosenModel]++;
      });
      return acc;
    }, {} as Record<string, number>);

    const fallbackRate = workflows.reduce((sum, w) => {
      const fallbacks = w.modelDecisions.filter(md => md.isFallback).length;
      return sum + fallbacks;
    }, 0) / workflows.length;

    return {
      totalWorkflows: workflows.length,
      successRate: successRate * 100,
      avgDurationMs: avgDuration,
      modelUsage,
      fallbackRate: fallbackRate * 100,
    };
  }

  /**
   * Get agent performance metrics
   */
  async getAgentMetrics() {
    const activities = await prisma.agentActivity.findMany({
      where: {
        completedAt: { not: null },
      },
    });

    const byAgent = activities.reduce((acc, activity) => {
      if (!acc[activity.agentType]) {
        acc[activity.agentType] = {
          total: 0,
          successful: 0,
          failed: 0,
          avgDuration: 0,
          totalDuration: 0,
        };
      }

      acc[activity.agentType].total++;
      if (activity.status === 'COMPLETED') {
        acc[activity.agentType].successful++;
      } else if (activity.status === 'FAILED') {
        acc[activity.agentType].failed++;
      }

      if (activity.durationMs) {
        acc[activity.agentType].totalDuration += activity.durationMs;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.keys(byAgent).forEach(agent => {
      byAgent[agent].avgDuration = byAgent[agent].totalDuration / byAgent[agent].total;
      byAgent[agent].successRate = (byAgent[agent].successful / byAgent[agent].total) * 100;
      delete byAgent[agent].totalDuration;
    });

    return byAgent;
  }

  /**
   * Get cost analysis
   */
  async getCostAnalysis(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = startDate;
      if (endDate) where.startedAt.lte = endDate;
    }

    const activities = await prisma.agentActivity.findMany({
      where: {
        workflowRun: where.startedAt ? { startedAt: where.startedAt } : undefined,
        costEstimate: { not: null },
      },
    });

    const totalCost = activities.reduce(
      (sum, activity) => sum + parseFloat(activity.costEstimate?.toString() || '0'),
      0
    );

    const byModel = activities.reduce((acc, activity) => {
      if (!activity.modelUsed) return acc;

      if (!acc[activity.modelUsed]) {
        acc[activity.modelUsed] = { count: 0, cost: 0 };
      }

      acc[activity.modelUsed].count++;
      acc[activity.modelUsed].cost += parseFloat(activity.costEstimate?.toString() || '0');

      return acc;
    }, {} as Record<string, any>);

    return {
      totalCost,
      avgCostPerWorkflow: totalCost / activities.length,
      byModel,
    };
  }

  /**
   * Get compliance analysis
   */
  async getComplianceAnalysis() {
    const analyses = await prisma.technicalAnalysis.findMany({
      where: {
        overallCompliance: { not: null },
      },
    });

    const avgCompliance = analyses.reduce(
      (sum, a) => sum + (a.overallCompliance || 0),
      0
    ) / analyses.length;

    const distribution = {
      high: analyses.filter(a => (a.overallCompliance || 0) >= 90).length,
      medium: analyses.filter(a => {
        const c = a.overallCompliance || 0;
        return c >= 70 && c < 90;
      }).length,
      low: analyses.filter(a => (a.overallCompliance || 0) < 70).length,
    };

    return {
      avgCompliance,
      distribution,
      totalAnalyses: analyses.length,
    };
  }

  /**
   * Calculate average processing time
   */
  private async calculateAverageProcessingTime(where: any) {
    const workflows = await prisma.workflowRun.findMany({
      where: {
        rfp: where,
        status: 'COMPLETED',
        durationMs: { not: null },
      },
    });

    if (workflows.length === 0) return 0;

    return workflows.reduce((sum, w) => sum + (w.durationMs || 0), 0) / workflows.length;
  }

  /**
   * Get dashboard overview
   */
  async getDashboardOverview() {
    const today = new Date();
    const thirtyDaysAgo = addDays(today, -30);

    const [
      rfpStats,
      workflowMetrics,
      agentMetrics,
      costAnalysis,
      complianceAnalysis,
      upcomingDeadlines,
    ] = await Promise.all([
      this.getRFPStatistics(thirtyDaysAgo, today),
      this.getWorkflowMetrics(thirtyDaysAgo, today),
      this.getAgentMetrics(),
      this.getCostAnalysis(thirtyDaysAgo, today),
      this.getComplianceAnalysis(),
      this.getUpcomingDeadlines(),
    ]);

    return {
      period: '30 days',
      rfpStats,
      workflowMetrics,
      agentMetrics,
      costAnalysis,
      complianceAnalysis,
      upcomingDeadlines,
    };
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(days: number = 30) {
    const today = startOfDay(new Date());
    const futureDate = endOfDay(addDays(today, days));

    return prisma.rFP.findMany({
      where: {
        submissionDeadline: {
          gte: today,
          lte: futureDate,
        },
        status: {
          notIn: ['SUBMITTED', 'CANCELLED', 'LOST'],
        },
      },
      orderBy: {
        submissionDeadline: 'asc',
      },
      take: 20,
    });
  }
}

export default new AnalyticsService();