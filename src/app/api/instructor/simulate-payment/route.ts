import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  // Validate Role
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'INSTRUCTOR') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const { action, studentId, courseId } = await req.json();

    if (action === 'simulate-registration-pending') {
      await db.user.update({
        where: { id: studentId },
        data: {
          registrationFeePending: true,
          registrationFeeReference: `MOCK-REG-${Math.floor(1000 + Math.random() * 9000)}`
        }
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'simulate-enrollment-pending') {
      await db.enrollment.upsert({
        where: { userId_courseId: { userId: studentId, courseId } },
        update: {
          status: 'PENDING',
          paymentType: 'FULL',
          revolutReference: `MOCK-REV-${Math.floor(1000 + Math.random() * 9000)}`
        },
        create: {
          userId: studentId,
          courseId,
          status: 'PENDING',
          paymentType: 'FULL',
          revolutReference: `MOCK-REV-${Math.floor(1000 + Math.random() * 9000)}`
        }
      });
      return NextResponse.json({ success: true });
    }

    return new NextResponse('Invalid action', { status: 400 });
  } catch (error: any) {
    console.error('[SIMULATION_ERROR]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
