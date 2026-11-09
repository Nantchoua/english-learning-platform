import Link from 'next/link';
import { Lock, LogIn, ArrowLeft } from 'lucide-react';
import InstallPwaButton from '@/components/InstallPwaButton';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <img src="/logo.svg" alt="Speaking Express" className="h-10 w-auto" />
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Registration by Invitation Only</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Public sign-ups are currently closed. All student accounts are created directly by the academy instructor or administrator.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 text-left space-y-2">
          <p className="font-semibold text-slate-700">Already have an account assigned?</p>
          <p>
            Please sign in using the student email and password provided to you by your instructor.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" /> Go to Sign In
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
          <InstallPwaButton className="w-full justify-center py-2 text-xs" />
          <p className="text-[11px] text-slate-400">
            Download Speaking Express as an app on your mobile device or desktop
          </p>
        </div>
      </div>
    </div>
  );
}
