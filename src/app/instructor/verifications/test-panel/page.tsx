import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TestActionButtons from '@/components/TestActionButtons';

export default async function TestPanelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  // Validate Admin Role
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'INSTRUCTOR') {
    notFound();
  }

  // Load list of students to select for testing
  const students = await db.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, name: true, email: true }
  });

  // Load list of courses to test enrollment
  const courses = await db.course.findMany({
    select: { id: true, title: true }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6 w-full flex-grow space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Simulator Panel</h1>
          <p className="text-slate-500 mt-1">
            Create mock student payments, trigger Revolut references, and test enrollment gates.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <TestActionButtons students={students} courses={courses} />
        </div>
      </main>
    </div>
  );
}
