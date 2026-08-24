import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, BookOpen, Video, FileText, Gift } from 'lucide-react';
import QuizBuilder from '@/components/QuizBuilder';

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const { id: courseId, lessonId } = await params;

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId },
    include: {
      module: { include: { course: true } },
      quiz: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });


  const isAdminOrInstructor = session.user.role === 'ADMIN' || session.user.role === 'INSTRUCTOR';

  if (!lesson || (!isAdminOrInstructor && lesson.module.course.instructorId !== session.user.id)) {
    notFound();
  }

  const course = lesson.module.course;

  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const youtubeId = lesson.videoUrl ? getYouTubeId(lesson.videoUrl) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/instructor/courses/${courseId}/edit`}
              className="text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Course
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-sm truncate max-w-[150px]">{course.title}</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800 text-sm truncate max-w-[200px]">{lesson.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lesson.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {lesson.isPublished ? 'Published' : 'Draft'}
            </span>
            {lesson.isFree && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                Free Preview
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Video Preview + Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
              <Video className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800 text-sm">Video Preview</h2>
            </div>
            {youtubeId ? (
              <div className="aspect-video">
                <iframe src={`https://www.youtube.com/embed/${youtubeId}`}
                  className="w-full h-full" allowFullScreen title={lesson.title} />
              </div>
            ) : (
              <div className="aspect-video bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                <Video className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm">Paste a YouTube URL in the settings panel to preview it here.</p>
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
              <FileText className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800 text-sm">Lesson Content</h2>
              <span className="text-xs text-slate-400 ml-1">(Markdown supported)</span>
            </div>
            <div className="p-6">
              <form action="/api/instructor/update-lesson" method="POST">
                <input type="hidden" name="lessonId" value={lesson.id} />
                <input type="hidden" name="title" value={lesson.title} />
                <input type="hidden" name="description" value={lesson.description ?? ''} />
                <input type="hidden" name="videoUrl" value={lesson.videoUrl ?? ''} />
                <input type="hidden" name="isFree" value={lesson.isFree ? 'on' : ''} />
                <input type="hidden" name="isPublished" value={lesson.isPublished ? 'on' : ''} />
                <textarea name="content" defaultValue={lesson.content ?? ''} rows={16}
                  placeholder={`Write your lesson content here using Markdown...\n\n# Introduction\n\nYour lesson content goes here.\n\n## Key Points\n- Point 1\n- Point 2`}
                  className="w-full border border-slate-300 rounded-md px-4 py-3 text-sm font-mono focus:ring-[#0056D2] focus:border-[#0056D2] resize-none" />
                <div className="flex justify-end mt-4">
                  <button type="submit"
                    className="bg-[#0056D2] hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition">
                    Save Content
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quiz Builder */}
          <QuizBuilder
            lessonId={lesson.id}
            initialQuestions={lesson.quiz?.questions ?? []}
          />
        </div>


        {/* Right: Lesson Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2 mb-5">
              <BookOpen className="w-4 h-4" /> Lesson Settings
            </h2>
            <form action="/api/instructor/update-lesson" method="POST" className="space-y-4">
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="content" value={lesson.content ?? ''} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" name="title" defaultValue={lesson.title} required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#0056D2] focus:border-[#0056D2]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea name="description" defaultValue={lesson.description ?? ''} rows={3}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#0056D2] focus:border-[#0056D2]"
                  placeholder="Short description of this lesson..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" /> Video URL
                </label>
                <input type="url" name="videoUrl" defaultValue={lesson.videoUrl ?? ''}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#0056D2] focus:border-[#0056D2]"
                  placeholder="https://youtube.com/watch?v=..." />
                <p className="text-xs text-slate-400 mt-1">YouTube URLs are supported.</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Gift className="w-4 h-4 text-blue-500" /> Free Preview
                  </span>
                  <input type="checkbox" name="isFree" defaultChecked={lesson.isFree}
                    className="w-4 h-4 rounded accent-[#0056D2]" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    {lesson.isPublished
                      ? <Eye className="w-4 h-4 text-green-500" />
                      : <EyeOff className="w-4 h-4 text-slate-400" />}
                    Published
                  </span>
                  <input type="checkbox" name="isPublished" defaultChecked={lesson.isPublished}
                    className="w-4 h-4 rounded accent-[#0056D2]" />
                </label>
              </div>

              <button type="submit"
                className="w-full bg-[#0056D2] hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition">
                Save Settings
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
