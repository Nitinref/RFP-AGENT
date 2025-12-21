'use client';

import { useParams } from 'next/navigation';
import { useWorkflowStatus } from '@/lib/hooks/useRFP';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  ArrowLeft,
  Play,
  Pause,
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
  Workflow as WorkflowIcon
} from 'lucide-react';
import Link from 'next/link';

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    PENDING: { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <Clock className="h-3 w-3 mr-1" /> 
    },
    RUNNING: { 
      color: 'bg-blue-100 text-blue-800', 
      icon: <Activity className="h-3 w-3 mr-1" /> 
    },
    COMPLETED: { 
      color: 'bg-green-100 text-green-800', 
      icon: <CheckCircle2 className="h-3 w-3 mr-1" /> 
    },
    FAILED: { 
      color: 'bg-red-100 text-red-800', 
      icon: <XCircle className="h-3 w-3 mr-1" /> 
    },
    PAUSED: { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: <Pause className="h-3 w-3 mr-1" /> 
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge className={`${config.color} flex items-center gap-1 px-3 py-1`}>
      {config.icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
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
  const getStepIcon = (stepName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Sales Triage': <Users className="h-5 w-5" />,
      'Technical Analysis': <BarChart3 className="h-5 w-5" />,
      'Pricing Analysis': <FileText className="h-5 w-5" />,
      'Timeline Estimation': <Clock className="h-5 w-5" />,
      'Document Generation': <FileText className="h-5 w-5" />,
      'Review & Approval': <CheckCircle2 className="h-5 w-5" />,
    };
    return icons[stepName] || <Target className="h-5 w-5" />;
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
        ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'}
        ${isActive ? 'ring-4 ring-blue-200' : ''}
        transition-all duration-300
      `}>
        <div className="text-white font-bold">
          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
        </div>
      </div>
      
      <Card className={`flex-1 transition-all duration-300 ${
        isActive ? 'border-blue-300 shadow-md' : 'border-gray-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${isCompleted ? 'bg-green-100 text-green-600' : 
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
              `}>
                {getStepIcon(step.name)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{step.name}</h4>
                <p className="text-sm text-gray-500">
                  {step.description || 'Processing step...'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              {step.status && (
                <Badge className={`
                  ${step.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    step.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                    step.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  } text-xs
                `}>
                  {step.status.toLowerCase()}
                </Badge>
              )}
              
              {step.duration && (
                <span className="text-xs text-gray-500 mt-1">
                  {Math.round(step.duration / 1000)}s
                </span>
              )}
            </div>
          </div>
          
          {step.details && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">{step.details}</p>
            </div>
          )}
          
          {step.error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{step.error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function WorkflowPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: workflow, isLoading, error } = useWorkflowStatus(id);

  // Mock data for demonstration
  const mockSteps = [
    {
      name: 'Sales Triage',
      description: 'Analyzing RFP priority and strategic value',
      status: 'COMPLETED',
      duration: 2500,
      details: 'Priority: MEDIUM | Strategic Value: 7/10',
    },
    {
      name: 'Technical Analysis',
      description: 'Matching requirements with products',
      status: 'RUNNING',
      duration: 1800,
      details: '3 SKU matches found | 85% compliance',
    },
    {
      name: 'Pricing Analysis',
      description: 'Calculating cost estimates and margins',
      status: 'PENDING',
    },
    {
      name: 'Timeline Estimation',
      description: 'Estimating project timeline and milestones',
      status: 'PENDING',
    },
    {
      name: 'Document Generation',
      description: 'Creating proposal documents',
      status: 'PENDING',
    },
    {
      name: 'Review & Approval',
      description: 'Final review and approval process',
      status: 'PENDING',
    },
  ];

  const completionPercentage = workflow 
    ? Math.round((workflow.completedSteps / workflow.totalSteps) * 100)
    : 33; // Mock value

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Workflow</h2>
          <p className="text-gray-600">Fetching workflow status and details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <Link href={`/rfps/${id}`}>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <WorkflowIcon className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Workflow Orchestration
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    AI-powered RFP response automation in progress
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Restart
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Overall Progress"
            value={`${completionPercentage}%`}
            icon={Activity}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Steps Completed"
            value={`${workflow?.completedSteps || 2}/${workflow?.totalSteps || 6}`}
            icon={CheckCircle2}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Time Elapsed"
            value={`${workflow?.durationMs ? Math.round(workflow.durationMs / 1000) : 43}s`}
            icon={Clock}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Status"
            value={
              <div className="flex items-center gap-2">
                <StatusBadge status={workflow?.status || 'RUNNING'} />
              </div>
            }
            icon={Zap}
            color="bg-orange-100 text-orange-600"
          />
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <GitBranch className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">Workflow Progress</span>
              </div>
              <span className="font-bold text-gray-900">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Started</span>
              <span>In Progress</span>
              <span>Completed</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Steps Timeline */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Workflow Steps</CardTitle>
                <CardDescription>
                  Sequential steps in the RFP response automation process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockSteps.map((step, index) => (
                    <StepCard
                      key={step.name}
                      step={step}
                      index={index}
                      isActive={step.status === 'RUNNING'}
                      isCompleted={step.status === 'COMPLETED'}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Panel */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <ExternalLink className="h-4 w-4" />
                  View Detailed Logs
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Download className="h-4 w-4" />
                  Download Interim Report
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Users className="h-4 w-4" />
                  Notify Team
                </Button>
                <Link href={`/rfps/${id}`}>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <ArrowLeft className="h-4 w-4" />
                    Back to RFP
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Agent Status */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Agent Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Sales Agent</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-sm font-medium">Technical Agent</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <span className="text-sm font-medium">Pricing Agent</span>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <span className="text-sm font-medium">Timeline Agent</span>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Sales triage completed</p>
                      <p className="text-xs text-gray-500">Priority: MEDIUM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Technical analysis started</p>
                      <p className="text-xs text-gray-500">3 SKUs being analyzed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">AI models initialized</p>
                      <p className="text-xs text-gray-500">GPT-4o ready</p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="w-full text-sm text-blue-600" size="sm">
                    View all activity
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Pricing analysis will start automatically</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Review final report when complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Team will be notified upon completion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        {workflow?.status === 'COMPLETED' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">🎉 Workflow Completed!</h3>
                <p className="text-gray-600 mt-1">
                  All steps have been processed successfully. You can now review the results.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Results
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}