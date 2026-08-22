import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  if (role !== 'INSTRUCTOR' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');

    if (!courseId || !studentId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Verify instructor ownership of the course
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Admins can delete anything; Instructors must own the course
    if (role !== 'ADMIN' && course.instructorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized course ownership' }, { status: 403 });
    }

    // Delete enrollment (Casacade deletes progress & quiz attempts)
    await db.enrollment.delete({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
