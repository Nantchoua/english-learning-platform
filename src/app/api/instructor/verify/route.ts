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

  // Double-check authorized user role (ADMIN or INSTRUCTOR only)
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'INSTRUCTOR') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const { action, userId, courseId } = await req.json();

    if (action === 'approve-registration') {
      const student = await db.user.update({
        where: { id: userId },
        data: {
          registrationFeePaid: true,
          registrationFeePending: false,
        },
      });

      await sendEmailSimulated({
        userId,
        toEmail: student.email || '',
        subject: 'Confirmed: Student Registration Fee Activated',
        body: `Hello ${student.name || 'Learner'},\n\nWe have verified your Revolut registration payment. Your student registration has been activated!\n\nYou can now enroll in courses on the platform.\n\nBest regards,\nThe EnglishPro Team`,
        type: 'REGISTRATION',
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'approve-installment-2') {
      const enrollment = await db.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          installmentsPaid: 2,
          status: 'ACTIVE',
        },
        include: { user: true, course: true }
      });

      const amount = enrollment.course ? (enrollment.course.price || 0) / 2 : 0;

      await sendEmailSimulated({
        userId,
        toEmail: enrollment.user.email || '',
        subject: `Confirmed: Final Installment for ${enrollment.course.title}`,
        body: `Hello ${enrollment.user.name || 'Learner'},\n\nWe have verified your final 50% installment payment of €${amount.toFixed(2)} via Revolut.\n\nYour course: "${enrollment.course.title}" has been fully unlocked! Enjoy learning.\n\nBest regards,\nThe EnglishPro Team`,
        type: 'INSTALLMENT',
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'approve-enrollment') {
      const current = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
      });
      
      const newStatus = current?.paymentType === 'INSTALLMENT' ? 'PARTIALLY_PAID' : 'ACTIVE';

      const enrollment = await db.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          status: newStatus,
        },
        include: { user: true, course: true }
      });

      const isInstallment = enrollment.paymentType === 'INSTALLMENT';
      let emailSubject = `Confirmed: Enrollment in ${enrollment.course.title}`;
      let emailBody = `Hello ${enrollment.user.name || 'Learner'},\n\nYour payment has been verified. You have successfully enrolled in: "${enrollment.course.title}".\n\nYou can start learning immediately from your dashboard!\n\nBest regards,\nThe EnglishPro Team`;

      if (isInstallment) {
        const amount = (enrollment.course.price || 0) / 2;
        emailSubject = `Confirmed: Installment 1/2 for ${enrollment.course.title}`;
        emailBody = `Hello ${enrollment.user.name || 'Learner'},\n\nYour first installment payment of €${amount.toFixed(2)} has been verified via Revolut.\n\nYou can start learning immediately. The final installment can be completed via your dashboard at any time.\n\nBest regards,\nThe EnglishPro Team`;
      }

      await sendEmailSimulated({
        userId,
        toEmail: enrollment.user.email || '',
        subject: emailSubject,
        body: emailBody,
        type: 'ENROLLMENT',
      });

      return NextResponse.json({ success: true });
    }

    return new NextResponse('Invalid action', { status: 400 });
  } catch (error: any) {
    console.error('[APPROVE_VERIFICATION_ERROR]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
