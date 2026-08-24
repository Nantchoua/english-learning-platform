import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.redirect(new URL('/login', req.url));

  const formData = await req.formData();
  const lessonId = formData.get('lessonId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const videoUrl = formData.get('videoUrl') as string;
  const content = formData.get('content') as string;
  const isFree = formData.get('isFree') === 'on';
  const isPublished = formData.get('isPublished') === 'on';

  // Verify ownership through the lesson → module → course chain
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Verify ownership
  const { checkCourseEditorAccess } = await import('@/lib/auth-helpers');
  const hasAccess = await checkCourseEditorAccess(lesson.module.courseId, session.user.id, session.user.role);

  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  await db.lesson.update({
    where: { id: lessonId },
    data: { title, description, videoUrl, content, isFree, isPublished },
  });

  const courseId = lesson.module.courseId;
  return NextResponse.redirect(
    new URL(`/instructor/courses/${courseId}/lessons/${lessonId}/edit`, req.url)
  );
}
