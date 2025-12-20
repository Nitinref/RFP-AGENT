'use client';

import { useEffect, useState } from 'react';

export default function ApiTestPage() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testEndpoint = async () => {
      try {
        // First, let's see what the root endpoint returns
        const res = await fetch('http://localhost:3000/');
        const data = await res.text();
        console.log('Root endpoint:', data);
        
        // Test the /api/rfps endpoint
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const apiRes = await fetch('http://localhost:3000/api/rfps', {
          headers,
        });
        
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          console.log('API Response:', apiData);
          setResponse(apiData);
        } else {
          console.log('API Error:', apiRes.status, apiRes.statusText);
          setResponse({ error: `Status: ${apiRes.status}` });
        }
      } catch (error) {
        console.error('Fetch error:', error);
        // @ts-ignore
        setResponse({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    testEndpoint();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Testing API Connection</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Response Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Backend Status:</h2>
        <div className="bg-green-100 text-green-800 p-3 rounded">
          ✅ Backend is running at http://localhost:3000/
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">/api/rfps Response:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
    </div>
  );
}