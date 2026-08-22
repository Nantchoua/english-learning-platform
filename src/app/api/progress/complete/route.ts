import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { sendEmailSimulated } from '@/lib/mail';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const lessonId = formData.get('lessonId') as string;
  const courseSlug = formData.get('courseSlug') as string;
  const nextLessonId = formData.get('nextLessonId') as string | null;
  const userId = session.user.id;

  // Complete current lesson progress
  await db.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { isCompleted: true },
    create: { userId, lessonId, isCompleted: true },
  });

  // Check if course is 100% complete to issue a certificate
  const currentLesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      module: {
        select: {
          course: {
            include: {
              modules: {
                include: { lessons: true },
              },
            },
          },
        },
      },
    },
  });

  if (currentLesson?.module?.course) {
    const course = currentLesson.module.course;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const lessonCount = allLessons.length;

    if (lessonCount > 0) {
      // Find all completed lesson IDs for this course
      const completedCount = await db.progress.count({
        where: {
          userId,
          isCompleted: true,
          lessonId: { in: allLessons.map((l) => l.id) },
        },
      });

      if (completedCount === lessonCount) {
        // Auto-create Certificate if not already issued
        const existingCert = await db.certificate.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: course.id,
            },
          },
        });

        if (!existingCert) {
          await db.certificate.create({
            data: { userId, courseId: course.id },
          });

          // Log simulated course completion email
          await sendEmailSimulated({
            userId,
            toEmail: session.user.email || '',
            subject: `Congratulations on completing: ${course.title}`,
            body: `Hello ${session.user.name || 'Learner'},\n\nFantastic work! You have successfully completed all ${lessonCount} lessons in: "${course.title}".\n\nYour Certificate of Completion has been generated and is now viewable on your student dashboard!\n\nBest regards,\nThe EnglishPro Team`,
            type: 'ENROLLMENT',
          });
        }
      }
    }
  }

  // Redirect to next lesson or back to course page
  const destination = nextLessonId
    ? `/courses/${courseSlug}/learn/${nextLessonId}`
    : `/courses/${courseSlug}`;

  return NextResponse.redirect(new URL(destination, req.url));
}
