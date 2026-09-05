import { db } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import CourseCatalog from '@/components/CourseCatalog';
import { BookOpen, Sparkles, Trophy, Flame, Zap, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <Navbar />

      {/* Cheerful Duolingo-styled Header Banner */}
      <section className="bg-gradient-to-b from-blue-600 to-[#0056D2] text-white pt-16 pb-20 px-6 relative overflow-hidden">
        {/* Decorative circular shapes */}
        <div className="absolute top-0 right-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full mb-4 border border-white/20 uppercase tracking-wider shadow-xs">
              <span className="text-base">🇬🇧</span>
              <span>Gamified English Pathways</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight drop-shadow-xs">
              Explore Our English Courses
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              Choose your CEFR level from A1 to C2 and start learning with bite-sized lessons, speaking practice, and streak rewards.
            </p>

            {/* Quick feature pill row */}
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-white/20 text-xs font-bold text-white/90">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Flame className="w-4 h-4 text-orange-400" /> Daily Streaks
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Zap className="w-4 h-4 text-amber-300" /> XP & Quests
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Trophy className="w-4 h-4 text-yellow-300" /> CEFR Certificates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full -mt-8 relative z-20">
        <CourseCatalog courses={courses} />
      </main>
    </div>
  );
}
