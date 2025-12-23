'use client';

import { useParams } from 'next/navigation';
import { useWorkflowStatus, useRFPReport } from '@/lib/hooks/useRFP';
import { useWorkflowActivities } from '@/lib/hooks/useWorkflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  BarChart3,
  FileText,
  Users,
  Target,
  Zap,
  ExternalLink,
  Download,
  ChevronRight,
  Activity,
  GitBranch,
  Layers,
  Workflow as WorkflowIcon,
  DollarSign,
  TrendingUp,
  Shield,
  Package,
  Eye,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import router from 'next/router';


// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    PENDING: {
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: <Clock className="h-3 w-3 mr-1" />
    },
    IN_PROGRESS: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Activity className="h-3 w-3 mr-1" />
    },
    RUNNING: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Activity className="h-3 w-3 mr-1" />
    },
    COMPLETED: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />
    },
    FAILED: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: <XCircle className="h-3 w-3 mr-1" />
    },
    PAUSED: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: <Clock className="h-3 w-3 mr-1" />
    },
    CANCELLED: {
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: <XCircle className="h-3 w-3 mr-1" />
    },
  };
  const router = useRouter();
  const params = useParams();
  const rfpId = params.id as string;

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge variant="outline" className={`${config.color} flex items-center gap-1 px-3 py-1 border`}>
      {config.icon}
      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
    </Badge>

  );
};

