'use client';

import { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';

type CheckoutFormProps = {
  courseId: string;
  slug: string;
  needsRegistrationFee: boolean;
  isPayingInstallment2: boolean;
  coursePrice: number;
};

export default function CheckoutForm({
  courseId,
  slug,
  needsRegistrationFee,
  isPayingInstallment2,
  coursePrice,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<'FULL' | 'INSTALLMENT'>('FULL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let action = 'enroll';
    if (needsRegistrationFee) {
      action = 'pay-registration-fee';
    } else if (isPayingInstallment2) {
      action = 'pay-second-installment';
    }

    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          action,
          paymentType,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not create Stripe checkout session');
      }

      const { url } = await res.json();
      window.location.href = url; // Redirect to Stripe Checkout portal
    } catch (err: any) {
      alert(err.message || 'Payment setup failed. Please try again.');
      setLoading(false);
    }
  };

  const installmentAmount = (coursePrice / 2).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Options (Show only if they don't need registration fee and aren't paying installment 2) */}
      {!needsRegistrationFee && !isPayingInstallment2 && (
        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Choose Payment Plan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pay in Full Option */}
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

            {/* Installments Option */}
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

      {/* Info card instead of credit card input fields */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-[#0056D2] mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-slate-800">Secure Stripe Checkout</h4>
          <p className="text-xs text-slate-500 mt-1">
            You will be redirected to Stripe's secure payment portal to complete this transaction. We do not store your credit card information.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0056D2] hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition text-sm flex items-center justify-center gap-2 mt-6 cursor-pointer"
      >
        {loading
          ? 'Connecting to Stripe...'
          : needsRegistrationFee
          ? 'Pay Registration Fee (€20.00)'
          : isPayingInstallment2
          ? `Pay Final Installment (€${installmentAmount})`
          : paymentType === 'INSTALLMENT'
          ? `Pay First Installment (€${installmentAmount}) & Enroll`
          : `Pay €${coursePrice.toFixed(2)} & Enroll`}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 mt-4">
        <ShieldCheck className="w-4 h-4" />
        Secure 256-bit SSL Encrypted Transaction.
      </div>
    </form>
  );
}
