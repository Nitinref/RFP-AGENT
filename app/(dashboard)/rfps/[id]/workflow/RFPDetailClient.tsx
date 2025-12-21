'use client';

import { useRFP, useStartWorkflow } from '@/lib/hooks/useRFP';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Play, 
  FileText, 
  Calendar, 
  Building2, 
  DollarSign, 
  MapPin,
  Target,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Users,
  BarChart3,
  Activity,
  History,
  Edit,
  Copy,
  Share2,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { RFP_STATUS_COLORS, PRIORITY_COLORS } from '@/lib/utils/constants';

// Status Timeline Component
const StatusTimeline = ({ status }: { status: string }) => {
  const steps = [
    { id: 'NEW', label: 'Received', icon: FileText, color: 'bg-blue-500' },
    { id: 'ANALYZING', label: 'Analyzing', icon: BarChart3, color: 'bg-purple-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'bg-yellow-500' },
    { id: 'SUBMITTED', label: 'Submitted', icon: CheckCircle2, color: 'bg-green-500' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === status);

  return (
    <div className="relative">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStepIndex;
          const isCurrent = step.id === status;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${isCompleted ? step.color : 'bg-gray-200'}
                ${isCurrent ? 'ring-4 ring-offset-2' : ''}
                ${isCurrent ? step.color.replace('bg-', 'ring-') : ''}
                transition-all duration-300
              `}>
                <Icon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <span className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 -z-10">
        <div 
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Quick Action Button
const QuickAction = ({ icon: Icon, label, onClick, variant = 'outline' }: any) => (
  <Button variant={variant} size="sm" className="gap-2" onClick={onClick}>
    <Icon className="h-4 w-4" />
    {label}
  </Button>
);

// Metric Card
const MetricCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function RFPDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: rfp, isLoading } = useRFP(id);
  const startWorkflow = useStartWorkflow();

  const handleStartWorkflow = async () => {
    await startWorkflow.mutateAsync({
      id,
      reason: 'Manual trigger from RFP details page',
    });
    router.push(`/rfps/${id}/workflow`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600">Loading RFP details...</p>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">RFP Not Found</h2>
        <p className="text-gray-600 mb-6">The requested RFP could not be found.</p>
        <Link href="/rfps">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to RFPs
          </Button>
        </Link>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(rfp.submissionDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const completionPercentage = 45; // This should come from your API

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <Link href="/rfps">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {rfp.rfpNumber || 'RFP-001'}
                    </span>
                    <Badge className={`${PRIORITY_COLORS[rfp.priority] || 'bg-gray-100 text-gray-800'} uppercase px-3 py-1`}>
                      {rfp.priority || 'MEDIUM'}
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {rfp.title || 'Industrial Automation System Upgrade'}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {rfp.issuer || 'ACME Manufacturing Corp'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <QuickAction icon={Copy} label="Duplicate" />
              <QuickAction icon={Share2} label="Share" />
              <Link href={`/rfps/${id}/edit`}>
                <QuickAction icon={Edit} label="Edit" />
              </Link>
              <Button 
                onClick={handleStartWorkflow} 
                disabled={startWorkflow.isPending}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2"
              >
                <Play className="h-4 w-4" />
                {startWorkflow.isPending ? 'Starting...' : 'Start Workflow'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Timeline */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Progress Timeline</CardTitle>
                <CardDescription className="text-gray-600">Track the current status of your RFP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <StatusTimeline status={rfp.status || 'NEW'} />
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Overall Progress</span>
                    <span className="font-bold text-gray-900">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RFP Details */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">RFP Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-900">
                    <FileText className="h-5 w-5" />
                    Description
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {rfp.description || 'Procurement of sensors, controllers, and related equipment for industrial automation system upgrade.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Submission Deadline</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(rfp.submissionDeadline) || 'December 31, 2024'}
                        </p>
                        <p className={`text-sm mt-1 ${
                          daysRemaining < 7 ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Overdue'}
                        </p>
                      </div>
                    </div>

                    {rfp.estimatedValue && (
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Estimated Value</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(rfp.estimatedValue, rfp.currency) || '$500,000'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {rfp.region && (
                      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <MapPin className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Region</p>
                          <p className="text-lg font-semibold text-gray-900">{rfp.region || 'North America'}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <Target className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <Badge className={`${RFP_STATUS_COLORS[rfp.status] || 'bg-gray-100 text-gray-800'} text-sm font-medium px-3 py-1`}>
                          {(rfp.status || 'NEW').replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {rfp.tags && rfp.tags.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Tags & Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {rfp.tags.map((tag: string) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-sm px-3 py-1.5 border-gray-300 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Tags & Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-sm px-3 py-1.5 border-gray-300">Automation</Badge>
                      <Badge variant="outline" className="text-sm px-3 py-1.5 border-gray-300">Manufacturing</Badge>
                      <Badge variant="outline" className="text-sm px-3 py-1.5 border-gray-300">Technology</Badge>
                      <Badge variant="outline" className="text-sm px-3 py-1.5 border-gray-300">Equipment</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600">Manage this RFP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/rfps/${id}/workflow`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-10">
                    <Activity className="h-4 w-4" />
                    View Workflow
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start gap-3 h-10">
                  <Download className="h-4 w-4" />
                  Download Details
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-10">
                  <History className="h-4 w-4" />
                  View History
                </Button>
                <Link href={`/rfps/${id}/edit`}>
                  <Button variant="outline" className="w-full justify-start gap-3 h-10">
                    <Edit className="h-4 w-4" />
                    Edit RFP
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricCard
                  title="Days Remaining"
                  value={daysRemaining}
                  icon={Clock}
                  color="bg-blue-100 text-blue-600"
                  subtext="Until submission deadline"
                />
                <MetricCard
                  title="Team Members"
                  value="5"
                  icon={Users}
                  color="bg-purple-100 text-purple-600"
                  subtext="Assigned to this RFP"
                />
                <MetricCard
                  title="Documents"
                  value="8"
                  icon={FileText}
                  color="bg-green-100 text-green-600"
                  subtext="Attached files"
                />
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Priority</span>
                    <Badge className={`${PRIORITY_COLORS[rfp.priority] || 'bg-gray-100 text-gray-800'} uppercase px-3 py-1`}>
                      {rfp.priority || 'MEDIUM'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {rfp.createdAt ? formatDate(rfp.createdAt) : 'Nov 15, 2024'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {rfp.updatedAt ? formatRelativeTime(rfp.updatedAt) : '2 days ago'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Workflow Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        rfp.workflowActive ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium text-gray-900">
                        {rfp.workflowActive ? 'Active' : 'Not Started'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}