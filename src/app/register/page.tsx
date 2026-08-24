import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const errorMessage =
    error === 'exists'
      ? 'An account with this email already exists.'
      : error === 'missing'
      ? 'Please fill in all fields.'
      : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <img src="/logo.svg" alt="Speaking Express" className="h-10 w-auto" />
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm mb-6">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-650 hover:underline font-semibold">
            Sign in
          </Link>
        </p>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
            {errorMessage}
          </div>
        )}

        <form action="/api/register" method="POST" className="space-y-4">
          {/* Role is hardcoded to STUDENT — instructors are added internally */}
          <input type="hidden" name="role" value="STUDENT" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              autoFocus
              placeholder="Jane Doe"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="jane@example.com"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer shadow-sm"
          >
            Create Account
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
