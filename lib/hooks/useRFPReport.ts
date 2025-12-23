import { useState, useEffect } from 'react';

export const useRFPReport = (rfpId: string | null) => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rfpId) {
      setReport(null);
      return;
    }

    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/rfps/${rfpId}/report`);
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }
        const data = await response.json();
        setReport(data.data);
      } catch (err) {
        // @ts-ignore
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [rfpId]);

  return { report, isLoading, error };
};