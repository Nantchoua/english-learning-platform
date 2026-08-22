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
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  // Instructor who owns the course gets full access automatically (no enrollment needed)
  const isOwner = userId && course.instructor.id === userId;

  // Check if current user is enrolled
  const enrollment = userId && !isOwner
    ? await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
      })
    : null;

  // Can access if enrolled OR is the course owner
  const hasAccess = !!enrollment || !!isOwner;

  // Get first lesson for "Start Learning" CTA
  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {course.level}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
            {course.description && (
              <p className="text-slate-300 text-lg mb-6">{course.description}</p>
            )}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {course._count.enrollments} students
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {course.modules.length} modules
              </span>
              <span className="flex items-center gap-1">
                <PlayCircle className="w-4 h-4" /> {totalLessons} lessons
              </span>
            </div>
            <p className="mt-4 text-slate-400 text-sm">
              Created by <span className="text-white font-medium">{course.instructor.name}</span>
            </p>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white text-slate-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-[#0056D2] opacity-50" />
              </div>
              <div className="p-6">
                {hasAccess ? (
                  <>
                    <div className="flex items-center gap-2 font-semibold mb-4 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      {isOwner ? 'Your course' : 'You are enrolled'}
                    </div>
                    {firstLesson ? (
                      <Link
                        href={`/courses/${slug}/learn/${firstLesson.id}`}
                        className="block w-full bg-[#0056D2] hover:bg-blue-700 text-white text-center py-3 rounded-md font-semibold transition">
                        {isOwner ? 'Preview Course →' : 'Continue Learning →'}
                      </Link>
                    ) : (
                      <div className="text-center text-sm text-slate-400 bg-slate-50 rounded-md py-3 px-4">
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
                    <div className="mb-4">
                      {course.price && course.price > 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-slate-900">€{course.price.toFixed(2)}</span>
                          <span className="text-xs text-slate-400">one-time payment</span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-green-600">Free</span>
                      )}
                    </div>
                    {session ? (
                      course.price && course.price > 0 ? (
                        <Link href={`/courses/${slug}/checkout`}
                          className="block w-full bg-[#0056D2] hover:bg-blue-700 text-white text-center py-3 rounded-md font-semibold transition">
                          Buy Course — €{course.price.toFixed(2)}
                        </Link>
                      ) : (
                        <form action="/api/enroll" method="POST">
                          <input type="hidden" name="courseId" value={course.id} />
                          <input type="hidden" name="slug" value={slug} />
                          <button type="submit"
                            className="w-full bg-[#0056D2] hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition">
                            Enroll Now — Free
                          </button>
                        </form>
                      )
                    ) : (
                      <Link href="/login"
                        className="block w-full bg-[#0056D2] hover:bg-blue-700 text-white text-center py-3 rounded-md font-semibold transition">
                        Sign in to Enroll
                      </Link>
                    )}
                  </>
                )}
                <p className="text-xs text-slate-400 text-center mt-3">30-day money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Course Curriculum</h2>
          <div className="space-y-3">
            {course.modules.map((mod, mIdx) => (
              <div key={mod.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-5 py-4 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Section {mIdx + 1}: {mod.title}
                  </h3>
                  <span className="text-xs text-slate-400">{mod.lessons.length} lessons</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {lesson.isFree || enrollment ? (
                          <PlayCircle className="w-4 h-4 text-[#0056D2] flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                        {lesson.isFree || enrollment ? (
                          <Link href={`/courses/${slug}/learn/${lesson.id}`}
                            className="text-sm text-slate-700 hover:text-[#0056D2] hover:underline">
                            {lesson.title}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-500">{lesson.title}</span>
                        )}
                      </div>
                      {lesson.isFree && !enrollment && (
                        <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      )}
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
