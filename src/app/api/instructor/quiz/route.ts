import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Helper to verify instructor ownership of the course containing this lesson
async function verifyLessonOwnership(lessonId: string, userId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson || lesson.module.course.instructorId !== userId) {
    throw new Error('Unauthorized');
  }
  return lesson;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lessonId, question, optionA, optionB, optionC, optionD, correctOption } = body;

    if (!lessonId || !question || !optionA || !optionB || !optionC || !optionD || correctOption === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await verifyLessonOwnership(lessonId, session.user.id);

    // Find or create the Quiz for this lesson
    let quiz = await db.quiz.findUnique({ where: { lessonId } });
    if (!quiz) {
      quiz = await db.quiz.create({ data: { lessonId } });
    }

    // Determine the next order index
    const count = await db.quizQuestion.count({ where: { quizId: quiz.id } });

    const newQuestion = await db.quizQuestion.create({
      data: {
        quizId: quiz.id,
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption: Number(correctOption),
        order: count + 1,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');
    const lessonId = searchParams.get('lessonId');

    if (!questionId || !lessonId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await verifyLessonOwnership(lessonId, session.user.id);

    await db.quizQuestion.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
