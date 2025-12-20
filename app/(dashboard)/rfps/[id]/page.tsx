'use client';

import { use } from 'react';
import { useRFP, useStartWorkflow } from '@/lib/hooks/useRFP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Play, FileText, Calendar, Building2, DollarSign, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { RFP_STATUS_COLORS, PRIORITY_COLORS } from '@/lib/utils/constants';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RFPDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { data: rfp, isLoading } = useRFP(resolvedParams.id);
  const startWorkflow = useStartWorkflow();
  const router = useRouter();

  const handleStartWorkflow = async () => {
    await startWorkflow.mutateAsync({
      id: resolvedParams.id,
      reason: 'Manual trigger from RFP details page',
    });
    router.push(`/rfps/${resolvedParams.id}/workflow`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!rfp) {
    return <div>RFP not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/rfps">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{rfp.title}</h1>
            <p className="text-gray-500 mt-1">{rfp.rfpNumber}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Link href={`/rfps/${resolvedParams.id}/workflow`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Workflow
            </Button>
          </Link>
          <Button onClick={handleStartWorkflow} disabled={startWorkflow.isPending}>
            <Play className="h-4 w-4 mr-2" />
            {startWorkflow.isPending ? 'Starting...' : 'Start Workflow'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>RFP Overview</CardTitle>
            <div className="flex space-x-2">
              <Badge className={PRIORITY_COLORS[rfp.priority]}>{rfp.priority}</Badge>
              <Badge className={RFP_STATUS_COLORS[rfp.status]}>{rfp.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">
              {rfp.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Issuer</p>
                <p className="text-sm text-gray-600">{rfp.issuer}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Submission Deadline</p>
                <p className="text-sm text-gray-600">{formatDate(rfp.submissionDeadline)}</p>
              </div>
            </div>

            {rfp.estimatedValue && (
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Estimated Value</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(rfp.estimatedValue, rfp.currency)}
                  </p>
                </div>
              </div>
            )}

            {rfp.region && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Region</p>
                  <p className="text-sm text-gray-600">{rfp.region}</p>
                </div>
              </div>
            )}
          </div>

          {rfp.tags && rfp.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {rfp.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}