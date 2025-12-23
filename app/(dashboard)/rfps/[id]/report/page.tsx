'use client';

import { useParams } from 'next/navigation';
import { useRFPReport } from '@/lib/hooks/useRFP';
import {
    AlertCircle,
    CheckCircle2,
    DollarSign,
    FileText,
    BarChart3,
    TrendingUp,
    Shield,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import { rfpAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { id } from 'zod/v4/locales';

// Temporary basic components (use these if shadcn/ui is not installed)
const Card = ({ children, className = '', ...props }: any) => (
    <div className={`border rounded-lg p-6 shadow-sm ${className}`} {...props}>
        {children}
    </div>
);

const CardHeader = ({ children, className = '' }: any) => (
    <div className={`mb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: any) => (
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: any) => (
    <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }: any) => (
    <div className={className}>{children}</div>
);

const Badge = ({ children, className = '', variant = 'default' }: any) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variantStyles = {
        default: 'bg-gray-100 text-gray-800',
        secondary: 'bg-gray-100 text-gray-800',
        outline: 'border border-gray-300 bg-transparent',
        destructive: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`${baseStyles} ${variantStyles[variant as keyof typeof variantStyles] || variantStyles.default} ${className}`}>
            {children}
        </span>
    );
};

const Progress = ({ value, className = '' }: any) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
    </div>
);

const Separator = ({ className = '' }: any) => (
    <hr className={`my-4 border-t border-gray-200 ${className}`} />
);

const Skeleton = ({ className = '' }: any) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export default function RFPReportPage() {
    const params = useParams();
    const rfpId = params?.id as string;

    const { data, isLoading, error } = useRFPReport(rfpId);

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold">Report Not Found</h2>
                    <p className="text-gray-500 max-w-md">
                        The RFP report could not be loaded. Please check the ID and try again.
                    </p>
                </div>
            </div>
        );
    }

    const getCompetitivenessColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">RFP Report</h1>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                        ID: {rfpId?.slice(0, 8) || 'N/A'}
                    </Badge>
                </div>
                <p className="text-gray-500">
                    Comprehensive analysis and proposal for your request
                </p>
            </div>

            {/* Summary Card */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <CardTitle>Executive Summary</CardTitle>
                    </div>
                    <CardDescription>Key insights and overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none">
                        <div className="bg-gray-50 p-4 rounded-lg leading-relaxed whitespace-pre-line">
                            {data.summary || 'No summary available'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Final Proposal */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <CardTitle>Final Proposal</CardTitle>
                    </div>
                    <CardDescription>Detailed response to RFP requirements</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border rounded-xl p-6 leading-relaxed whitespace-pre-line">
                        {data.finalResponse || 'No proposal available'}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Technical Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <CardTitle>Technical Analysis</CardTitle>
                            </div>
                            <CardDescription>
                                Product matches and compatibility assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.technicalAnalysis?.topMatches?.map((match: any, index: number) => (
                                <div
                                    key={index}
                                    className="border rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="font-mono">
                                                    {match.sku || 'SKU-000'}
                                                </Badge>
                                                {(!match.risks || match.risks.length === 0) && (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Low Risk
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-lg">{match.productName || 'Product Name'}</h4>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-lg font-bold ${match.matchScore >= 90
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : match.matchScore >= 70
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                }`}
                                        >
                                            {match.matchScore || 0}%
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-500">Match Score</span>
                                                <span className="font-medium">{match.matchScore || 0}%</span>
                                            </div>
                                            <Progress
                                                value={match.matchScore || 0}
                                                className={`h-2 ${match.matchScore >= 90
                                                    ? 'bg-green-100'
                                                    : match.matchScore >= 70
                                                        ? 'bg-yellow-100'
                                                        : 'bg-red-100'
                                                    }`}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-500">Confidence Level</span>
                                                <span className="font-medium">
                                                    {Math.round((match.confidence || 0) * 100)}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={(match.confidence || 0) * 100}
                                                className="h-2 bg-blue-100"
                                            />
                                        </div>

                                        {match.risks?.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex items-center gap-2 mb-2 text-red-600">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <p className="font-semibold">Potential Risks</p>
                                                </div>
                                                <ul className="space-y-2">
                                                    {match.risks.map((risk: string, i: number) => (
                                                        <li
                                                            key={i}
                                                            className="flex items-start gap-2 text-sm text-red-700"
                                                        >
                                                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                                                            <span>{risk}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Pricing Analysis Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                                <CardTitle>Pricing Analysis</CardTitle>
                            </div>
                            <CardDescription>Cost breakdown and competitiveness</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Bid Price</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        ${(data.pricingAnalysis?.pricing?.totalBidPrice || 0).toLocaleString()}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Competitiveness</p>
                                    <Badge
                                        className={`px-3 py-1 text-sm font-semibold ${getCompetitivenessColor(
                                            data.pricingAnalysis?.competitiveness
                                        )}`}
                                    >
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {data.pricingAnalysis?.competitiveness || 'N/A'}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Contingency</p>
                                    <p className="text-2xl font-semibold">
                                        ${(data.pricingAnalysis?.pricing?.contingency || 0).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Savings Estimate</p>
                                    <p className="text-xl font-semibold text-green-600">
                                        ~${((data.pricingAnalysis?.pricing?.totalBidPrice || 0) * 0.15).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <h4 className="font-medium">Delivery Timeline</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Estimated Lead Time</span>
                                        <span className="font-medium">4-6 weeks</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Warranty Period</span>
                                        <span className="font-medium">24 months</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Report Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total Matches</span>
                                <span className="font-semibold">
                                    {data.technicalAnalysis?.topMatches?.length || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Average Match Score</span>
                                <span className="font-semibold">
                                    {Math.round(
                                        (data.technicalAnalysis?.topMatches?.reduce(
                                            (acc: number, match: any) => acc + (match.matchScore || 0),
                                            0
                                        ) / (data.technicalAnalysis?.topMatches?.length || 1)) || 0
                                    )}
                                    %
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total Risks</span>
                                <span className="font-semibold text-red-600">
                                    {data.technicalAnalysis?.topMatches?.reduce(
                                        (acc: number, match: any) => acc + (match.risks?.length || 0),
                                        0
                                    )}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
                <Button
                    onClick={() => {
                        const token = localStorage.getItem('token');

                        fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/rfps/${rfpId}/report/pdf`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        )
                            .then(res => res.blob())
                            .then(blob => {
                                const url = window.URL.createObjectURL(blob);
                                window.open(url);
                            });
                    }}
                >
                    📄 Download PDF
                </Button>


                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Export to Excel
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Submit Proposal
                </button>
            </div>
        </div>
    );
}