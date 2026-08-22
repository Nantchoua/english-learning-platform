import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const MESSAGES: Record<string, { type: 'success' | 'error'; text: string }> = {
  // success
  'success=name':             { type: 'success', text: 'Your name has been updated successfully.' },
  'success=password':         { type: 'success', text: 'Password changed successfully. Use your new password next time you sign in.' },
  // errors
  'error=name-empty':         { type: 'error',   text: 'Name cannot be empty.' },
  'error=password-missing':   { type: 'error',   text: 'Please fill in all password fields.' },
  'error=password-short':     { type: 'error',   text: 'New password must be at least 6 characters.' },
  'error=password-mismatch':  { type: 'error',   text: 'New passwords do not match.' },
  'error=password-wrong':     { type: 'error',   text: 'Current password is incorrect.' },
  'error=password-none':      { type: 'error',   text: 'No password set for this account.' },
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const params = await searchParams;

  // Build query string to look up message
  const msgKey = Object.keys(params)
    .map((k) => `${k}=${params[k]}`)
    .find((key) => MESSAGES[key]);
  const message = msgKey ? MESSAGES[msgKey] : null;

  // Fetch latest user data from DB (session name might be stale)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your account information</p>
        </div>

        {/* Flash message */}
        {message && (
          <div className={`flex items-start gap-3 rounded-lg px-4 py-3 mb-6 text-sm border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-5">
            <User className="w-4 h-4" /> Account Information
          </h2>

          <form action="/api/profile" method="POST" className="space-y-4">
            <input type="hidden" name="action" value="update-name" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={user.name ?? ''}
                placeholder="Your full name"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0056D2] focus:border-[#0056D2] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email ?? ''}
                disabled
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700'
                : user.role === 'ADMIN'    ? 'bg-purple-100 text-purple-700'
                : 'bg-green-100 text-green-700'
              }`}>
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </span>
            </div>

            <button
              type="submit"
              className="bg-[#0056D2] hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4" /> Change Password
          </h2>

          <form action="/api/profile" method="POST" className="space-y-4">
            <input type="hidden" name="action" value="change-password" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                required
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0056D2] focus:border-[#0056D2] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0056D2] focus:border-[#0056D2] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                placeholder="Repeat new password"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0056D2] focus:border-[#0056D2] outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
