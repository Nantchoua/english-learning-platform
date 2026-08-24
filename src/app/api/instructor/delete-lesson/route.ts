import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.redirect(new URL('/login', req.url));

  const formData = await req.formData();
  const courseId = formData.get('courseId') as string;
  const lessonId = formData.get('lessonId') as string;

  const { checkCourseEditorAccess } = await import('@/lib/auth-helpers');
  const hasAccess = await checkCourseEditorAccess(courseId, session.user.id, session.user.role);
  if (!hasAccess) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  await db.lesson.delete({ where: { id: lessonId } });

  return NextResponse.redirect(new URL(`/instructor/courses/${courseId}/edit`, req.url));
}
