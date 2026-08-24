import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { quizId, answers } = body; // answers: { [questionId]: number }

    if (!quizId || !answers) {
      return NextResponse.json({ error: 'Missing quizId or answers' }, { status: 400 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q) => {
      const studentAnswer = answers[q.id];
      if (studentAnswer !== undefined && Number(studentAnswer) === q.correctOption) {
        score++;
      }
    });

    const attempt = await db.quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
        score,
        total: quiz.questions.length,
        answers,
      },
    });

    // Create safe correct answers mapping for client feedback after submission
    const correctAnswers: Record<string, number> = {};
    quiz.questions.forEach((q) => {
      correctAnswers[q.id] = q.correctOption;
    });

    return NextResponse.json({
      id: attempt.id,
      score,
      total: quiz.questions.length,
      correctAnswers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
