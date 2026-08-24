import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookOpen, LayoutDashboard, LogOut, LogIn, UserCircle } from 'lucide-react';

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Speaking Express" className="h-8 w-auto" />
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-slate-600 hover:text-emerald-600 transition font-medium">
            Courses
          </Link>

          {session ? (
            <>
              {role === 'INSTRUCTOR' || role === 'ADMIN' ? (
                <>
                  <Link href="/instructor/verifications"
                    className="text-sm text-slate-650 hover:text-emerald-600 transition font-semibold flex items-center gap-1">
                    Approvals
                  </Link>
                  <Link href="/instructor/courses"
                    className="text-sm text-slate-600 hover:text-emerald-600 transition font-medium flex items-center gap-1">
                    <LayoutDashboard className="w-4 h-4" /> Teach
                  </Link>
                </>
              ) : null}
              <Link href="/dashboard"
                className="text-sm text-slate-600 hover:text-[#0056D2] transition font-medium">
                My Learning
              </Link>
              <Link href="/profile"
                className="text-sm text-slate-600 hover:text-[#0056D2] transition font-medium flex items-center gap-1">
                <UserCircle className="w-4 h-4" /> Profile
              </Link>
              <Link href="/api/auth/signout"
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition">
                <LogOut className="w-4 h-4" /> Sign out
              </Link>
            </>
          ) : (
            <Link href="/login"
              className="flex items-center gap-1 bg-[#0056D2] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
