'use server'

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function verifyLessonOwnership(lessonId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  const isAdminOrInstructor = session.user.role === 'ADMIN' || session.user.role === 'INSTRUCTOR';

  if (!lesson || (!isAdminOrInstructor && lesson.module.course.instructorId !== session.user.id)) {
    throw new Error('Lesson not found or access denied');
  }

  return lesson;
}

export async function updateLesson(lessonId: string, formData: FormData) {
  const lesson = await verifyLessonOwnership(lessonId);

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const videoUrl = formData.get('videoUrl') as string;
  const content = formData.get('content') as string;
  const isFree = formData.get('isFree') === 'on';
  const isPublished = formData.get('isPublished') === 'on';

  await db.lesson.update({
    where: { id: lessonId },
    data: { title, description, videoUrl, content, isFree, isPublished },
  });

  revalidatePath(
    `/instructor/courses/${lesson.module.courseId}/lessons/${lessonId}/edit`
  );
}
