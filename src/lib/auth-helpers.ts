import { db } from './prisma';

export async function checkCourseEditorAccess(courseId: string, userId: string, role?: string): Promise<boolean> {
  if (role === 'ADMIN' || role === 'INSTRUCTOR') {
    return true;
  }
  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: userId }
  });
  return !!course;
}
