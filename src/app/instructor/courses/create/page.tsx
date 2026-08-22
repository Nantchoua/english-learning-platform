import { createCourse } from './actions';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN') redirect('/');

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New Course</h1>
        <p className="text-slate-500">Fill out the basic details for your new course.</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <form action={createCourse} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-[#0056D2] focus:border-[#0056D2]"
              placeholder="e.g. Advanced English Grammar"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-[#0056D2] focus:border-[#0056D2]"
              placeholder="What will students learn in this course?"
            />
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-1">
              Course Level
            </label>
            <select
              id="level"
              name="level"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-[#0056D2] focus:border-[#0056D2]"
            >
              <option value="A1">A1 (Beginner)</option>
              <option value="A2">A2 (Elementary)</option>
              <option value="B1">B1 (Intermediate)</option>
              <option value="B2">B2 (Upper Intermediate)</option>
              <option value="C1">C1 (Advanced)</option>
              <option value="C2">C2 (Proficient)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
            <Link
              href="/instructor/courses"
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-[#0056D2] hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
