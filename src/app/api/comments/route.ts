import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');

  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });
  }

  try {
    const comments = await db.comment.findMany({
      where: { lessonId },
      include: {
        user: { select: { name: true, role: true } },
        replies: {
          include: {
            user: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Separate top-level questions from nested replies
    const topLevel = comments.filter((c) => c.parentId === null);
    return NextResponse.json(topLevel);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lessonId, content, parentId } = body;

    if (!lessonId || !content.trim()) {
      return NextResponse.json({ error: 'Missing content or lessonId' }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        lessonId,
        userId: session.user.id,
        content,
        parentId: parentId || null,
      },
      include: {
        user: { select: { name: true, role: true } },
        replies: {
          include: {
            user: { select: { name: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
