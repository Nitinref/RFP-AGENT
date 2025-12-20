'use client';

import { useState } from 'react';
import { useRFPs } from '@/lib/hooks/useRFP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Search, Calendar, Building2, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { RFP_STATUS_COLORS, PRIORITY_COLORS } from '@/lib/utils/constants';

// Create a simple Select component if you don't have one
const Select = ({ value, onChange, children, ...props }: any) => (
  <select
    value={value}
    onChange={onChange}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    {children}
  </select>
);

export default function RFPsPage() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  const { data: rfps, isLoading, error } = useRFPs(filters);

  console.log('RFPs data:', rfps); // Debug: Check actual response structure

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RFPs</h1>
          <p className="text-gray-500 mt-1">Manage and track all your RFP submissions</p>
        </div>
        <Link href="/rfps/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New RFP
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search RFPs..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <Select
            value={filters.status}
            onChange={(e: { target: { value: any; }; }) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="ANALYZING">Analyzing</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED">Submitted</option>
          </Select>

          <Select
            value={filters.priority}
            onChange={(e: { target: { value: any; }; }) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>

          <Button
            variant="outline"
            onClick={() => setFilters({ status: '', priority: '', search: '' })}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading RFPs"
          description={error.message || "Failed to fetch RFPs"}
          action={
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      ) : rfps && rfps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfps.map((rfp: any) => (
            <Card key={rfp.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 line-clamp-1">{rfp.title}</CardTitle>
                    <p className="text-sm text-gray-500">{rfp.rfpNumber}</p>
                  </div>
                  <Badge className={PRIORITY_COLORS[rfp.priority] || 'bg-gray-100 text-gray-800'}>
                    {rfp.priority}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{rfp.issuer}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Due: {formatDate(rfp.submissionDeadline)}</span>
                  <span className="ml-2 text-xs text-gray-400 flex-shrink-0">
                    ({formatRelativeTime(rfp.submissionDeadline)})
                  </span>
                </div>

                {rfp.estimatedValue && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatCurrency(rfp.estimatedValue, rfp.currency)}</span>
                  </div>
                )}

                {rfp.tags && rfp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {rfp.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={`${tag}-${index}`} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between">
                <Badge className={RFP_STATUS_COLORS[rfp.status] || 'bg-gray-100 text-gray-800'}>
                  {rfp.status}
                </Badge>
                <Link href={`/rfps/${rfp.id}`}>
                  <Button variant="ghost" size="sm">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No RFPs found"
          description="Get started by creating your first RFP"
          action={
            <Link href="/rfps/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create RFP
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}