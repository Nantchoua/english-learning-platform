import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import RegistrationFeeForm from './RegistrationFeeForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RegistrationFeePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Load user data
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      registrationFeePaid: true,
      registrationFeePending: true,
      registrationFeeReference: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Admin and Instructors do not pay registration fees
  if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
    redirect('/instructor/courses');
  }

  // If already paid, send them to the dashboard
  if (user.registrationFeePaid) {
    redirect('/dashboard');
  }

  // Fetch current fee from Settings database
  const regFeeSetting = await db.setting.findUnique({
    where: { key: 'registration_fee' }
  });
  const fee = regFeeSetting ? parseFloat(regFeeSetting.value) : 20.00;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8">
        <img src="/logo.svg" alt="Speaking Express" className="h-10 w-auto" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <span className="bg-blue-50 text-[#0056D2] font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Account Activation
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-3 mb-1">One-time Registration Fee Required</h1>
          <p className="text-slate-500 text-sm">
            To access the courses and materials on Speaking Express, please complete the registration fee payment.
          </p>
        </div>

        <div className="border-t border-b border-slate-100 py-4 my-6 flex justify-between items-center">
          <span className="text-slate-600 font-medium">Registration Fee</span>
          <span className="text-2xl font-extrabold text-[#0056D2]">€{fee.toFixed(2)}</span>
        </div>

        <RegistrationFeeForm 
          fee={fee} 
          initialReference={user.registrationFeeReference}
          initialPending={user.registrationFeePending}
        />

        <div className="mt-8 text-center">
          <Link href="/api/auth/signout" className="text-xs text-red-500 hover:text-red-700 font-medium">
            Sign out of account
          </Link>
        </div>
      </div>
    </div>
  );
}
