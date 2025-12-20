'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWorkflowStatus, useTechnicalAnalysis, usePricingAnalysis } from '@/lib/hooks/useRFP';
import { formatDateTime, formatDuration, formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import { WORKFLOW_STATUS_COLORS } from '@/lib/utils/constants';

interface PageProps {
  params: { id: string };
}

// Progress component (create if you don't have one)
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-primary h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

export default function WorkflowPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  
  const { 
    data: workflow, 
    isLoading: workflowLoading, 
    error: workflowError 
  } = useWorkflowStatus(id);
  
  const { 
    data: technicalData, 
    isLoading: technicalLoading 
  } = useTechnicalAnalysis(id);
  
  const { 
    data: pricingData, 
    isLoading: pricingLoading 
  } = usePricingAnalysis(id);

  // Debug log
  console.log('Workflow data:', workflow);

  if (workflowLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (workflowError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workflow Status</h1>
            <p className="text-gray-500 mt-1">Error loading workflow</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Error: {workflowError.message}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workflow Status</h1>
            <p className="text-gray-500 mt-1">No workflow data available</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p>No workflow found for this RFP. The workflow may not have been started yet.</p>
            <Button 
              onClick={() => router.push(`/rfps/${id}`)} 
              className="mt-4"
            >
              Back to RFP Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = workflow.totalSteps > 0 ? (workflow.completedSteps / workflow.totalSteps) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workflow Status</h1>
            <p className="text-gray-500 mt-1">Run #{workflow.runNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workflow Progress</CardTitle>
            <Badge className={WORKFLOW_STATUS_COLORS[workflow.status] || 'bg-gray-100 text-gray-800'}>
              {workflow.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            {workflow.status === 'RUNNING' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {workflow.completedSteps || 0} of {workflow.totalSteps || 0} steps completed
                </span>
                <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Started</p>
              <p className="text-sm font-medium">
                {workflow.startedAt ? formatDateTime(workflow.startedAt) : 'Not started'}
              </p>
            </div>
            
            {workflow.completedAt && (
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-sm font-medium">{formatDateTime(workflow.completedAt)}</p>
              </div>
            )}
            
            {workflow.durationMs && (
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-sm font-medium">{formatDuration(workflow.durationMs)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Analysis Section */}
      {technicalLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          </CardContent>
        </Card>
      ) : technicalData && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Compliance</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPercentage(technicalData.overallCompliance || 0)}
                </span>
              </div>
              <Progress value={technicalData.overallCompliance || 0} className="h-2" />
            </div>

            {technicalData.skuMatches && technicalData.skuMatches.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Recommended Products</h4>
                <div className="space-y-3">
                  {technicalData.skuMatches.slice(0, 3).map((match: any, index: number) => (
                    <div key={match.id || index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">#{index + 1} - Match Score</span>
                        <Badge>{formatPercentage(match.overallMatchScore || 0)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{match.justification || 'No justification provided'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Analysis Section */}
      {pricingLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          </CardContent>
        </Card>
      ) : pricingData && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bid Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(parseFloat(pricingData.totalBidPrice || '0'))}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Cost Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Products Cost</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(parseFloat(pricingData.productsCost || '0'))}
                  </span>
                </div>
                {pricingData.testingCost && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Testing Cost</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(parseFloat(pricingData.testingCost))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}