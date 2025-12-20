'use client';

import { useRouter } from 'next/navigation';
import { useCreateRFP } from '@/lib/hooks/useRFP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const rfpSchema = z.object({
  rfpNumber: z.string().min(1, 'RFP number is required'),
  title: z.string().min(1, 'Title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  industry: z.string().min(1, 'Industry is required'),
  source: z.string(),
  submissionDeadline: z.string(),
  priority: z.string().optional(),
  estimatedValue: z.number().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
});

type RFPFormData = z.infer<typeof rfpSchema>;

export default function NewRFPPage() {
  const router = useRouter();
  const createRFP = useCreateRFP();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RFPFormData>({
    resolver: zodResolver(rfpSchema),
    defaultValues: {
      source: 'MANUAL',
      priority: 'MEDIUM',
      currency: 'USD',
    },
  });

  const onSubmit = async (data: RFPFormData) => {
    await createRFP.mutateAsync(data);
    router.push('/rfps');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/rfps">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New RFP</h1>
          <p className="text-gray-500 mt-1">Fill in the RFP details to get started</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFP Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rfpNumber">RFP Number *</Label>
                <Input id="rfpNumber" {...register('rfpNumber')} />
                {errors.rfpNumber && (
                  <p className="text-sm text-red-500">{errors.rfpNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select id="priority" {...register('priority')}>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer *</Label>
                <Input id="issuer" {...register('issuer')} />
                {errors.issuer && <p className="text-sm text-red-500">{errors.issuer.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input id="industry" {...register('industry')} />
                {errors.industry && (
                  <p className="text-sm text-red-500">{errors.industry.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionDeadline">Submission Deadline *</Label>
              <Input id="submissionDeadline" type="datetime-local" {...register('submissionDeadline')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  {...register('estimatedValue', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" {...register('currency')} defaultValue="USD" />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRFP.isPending}>
                {createRFP.isPending ? 'Creating...' : 'Create RFP'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}