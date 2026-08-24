import Link from 'next/link';
import { db } from '@/lib/prisma';
import { Plus, Edit } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);
  
  const courses = await db.course.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
          <div className="flex gap-4 mt-2">
            <span className="text-sm font-semibold text-[#0056D2]">Courses</span>
            <Link href="/instructor/analytics" className="text-sm text-slate-500 hover:text-[#0056D2] font-medium transition">
              Analytics
            </Link>
          </div>
        </div>
        <Link href="/instructor/courses/create" className="bg-[#0056D2] hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition">
          <Plus className="w-5 h-5 mr-2" /> New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No courses yet</h3>
          <p className="text-slate-500 mb-6">Create your first course to start teaching.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">Course Title</th>
                <th className="p-4 font-semibold text-slate-700">Level</th>
                <th className="p-4 font-semibold text-slate-700">Status</th>
                <th className="p-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course: any) => (
                <tr key={course.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{course.title}</td>
                  <td className="p-4 text-slate-500">{course.level}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/instructor/courses/${course.id}/edit`} className="text-[#0056D2] hover:underline flex items-center font-medium">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
