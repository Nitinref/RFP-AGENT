import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Simulated AI service calls (replace with your actual backend)
const aiAPI = {
  analyzeRFP: async (rfpId: string, documentUrl?: string) => {
    const response = await fetch(`/api/rfps/${rfpId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentUrl }),
    });
    return response.json();
  },

  getTechnicalAnalysis: async (rfpId: string) => {
    // This should call your AI agent for technical matching
    const response = await fetch(`/api/ai/technical-analysis/${rfpId}`);
    return response.json();
  },

  getPricingAnalysis: async (rfpId: string) => {
    // This should call your AI agent for pricing
    const response = await fetch(`/api/ai/pricing-analysis/${rfpId}`);
    return response.json();
  },

  extractRequirements: async (documentText: string) => {
    // Call AI to extract requirements from RFP document
    const response = await fetch('/api/ai/extract-requirements', {
      method: 'POST',
      body: JSON.stringify({ text: documentText }),
    });
    return response.json();
  },
};

// React hooks for AI agents
export const useAnalyzeRFP = () => {
  return useMutation({
    mutationFn: ({ rfpId, documentUrl }: { rfpId: string; documentUrl?: string }) =>
      aiAPI.analyzeRFP(rfpId, documentUrl),
    onSuccess: () => {
      toast.success('AI analysis started successfully');
    },
    onError: (error) => {
      toast.error(`AI analysis failed: ${error.message}`);
    },
  });
};

export const useExtractRequirements = () => {
  return useMutation({
    mutationFn: (documentText: string) => aiAPI.extractRequirements(documentText),
    onSuccess: (data) => {
      toast.success(`Extracted ${data.requirements?.length || 0} requirements`);
    },
  });
};