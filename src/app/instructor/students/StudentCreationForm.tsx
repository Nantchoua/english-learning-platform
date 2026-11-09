'use client';

import { useState } from 'react';
import { UserPlus, KeyRound, Sparkles, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createStudent } from './actions';

type CourseOption = {
  id: string;
  title: string;
  slug: string;
  level: string;
};

export default function StudentCreationForm({ courses }: { courses: CourseOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    formData.set('password', password);

    try {
      await createStudent(formData);
      const email = formData.get('email') as string;
      setSuccess(`Student account created for ${email}!`);
      (e.target as HTMLFormElement).reset();
      setPassword('');
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to create student account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Add New Student
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create an invitation student account with assigned course enrollment and access credentials.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          {isOpen ? 'Close Form' : 'New Student Account'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg p-3 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Marie Dubois"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="student@example.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Initial Password
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs text-emerald-650 hover:text-emerald-750 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" /> Generate Secure
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Auto-Enroll in Course
              </label>
              <select
                name="courseId"
                defaultValue={courses[0]?.id || ''}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white"
              >
                <option value="">-- No Initial Course (Dashboard only) --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.level}] {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="registrationFeePaid"
              name="registrationFeePaid"
              defaultChecked
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="registrationFeePaid" className="text-xs text-slate-700 font-medium cursor-pointer">
              Mark Student Registration Fee as <strong>Paid (€20.00)</strong> (Unlocks immediate access upon login)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-lg text-sm transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create Student Credentials'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
