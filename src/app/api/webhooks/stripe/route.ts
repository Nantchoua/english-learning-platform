import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { sendEmailSimulated } from '@/lib/mail';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_compilation_safety', {
  apiVersion: '2025-02-17-pre.0' as any,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`[STRIPE_WEBHOOK_VERIFICATION_FAILED]`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata;

  if (event.type === 'checkout.session.completed' && metadata) {
    const { userId, action, courseId, paymentType } = metadata;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (user) {
      const email = user.email || '';
      const name = user.name || 'Learner';

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
      }

      // 2. Action: Pay Second Installment
      else if (action === 'pay-second-installment' && courseId) {
        await db.enrollment.update({
          where: { userId_courseId: { userId, courseId } },
          data: {
            installmentsPaid: 2,
            status: 'ACTIVE',
          },
        });

        const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true, price: true } });
        const amount = course ? (course.price || 0) / 2 : 0;

        await sendEmailSimulated({
          userId,
          toEmail: email,
          subject: `Receipt: Final Installment for ${course?.title || 'Course'}`,
          body: `Hello ${name},\n\nWe have received your final 50% installment payment of €${amount.toFixed(2)} for the course: "${course?.title}".\n\nYour course has now been fully unlocked!\n\nBest regards,\nThe EnglishPro Team`,
          type: 'INSTALLMENT',
        });
      }

      // 3. Action: Course Enrollment (Full Price or Installment 1)
      else if (courseId) {
        const isInstallment = paymentType === 'INSTALLMENT';
        
        await db.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          update: {
            paymentType: paymentType || 'FULL',
            installmentsPaid: 1,
            status: isInstallment ? 'PARTIALLY_PAID' : 'ACTIVE',
          },
          create: {
            userId,
            courseId,
            paymentType: paymentType || 'FULL',
            installmentsPaid: 1,
            status: isInstallment ? 'PARTIALLY_PAID' : 'ACTIVE',
          }
        });

        const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true, price: true } });

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
    }
  }

  return NextResponse.json({ received: true });
}
