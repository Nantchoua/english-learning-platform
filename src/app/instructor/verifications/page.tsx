import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import VerificationList from '@/components/VerificationList';
import Link from 'next/link';

export default async function VerificationsDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  // Load user details
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'INSTRUCTOR') {
    notFound();
  }

  // Fetch or create registration fee setting
  let regFeeSetting = await db.setting.findUnique({ where: { key: 'registration_fee' } });
  if (!regFeeSetting) {
    try {
      regFeeSetting = await db.setting.create({
        data: { key: 'registration_fee', value: '20.00' }
      });
    } catch (e) {
      regFeeSetting = { key: 'registration_fee', value: '20.00' };
    }
  }

  async function updateFeeAction(formData: FormData) {
    'use server';
    const newFee = formData.get('registration_fee') as string;
    if (newFee) {
      const parsed = parseFloat(newFee);
      if (!isNaN(parsed) && parsed >= 0) {
        const { revalidatePath } = require('next/cache');
        const { db: actionDb } = require('@/lib/prisma');
        await actionDb.setting.upsert({
          where: { key: 'registration_fee' },
          update: { value: parsed.toFixed(2) },
          create: { key: 'registration_fee', value: parsed.toFixed(2) }
        });
        revalidatePath('/instructor/verifications');
        revalidatePath('/courses/[slug]/checkout', 'page');
      }
    }
  }

  // 1. Fetch users with pending registration fee approvals
  const pendingRegistrations = await db.user.findMany({
    where: { registrationFeePending: true },
    select: { id: true, name: true, email: true, registrationFeeReference: true }
  });

  // 2. Fetch enrollments with pending status
  const pendingEnrollments = await db.enrollment.findMany({
    where: {
      OR: [
        { status: 'PENDING' },
        { status: 'PENDING_INSTALLMENT_2' }
      ]
    },
    include: {
      user: {
        select: { name: true, email: true }
      },
      course: {
        select: { title: true, price: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6 w-full flex-grow">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment Verifications</h1>
            <p className="text-slate-500 mt-1">
              Review submitted Revolut transactions and unlock courses for students.
            </p>
          </div>
          <Link href="/instructor/verifications/test-panel" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 shadow-sm">
            ⚙️ Open Simulator Panel
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Registration Fee Setting</h2>
          <form action={updateFeeAction} className="flex items-center gap-3">
            <span className="text-slate-600 text-sm font-medium">One-Time Registration Fee: €</span>
            <input 
              type="number" 
              name="registration_fee" 
              step="0.01" 
              min="0"
              defaultValue={regFeeSetting?.value || '20.00'} 
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-32 focus:ring-[#0056D2] focus:border-[#0056D2] text-slate-900 font-semibold"
            />
            <button type="submit" className="bg-[#0056D2] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition shadow-sm">
              Save Fee
            </button>
          </form>
        </div>

        <VerificationList 
          registrations={pendingRegistrations}
          enrollments={pendingEnrollments}
        />

      </div>
    </div>
  );
}
