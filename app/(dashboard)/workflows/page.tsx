'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WORKFLOW_STATUS_COLORS } from '@/lib/utils/constants';

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflows</h1>
        <p className="text-gray-500 mt-1">Monitor all RFP workflow executions</p>
      </div>

      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <p>Workflows list will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
}