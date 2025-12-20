import express from 'express';
import { prisma} from '../prisma/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    // Get total RFPs
    const totalRFPs = await prisma.rFP.count();
    
    // Get active workflows
    const activeWorkflows = await prisma.workflowRun.count({
      where: { status: 'RUNNING' }
    });
    
    // Get average response time (sample calculation)
    const responses = await prisma.rFPResponse.findMany({
      where: { submittedAt: { not: null } },
      select: { createdAt: true, submittedAt: true }
    });
    
    let avgResponseTime = 0;
    if (responses.length > 0) {
      const totalHours = responses.reduce((sum, r) => {
        if (r.submittedAt) {
          const hours = (r.submittedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);
      avgResponseTime = totalHours / responses.length;
    }
    
    // Get total value
    const pricingAnalyses = await prisma.pricingAnalysis.findMany({
      where: { status: 'COMPLETED' },
      select: { totalBidPrice: true }
    });
    
    const totalValue = pricingAnalyses.reduce((sum, p) => {
      return sum + (p.totalBidPrice ? Number(p.totalBidPrice) : 0);
    }, 0);
    
    // Get recent RFPs
    const recentRFPs = await prisma.rFP.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        estimatedValue: true
      }
    });

    res.json({
      totalRFPs,
      activeWorkflows,
      avgResponseTime,
      totalValue,
      recentRFPs: recentRFPs.map(rfp => ({
        id: rfp.id,
        title: rfp.title,
        status: rfp.status,
        value: rfp.estimatedValue ? Number(rfp.estimatedValue) : 0
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;