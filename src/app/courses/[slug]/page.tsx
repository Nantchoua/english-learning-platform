import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LearningPath from '@/components/duolingo/LearningPath';
import GamificationSidebar from '@/components/duolingo/GamificationSidebar';
import { UnitData, LessonNodeData } from '@/components/duolingo/types';
import { BookOpen, CheckCircle, Clock, Lock, PlayCircle, Users, Award, Sparkles, Trophy } from 'lucide-react';

const UNIT_THEMES: Array<'emerald' | 'blue' | 'purple' | 'amber' | 'rose'> = [
  'emerald', 'blue', 'purple', 'amber', 'rose'
];

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const course = await db.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      instructor: true,
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { quiz: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    if (slug === 'connect-with-english-a1-a2') {
      redirect('/courses/english-beginner-course');
    }
    notFound();
  }

  const userId = (session?.user as any)?.id as string | undefined;
  const totalLessons = course.modules.reduce((acc, m: any) => acc + m.lessons.length, 0);

  const isOwner = userId && course.instructor.id === userId;

  const dbUser = userId
    ? await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })
    : null;
  const isAdmin = dbUser?.role === 'ADMIN';

  const enrollment = userId && !isOwner
    ? await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
      })
    : null;

  const hasAccess = !!enrollment || !!isOwner || isAdmin;

  const progressRecords = userId
    ? await db.progress.findMany({
        where: { userId, isCompleted: true },
        select: { lessonId: true },
      })
    : [];
  const completedIds = new Set(progressRecords.map((p: any) => p.lessonId));

  let globalFoundCurrent = false;
  const units: UnitData[] = course.modules.map((mod: any, modIdx: number) => {
    let completedInUnit = 0;

    const lessons: LessonNodeData[] = mod.lessons.map((lesson: any, lessonIdx: number) => {
      const isDone = completedIds.has(lesson.id);
      if (isDone) completedInUnit++;

      let status: 'COMPLETED' | 'CURRENT' | 'LOCKED' = 'LOCKED';
      if (isDone) {
        status = 'COMPLETED';
      } else if (!globalFoundCurrent) {
        status = 'CURRENT';
        globalFoundCurrent = true;
      }

      let type: LessonNodeData['type'] = 'LESSON';
      if (lesson.quiz) type = 'QUIZ';
      else if (lesson.videoUrl) type = 'VIDEO';
      else if (lesson.title.toLowerCase().includes('speaking') || lesson.title.toLowerCase().includes('pronunciation')) {
        type = 'SPEAKING';
      }

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || null,
        videoUrl: lesson.videoUrl || null,
        content: lesson.content || null,
        order: lesson.order,
        isFree: lesson.isFree,
        status,
        type,
        xpReward: 20 + (lessonIdx * 5),
        durationMinutes: 5 + (lessonIdx * 3),
        slug: course.slug,
        moduleId: mod.id,
      };
    });

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description || null,
      order: mod.order,
      colorTheme: UNIT_THEMES[modIdx % UNIT_THEMES.length],
      lessons,
      completedCount: completedInUnit,
      totalCount: lessons.length,
    };
  });

  const firstLesson = course.modules.flatMap((m: any) => m.lessons)[0];
  const completedCount = completedIds.size;
  const totalXp = completedCount * 25 + 50;
  const streakDays = completedCount > 0 ? Math.min(14, Math.max(1, completedCount)) : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-slate-900 border-b border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#58CC02] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {course.level} Level
              </span>
              {hasAccess && (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Active Student
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-white">{course.title}</h1>
            {course.description && (
              <p className="text-slate-300 text-base font-normal leading-relaxed">{course.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5 font-bold">
                <Users className="w-4 h-4 text-blue-400" /> {course._count.enrollments} Students
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <BookOpen className="w-4 h-4 text-emerald-400" /> {course.modules.length} Units
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <PlayCircle className="w-4 h-4 text-amber-400" /> {totalLessons} Lessons
              </span>
            </div>
          </div>

          {/* Quick CTA or Pricing card */}
          <div className="lg:col-span-1">
            <div className="bg-white text-slate-800 rounded-3xl shadow-xl p-6 border-2 border-slate-200/80">
              {hasAccess ? (
                <div className="space-y-4 text-center">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Your Learning Path is Ready</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Pick any unlocked lesson node below to continue.</p>
                  </div>
                  {firstLesson && (
                    <Link
                      href={`/courses/${slug}/learn/${firstLesson.id}`}
                      className="block w-full bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-1 text-white font-black py-3 rounded-2xl shadow-md transition"
                    >
                      Jump In & Learn
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tuition Cost</span>
                      {course.accessPassword && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          <Lock className="w-2.5 h-2.5" /> Password Protected
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">€{course.price?.toFixed(2) ?? '0.00'}</div>
                  </div>
                  {session ? (
                    course.price && course.price > 0 ? (
                      <Link
                        href={`/courses/${slug}/checkout`}
                        className="block w-full bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-1 text-white font-black py-3.5 rounded-2xl shadow-md transition text-base"
                      >
                        Enroll & Unlock Path
                      </Link>
                    ) : (
                      <form action="/api/enroll" method="POST" className="space-y-3">
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="slug" value={slug} />
                        {course.accessPassword && (
                          <div>
                            <input
                              type="password"
                              name="coursePassword"
                              required
                              placeholder="Enter Course Password"
                              className="w-full text-center border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 font-mono"
                            />
                          </div>
                        )}
                        <button
                          type="submit"
                          className="w-full bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-1 text-white font-black py-3.5 rounded-2xl shadow-md transition text-base cursor-pointer"
                        >
                          Enroll Now — Free
                        </button>
                      </form>
                    )
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] text-white font-black py-3.5 rounded-2xl shadow-md transition text-base"
                    >
                      Sign in to Enroll
                    </Link>
                  )}
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Lifetime Access · Duolingo-style Pathway
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Duolingo Learning Tree & Gamification Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Duolingo Winding Path */}
          <div className="lg:col-span-2">
            <LearningPath
              units={units}
              courseSlug={course.slug}
              courseTitle={course.title}
            />
          </div>

          {/* Gamification Sidebar */}
          <div className="lg:col-span-1 sticky top-6">
            <GamificationSidebar
              streakDays={streakDays}
              totalXp={totalXp}
              gemsCount={Math.max(20, completedCount * 15 + 40)}
              courseTitle={course.title}
              courseSlug={course.slug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
