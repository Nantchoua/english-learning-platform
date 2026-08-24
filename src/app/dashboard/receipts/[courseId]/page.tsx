import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import PrintButton from '@/components/PrintButton';
import Link from 'next/link';

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = session.user.id;

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, price: true, level: true } }
    }
  });

  if (!enrollment || (enrollment.status !== 'ACTIVE' && enrollment.status !== 'PARTIALLY_PAID')) {
    notFound();
  }

  const receiptId = `REC-${enrollment.createdAt.getTime().toString().slice(-6)}-${courseId.slice(-4)}`.toUpperCase();
  const basePrice = enrollment.course.price || 0;
  const paidAmount = enrollment.paymentType === 'INSTALLMENT' 
    ? (enrollment.installmentsPaid === 2 ? basePrice : basePrice / 2)
    : basePrice;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back navigation & Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Link href="/dashboard" className="text-sm font-semibold text-emerald-650 hover:underline">
            ← Back to Dashboard
          </Link>
          <PrintButton />
        </div>

        {/* Invoice Body */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 print:shadow-none print:border-none">
          <div className="flex justify-between items-start border-b border-slate-100 pb-8">
            <div className="space-y-1.5">
              <img src="/logo.svg" alt="Speaking Express" className="h-10 w-auto" />
              <p className="text-xs text-slate-400 font-medium">Speaking Express English Academy</p>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Receipt</h1>
              <p className="text-xs font-mono font-bold text-emerald-650 mt-1">{receiptId}</p>
            </div>
          </div>

          {/* Details Metadata */}
          <div className="grid grid-cols-2 gap-8 py-8 text-sm">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Billed To</h3>
              <p className="font-bold text-slate-850">{enrollment.user.name || 'Student'}</p>
              <p className="text-xs text-slate-500">{enrollment.user.email}</p>
            </div>
            <div className="space-y-1 text-right">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Date Issued</h3>
              <p className="font-semibold text-slate-800">
                {new Date(enrollment.updatedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-slate-500">
                Payment Mode: {enrollment.revolutReference ? 'Revolut Manual Transfer' : 'PayPal Checkout'}
              </p>
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-650 text-xs uppercase tracking-wider">Item Description</th>
                  <th className="p-4 font-bold text-slate-650 text-xs uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                <tr>
                  <td className="p-4 font-medium text-slate-900">
                    {enrollment.course.title} ({enrollment.course.level} Level)
                    {enrollment.paymentType === 'INSTALLMENT' && (
                      <span className="block text-xs font-bold text-orange-600 mt-1.5 uppercase">
                        Installment Plan ({enrollment.installmentsPaid}/2 Paid)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-850 font-bold text-right">€{basePrice.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial summary */}
          <div className="space-y-3 border-t border-slate-100 pt-6 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-800">€{basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">VAT (0%)</span>
              <span className="font-semibold text-slate-800">€0.00</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-150 pt-3">
              <span>Amount Paid</span>
              <span className="text-emerald-650 font-extrabold text-lg">€{paidAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Signature */}
          <div className="border-t border-slate-100 pt-8 mt-12 text-center text-xs text-slate-400 space-y-1">
            <p className="font-serif italic font-semibold text-slate-600 text-sm">Dominic Nantchoua</p>
            <p className="uppercase tracking-wider text-[10px]">Academy Principal, Speaking Express</p>
          </div>
        </div>
      </div>
    </div>
  );
}
