import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, Award, CheckCircle, Percent } from 'lucide-react';
import UnenrollButton from '@/components/UnenrollButton';

export default async function InstructorAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN') redirect('/');

  const userId = session.user.id;

  // Fetch courses owned by the instructor
  const courses = await db.course.findMany({
    where: { instructorId: userId },
    include: {
      enrollments: {
        include: {
          user: {
            include: {
              progress: true,
              quizAttempts: true,
            },
          },
        },
      },
      modules: {
        include: {
          lessons: {
            include: {
              quiz: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate statistics
  const totalCourses = courses?.length || 0;
  let totalEnrollments = 0;
  let totalLessonsAcrossAll = 0;
  let totalProgressPercentagesSum = 0;
  let studentProgressCount = 0;

  const courseStats = (courses || []).map((course: any) => {
    const allLessons = course.modules?.flatMap((m: any) => m.lessons || []) || [];
    const lessonCount = allLessons.length;
    const enrollmentsCount = course.enrollments?.length || 0;
    totalEnrollments += enrollmentsCount;
    totalLessonsAcrossAll += lessonCount;

    let progressSum = 0;
    (course.enrollments || []).forEach((enrollment: any) => {
      if (lessonCount > 0 && enrollment.user?.progress) {
        const completedCount = allLessons.filter((lesson: any) =>
          enrollment.user.progress.some((p: any) => p.lessonId === lesson.id && p.isCompleted)
        ).length;
        const progressPercentage = (completedCount / lessonCount) * 100;
        progressSum += progressPercentage;
        totalProgressPercentagesSum += progressPercentage;
        studentProgressCount++;
      }
    });

    const averageProgress = enrollmentsCount > 0 ? Math.round(progressSum / enrollmentsCount) : 0;

    return {
      id: course.id,
      title: course.title,
      level: course.level,
      isPublished: course.isPublished,
      enrollmentsCount,
      lessonCount,
      averageProgress,
    };
  });

  const averageGlobalProgress = studentProgressCount > 0 ? Math.round(totalProgressPercentagesSum / studentProgressCount) : 0;

  // Gather individual student breakdowns
  const studentBreakdowns: Array<{
    studentId: string;
    courseId: string;
    name: string | null;
    email: string | null;
    courseTitle: string;
    progressPercentage: number;
  }> = [];

  (courses || []).forEach((course: any) => {
    const allLessons = course.modules?.flatMap((m: any) => m.lessons || []) || [];
    (course.enrollments || []).forEach((enrollment: any) => {
      const lessonCount = allLessons.length;
      let progressPercentage = 0;
      if (lessonCount > 0 && enrollment.user?.progress) {
        const completedCount = allLessons.filter((lesson: any) =>
          enrollment.user.progress.some((p: any) => p.lessonId === lesson.id && p.isCompleted)
        ).length;
        progressPercentage = Math.round((completedCount / lessonCount) * 100);
      }
      studentBreakdowns.push({
        studentId: enrollment.userId,
        courseId: course.id,
        name: enrollment.user?.name || 'Anonymous',
        email: enrollment.user?.email || 'N/A',
        courseTitle: course.title,
        progressPercentage,
      });
    });
  });


  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header and Nav Tabs */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <div className="flex gap-4 mt-2">
            <Link href="/instructor/courses" className="text-sm text-slate-500 hover:text-[#0056D2] font-medium transition">
              Courses
            </Link>
            <span className="text-sm font-semibold text-[#0056D2]">Analytics</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#0056D2] rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Courses</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalCourses}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalEnrollments}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Avg. Completion Rate</p>
            <h3 className="text-2xl font-bold text-slate-900">{averageGlobalProgress}%</h3>
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-sm">Course Performance Details</h2>
        </div>
        {courseStats.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">No courses available.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="p-4">Course Title</th>
                <th className="p-4 text-center">Level</th>
                <th className="p-4 text-center">Students</th>
                <th className="p-4 text-center">Lessons</th>
                <th className="p-4">Avg. Progress</th>
              </tr>
            </thead>
            <tbody>
              {courseStats.map((stat: any) => (
                <tr key={stat.id} className="border-b border-slate-200 hover:bg-slate-50/30 text-sm">
                  <td className="p-4 font-semibold text-slate-900">
                    {stat.title}
                    {!stat.isPublished && (
                      <span className="ml-2 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center text-slate-600 font-medium">{stat.level}</td>
                  <td className="p-4 text-center font-bold text-slate-800">{stat.enrollmentsCount}</td>
                  <td className="p-4 text-center text-slate-500">{stat.lessonCount}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${stat.averageProgress}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-xs">{stat.averageProgress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Progress Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-sm">Student Enrollment Progress List</h2>
        </div>
        {studentBreakdowns.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">No students currently enrolled in your courses.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="p-4">Student Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Completed Percentage</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {studentBreakdowns.map((student, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/30 text-sm">
                  <td className="p-4 font-semibold text-slate-900">{student.name || 'Anonymous'}</td>
                  <td className="p-4 text-slate-600">{student.email || 'N/A'}</td>
                  <td className="p-4 text-slate-600 font-medium">{student.courseTitle}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${student.progressPercentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-green-700 text-xs">{student.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <UnenrollButton
                      studentId={student.studentId}
                      courseId={student.courseId}
                      studentName={student.name || 'Anonymous'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
