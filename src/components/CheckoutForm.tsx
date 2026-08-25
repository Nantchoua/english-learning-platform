'use client';

import { useState } from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type CheckoutFormProps = {
  courseId: string;
  slug: string;
  needsRegistrationFee: boolean;
  isPayingInstallment2: boolean;
  coursePrice: number;
  registrationFee?: number;
};

export default function CheckoutForm({
  courseId,
  slug,
  needsRegistrationFee,
  isPayingInstallment2,
  coursePrice,
  registrationFee = 20.00,
}: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentType, setPaymentType] = useState<'FULL' | 'INSTALLMENT'>('FULL');
  const [revolutReference, setRevolutReference] = useState('');

  const installmentAmount = (coursePrice / 2).toFixed(2);

  // Define your Revolut username/tag or payment link
  const revolutUsername = '@nantchoua'; 

  const getChargeAmount = () => {
    if (needsRegistrationFee) return registrationFee.toFixed(2);
    if (isPayingInstallment2) return installmentAmount;
    return paymentType === 'INSTALLMENT' ? installmentAmount : coursePrice.toFixed(2);
  };

  const getChargeDescription = () => {
    if (needsRegistrationFee) return `One-time Student Registration Fee (€${registrationFee.toFixed(2)})`;
    if (isPayingInstallment2) return `Final 50% Installment (€${installmentAmount})`;
    return paymentType === 'INSTALLMENT'
      ? `First Installment (€${installmentAmount})`
      : `Full Course Payment (€${coursePrice.toFixed(2)})`;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revolutReference.trim()) {
      alert('Please enter your Revolut username or payment reference.');
      return;
    }

    setLoading(true);

    let action = 'enroll';
    if (needsRegistrationFee) {
      action = 'pay-registration-fee';
    } else if (isPayingInstallment2) {
      action = 'pay-second-installment';
    }

    try {
      const res = await fetch('/api/checkout/revolut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          action,
          paymentType,
          revolutReference: revolutReference.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to submit payment reference.');
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Submission failed. Please try again.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-sm animate-fade-in">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Payment Reference Submitted!</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          We have logged your payment under reference <strong>"{revolutReference}"</strong>. 
          The instructor (Nantchoua) will verify the transfer in Revolut and activate your access shortly.
        </p>
        <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Payment Plan Selector */}
      {!needsRegistrationFee && !isPayingInstallment2 && (
        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Choose Payment Plan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pay in Full */}
            <label className={`flex flex-col p-3 border rounded-lg cursor-pointer transition ${
              paymentType === 'FULL'
                ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/10'
                : 'bg-white border-slate-300 hover:border-blue-400'
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentPlan"
                  checked={paymentType === 'FULL'}
                  onChange={() => setPaymentType('FULL')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-800">Pay in Full</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 pl-6">
                One-time payment of €{coursePrice.toFixed(2)}
              </span>
            </label>

            {/* Installments */}
            <label className={`flex flex-col p-3 border rounded-lg cursor-pointer transition ${
              paymentType === 'INSTALLMENT'
                ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/10'
                : 'bg-white border-slate-300 hover:border-blue-400'
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentPlan"
                  checked={paymentType === 'INSTALLMENT'}
                  onChange={() => setPaymentType('INSTALLMENT')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-800">2 Installments</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 pl-6">
                €{installmentAmount} now, and €{installmentAmount} later
              </span>
            </label>
          </div>
        </div>
      )}

      {/* 2. Revolut Payment Instructions */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          How to Pay (0% Fees):
        </h4>
        <div className="text-sm text-slate-700 space-y-2">
          <p>
            1. Open your **Revolut** app on your phone.
          </p>
          <p>
            2. Send exactly <strong className="text-slate-900 font-extrabold text-base">€{getChargeAmount()}</strong> to username:
          </p>
          <div className="bg-white border border-slate-300 rounded px-4 py-2 flex items-center justify-between font-mono font-bold text-[#0056D2] text-lg select-all">
            {revolutUsername}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            *Include the course name in your Revolut payment note if possible.
          </p>
        </div>
      </div>

      {/* 3. Reference Proof input */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Verify Your Payment:
        </label>
        <input
          type="text"
          required
          placeholder="Your Revolut Username or Transaction ID"
          value={revolutReference}
          onChange={(e) => setRevolutReference(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm focus:ring-1 focus:ring-[#0056D2] focus:border-[#0056D2]"
        />
        <p className="text-xs text-slate-400">
          We will double-check your submission against our Revolut transaction logs.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0056D2] hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-lg transition text-sm flex items-center justify-center gap-2 mt-6 cursor-pointer"
      >
        {loading ? 'Submitting proof...' : 'Confirm Revolut Transfer'}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 mt-4">
        <ShieldCheck className="w-4 h-4" />
        Manual Verification Secure Link
      </div>
    </form>
  );
}
