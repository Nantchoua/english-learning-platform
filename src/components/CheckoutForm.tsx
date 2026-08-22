'use client';

import { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Payment choice selector state (defaults to FULL)
  const [paymentType, setPaymentType] = useState<'FULL' | 'INSTALLMENT'>('FULL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      alert('Please fill out all payment details.');
      return;
    }

    setLoading(true);

    // Determine the parameters to send
    let action = 'enroll';
    if (needsRegistrationFee) {
      action = 'pay-registration-fee';
    } else if (isPayingInstallment2) {
      action = 'pay-second-installment';
    }

    // Simulate 2 second payment network processing delay
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('slug', slug);
        formData.append('action', action);
        formData.append('paymentType', paymentType);

        const res = await fetch('/api/enroll', {
          method: 'POST',
          body: formData,
        });

        if (res.redirected) {
          router.push(res.url);
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } catch (err) {
        alert('Payment processing failed. Please try again.');
        setLoading(false);
      }
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
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

      {/* Credit Card Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
          <input
            type="text"
            required
            placeholder="Jane Doe"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#0056D2] focus:border-[#0056D2]"
          />
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
          <div className="relative">
            <input
              type="text"
              required
              maxLength={19}
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="w-full border border-slate-300 rounded pl-10 pr-3 py-2 text-sm focus:ring-1 focus:ring-[#0056D2] focus:border-[#0056D2]"
            />
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
            <input
              type="text"
              required
              maxLength={5}
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#0056D2] focus:border-[#0056D2]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
            <input
              type="password"
              required
              maxLength={3}
              placeholder="123"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#0056D2] focus:border-[#0056D2]"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0056D2] hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition text-sm flex items-center justify-center gap-2 mt-6 cursor-pointer"
      >
        {loading
          ? 'Processing Secure Payment...'
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
