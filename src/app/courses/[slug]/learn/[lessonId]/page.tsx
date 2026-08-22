import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  CheckCircle, Circle, ChevronLeft, ChevronRight,
  PlayCircle, FileText, Lock, BookOpen,
} from 'lucide-react';
import QuizViewer from '@/components/QuizViewer';
import DiscussionForum from '@/components/DiscussionForum';

export default async function LessonViewerPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login`);

  const userId = session.user.id;

  // Load the course with all lessons
  const course = await db.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              quiz: {
                include: {
                  questions: {
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) notFound();


  // Fetch user data to verify registration fee status
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { registrationFeePaid: true, role: true },
  });

  // Instructors and Admins bypass learning gates
  const isAuthorizedStaff = dbUser?.role === 'INSTRUCTOR' || dbUser?.role === 'ADMIN';

  // Check enrollment
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  // Find the current lesson
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLesson = allLessons.find((l) => l.id === lessonId);
  if (!currentLesson) notFound();

  // Gate checkouts for students
  if (!isAuthorizedStaff) {
    const isPaidCourse = course.price && course.price > 0;

    // 1. Paid course requires registration fee to be paid first
    if (isPaidCourse && dbUser?.registrationFeePaid !== true) {
      redirect(`/courses/${slug}/checkout`);
    }

    // 2. Unenrolled non-free lessons block
    if (!currentLesson.isFree && !enrollment) {
      redirect(`/courses/${slug}/checkout`);
    }

    // 3. Partially paid installments block
    if (enrollment && enrollment.status === 'PARTIALLY_PAID') {
      redirect(`/courses/${slug}/checkout`);
    }
  }

  // Get progress for all lessons
  const progressRecords = await db.progress.findMany({
    where: { userId, lessonId: { in: allLessons.map((l) => l.id) } },
    select: { lessonId: true, isCompleted: true },
  });
  const completedIds = new Set(
    progressRecords.filter((p) => p.isCompleted).map((p) => p.lessonId)
  );

  const isCompleted = completedIds.has(lessonId);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // YouTube embed
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };
  const youtubeId = currentLesson.videoUrl ? getYouTubeId(currentLesson.videoUrl) : null;

  // Find which module this lesson belongs to
  const currentModule = course.modules.find((m) =>
    m.lessons.some((l) => l.id === lessonId)
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Curriculum */}
        <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col overflow-y-auto shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-slate-700">
            <Link href={`/courses/${slug}`}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition mb-3">
              <ChevronLeft className="w-4 h-4" /> Back to course
            </Link>
            <h2 className="font-bold text-white text-sm line-clamp-2">{course.title}</h2>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{completedIds.size} / {allLessons.length} completed</span>
                <span>{allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full">
                <div
                  className="h-full bg-[#0056D2] rounded-full transition-all"
                  style={{ width: `${allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {course.modules.map((mod, mIdx) => (
              <div key={mod.id} className="mb-1">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Section {mIdx + 1}: {mod.title}
                </div>
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.id === lessonId;
                  const isDone = completedIds.has(lesson.id);
                  const isLocked = !lesson.isFree && !enrollment;

                  return (
                    <div key={lesson.id}>
                      {isLocked ? (
                        <div className={`flex items-center gap-3 px-4 py-3 text-slate-500 cursor-not-allowed`}>
                          <Lock className="w-4 h-4 shrink-0" />
                          <span className="text-sm line-clamp-1">{lesson.title}</span>
                        </div>
                      ) : (
                        <Link
                          href={`/courses/${slug}/learn/${lesson.id}`}
                          className={`flex items-center gap-3 px-4 py-3 transition ${
                            isActive
                              ? 'bg-[#0056D2]/20 border-l-2 border-[#0056D2] text-white'
                              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 shrink-0 text-slate-500" />
                          )}
                          <span className="text-sm line-clamp-2">{lesson.title}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Video */}
          {youtubeId ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
                title={currentLesson.title}
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-slate-800 flex flex-col items-center justify-center text-slate-500">
              <PlayCircle className="w-16 h-16 mb-3 opacity-30" />
              <p className="text-sm">No video for this lesson.</p>
            </div>
          )}

          {/* Lesson content area */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">{currentModule?.title}</p>
                <h1 className="text-2xl font-bold text-white">{currentLesson.title}</h1>
                {currentLesson.description && (
                  <p className="text-slate-400 mt-2">{currentLesson.description}</p>
                )}
              </div>
              {isCompleted && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5" /> Completed
                </div>
              )}
            </div>

            {/* Lesson written content */}
            {currentLesson.content && (
              <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                  <FileText className="w-4 h-4" /> Lesson Notes
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {currentLesson.content}
                </div>
              </div>
            )}

            {/* Quiz Viewer */}
            {currentLesson.quiz && (
              <QuizViewer
                quizId={currentLesson.quiz.id}
                questions={currentLesson.quiz.questions}
                initialAttempts={await db.quizAttempt.findMany({
                  where: { quizId: currentLesson.quiz.id, userId },
                  orderBy: { createdAt: 'desc' },
                  select: { id: true, score: true, total: true, createdAt: true },
                })}
              />
            )}

            {/* Discussion Forum */}
            <DiscussionForum lessonId={currentLesson.id} />

            {/* Navigation + Mark Complete */}
            <div className="flex items-center justify-between gap-4 border-t border-slate-700 pt-6 mt-8">

              {/* Prev */}
              {prevLesson ? (
                <Link href={`/courses/${slug}/learn/${prevLesson.id}`}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Link>
              ) : <div />}

              {/* Mark complete */}
              {enrollment && !isCompleted && (
                <form action="/api/progress/complete" method="POST">
                  <input type="hidden" name="lessonId" value={lessonId} />
                  <input type="hidden" name="courseSlug" value={slug} />
                  <input type="hidden" name="nextLessonId" value={nextLesson?.id ?? ''} />
                  <button type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Mark as Complete
                  </button>
                </form>
              )}

              {enrollment && isCompleted && nextLesson && (
                <Link href={`/courses/${slug}/learn/${nextLesson.id}`}
                  className="bg-[#0056D2] hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition flex items-center gap-2">
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </Link>
              )}

              {/* Next */}
              {nextLesson ? (
                <Link href={`/courses/${slug}/learn/${nextLesson.id}`}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium">
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link href={`/courses/${slug}`}
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 transition text-sm font-medium">
                  <BookOpen className="w-4 h-4" /> Back to Course
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
