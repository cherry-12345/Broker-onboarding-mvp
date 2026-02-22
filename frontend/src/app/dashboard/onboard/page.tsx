'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  gstin: z
    .string()
    .min(1, 'GSTIN is required')
    .transform((val) => val.toUpperCase())
    .refine((val) => gstinRegex.test(val), {
      message: 'Invalid GSTIN format. Expected format: 22AAAAA0000A1Z5',
    }),
  entityType: z.enum(['EXPORTER', 'IMPORTER'], {
    message: 'Please select entity type',
  }),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function OnboardPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      entityType: undefined,
    },
  });

  const gstinValue = watch('gstin') || '';

  const onSubmit = async (data: CustomerForm) => {
    setIsSubmitting(true);
    try {
      await api.post('/customers', {
        fullName: data.fullName,
        email: data.email,
        gstin: data.gstin.toUpperCase(),
        entityType: data.entityType,
      });
      toast.success('Customer onboarded successfully!');
      reset();
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; errors?: { msg: string }[] } } };
      const message =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to onboard customer.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Onboard Customer</h1>
        <p className="text-gray-500 mt-1">Add a new exporter or importer to your account.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              {...register('fullName')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
              placeholder="Customer's full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
              placeholder="customer@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-1">
              GSTIN <span className="text-red-500">*</span>
            </label>
            <input
              id="gstin"
              type="text"
              {...register('gstin')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 uppercase font-mono"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.gstin ? (
                <p className="text-sm text-red-600">{errors.gstin.message}</p>
              ) : (
                <p className="text-xs text-gray-400">Format: 22AAAAA0000A1Z5</p>
              )}
              {gstinValue && (
                <span className="text-xs text-gray-400">{gstinValue.length}/15</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative flex items-center justify-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  value="EXPORTER"
                  {...register('entityType')}
                  className="sr-only"
                />
                <div className="text-center">
                  <svg className="h-6 w-6 mx-auto mb-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Exporter</span>
                </div>
              </label>
              <label className="relative flex items-center justify-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  value="IMPORTER"
                  {...register('entityType')}
                  className="sr-only"
                />
                <div className="text-center">
                  <svg className="h-6 w-6 mx-auto mb-1 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Importer</span>
                </div>
              </label>
            </div>
            {errors.entityType && (
              <p className="mt-1 text-sm text-red-600">{errors.entityType.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Onboard Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
