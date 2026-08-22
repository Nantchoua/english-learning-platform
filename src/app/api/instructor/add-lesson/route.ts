import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.redirect(new URL('/login', req.url));

  const formData = await req.formData();
  const courseId = formData.get('courseId') as string;
  const moduleId = formData.get('moduleId') as string;
  const title = formData.get('title') as string;

  const course = await db.course.findFirst({ where: { id: courseId, instructorId: session.user.id } });
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const count = await db.lesson.count({ where: { moduleId } });
  await db.lesson.create({ data: { title, moduleId, order: count + 1 } });

  return NextResponse.redirect(new URL(`/instructor/courses/${courseId}/edit`, req.url));
}
