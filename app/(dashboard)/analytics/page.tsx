'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, Clock, DollarSign, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  totalRFPs: number;
  activeWorkflows: number;
  avgResponseTime: number;
  totalValue: number;
  recentRFPs: Array<{
    id: string;
    title: string;
    status: string;
    value: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      // Use sample data for demo
      setAnalytics({
        totalRFPs: 0,
        activeWorkflows: 0,
        avgResponseTime: 0,
        totalValue: 0,
        recentRFPs: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Loading analytics data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time RFP performance and business metrics</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total RFPs</p>
                <p className="text-3xl font-bold mt-2">
                  {analytics?.totalRFPs || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics && analytics.totalRFPs > 0 
                    ? `${analytics.totalRFPs} requests for proposal`
                    : 'No RFPs yet'
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Workflows</p>
                <p className="text-3xl font-bold mt-2">
                  {analytics?.activeWorkflows || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Currently being processed
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-3xl font-bold mt-2">
                  {analytics?.avgResponseTime 
                    ? `${analytics.avgResponseTime.toFixed(1)}h`
                    : '0h'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Time to respond
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-3xl font-bold mt-2">
                  ${analytics?.totalValue 
                    ? (analytics.totalValue / 1000000).toFixed(1) + 'M'
                    : '0'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Estimated contract value
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent RFPs</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.recentRFPs && analytics.recentRFPs.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentRFPs.map((rfp) => (
                <div key={rfp.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{rfp.title}</p>
                    <p className="text-sm text-gray-500">Status: {rfp.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${rfp.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent RFPs found</p>
              <p className="text-sm text-gray-400 mt-1">Start by creating or receiving RFPs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}