// Step Component
const StepCard = ({
  step,
  index,
  isActive,
  isCompleted
}: {
  step: any;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
}) => {
  const getStepIcon = (agentType: string) => {
    const icons: Record<string, React.ReactNode> = {
      'SALES_SCOUT': <Users className="h-5 w-5" />,
      'TECHNICAL_SPECIALIST': <BarChart3 className="h-5 w-5" />,
      'PRICING_SPECIALIST': <DollarSign className="h-5 w-5" />,
      'ORCHESTRATOR': <GitBranch className="h-5 w-5" />,
    };
    return icons[agentType] || <Target className="h-5 w-5" />;
  };

  const getStepName = (agentType: string) => {
    const names: Record<string, string> = {
      'SALES_SCOUT': 'Sales Triage',
      'TECHNICAL_SPECIALIST': 'Technical Analysis',
      'PRICING_SPECIALIST': 'Pricing Analysis',
      'ORCHESTRATOR': 'Response Generation',
    };
    return names[agentType] || 'Agent';
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`
        relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
        ${isCompleted ? 'bg-green-500 text-white' :
          isActive ? 'bg-blue-500 text-white ring-4 ring-blue-200' :
            'bg-gray-200 text-gray-600'}
        transition-all duration-300
      `}>
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : isActive ? (
          <Activity className="h-5 w-5 animate-pulse" />
        ) : (
          <span className="font-bold">{index + 1}</span>
        )}

        {/* Connector line */}
        {index < 3 && (
          <div className="absolute top-full left-1/2 w-0.5 h-6 -translate-x-1/2 bg-gray-200" />
        )}
      </div>

      <Card className={`flex-1 transition-all duration-300 ${isActive ? 'border-blue-300 shadow-lg shadow-blue-100' :
        isCompleted ? 'border-green-200 shadow-sm' :
          'border-gray-200'
        }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isCompleted ? 'bg-green-100 text-green-600' :
                  isActive ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-500'}
              `}>
                {getStepIcon(step.agentType)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {getStepName(step.agentType)}
                </h4>
                <p className="text-sm text-gray-500">
                  {step.description || step.task || 'Processing...'}
                </p>
                {step.createdAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Started: {formatDate(step.createdAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Badge className={`
                ${step.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-300' :
                  step.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    step.status === 'FAILED' ? 'bg-red-100 text-red-800 border-red-300' :
                      step.status === 'RUNNING' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                } text-xs
              `}>
                {step.status?.toLowerCase().replace('_', ' ') || 'pending'}
              </Badge>

              {step.durationMs && (
                <span className="text-xs text-gray-500">
                  {Math.round(step.durationMs / 1000)}s
                </span>
              )}
              {step.completedAt && step.createdAt && (
                <span className="text-xs text-gray-500">
                  {Math.round((new Date(step.completedAt).getTime() - new Date(step.createdAt).getTime()) / 1000)}s
                </span>
              )}
            </div>
          </div>

          {step.result && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Result:</p>
                  <p className="text-sm text-gray-600">
                    {typeof step.result === 'string'
                      ? step.result
                      : JSON.stringify(step.result, null, 2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step.output && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Output:</p>
                  <p className="text-sm text-gray-600">
                    {typeof step.output === 'string'
                      ? step.output
                      : JSON.stringify(step.output, null, 2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{step.error}</p>
              </div>
            </div>
          )}

          {(step.model || step.llmModel) && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-gray-50">
                {step.model || step.llmModel}
              </Badge>
              {step.tokens && (
                <span className="text-xs text-gray-500">
                  {step.tokens} tokens
                </span>
              )}
              {step.cost && (
                <span className="text-xs text-gray-500">
                  ${step.cost}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change, description }: any) => (
  <Card className="hover:shadow-md transition-shadow border">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          {change && (
            <p className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Analysis Badge Component
const AnalysisBadge = ({ label, value, icon: Icon, color }: any) => (
  <div className="flex items-center gap-2 p-3 bg-white border rounded-lg">
    <div className={`p-2 rounded-full ${color}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  </div>
);

export default function WorkflowPage() {
  const params = useParams();
  const id = params?.id as string;

  // ✅ Using existing hooks
  const { data: workflow, isLoading, error, refetch } = useWorkflowStatus(id);
  const {
    data: reportResponse,
    isLoading: reportLoading,
    error: reportError,
    refetch: refetchReport
  } = useRFPReport(workflow?.rfpId);

  // ✅ Using REAL database activities hook
  const {
    data: dbActivities = [],
    isLoading: activitiesLoading,
    refetch: refetchActivities
  } = useWorkflowActivities(workflow?.id);

  const [showReport, setShowReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);

  // Extract report data
  const report = reportResponse;

  // ✅ Handle View Detailed Logs
  const handleViewDetailedLogs = () => {
    if (workflow?.id) {
      // Option 1: Open in new tab with logs page
      window.open(`/workflows/${workflow.id}/logs`, '_blank');

      // Option 2: Show modal with detailed logs (if you have a logs page)
      // setShowDetailedLogs(true);

      toast.info('Opening detailed logs...');
    } else {
      toast.error('Workflow ID not found');
    }
  };

  const handleDownloadPDF = () => {
  if (!workflow?.rfpId) {
    toast.error('RFP ID not found');
    return;
  }

  const token = localStorage.getItem('token');

  window.open(
    `http://localhost:3000/api/rfps/${workflow.rfpId}/report/pdf?token=${token}`,
    '_blank'
  );
};




  // ✅ SIMPLE Export Function (Uses existing report data)
  const handleExportReport = () => {
    if (!report) {
      toast.error('No report data available');
      return;
    }

    setIsExporting(true);

    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RFP-Report-${workflow?.rfpId || 'unknown'}-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Report exported successfully! Check your downloads.');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Auto-refresh when workflow is running
  useEffect(() => {
    {/* @ts-ignore */ }
    if (workflow?.status === 'RUNNING' || workflow?.status === 'IN_PROGRESS') {
      const interval = setInterval(() => {
        refetch();
        refetchReport();
        refetchActivities();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [workflow?.status, refetch, refetchReport, refetchActivities]);

  // Calculate progress
  const completionPercentage = workflow
    ? Math.round((workflow.completedSteps / workflow.totalSteps) * 100)
    : 0;

  // Get recent activities for sidebar (last 3 activities)
  const recentActivity = dbActivities?.slice(-3).reverse() || [];

  // Get agent count
  const agentCount = dbActivities?.length || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Workflow</h2>
          <p className="text-gray-600">Fetching workflow status and details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Workflow</h2>
          <p className="text-gray-600 mb-6">
            Unable to load workflow details. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No workflow found
  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Not Found</h2>
          <p className="text-gray-600 mb-6">
            The workflow you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/rfps">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to RFPs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <Link href={`/rfps/${workflow.rfpId}`}>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg">
                      <WorkflowIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Workflow Run #{workflow.runNumber}
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span>RFP ID: {workflow.rfpId?.substring(0, 8)}...</span>
                        <span>•</span>
                        <span>{workflow.triggerType.toLowerCase().replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  refetch();
                  refetchReport();
                  refetchActivities();
                  toast.success('Refreshed workflow data');
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              {/* Export Report Button */}
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2 text-white"
                onClick={handleExportReport}
                disabled={isExporting || !report}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Report
                  </>
                )}
              </Button>

              {/* View Report Button */}
              <Link href={`/rfps/${workflow.rfpId}/report`}>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2 text-white">
                    <ExternalLink className="h-4 w-4" />
                    View RFP Details
                  </Button>
                </Link>
           
                

            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Overall Progress"
            value={`${completionPercentage}%`}
            icon={Activity}
            color="bg-blue-100 text-blue-600"
            description={`${workflow.completedSteps || 0} of ${workflow.totalSteps || 0} steps`}
          />
          <StatCard
            title="Workflow Status"
            value={
              <div className="flex items-center gap-2">
                <StatusBadge status={workflow.status} />
              </div>
            }
            icon={Zap}
            color="bg-orange-100 text-orange-600"
            description={workflow.triggerReason || 'Manual trigger'}
          />
          <StatCard
            title="Time Elapsed"
            value={`${workflow.durationMs ? Math.round(workflow.durationMs / 1000) : 0}s`}
            icon={Clock}
            color="bg-purple-100 text-purple-600"
            description={workflow.completedAt ? 'Completed' : 'In progress'}
          />
          <StatCard
            title="AI Agents"
            value={agentCount}
            icon={Users}
            color="bg-green-100 text-green-600"
            description={`${dbActivities?.filter((a: any) => a.status === 'COMPLETED').length || 0} completed`}
          />
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <GitBranch className="h-5 w-5 text-blue-500" />
                <div>
                  <span className="font-medium text-gray-900">Workflow Progress</span>
                  <p className="text-sm text-gray-500">Real-time execution tracking</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-gray-500 mt-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Started: {formatDate(workflow.startedAt)}
              </span>
              {/* @ts-ignore */}
              <span>{workflow.status === 'RUNNING' || workflow.status === 'IN_PROGRESS' ? '🔄 In Progress' : workflow.status}</span>
              <span>
                {workflow.completedAt
                  ? `Completed: ${formatDate(workflow.completedAt)}`
                  : '⏳ Ongoing'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ✅ Report Section - Uses backend data */}
        {showReport && report && (
          <Card className="mb-8 border shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    RFP Final Report
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    AI-generated analysis and proposal • Generated on {formatDate(report.generatedAt || new Date().toISOString())}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportReport}
                    disabled={isExporting}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReport(false)}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* RFP Overview */}
              <section className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  RFP Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {report.rfpDetails && (
                    <>
                      <AnalysisBadge
                        label="Title"
                        value={report.rfpDetails.title || 'Untitled RFP'}
                        icon={FileText}
                        color="bg-blue-100 text-blue-600"
                      />
                      <AnalysisBadge
                        label="Issuer"
                        value={report.rfpDetails.issuer || 'Unknown'}
                        icon={Users}
                        color="bg-green-100 text-green-600"
                      />
                      <AnalysisBadge
                        label="Deadline"
                        value={formatDate(report.rfpDetails.deadline)}
                        icon={Clock}
                        color="bg-orange-100 text-orange-600"
                      />
                      <AnalysisBadge
                        label="Estimated Value"
                        value={`$${parseInt(report.rfpDetails.estimatedValue || '0').toLocaleString()}`}
                        icon={DollarSign}
                        color="bg-purple-100 text-purple-600"
                      />
                    </>
                  )}
                </div>
              </section>

              {/* Executive Summary */}
              {report.summary && (
                <section className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Executive Summary
                  </h3>
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {report.summary}
                    </p>
                  </div>
                </section>
              )}

              {/* Technical Analysis */}
              {report.technicalAnalysis && (
                <section className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Technical Analysis
                  </h3>
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    {typeof report.technicalAnalysis === 'string' ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{report.technicalAnalysis}</p>
                    ) : (
                      <div className="space-y-4">
                        {report.technicalAnalysis.compliance !== undefined && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Overall Compliance</span>
                              <span className="text-2xl font-bold text-green-600">
                                {report.technicalAnalysis.compliance}%
                              </span>
                            </div>
                            <Progress value={report.technicalAnalysis.compliance} className="h-2" />
                          </div>
                        )}

                        {report.technicalAnalysis.matchedSKUs && Array.isArray(report.technicalAnalysis.matchedSKUs) && (
                          <div>
                            <h4 className="font-semibold mb-3">Matched Products</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {report.technicalAnalysis.matchedSKUs.map((sku: any, idx: number) => (
                                <Card key={idx} className="border hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">{sku.name || sku.sku || `SKU ${idx + 1}`}</span>
                                      <Badge className="bg-green-100 text-green-800">
                                        {sku.matchScore || 85}% match
                                      </Badge>
                                    </div>
                                    {sku.description && (
                                      <p className="text-sm text-gray-600">{sku.description}</p>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Pricing Analysis */}
              {report.pricingAnalysis && (
                <section className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Pricing Analysis
                  </h3>
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    {typeof report.pricingAnalysis === 'string' ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{report.pricingAnalysis}</p>
                    ) : (
                      <div className="space-y-6">
                        {report.pricingAnalysis.totalBidPrice && (
                          <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                            <p className="text-sm text-gray-600 mb-2">Total Bid Price</p>
                            <p className="text-4xl font-bold text-purple-700">
                              ${parseInt(report.pricingAnalysis.totalBidPrice).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {report.pricingAnalysis.breakdown && (
                          <div>
                            <h4 className="font-semibold mb-3">Cost Breakdown</h4>
                            <div className="space-y-3">
                              {Object.entries(report.pricingAnalysis.breakdown).map(([key, value]: [string, any]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className="font-bold">${parseInt(value).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {report.pricingAnalysis.margin && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Target Margin</span>
                              <span className="text-2xl font-bold text-green-600">
                                {report.pricingAnalysis.margin}%
                              </span>
                            </div>
                            <Progress value={report.pricingAnalysis.margin} className="h-2" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Final Response */}
              {report.finalResponse && (
                <section className="bg-gradient-to-r from-gray-50 to-slate-100 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gray-600" />
                    Final Response
                  </h3>
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {report.finalResponse}
                    </p>
                  </div>
                </section>
              )}

              {/* Report Metadata */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    <p>Generated by: {report.system?.generatedBy || 'AI RFP Assistant'}</p>
                    <p>Export format: {report.system?.exportFormat || 'JSON'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Share
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1 bg-blue-600"
                      onClick={handleExportReport}
                      disabled={isExporting}
                    >
                      <Download className="h-3 w-3" />
                      Download Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Steps Timeline - Now using REAL DATA */}
          <div className="lg:col-span-2">
            <Card className="border shadow-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">AI Agent Activities</CardTitle>
                    <CardDescription>
                      {dbActivities && dbActivities.length > 0
                        ? `${dbActivities.length} steps from database`
                        : 'Waiting for workflow execution...'}
                    </CardDescription>
                  </div>
                  {activitiesLoading && (
                    <LoadingSpinner size="sm" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {activitiesLoading ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">Loading activities...</p>
                  </div>
                ) : dbActivities && dbActivities.length > 0 ? (
                  <div className="space-y-8">
                    {dbActivities.map((activity: any, index: number) => (
                      <StepCard
                        key={activity.id}
                        step={activity}
                        index={index}
                        isActive={activity.status === 'IN_PROGRESS' || activity.status === 'RUNNING'}
                        isCompleted={activity.status === 'COMPLETED'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No Activities Yet</p>
                    <p>Agent activities will appear here as they execute...</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => refetchActivities()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="default"
                  className="w-full justify-start gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                  onClick={handleExportReport}
                  disabled={isExporting || !report}
                >
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isExporting ? 'Exporting...' : 'Export Report'}
                </Button>

                <Link href={`/rfps/${workflow.rfpId}/report`}>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2 text-white">
                    <ExternalLink className="h-4 w-4" />
                    View RFP Details
                  </Button>
                </Link>
                {/* ✅ View Detailed Logs Button - NOW WORKING */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={handleViewDetailedLogs}
                >
                  <Eye className="h-4 w-4" />
                  View Detailed Logs
                </Button>

                <Link href={`/rfps/${workflow.rfpId}`}>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <ArrowLeft className="h-4 w-4" />
                    Back to RFP
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Agent Status */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Agent Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dbActivities && dbActivities.length > 0 ? (
                    dbActivities.map((activity: any) => {
                      const isActive = activity.status === 'IN_PROGRESS' || activity.status === 'RUNNING';
                      const isCompleted = activity.status === 'COMPLETED';

                      return (
                        <div key={activity.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-green-500' :
                              isActive ? 'bg-blue-500 animate-pulse' :
                                'bg-gray-300'
                              }`}></div>
                            <span className="text-sm font-medium">
                              {activity.agentType
                                ? activity.agentType.split('_').map((w: string) =>
                                  w.charAt(0) + w.slice(1).toLowerCase()
                                ).join(' ')
                                : 'Unknown Agent'
                              }
                            </span>
                          </div>
                          <Badge className={`
                            ${isCompleted ? 'bg-green-100 text-green-800 border-green-300' :
                              isActive ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                activity.status === 'FAILED' ? 'bg-red-100 text-red-800 border-red-300' :
                                  'bg-gray-100 text-gray-800 border-gray-300'
                            } text-xs
                          `}>
                            {activity.status?.toLowerCase().replace('_', ' ') || 'pending'}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No agents active yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity: any) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.status === 'COMPLETED' ? 'bg-green-500' :
                          activity.status === 'IN_PROGRESS' || activity.status === 'RUNNING' ? 'bg-blue-500' :
                            activity.status === 'FAILED' ? 'bg-red-500' :
                              'bg-gray-300'
                          }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description || activity.task || 'Activity'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {activity.agentType
                                ? activity.agentType.split('_').map((w: string) =>
                                  w.charAt(0) + w.slice(1).toLowerCase()
                                ).join(' ')
                                : 'Agent'
                              }
                            </span>
                            {activity.createdAt && (
                              <span className="text-xs text-gray-400">
                                • {formatDate(activity.createdAt).split(',')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Workflow Info */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Workflow Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Trigger Type</p>
                      <p className="text-sm text-gray-600">{workflow.triggerType.toLowerCase().replace('_', ' ')}</p>
                    </div>
                  </div>

                  {workflow.triggerReason && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Trigger Reason</p>
                        <p className="text-sm text-gray-600">{workflow.triggerReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Started</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(workflow.startedAt)}
                      </p>
                    </div>
                  </div>

                  {workflow.completedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(workflow.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-gray-600">
                        {workflow.durationMs ? Math.round(workflow.durationMs / 1000) : 0} seconds
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        {workflow.status === 'COMPLETED' && (
          <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">🎉 Workflow Completed Successfully!</h3>
                  <p className="text-gray-600 mt-1">
                    All AI agents have completed their tasks. The final report is ready for review.
                  </p>
                  {dbActivities && (
                    <p className="text-sm text-gray-500 mt-2">
                      {dbActivities.filter((a: any) => a.status === 'COMPLETED').length} of {dbActivities.length} agents completed successfully.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-green-300 hover:bg-green-50"
                  onClick={handleExportReport}
                  disabled={isExporting || !report}
                >
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isExporting ? 'Exporting...' : 'Download Report'}
                </Button>
                <Link href={`/rfps/${workflow.rfpId}/report`}>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2 text-white">
                    <ExternalLink className="h-4 w-4" />
                    View RFP Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {workflow.status === 'FAILED' && (
          <div className="mt-8 p-8 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-full">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">❌ Workflow Failed</h3>
                  <p className="text-gray-600 mt-1">
                    The workflow encountered an error and could not complete.
                  </p>
                  {workflow.error && (
                    <p className="text-sm text-red-600 mt-2 font-medium">{workflow.error}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                {workflow.canRetry && (
                  <Button variant="outline" className="gap-2 border-red-300 hover:bg-red-50">
                    <RefreshCw className="h-4 w-4" />
                    Retry Workflow
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleViewDetailedLogs}
                >
                  <Eye className="h-4 w-4" />
                  View Error Logs
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}