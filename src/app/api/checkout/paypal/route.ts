import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { sendEmailSimulated } from '@/lib/mail';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Generate access token for PayPal REST API calls
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to retrieve PayPal access token');
  }

  const data = await res.json();
  return data.access_token;
}

// 1. CREATE Order Endpoint
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { courseId, action, paymentType } = await req.json();
    const userId = session.user.id;

    let priceInEur = 0;
    let description = '';

    if (action === 'pay-registration-fee') {
      priceInEur = 20.00;
      description = 'One-time Student Registration Fee';
    } else if (action === 'pay-second-installment') {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { price: true, title: true }
      });
      if (!course) return new NextResponse('Course not found', { status: 404 });
      priceInEur = (course.price || 0) / 2;
      description = `Final 50% Installment for ${course.title}`;
    } else {
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
    }

    const accessToken = await getPayPalAccessToken();

    // Create Order with PayPal
    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'EUR',
              value: priceInEur.toFixed(2),
            },
            description,
            custom_id: JSON.stringify({
              userId,
              action,
              courseId,
              paymentType,
            }),
          },
        ],
      }),
    });

    if (!orderRes.ok) {
      const errorData = await orderRes.text();
      console.error('PayPal Order Creation Failed:', errorData);
      return new NextResponse('PayPal order creation failed', { status: 500 });
    }

    const orderData = await orderRes.json();
    return NextResponse.json({ id: orderData.id });
  } catch (error: any) {
    console.error('[PAYPAL_CREATE_ERROR]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

// 2. CAPTURE Order Endpoint (Completing payment)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureRes.ok) {
      return new NextResponse('Failed to capture PayPal payment', { status: 400 });
    }

    const captureData = await captureRes.json();
    
    // Check if capture succeeded
    if (captureData.status !== 'COMPLETED') {
      return new NextResponse('PayPal payment not completed', { status: 400 });
    }

    const purchaseUnit = captureData.purchase_units?.[0];
    const customIdStr = purchaseUnit?.payments?.captures?.[0]?.custom_id || purchaseUnit?.custom_id;
    if (!customIdStr) {
      return new NextResponse('Invalid payment metadata', { status: 400 });
    }

    const { userId, action, courseId, paymentType } = JSON.parse(customIdStr);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) return new NextResponse('User not found', { status: 404 });
    const email = user.email || '';
    const name = user.name || 'Learner';

    // Process payment success database records
    if (action === 'pay-registration-fee') {
      await db.user.update({
        where: { id: userId },
        data: { registrationFeePaid: true },
      });

      await sendEmailSimulated({
        userId,
        toEmail: email,
        subject: 'Receipt: Student Registration Fee Paid',
        body: `Hello ${name},\n\nWe have successfully received your one-time Student Registration Fee payment of €20.00 via PayPal.\n\nYou can now proceed to purchase your courses!\n\nBest regards,\nThe EnglishPro Team`,
        type: 'REGISTRATION',
      });
    }

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
        body: `Hello ${name},\n\nWe have received your final 50% installment payment of €${amount.toFixed(2)} via PayPal for the course: "${course?.title}".\n\nYour course has now been fully unlocked!\n\nBest regards,\nThe EnglishPro Team`,
        type: 'INSTALLMENT',
      });
    }

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
        emailBody = `Hello ${name},\n\nThank you for your first installment payment of €${amount.toFixed(2)} via PayPal for the course: "${course?.title}".\n\nYou have unlocked the course. The final 50% installment can be completed via your dashboard at any time.\n\nBest regards,\nThe EnglishPro Team`;
      }

      await sendEmailSimulated({
        userId,
        toEmail: email,
        subject: emailSubject,
        body: emailBody,
        type: 'ENROLLMENT',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PAYPAL_CAPTURE_ERROR]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
