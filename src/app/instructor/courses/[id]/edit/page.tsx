import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Settings, Trash2, BookOpen, LayoutDashboard, Eye, EyeOff,
  CheckCircle2, Circle, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { updateCourse, togglePublish } from './actions';
import DeleteCourseButton from '@/components/DeleteCourseButton';

export default async function CourseEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ publishError?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;
  const { publishError } = await searchParams;


  const isAdminOrInstructor = session.user.role === 'ADMIN' || session.user.role === 'INSTRUCTOR';
  
  const course = await db.course.findFirst({
    where: isAdminOrInstructor ? { id } : { id, instructorId: session.user.id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  });

  if (!course) notFound();

  // Compute publish checklist
  const totalLessons = course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0);
  const checks = [
    { label: 'Course title',       done: !!course.title?.trim() },
    { label: 'Course description', done: !!course.description?.trim() },
    { label: 'At least one lesson', done: totalLessons > 0 },
  ];
  const canPublish = checks.every((c) => c.done);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/instructor/courses" className="text-slate-500 hover:text-slate-800 transition">
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800 truncate max-w-xs">{course.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium text-sm transition"
            >
              <ExternalLink className="w-4 h-4" /> Preview Course
            </Link>
            <form action={togglePublish}>
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="isPublished" value={String(!course.isPublished)} />
              <button
                type="submit"
                disabled={!course.isPublished && !canPublish}
                title={!course.isPublished && !canPublish ? 'Complete the checklist before publishing' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition ${
                  course.isPublished
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : canPublish
                    ? 'bg-[#0056D2] hover:bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {course.isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Publish error banner */}
      {publishError && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span><strong>Cannot publish:</strong> {decodeURIComponent(publishError)}</span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Settings */}
        <div className="lg:col-span-1 space-y-6">

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-base flex items-center gap-2 mb-5 text-slate-800">
              <Settings className="w-4 h-4" /> Course Settings
            </h2>
            <form action={updateCourse} className="space-y-4">
              <input type="hidden" name="courseId" value={course.id} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" name="title" defaultValue={course.title} required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#0056D2] focus:border-[#0056D2] text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea name="description" defaultValue={course.description ?? ''} rows={4}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#0056D2] focus:border-[#0056D2] text-slate-900" />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                <select name="level" defaultValue={course.level}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900">
                  <option value="A1">A1 – Beginner</option>
                  <option value="A2">A2 – Elementary</option>
                  <option value="B1">B1 – Intermediate</option>
                  <option value="B2">B2 – Upper Intermediate</option>
                  <option value="C1">C1 – Advanced</option>
                  <option value="C2">C2 – Proficient</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (EUR)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  defaultValue={course.price ?? 0}
                  placeholder="0.00 for free course"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#0056D2] focus:border-[#0056D2] text-slate-900"
                />
              </div>
              <button type="submit"
                className="w-full bg-[#0056D2] hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition">
                Save Changes
              </button>
            </form>
          </div>

          {/* Publish Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-base flex items-center gap-2 mb-4 text-slate-800">
              {canPublish
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <Circle className="w-4 h-4 text-slate-300" />}
              Publish Checklist
            </h2>
            <ul className="space-y-3">
              {checks.map((check) => (
                <li key={check.label} className="flex items-center gap-3 text-sm">
                  {check.done
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span className={check.done ? 'text-slate-700' : 'text-slate-400'}>
                    {check.label}
                  </span>
                </li>
              ))}
            </ul>
            {canPublish ? (
              <p className="mt-4 text-xs text-green-600 font-medium">✓ Ready to publish!</p>
            ) : (
              <p className="mt-4 text-xs text-slate-400">Complete all items above to publish.</p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
            <h2 className="font-semibold text-base flex items-center gap-2 mb-4 text-red-600">
              <Trash2 className="w-4 h-4" /> Danger Zone
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Deleting this course is permanent and cannot be undone. All modules, lessons, student progress, and enrollments will be deleted.
            </p>
            <DeleteCourseButton courseId={course.id} />
          </div>
        </div>


        {/* Right Column: Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-base flex items-center gap-2 text-slate-800">
                <BookOpen className="w-4 h-4" /> Curriculum
              </h2>
              {/* Plain URL action — bypasses Server Actions entirely */}
              <form action="/api/instructor/add-module" method="POST" className="flex items-center gap-2">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="text" name="title" required placeholder="New module title..."
                  className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-[#0056D2] focus:border-[#0056D2] w-48" />
                <button type="submit"
                  className="bg-[#0056D2] hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition">
                  <Plus className="w-4 h-4" /> Add Module
                </button>
              </form>
            </div>

            {course.modules.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No modules yet. Add your first module above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {course.modules.map((mod: any) => (
                  <div key={mod.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Module Header */}
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                      <span className="font-medium text-slate-800 text-sm">{mod.title}</span>
                      <form action="/api/instructor/delete-module" method="POST">
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="moduleId" value={mod.id} />
                        <button type="submit" className="text-slate-400 hover:text-red-500 transition p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    {/* Lessons */}
                    <div className="p-3 space-y-2">
                      {mod.lessons.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between bg-white border border-slate-200 rounded px-3 py-2 group">
                          <Link href={`/instructor/courses/${course.id}/lessons/${lesson.id}/edit`}
                            className="text-sm text-slate-700 hover:text-[#0056D2] hover:underline flex-1">
                            {lesson.title}
                          </Link>
                          <form action="/api/instructor/delete-lesson" method="POST">
                            <input type="hidden" name="courseId" value={course.id} />
                            <input type="hidden" name="lessonId" value={lesson.id} />
                            <button type="submit" className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      ))}

                      {/* Add Lesson Form — plain URL action */}
                      <form action="/api/instructor/add-lesson" method="POST" className="flex items-center gap-2 pt-1">
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="moduleId" value={mod.id} />
                        <input type="text" name="title" required placeholder="New lesson title..."
                          className="border border-slate-300 rounded px-3 py-1.5 text-sm flex-1 focus:ring-[#0056D2] focus:border-[#0056D2]" />
                        <button type="submit"
                          className="text-[#0056D2] hover:bg-blue-50 text-sm font-medium px-3 py-1.5 rounded flex items-center gap-1 transition border border-[#0056D2]">
                          <Plus className="w-3 h-3" /> Lesson
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
