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

  const onSubmit = async (data: RFPFormData) => {
    const payload = {
      rfpNumber: data.rfpNumber,
      title: data.title,
      description: data.description,
      issuer: data.issuer,
      industry: data.industry,
      priority: data.priority.toUpperCase(),
      estimatedValue: data.estimatedValue
        ? Number(data.estimatedValue)
        : undefined,
      submissionDeadline: new Date(
        data.submissionDeadline
      ).toISOString(),
      currency: data.currency,
      source: 'MANUAL',
    };

    const result = await createRFP.mutateAsync(payload);
    router.push(`/rfps/${result.id}/upload`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create New RFP
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details to create a new Request for Proposal
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* RFP Number */}
          <div>
            <label className="label">RFP Number *</label>
            <input
              className="input"
              {...register('rfpNumber', { required: true })}
            />
            {errors.rfpNumber && (
              <p className="error-text">RFP number is required</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              {...register('title', { required: true })}
            />
            {errors.title && (
              <p className="error-text">Title is required</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[90px]"
              {...register('description')}
            />
          </div>

          {/* Issuer & Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Issuer *</label>
              <input
                className="input"
                {...register('issuer', { required: true })}
              />
              {errors.issuer && (
                <p className="error-text">Issuer is required</p>
              )}
            </div>

            <div>
              <label className="label">Industry *</label>
              <input
                className="input"
                {...register('industry', { required: true })}
              />
              {errors.industry && (
                <p className="error-text">Industry is required</p>
              )}
            </div>
          </div>

          {/* Priority & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Priority *</label>
              <select
                className="input"
                {...register('priority', { required: true })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="label">Submission Deadline *</label>
              <input
                type="datetime-local"
                className="input"
                {...register('submissionDeadline', { required: true })}
              />
            </div>
          </div>

          {/* Estimated Value & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Estimated Value</label>
              <input
                type="number"
                className="input"
                {...register('estimatedValue')}
              />
            </div>

            <div>
              <label className="label">Currency</label>
              <select className="input" {...register('currency')}>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={createRFP.isPending}
            >
              {createRFP.isPending ? 'Creating RFP...' : 'Create RFP'}
            </Button>
          </div>
        </form>
      </div>

      {/* Tailwind utility classes */}
      <style jsx global>{`
        .label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px #2563eb;
        }
        .error-text {
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}
