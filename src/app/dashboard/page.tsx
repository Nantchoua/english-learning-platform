import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StudentDashboardView from '@/components/duolingo/StudentDashboardView';
import { UnitData, LessonNodeData } from '@/components/duolingo/types';
import { BookOpen, CheckCircle, PlayCircle, CreditCard, Flame, Zap, Trophy, Award } from 'lucide-react';

const UNIT_THEMES: Array<'emerald' | 'blue' | 'purple' | 'amber' | 'rose'> = [
  'emerald', 'blue', 'purple', 'amber', 'rose'
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = session.user.id;

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
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
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get all completed lesson IDs for this user
  const progressRecords = await db.progress.findMany({
    where: { userId, isCompleted: true },
    select: { lessonId: true, updatedAt: true },
  });
  const completedIds = new Set(progressRecords.map((p: any) => p.lessonId));

  // Get issued certificates
  const certificates = await db.certificate.findMany({
    where: { userId },
    select: { courseId: true },
  });
  const completedCourseIds = new Set(certificates.map((c: any) => c.courseId));

  const totalEnrolled = enrollments.length;
  const totalCompletedLessons = completedIds.size;
  const totalCertificates = completedCourseIds.size;

  // Compute Streak & XP
  const totalXp = totalCompletedLessons * 25 + 50;
  const gemsCount = Math.max(20, totalCompletedLessons * 15 + 40);
  const streakDays = totalCompletedLessons > 0 ? Math.min(14, Math.max(1, totalCompletedLessons)) : 1;

  // Format courses for Duolingo view
  const formattedCourses = enrollments.map(({ course }: any) => {
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

    const allLessons = course.modules.flatMap((m: any) => m.lessons);
    const totalCount = allLessons.length;
    const completedCount = allLessons.filter((l: any) => completedIds.has(l.id)).length;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      level: course.level,
      units,
      completedCount,
      totalCount,
    };
  });

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="pb-16">
        {totalEnrolled === 0 ? (
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome, {session.user.name ?? 'Learner'}!</h1>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              You are not enrolled in any English courses yet. Browse our catalog to unlock your Duolingo learning pathway!
            </p>
            <Link
              href="/courses"
              className="bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-1 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg transition duration-150 inline-block text-lg"
            >
              Browse English Courses
            </Link>
          </div>
        ) : (
          <StudentDashboardView
            userName={session.user.name ?? 'Learner'}
            courses={formattedCourses}
            streakDays={streakDays}
            totalXp={totalXp}
            gemsCount={gemsCount}
          />
        )}
      </main>
    </div>
  );
}
