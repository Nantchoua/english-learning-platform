import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/prisma';
import CourseCatalog from '@/components/CourseCatalog';

export default async function LandingPage() {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: true,
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0056D2] to-blue-800 text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
              #1 English Learning Platform
            </span>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Master English to<br />Advance Your Career
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl">
              High-quality courses for business, test prep, and everyday conversation. Learn at your own pace.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="#courses"
                className="bg-white text-[#0056D2] font-semibold py-3 px-7 rounded-md hover:bg-slate-100 transition flex items-center gap-2">
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register"
                className="border border-white/40 text-white font-semibold py-3 px-7 rounded-md hover:bg-white/10 transition">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Published Courses', value: courses.length.toString() },
            { label: 'CEFR Levels',       value: 'A1 – C2' },
            { label: 'Expert Instructors', value: '100%' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-[#0056D2]">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Catalog — with search & level filter */}
      <CourseCatalog courses={courses} />
    </main>
  );
}
