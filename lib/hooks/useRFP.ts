import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rfpAPI } from '../api';
import { toast } from 'sonner';

/* -------------------- List RFPs -------------------- */
export const useRFPs = (params?: any) => {
  return useQuery({
    queryKey: ['rfps', params],
    queryFn: () => rfpAPI.list(params),
  });
};

/* -------------------- Get Single RFP -------------------- */
export const useRFP = (id?: string) => {
  return useQuery({
    queryKey: ['rfp', id],
    queryFn: () => rfpAPI.getById(id!),
    enabled: !!id,
  });
};

/* -------------------- Create RFP -------------------- */
export const useCreateRFP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => rfpAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      toast.success('RFP created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create RFP');
    },
  });
};

/* -------------------- Upload Document -------------------- */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      rfpAPI.uploadDocument(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfp', variables.id] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
};

/* -------------------- Start Workflow -------------------- */
export const useStartWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rfpAPI.startWorkflow(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfp', variables.id] });
      queryClient.invalidateQueries({
        queryKey: ['workflow-status', variables.id],
      });
      toast.success('Workflow started successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start workflow');
    },
  });
};

/* -------------------- Workflow Status -------------------- */
export const useWorkflowStatus = (id?: string) => {
  return useQuery({
    queryKey: ['workflow-status', id],
    queryFn: () => rfpAPI.getWorkflowStatus(id!),
    enabled: !!id,
    refetchInterval: (data: any) =>
      data?.status === 'RUNNING' ? 3000 : false,
  });
};

/* -------------------- Technical Analysis -------------------- */
export const useTechnicalAnalysis = (id?: string) => {
  return useQuery({
    queryKey: ['technical-analysis', id],
    queryFn: () => rfpAPI.getTechnicalAnalysis(id!),
    enabled: !!id,
    retry: false,
  });
};

/* -------------------- Pricing Analysis -------------------- */
export const usePricingAnalysis = (id?: string) => {
  return useQuery({
    queryKey: ['pricing-analysis', id],
    queryFn: () => rfpAPI.getPricingAnalysis(id!),
    enabled: !!id,
    retry: false,
  });
};
