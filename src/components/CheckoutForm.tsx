'use client';

import { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

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
  const [paymentType, setPaymentType] = useState<'FULL' | 'INSTALLMENT'>('FULL');

  const installmentAmount = (coursePrice / 2).toFixed(2);
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sandbox'; // Fallback to sandbox

  // Calculates exact amount to charge
  const getChargeAmount = () => {
    if (needsRegistrationFee) return '20.00';
    if (isPayingInstallment2) return installmentAmount;
    return paymentType === 'INSTALLMENT' ? installmentAmount : coursePrice.toFixed(2);
  };

  const getChargeDescription = () => {
    if (needsRegistrationFee) return 'One-time Student Registration Fee (€20.00)';
    if (isPayingInstallment2) return `Final 50% Installment (€${installmentAmount})`;
    return paymentType === 'INSTALLMENT'
      ? `First Installment (€${installmentAmount})`
      : `Full Course Payment (€${coursePrice.toFixed(2)})`;
  };

  // 1. Create order handler
  const handleCreateOrder = async () => {
    setLoading(true);
    let action = 'enroll';
    if (needsRegistrationFee) {
      action = 'pay-registration-fee';
    } else if (isPayingInstallment2) {
      action = 'pay-second-installment';
    }

    try {
      const res = await fetch('/api/checkout/paypal', {
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

      if (!res.ok) throw new Error('Failed to initiate PayPal order');

      const data = await res.json();
      return data.id; // Returns order ID to PayPal
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  // 2. Approve payment handler
  const handleApprove = async (data: any) => {
    try {
      const res = await fetch('/api/checkout/paypal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
        }),
      });

      if (!res.ok) throw new Error('Failed to verify payment capture');

      const captureResult = await res.json();
      if (captureResult.success) {
        // Redirect to success page or dashboard
        router.push('/dashboard?checkout_success=1');
        router.refresh();
      } else {
        throw new Error('Payment completion failed');
      }
    } catch (err: any) {
      alert(err.message || 'Payment capture failed. Please check with your bank.');
      setLoading(false);
    }
  };

  return (
    <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "EUR" }}>
      <div className="space-y-6">
        {/* Payment Plan Selector */}
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

        {/* Current Transaction Detail Info Card */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#0056D2] mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-slate-800">Transaction Summary</h4>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {getChargeDescription()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Transactions are completed securely via PayPal. You can use your PayPal account or a credit/debit card.
            </p>
          </div>
        </div>

        {/* PayPal Smart Payment Buttons */}
        <div className="relative z-0">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-xs flex items-center justify-center z-10 rounded">
              <span className="text-sm text-slate-600 font-medium">Processing payment...</span>
            </div>
          )}
          <PayPalButtons
            style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
            disabled={loading}
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onCancel={() => {
              setLoading(false);
            }}
            onError={() => {
              alert("An error occurred during payment processing. Please try again.");
              setLoading(false);
            }}
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 mt-4">
          <ShieldCheck className="w-4 h-4" />
          Secure 256-bit SSL Encrypted Transaction.
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
