import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';

// This route (/courses/[slug]/learn) has no lessonId — redirect to the first
// lesson if enrolled, or back to the course detail page.
export default async function LearnIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login`);
  }

  const course = await db.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  });

  if (!course) notFound();

  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];

  if (firstLesson) {
    redirect(`/courses/${slug}/learn/${firstLesson.id}`);
  }

  // No lessons yet — fall back to course detail page
  redirect(`/courses/${slug}`);
}
