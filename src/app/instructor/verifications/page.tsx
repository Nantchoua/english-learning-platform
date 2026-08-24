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

        <VerificationList 
          registrations={pendingRegistrations}
          enrollments={pendingEnrollments}
        />
      </div>
    </div>
  );
}
