import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StudentCreationForm from './StudentCreationForm';
import StudentTable from './StudentTable';
import { Users, UserCheck, ShieldCheck, BookOpen } from 'lucide-react';

export default async function InstructorStudentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const isAdminOrInstructor = session.user.role === 'ADMIN' || session.user.role === 'INSTRUCTOR';
  if (!isAdminOrInstructor) redirect('/dashboard');

  // Fetch all students with their enrollments and progress
  const students = await db.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { createdAt: 'desc' },
    include: {
      enrollments: {
        include: {
          course: {
            select: { title: true, slug: true },
          },
        },
      },
      _count: {
        select: { progress: true },
      },
    },
  });

  // Fetch courses for auto-enrollment dropdown
  const courses = await db.course.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, slug: true, level: true },
    orderBy: { title: 'asc' },
  });

  const totalStudents = students.length;
  const feesPaidCount = students.filter((s) => s.registrationFeePaid).length;
  const enrolledCount = students.filter((s) => s.enrollments.length > 0).length;

  const formattedStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    createdAt: new Date(s.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    registrationFeePaid: s.registrationFeePaid,
    enrollments: s.enrollments.map((e) => ({
      id: e.id,
      course: {
        title: e.course.title,
        slug: e.course.slug,
      },
      status: e.status,
    })),
    progressCount: s._count.progress,
  }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Student Management</h1>
            <div className="flex gap-4 mt-2">
              <Link
                href="/instructor/courses"
                className="text-sm text-slate-500 hover:text-emerald-600 font-medium transition"
              >
                Courses
              </Link>
              <span className="text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600 pb-0.5">
                Students ({totalStudents})
              </span>
              <Link
                href="/instructor/analytics"
                className="text-sm text-slate-500 hover:text-emerald-600 font-medium transition"
              >
                Analytics
              </Link>
              <Link
                href="/instructor/verifications"
                className="text-sm text-slate-500 hover:text-emerald-600 font-medium transition"
              >
                Approvals
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Students</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{feesPaidCount}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fee Verified</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{enrolledCount}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Enrolled Learners</div>
            </div>
          </div>
        </div>

        {/* 1. Add New Student Form Card */}
        <StudentCreationForm courses={courses} />

        {/* 2. Student Roster Table */}
        <StudentTable students={formattedStudents} />
      </main>
    </div>
  );
}
