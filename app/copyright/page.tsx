'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

const claimSchema = z.object({
  songUrl: z.string().url(),
  originalSongUrl: z.string().url(),
  reason: z.string().min(20),
});

type ClaimForm = z.infer<typeof claimSchema>;

export default function CopyrightPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ClaimForm>({
    resolver: zodResolver(claimSchema),
  });

  const onSubmit = async (data: ClaimForm) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/copyright/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const err = await res.json();
        setError(err.error || 'Submission failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Claim Submitted</h1>
        <p>Thank you. Your claim is under review. Revenue from the song has been frozen for 14 days.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Submit Copyright Claim</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Infringing Song URL</label>
          <input
            {...register('songUrl')}
            className="w-full p-2 border rounded"
            placeholder="https://thirdkey.com/song/123"
          />
          {errors.songUrl && <p className="text-red-500">{errors.songUrl.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Your Original Song URL</label>
          <input
            {...register('originalSongUrl')}
            className="w-full p-2 border rounded"
            placeholder="https://thirdkey.com/song/456"
          />
          {errors.originalSongUrl && <p className="text-red-500">{errors.originalSongUrl.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Reason (min 20 chars)</label>
          <textarea
            {...register('reason')}
            className="w-full p-2 border rounded"
            rows={4}
          />
          {errors.reason && <p className="text-red-500">{errors.reason.message}</p>}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground p-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Claim'}
        </button>
      </form>
    </div>
  );
}
