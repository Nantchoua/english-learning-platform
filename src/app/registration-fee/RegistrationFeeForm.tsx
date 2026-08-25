'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface RegistrationFeeFormProps {
  fee: number;
  initialReference: string | null;
  initialPending: boolean;
}

export default function RegistrationFeeForm({
  fee,
  initialReference,
  initialPending,
}: RegistrationFeeFormProps) {
  const router = useRouter();
  const [reference, setReference] = useState(initialReference || '');
  const [isPending, setIsPending] = useState(initialPending);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      setError('Please enter a payment reference or your Revolut username.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/revolut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'pay-registration-fee',
          revolutReference: reference.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to submit payment reference.');
      }

      setSuccess(true);
      setIsPending(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-pulse">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-900">Payment Submitted for Verification</h3>
        <p className="text-sm text-emerald-700 max-w-md mx-auto">
          Your payment reference <strong>"{reference}"</strong> has been submitted. The instructor/admin will verify the transfer on Revolut and approve your account shortly.
        </p>
        <div className="pt-2 text-xs text-slate-500">
          Need to submit a different reference?{' '}
          <button 
            type="button" 
            onClick={() => setIsPending(false)} 
            className="text-[#0056D2] hover:underline font-medium"
          >
            Update Reference
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          Payment reference successfully submitted!
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-slate-800 text-sm">How to Pay:</h3>
          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2">
            <li>Open your Revolut app.</li>
            <li>Send exactly <strong className="text-slate-900 text-sm">€{fee.toFixed(2)}</strong> to our account: <strong className="text-slate-900 text-sm">@nantchoua</strong></li>
            <li>Enter the transfer reference or your Revolut @username below so we can verify your payment.</li>
          </ol>
        </div>

        <div>
          <label htmlFor="reference" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Revolut Username or Payment Reference
          </label>
          <input
            id="reference"
            type="text"
            required
            placeholder="e.g. @username or Ref #12345"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-black"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#0056D2] hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 shadow-md cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit Payment Reference
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
