import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { BookOpen, CheckCircle, PlayCircle, CreditCard } from 'lucide-react';

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
            include: { lessons: true },
          },
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get all completed lesson IDs for this user
  const progress = await db.progress.findMany({
    where: { userId, isCompleted: true },
    select: { lessonId: true },
  });
  const completedIds = new Set(progress.map((p: any) => p.lessonId));

  // Get issued certificates
  const certificates = await db.certificate.findMany({
    where: { userId },
    select: { courseId: true },
  });
  const completedCourseIds = new Set(certificates.map((c: any) => c.courseId));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Learning</h1>
          <p className="text-slate-500 mt-1">Welcome back, {session.user.name ?? 'Learner'}!</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No courses yet</h3>
            <p className="text-slate-400 mb-6">Start learning by enrolling in a course.</p>
            <Link href="/"
              className="bg-[#0056D2] hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium transition">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(({ course, status, paymentType }: any) => {
              const allLessons = course.modules.flatMap((m: any) => m.lessons);
              const totalLessons = allLessons.length;
              const completedCount = allLessons.filter((l: any) => completedIds.has(l.id)).length;
              const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
              const firstLesson = course.modules[0]?.lessons[0];

              const isPartiallyPaid = status === 'PARTIALLY_PAID';

              return (
                <div key={course.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    {/* Thumbnail */}
                    <div className="h-36 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
                      <BookOpen className="w-12 h-12 text-[#0056D2] opacity-40" />
                      {isPartiallyPaid && (
                        <span className="absolute top-3 right-3 bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Partially Paid (1/2)
                        </span>
                      )}
                    </div>

                    <div className="p-5 pb-2">
                      <span className="text-xs font-bold text-[#0056D2] bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                        {course.level}
                      </span>
                      <h3 className="font-bold text-slate-800 mt-2 mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-slate-400 mb-4">{course.instructor.name}</p>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>{completedCount} / {totalLessons} lessons</span>
                          <span className="font-semibold text-[#0056D2]">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0056D2] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-2">
                    {isPartiallyPaid && (
                      <Link href={`/courses/${course.slug}/checkout`}
                        className="flex items-center gap-1.5 w-full border border-orange-500 hover:bg-orange-50 text-orange-600 py-2 rounded-md text-sm font-semibold transition justify-center">
                        <CreditCard className="w-4 h-4" />
                        Pay 2nd Installment (€{(course.price ? course.price / 2 : 0).toFixed(2)})
                      </Link>
                    )}

                    {pct === 100 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 text-sm font-semibold justify-center py-1">
                          <CheckCircle className="w-4 h-4" /> Completed!
                        </div>
                        {completedCourseIds.has(course.id) && (
                          <Link href={`/courses/${course.slug}/certificate`}
                            className="flex items-center gap-1.5 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md text-sm font-semibold transition justify-center shadow">
                            View Certificate 🎓
                          </Link>
                        )}
                      </div>
                    ) : firstLesson ? (
                      <Link href={`/courses/${course.slug}/learn/${firstLesson.id}`}
                        className="flex items-center gap-2 w-full bg-[#0056D2] hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition justify-center">
                        <PlayCircle className="w-4 h-4" />
                        {completedCount > 0 ? 'Continue' : 'Start Learning'}
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
