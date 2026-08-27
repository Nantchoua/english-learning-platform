'use server'

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function verifyOwnership(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const role = session.user.role;
  if (role === 'ADMIN' || role === 'INSTRUCTOR') {
    return session.user.id;
  }

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: session.user.id },
  });
  if (!course) throw new Error('Course not found or access denied');
  return session.user.id;
}

export async function updateCourse(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  await verifyOwnership(courseId);

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const level = formData.get('level') as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  const priceInput = formData.get('price') as string;
  const price = priceInput ? parseFloat(priceInput) : 0;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  await db.course.update({
    where: { id: courseId },
    data: { title, slug, description, level, price },
  });

  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function togglePublish(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  const isPublished = formData.get('isPublished') === 'true';
  await verifyOwnership(courseId);

  // Validate requirements before publishing
  if (isPublished) {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { include: { lessons: true } },
      },
    });
    if (!course) throw new Error('Course not found');

    const totalLessons = course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0);
    const errors: string[] = [];

    if (!course.title?.trim()) errors.push('Course title is required');
    if (!course.description?.trim()) errors.push('Course description is required');
    if (totalLessons === 0) errors.push('At least one lesson is required');

    if (errors.length > 0) {
      redirect(`/instructor/courses/${courseId}/edit?publishError=${encodeURIComponent(errors.join(', '))}`);
    }
  }

  await db.course.update({
    where: { id: courseId },
    data: { isPublished },
  });
  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath('/');
}

export async function addModule(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  await verifyOwnership(courseId);
  const title = formData.get('title') as string;
  const count = await db.module.count({ where: { courseId } });
  await db.module.create({
    data: { title, courseId, order: count + 1 },
  });
  redirect(`/instructor/courses/${courseId}/edit`);
}

export async function deleteModule(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  const moduleId = formData.get('moduleId') as string;
  await verifyOwnership(courseId);
  await db.module.delete({ where: { id: moduleId } });
  redirect(`/instructor/courses/${courseId}/edit`);
}

export async function addLesson(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  const moduleId = formData.get('moduleId') as string;
  await verifyOwnership(courseId);
  const title = formData.get('title') as string;
  const count = await db.lesson.count({ where: { moduleId } });
  await db.lesson.create({
    data: { title, moduleId, order: count + 1 },
  });
  redirect(`/instructor/courses/${courseId}/edit`);
}

export async function deleteLesson(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  const lessonId = formData.get('lessonId') as string;
  await verifyOwnership(courseId);
  await db.lesson.delete({ where: { id: lessonId } });
  redirect(`/instructor/courses/${courseId}/edit`);
}

export async function moveModule(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  const moduleId = formData.get('moduleId') as string;
  const direction = formData.get('direction') as 'up' | 'down';
  await verifyOwnership(courseId);

  const modules = await db.module.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });

  const currentIndex = modules.findIndex((m) => m.id === moduleId);
  if (currentIndex === -1) return;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= modules.length) return;

  const currentMod = modules[currentIndex];
  const targetMod = modules[targetIndex];

  // Swap their orders in transaction
  await db.$transaction([
    db.module.update({ where: { id: currentMod.id }, data: { order: targetMod.order } }),
    db.module.update({ where: { id: targetMod.id }, data: { order: currentMod.order } }),
  ]);

  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function moveLesson(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  const lessonId = formData.get('lessonId') as string;
  const direction = formData.get('direction') as 'up' | 'down';
  await verifyOwnership(courseId);

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true, order: true },
  });
  if (!lesson) return;

  const lessons = await db.lesson.findMany({
    where: { moduleId: lesson.moduleId },
    orderBy: { order: 'asc' },
  });

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) return;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= lessons.length) return;

  const currentLesson = lessons[currentIndex];
  const targetLesson = lessons[targetIndex];

  // Swap their orders in transaction
  await db.$transaction([
    db.lesson.update({ where: { id: currentLesson.id }, data: { order: targetLesson.order } }),
    db.lesson.update({ where: { id: targetLesson.id }, data: { order: currentLesson.order } }),
  ]);

  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function deleteCourse(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  await verifyOwnership(courseId);
  await db.course.delete({ where: { id: courseId } });
  redirect('/instructor/courses');
}


