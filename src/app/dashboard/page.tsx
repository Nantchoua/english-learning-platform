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

  const totalEnrolled = enrollments.length;
  const totalCompletedLessons = completedIds.size;
  const totalCertificates = completedCourseIds.size;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Learning</h1>
            <p className="text-slate-500 mt-1">Welcome back, {session.user.name ?? 'Learner'}!</p>
          </div>
        </div>

        {/* Dynamic Performance Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Enrolled Courses</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalEnrolled}</span>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
              📚
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Finished Lessons</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCompletedLessons}</span>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
              ✅
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Certificates Earned</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCertificates}</span>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
              🎓
            </div>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No courses yet</h3>
            <p className="text-slate-400 mb-6">Start learning by enrolling in a course.</p>
            <Link href="/#courses"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-md font-medium transition inline-block">
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
              const isPending = status === 'PENDING';
              const isPending2 = status === 'PENDING_INSTALLMENT_2';

              return (
                <div key={course.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    {/* Thumbnail */}
                    <div className="h-36 bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center relative">
                      <BookOpen className="w-12 h-12 text-emerald-600 opacity-40" />
                      {isPartiallyPaid && (
                        <span className="absolute top-3 right-3 bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Partially Paid (1/2)
                        </span>
                      )}
                      {isPending && (
                        <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Pending Verification
                        </span>
                      )}
                      {isPending2 && (
                        <span className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Installment 2 Pending
                        </span>
                      )}
                    </div>

                    <div className="p-5 pb-2">
                      <span className="text-xs font-bold text-emerald-750 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-100">
                        {course.level}
                      </span>
                      <h3 className="font-extrabold text-slate-900 mt-3 mb-1 line-clamp-2 leading-snug">{course.title}</h3>
                      <p className="text-xs text-slate-400 mb-4">Instructor: {course.instructor.name}</p>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>{completedCount} / {totalLessons} lessons</span>
                          <span className="font-bold text-emerald-600">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-2">
                    {isPartiallyPaid && (
                      <Link href={`/courses/${course.slug}/checkout`}
                        className="flex items-center gap-1.5 w-full border border-orange-500 hover:bg-orange-50 text-orange-600 py-2.5 rounded-lg text-sm font-semibold transition justify-center">
                        <CreditCard className="w-4 h-4" />
                        Pay 2nd Installment (€{(course.price ? course.price / 2 : 0).toFixed(2)})
                      </Link>
                    )}

                    {isPending && (
                      <div className="bg-slate-50 border border-slate-200 text-center py-2.5 rounded-lg text-xs text-slate-500 font-medium">
                        Verifying Revolut Payment Reference...
                      </div>
                    )}

                    {isPending2 && (
                      <div className="bg-slate-50 border border-slate-200 text-center py-2.5 rounded-lg text-xs text-slate-500 font-medium">
                        Verifying Final Installment...
                      </div>
                    )}

                    {!isPending && !isPending2 && (
                      pct === 100 ? (
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
                          className="flex items-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition justify-center shadow-sm">
                          <PlayCircle className="w-4 h-4" />
                          {completedCount > 0 ? 'Continue' : 'Start Learning'}
                        </Link>
                      ) : null
                    )}

                    {/* Download payment invoice / receipt action link */}
                    {!isPending && !isPending2 && (
                      <Link href={`/dashboard/receipts/${course.id}`}
                        className="flex items-center gap-1.5 w-full border border-slate-200 hover:bg-slate-50 text-slate-500 py-2 rounded-lg text-xs font-semibold transition justify-center">
                        Download Receipt 🧾
                      </Link>
                    )}
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
