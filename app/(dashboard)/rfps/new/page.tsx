'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useCreateRFP } from '@/lib/hooks/useRFP';

type RFPFormData = {
  rfpNumber: string;
  title: string;
  description?: string;
  issuer: string;
  industry: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  submissionDeadline: string;
  estimatedValue?: number | string;
  currency: string;
};

export default function CreateRFPPage() {
  const router = useRouter();
  const createRFP = useCreateRFP();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RFPFormData>();

  // ✅ THIS IS THE IMPORTANT PART
  const onSubmit = async (data: RFPFormData) => {
    const payload = {
      rfpNumber: data.rfpNumber,
      title: data.title,
      description: data.description,
      issuer: data.issuer,
      industry: data.industry,

      // 🔴 REQUIRED TRANSFORMATIONS
      priority: data.priority.toUpperCase(), // "LOW"
      estimatedValue: data.estimatedValue
        ? Number(data.estimatedValue)
        : undefined,

      submissionDeadline: new Date(
        data.submissionDeadline
      ).toISOString(), // ISO string

      currency: data.currency,
      source: 'MANUAL',
    };

    console.log('CREATE RFP PAYLOAD', payload);

    await createRFP.mutateAsync(payload);
    router.push('/rfps');
  };

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Create New RFP
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: 12 }}>
          <label>RFP Number *</label>
          <input {...register('rfpNumber', { required: true })} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Title *</label>
          <input {...register('title', { required: true })} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Description</label>
          <textarea {...register('description')} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Issuer *</label>
          <input {...register('issuer', { required: true })} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Industry *</label>
          <input {...register('industry', { required: true })} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Priority *</label>
          <select {...register('priority', { required: true })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Submission Deadline *</label>
          <input
            type="datetime-local"
            {...register('submissionDeadline', { required: true })}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Estimated Value</label>
          <input
            type="number"
            {...register('estimatedValue')}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Currency</label>
          <select {...register('currency')}>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
          </select>
        </div>

        <Button type="submit" disabled={createRFP.isPending}>
          {createRFP.isPending ? 'Creating...' : 'Create RFP'}
        </Button>
      </form>
    </div>
  );
}
