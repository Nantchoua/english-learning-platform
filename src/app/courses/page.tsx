import { db } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import CourseCatalog from '@/components/CourseCatalog';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CoursesCatalogPage() {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: true,
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0056D2] to-blue-800 text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              <BookOpen className="w-3.5 h-3.5" /> All Speaking & English Courses
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Explore Our Course Catalog
            </h1>
            <p className="text-blue-100 text-base">
              Choose from A1-A2 speaking handbooks, business communication, and fluency mastery courses.
            </p>
          </div>
        </div>
      </section>

      {/* Courses List */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        <CourseCatalog courses={courses} />
      </main>
    </div>
  );
}
