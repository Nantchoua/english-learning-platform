import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { BookOpen, CheckCircle, Clock, Lock, PlayCircle, Users } from 'lucide-react';

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
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  const userId = (session?.user as any)?.id as string | undefined;
  const totalLessons = course.modules.reduce((acc, m: any) => acc + m.lessons.length, 0);

  // Instructor who owns the course gets full access automatically (no enrollment needed)
  const isOwner = userId && course.instructor.id === userId;

  // Fetch current user details to check for ADMIN status
  const dbUser = userId
    ? await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })
    : null;
  const isAdmin = dbUser?.role === 'ADMIN';

  // Check if current user is enrolled
  const enrollment = userId && !isOwner
    ? await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
      })
    : null;

  // Can access if enrolled OR is the course owner OR is an Admin
  const hasAccess = !!enrollment || !!isOwner || isAdmin;

  // Get first lesson for "Start Learning" CTA
  const firstLesson = course.modules.flatMap((m: any) => m.lessons)[0];


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Premium Hero with Subtle Wave/Angle Graphic */}
      <div className="bg-slate-900 border-b border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                {course.level} Level
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight text-white">{course.title}</h1>
            {course.description && (
              <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed">{course.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4.5 h-4.5 text-blue-500" /> {course._count.enrollments} Students Enrolled
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-4.5 h-4.5 text-blue-500" /> {course.modules.length} Modules
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <PlayCircle className="w-4.5 h-4.5 text-blue-500" /> {totalLessons} Lessons
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Instructed by <span className="text-slate-300 font-semibold">{course.instructor.name}</span>
            </p>
          </div>

          {/* Enrollment / Pricing card */}
          <div className="lg:col-span-1">
            <div className="bg-white text-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200/80 max-w-sm mx-auto">
              <div className="h-44 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative">
                <BookOpen className="w-20 h-20 text-white/20 absolute" />
                <Award className="w-16 h-16 text-white drop-shadow-md z-10" />
              </div>
              <div className="p-6 space-y-6">
                {hasAccess ? (
                  <>
                    <div className="flex items-center gap-2.5 font-bold text-green-600 justify-center bg-green-50/50 py-3 rounded-xl border border-green-100">
                      <CheckCircle className="w-5 h-5" />
                      {isOwner ? 'Instructor Access' : 'Successfully Enrolled'}
                    </div>
                    {firstLesson ? (
                      <Link
                        href={`/courses/${slug}/learn/${firstLesson.id}`}
                        className="block w-full bg-[#0056D2] hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-bold transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-150">
                        {isOwner ? 'Preview Course →' : 'Continue Learning →'}
                      </Link>
                    ) : (
                      <div className="text-center text-sm text-slate-400 bg-slate-50 rounded-xl py-3 px-4">
                        No lessons published yet.
                        {isOwner && (
                          <Link href={`/instructor/courses`} className="block mt-2 text-[#0056D2] hover:underline font-medium">
                            Go to Course Editor →
                          </Link>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-1 text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Tuition Cost</span>
                      <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-4xl font-black text-slate-900">€{course.price?.toFixed(2)}</span>
                        <span className="text-xs text-slate-400 font-semibold">one-time</span>
                      </div>
                    </div>
                    {session ? (
                      course.price && course.price > 0 ? (
                        <Link href={`/courses/${slug}/checkout`}
                          className="block w-full bg-[#0056D2] hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-bold transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-150">
                          Register & Buy Course
                        </Link>
                      ) : (
                        <form action="/api/enroll" method="POST">
                          <input type="hidden" name="courseId" value={course.id} />
                          <input type="hidden" name="slug" value={slug} />
                          <button type="submit"
                            className="w-full bg-[#0056D2] hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-150 cursor-pointer">
                            Enroll Now — Free
                          </button>
                        </form>
                      )
                    ) : (
                      <Link href="/login"
                        className="block w-full bg-[#0056D2] hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-bold transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-150">
                        Sign in to Enroll
                      </Link>
                    )}
                  </>
                )}
                <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold">
                  30-day money-back guarantee · Lifetime Access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-950">Course Curriculum</h2>
          <div className="space-y-4">
            {course.modules.map((mod: any, mIdx: number) => (
              <div key={mod.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition duration-200">
                <div className="bg-slate-50/50 px-6 py-4.5 flex items-center justify-between border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Section {mIdx + 1}: {mod.title}
                  </h3>
                  <span className="text-xs bg-slate-200/60 text-slate-650 px-2.5 py-1 rounded-md font-bold">{mod.lessons.length} Lessons</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {mod.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {enrollment ? (
                          <PlayCircle className="w-4 h-4 text-[#0056D2] flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                        {enrollment ? (
                          <Link href={`/courses/${slug}/learn/${lesson.id}`}
                            className="text-sm text-slate-700 hover:text-[#0056D2] hover:underline">
                            {lesson.title}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-500">{lesson.title}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4">Your Instructor</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#0056D2] flex items-center justify-center text-white font-bold text-lg">
                {course.instructor.name?.charAt(0) ?? 'I'}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{course.instructor.name}</p>
                <p className="text-xs text-slate-400">English Instructor</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Expert English instructor dedicated to helping you achieve fluency and confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
