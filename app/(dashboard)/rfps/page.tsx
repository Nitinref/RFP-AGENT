'use client';

import { useState, useMemo } from 'react';
import { useRFPs } from '@/lib/hooks/useRFP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { 
  Plus, 
  Search, 
  Calendar, 
  Building2, 
  DollarSign, 
  ArrowRight,
  Filter,
  X,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  BarChart3,
  ChevronDown,
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { RFP_STATUS_COLORS, PRIORITY_COLORS } from '@/lib/utils/constants';

// Create enhanced Select component
const Select = ({ value, onChange, children, icon: Icon, ...props }: any) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
    )}
    <select
      value={value}
      onChange={onChange}
      className={`flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${Icon ? 'pl-10' : 'pl-3'}`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
  </div>
);

// Enhanced Badge component with icons
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    NEW: { icon: <FileText className="h-3 w-3 mr-1" />, color: 'bg-blue-100 text-blue-800' },
    ANALYZING: { icon: <BarChart3 className="h-3 w-3 mr-1" />, color: 'bg-purple-100 text-purple-800' },
    IN_PROGRESS: { icon: <Clock className="h-3 w-3 mr-1" />, color: 'bg-yellow-100 text-yellow-800' },
    SUBMITTED: { icon: <CheckCircle className="h-3 w-3 mr-1" />, color: 'bg-green-100 text-green-800' },
  };

  const config = statusConfig[status] || { icon: null, color: 'bg-gray-100 text-gray-800' };

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {status.replace('_', ' ')}
    </Badge>
  );
};

// Priority indicator component
const PriorityIndicator = ({ priority }: { priority: string }) => {
  const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${priorityColors[priority] || 'bg-gray-300'}`} />
      <span className="text-xs font-medium capitalize">{priority.toLowerCase()}</span>
    </div>
  );
};

// Stats cards component
const StatsCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-100">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <TrendingUp className={`h-3 w-3 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function RFPsPage() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: rfps = [], isLoading, error } = useRFPs(filters);

  // Calculate stats
  const stats = useMemo(() => {
    if (!rfps) return {};
    return {
      total: rfps.length,
      submitted: rfps.filter((r: any) => r.status === 'SUBMITTED').length,
      inProgress: rfps.filter((r: any) => r.status === 'IN_PROGRESS').length,
      highPriority: rfps.filter((r: any) => r.priority === 'HIGH').length,
    };
  }, [rfps]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ status: '', priority: '', search: '' });
  };

  // Check if any filter is active
  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request for Proposals</h1>
            <p className="text-gray-600 mt-2">Track and manage all your RFP submissions in one place</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Link href="/rfps/new">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="h-4 w-4" />
                New RFP
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total RFPs"
            value={stats.total}
            icon={FileText}
            trend={12}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            trend={8}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatsCard
            title="Submitted"
            value={stats.submitted}
            icon={CheckCircle}
            trend={15}
            color="bg-green-100 text-green-600"
          />
          <StatsCard
            title="High Priority"
            value={stats.highPriority}
            icon={AlertCircle}
            trend={5}
            color="bg-red-100 text-red-600"
          />
        </div>

        {/* Filters and Controls */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="gap-2"
                  >
                    <div className="grid grid-cols-2 gap-0.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-current rounded" />
                      ))}
                    </div>
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="gap-2"
                  >
                    <div className="space-y-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-4 h-0.5 bg-current rounded" />
                      ))}
                    </div>
                    List
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, issuer, or RFP number..."
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <Select
                value={filters.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleFilterChange('status', e.target.value)
                }
                icon={FileText}
              >
                <option value="">All Status</option>
                <option value="NEW">New</option>
                <option value="ANALYZING">Analyzing</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="SUBMITTED">Submitted</option>
              </Select>

              <Select
                value={filters.priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleFilterChange('priority', e.target.value)
                }
                icon={AlertCircle}
              >
                <option value="">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="gap-2 border-gray-300 hover:border-gray-400"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active filters display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.status && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {filters.status}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('status', '')}
                    />
                  </Badge>
                )}
                {filters.priority && (
                  <Badge variant="secondary" className="gap-1">
                    Priority: {filters.priority}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('priority', '')}
                    />
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{filters.search}"
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('search', '')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-600">Loading RFPs...</p>
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load RFPs"
            description="There was an error fetching your RFPs. Please try again."
            // @ts-ignore
            icon={AlertCircle}
            iconClassName="text-red-500"
            action={
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        ) : rfps && rfps.length > 0 ? (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{rfps.length}</span> RFP{rfps.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500">
                Sorted by: Due Date
              </p>
            </div>

            {/* RFPs Grid/List View */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {rfps.map((rfp: any) => (
                <Card 
                  key={rfp.id} 
                  className={`
                    hover:shadow-xl transition-all duration-300 border-gray-200 
                    ${viewMode === 'list' ? 'flex flex-col lg:flex-row lg:items-center' : ''}
                    hover:border-blue-200 hover:translate-y-[-2px]
                  `}
                >
                  <CardHeader className={viewMode === 'list' ? 'lg:w-2/5' : ''}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-mono text-gray-500">{rfp.rfpNumber}</span>
                        </div>
                        <CardTitle className="text-lg font-bold mb-2 line-clamp-1">
                          {rfp.title}
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={rfp.status} />
                          <PriorityIndicator priority={rfp.priority} />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className={viewMode === 'list' ? 'lg:w-2/5' : ''}>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-700">{rfp.issuer}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-700">Due: </span>
                          <span>{formatDate(rfp.submissionDeadline)}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            new Date(rfp.submissionDeadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {formatRelativeTime(rfp.submissionDeadline)}
                          </span>
                        </div>
                      </div>

                      {rfp.estimatedValue && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(rfp.estimatedValue, rfp.currency)}
                          </span>
                        </div>
                      )}

                      {rfp.tags && rfp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {rfp.tags.map((tag: string, index: number) => (
                            <Badge 
                              key={`${tag}-${index}`} 
                              variant="outline" 
                              className="text-xs border-gray-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className={`
                    ${viewMode === 'list' ? 'lg:w-1/5 lg:justify-end' : ''}
                    border-t pt-4 mt-4
                  `}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {rfp.assignedTo && (
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/rfps/${rfp.id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Link href={`/rfps/${rfp.id}`}>
                          <Button size="sm" className="gap-2">
                            <Eye className="h-3 w-3" />
                            View
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="No RFPs found"
            description={hasActiveFilters 
              ? "Try adjusting your filters to see more results" 
              : "Get started by creating your first RFP"
            }
             // @ts-ignore
            icon={FileText}
            iconClassName="text-gray-400"
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Link href="/rfps/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create RFP
                  </Button>
                </Link>
              )
            }
          />
        )}
      </div>
    </div>
  );
}