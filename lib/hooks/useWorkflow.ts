import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export const useWorkflowActivities = (workflowRunId?: string) => {
  return useQuery({
    queryKey: ['workflow-activities', workflowRunId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/workflows/${workflowRunId}/activities`
      );
    //   @ts-ignore
      return res.data.activities; // 👈 backend response
    },
    enabled: !!workflowRunId,
  });
};
