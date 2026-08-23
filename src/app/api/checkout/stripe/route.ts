import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_compilation_safety', {
  apiVersion: '2025-02-17-pre.0' as any, // standard API version fallback
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { courseId, action, paymentType } = await req.json();
    const userId = session.user.id;
    const email = session.user.email || '';

    let priceInEur = 0;
    let description = '';
    let metadata: Record<string, string> = {
      userId,
      action,
    };

    if (action === 'pay-registration-fee') {
      priceInEur = 20.00;
      description = 'One-time Student Registration Fee';
      metadata.courseId = courseId || '';
    } else if (action === 'pay-second-installment') {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { price: true, title: true }
      });
      if (!course) return new NextResponse('Course not found', { status: 404 });
      priceInEur = (course.price || 0) / 2;
      description = `Final 50% Installment for ${course.title}`;
      metadata.courseId = courseId;
    } else {
      // Normal course purchase (Full or 1st Installment)
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { price: true, title: true }
      });
      if (!course) return new NextResponse('Course not found', { status: 404 });
      
      const isInstallment = paymentType === 'INSTALLMENT';
      priceInEur = isInstallment ? (course.price || 0) / 2 : (course.price || 0);
      description = isInstallment 
        ? `Installment 1/2 for ${course.title}`
        : `Full Course Access for ${course.title}`;
      
      metadata.courseId = courseId;
      metadata.paymentType = paymentType || 'FULL';
    }

    if (priceInEur <= 0) {
      return new NextResponse('Invalid checkout amount', { status: 400 });
    }

    // Generate Vercel domain URLs for redirection
    const origin = req.headers.get('origin') || 'https://www.speakingexpressenglish.com';
    const successUrl = `${origin}/dashboard?checkout_success=1`;
    const cancelUrl = `${origin}/courses/${metadata.courseId ? (await db.course.findUnique({ where: { id: metadata.courseId }, select: { slug: true } }))?.slug || '' : ''}/checkout`;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description,
            },
            unit_amount: Math.round(priceInEur * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
