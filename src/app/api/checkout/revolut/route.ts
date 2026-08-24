import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { sendEmailSimulated } from '@/lib/mail';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { courseId, action, paymentType, revolutReference } = await req.json();
    const userId = session.user.id;

    if (!revolutReference || !revolutReference.trim()) {
      return new NextResponse('Revolut payment reference is required', { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return new NextResponse('User not found', { status: 404 });

    // 1. Action: Pay Registration Fee
    if (action === 'pay-registration-fee') {
      await db.user.update({
        where: { id: userId },
        data: {
          registrationFeePending: true,
          registrationFeeReference: revolutReference,
        },
      });

      // Send simulation notification to Instructor/Admin
      await sendEmailSimulated({
        userId,
        toEmail: 'sarah@example.com', // Instructor email
        subject: `ACTION REQUIRED: Registration Fee Verification for ${user.name || user.email}`,
        body: `Hello Nantchoua,\n\nStudent ${user.name} (${user.email}) has submitted a Revolut registration payment proof.\n\nReference: "${revolutReference}"\n\nPlease verify your Revolut app and approve their access from the Admin panel.\n\nBest regards,\nPlatform System`,
        type: 'REGISTRATION',
      });

      return NextResponse.json({ success: true, status: 'PENDING_REGISTRATION' });
    }

    // 2. Action: Pay Second Installment
    if (action === 'pay-second-installment') {
      await db.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          status: 'PENDING_INSTALLMENT_2',
          revolutReference: revolutReference,
        },
      });

      const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true } });

      await sendEmailSimulated({
        userId,
        toEmail: 'sarah@example.com',
        subject: `ACTION REQUIRED: Second Installment Verification for ${course?.title}`,
        body: `Hello Nantchoua,\n\nStudent ${user.name} (${user.email}) has submitted their second installment payment proof via Revolut.\n\nReference: "${revolutReference}"\n\nPlease approve their final access in the Admin panel.\n\nBest regards,\nPlatform System`,
        type: 'INSTALLMENT',
      });

      return NextResponse.json({ success: true, status: 'PENDING_INSTALLMENT_2' });
    }

    // 3. Action: Standard Course Enrollment (Full Price or Installment 1)
    const isInstallment = paymentType === 'INSTALLMENT';
    await db.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        paymentType,
        installmentsPaid: 1,
        status: 'PENDING',
        revolutReference: revolutReference,
      },
      create: {
        userId,
        courseId,
        paymentType,
        installmentsPaid: 1,
        status: 'PENDING',
        revolutReference: revolutReference,
      }
    });

    const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true } });

    await sendEmailSimulated({
      userId,
      toEmail: 'sarah@example.com',
      subject: `ACTION REQUIRED: Course Enrollment Verification for ${course?.title}`,
      body: `Hello Nantchoua,\n\nStudent ${user.name} (${user.email}) has requested enrollment in: "${course?.title}" via Revolut.\n\nReference: "${revolutReference}"\n\nPlease verify and approve their access from the Admin panel.\n\nBest regards,\nPlatform System`,
      type: 'ENROLLMENT',
    });

    return NextResponse.json({ success: true, status: 'PENDING' });
  } catch (error: any) {
    console.error('[REVOLUT_CHECKOUT_ERROR]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
