import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { sendEmailSimulated } from '@/lib/mail';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.redirect(new URL('/login', req.url));

  const formData = await req.formData();
  const courseId = formData.get('courseId') as string;
  const action = formData.get('action') as string; // 'pay-registration-fee' | 'pay-second-installment' | 'enroll'
  const paymentType = formData.get('paymentType') as string || 'FULL'; // 'FULL' | 'INSTALLMENT'

  const userId = session.user.id;
  const email = session.user.email || '';
  const name = session.user.name || 'Learner';

  // Fetch course details for receipt emails
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { title: true, price: true },
  });

  // 1. Action: Pay Registration Fee
  if (action === 'pay-registration-fee') {
    await db.user.update({
      where: { id: userId },
      data: { registrationFeePaid: true },
    });

    await sendEmailSimulated({
      userId,
      toEmail: email,
      subject: 'Receipt: Student Registration Fee Paid',
      body: `Hello ${name},\n\nWe have successfully received your one-time Student Registration Fee payment of €20.00.\n\nYou can now proceed to purchase your courses!\n\nBest regards,\nThe EnglishPro Team`,
      type: 'REGISTRATION',
    });

    const slug = formData.get('slug') as string;
    return NextResponse.redirect(new URL(`/courses/${slug}/checkout`, req.url));
  }

  // 2. Action: Pay Second Installment
  if (action === 'pay-second-installment') {
    await db.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: {
        installmentsPaid: 2,
        status: 'ACTIVE',
      },
    });

    const amount = course ? (course.price || 0) / 2 : 0;
    await sendEmailSimulated({
      userId,
      toEmail: email,
      subject: `Receipt: Final Installment for ${course?.title || 'Course'}`,
      body: `Hello ${name},\n\nWe have received your final 50% installment payment of €${amount.toFixed(2)} for the course: "${course?.title}".\n\nYour course has now been fully unlocked!\n\nBest regards,\nThe EnglishPro Team`,
      type: 'INSTALLMENT',
    });

    return NextResponse.redirect(new URL(`/dashboard`, req.url));
  }

  // 3. Action: Standard Course Enrollment (Free, Full Price, or Installment 1)
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!existing) {
    const isInstallment = paymentType === 'INSTALLMENT';
    await db.enrollment.create({
      data: {
        userId,
        courseId,
        paymentType,
        installmentsPaid: 1,
        status: isInstallment ? 'PARTIALLY_PAID' : 'ACTIVE',
      },
    });

    // Send course enrollment confirmation email log
    let emailSubject = `Welcome to your course: ${course?.title}`;
    let emailBody = `Hello ${name},\n\nYou have successfully enrolled in: "${course?.title}".\n\nYou can start learning immediately from your dashboard!\n\nBest regards,\nThe EnglishPro Team`;

    if (isInstallment) {
      const amount = course ? (course.price || 0) / 2 : 0;
      emailSubject = `Plan Confirmation: Installment 1/2 for ${course?.title}`;
      emailBody = `Hello ${name},\n\nThank you for your first installment payment of €${amount.toFixed(2)} for the course: "${course?.title}".\n\nYou have unlocked the course. The final 50% installment can be completed via your dashboard at any time.\n\nBest regards,\nThe EnglishPro Team`;
    }

    await sendEmailSimulated({
      userId,
      toEmail: email,
      subject: emailSubject,
      body: emailBody,
      type: 'ENROLLMENT',
    });
  }

  return NextResponse.redirect(new URL(`/dashboard`, req.url));
}
