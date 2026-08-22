'use server'

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function createCourse(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const level = formData.get('level') as "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const course = await db.course.create({
    data: {
      title,
      slug,
      description,
      level,
      instructorId: session.user.id,
    },
  });

  redirect(`/instructor/courses/${course.id}/edit`);
}
