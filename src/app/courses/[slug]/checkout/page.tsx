import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CheckoutForm from '@/components/CheckoutForm';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login`);

  const userId = session.user.id;

  // Load user data to check registration fee status
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { registrationFeePaid: true, registrationFeePending: true, registrationFeeReference: true },
  });

  if (!user) redirect(`/login`);

  const course = await db.course.findUnique({
    where: { slug, isPublished: true },
    select: {
      id: true,
      title: true,
      price: true,
      level: true,
    },
  });

  if (!course) notFound();

  // If the course is free, there is no need for checkout
  if (!course.price || course.price <= 0) {
    redirect(`/courses/${slug}`);
  }

  // Check if student is already enrolled
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  // If fully active, redirect to dashboard.
  if (enrollment && enrollment.status === 'ACTIVE') {
    redirect(`/dashboard`);
  }

  // Fetch the registration fee from settings safely
  let regFeeSetting = null;
  try {
    regFeeSetting = await db.setting.findUnique({ where: { key: 'registration_fee' } });
  } catch (e) {
    console.error('Failed to fetch registration fee setting:', e);
  }
  const registrationFee = regFeeSetting ? parseFloat(regFeeSetting.value) : 20.00;


  // Check if the user is already pending approval
  const isRegistrationPending = user.registrationFeePending === true;
  const isEnrollmentPending = !!(enrollment && (enrollment.status === 'PENDING' || enrollment.status === 'PENDING_INSTALLMENT_2'));

  const needsRegistrationFee = user.registrationFeePaid !== true;
  const isPayingInstallment2 = !!(enrollment && enrollment.status === 'PARTIALLY_PAID');

  let checkoutTitle = 'Payment Details';
  let checkoutDesc = 'Complete your payment using Revolut bank transfer.';
  let orderItemTitle = course.title;
  let orderItemPrice = course.price;

  if (isRegistrationPending) {
    checkoutTitle = 'Registration Pending Approval';
    checkoutDesc = `Your registration payment proof is currently under review. Reference: "${user.registrationFeeReference}"`;
    orderItemTitle = 'Student Registration Fee';
    orderItemPrice = registrationFee;
  } else if (isEnrollmentPending) {
    checkoutTitle = 'Course Purchase Pending Approval';
    checkoutDesc = `Your Revolut payment reference "${enrollment?.revolutReference}" is pending verification by the instructor.`;
    orderItemTitle = course.title;
    orderItemPrice = enrollment?.paymentType === 'INSTALLMENT' ? course.price / 2 : course.price;
  } else if (needsRegistrationFee) {
    checkoutTitle = 'Pay Registration Fee';
    checkoutDesc = `You must pay a one-time registration fee of €${registrationFee.toFixed(2)} before enrolling in any courses.`;
    orderItemTitle = 'Student Registration Fee';
    orderItemPrice = registrationFee;
  } else if (isPayingInstallment2) {
    checkoutTitle = 'Pay Final Installment';
    checkoutDesc = 'Complete the remaining 50% installment payment to fully unlock this course.';
    orderItemTitle = `${course.title} (Installment 2/2)`;
    orderItemPrice = course.price / 2;
  }


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Checkout Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h1 className="text-xl font-bold text-slate-800 mb-4">{checkoutTitle}</h1>
            <p className="text-xs text-slate-400 mb-6">{checkoutDesc}</p>
            
            {isRegistrationPending || isEnrollmentPending ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Your Revolut payment reference is currently being verified by the instructor (**Nantchoua**).
                </p>
                <p className="text-xs text-slate-400">
                  Once verified, your course content will be unlocked automatically. Please check back later.
                </p>
              </div>
            ) : (
              <CheckoutForm
                courseId={course.id}
                slug={slug}
                needsRegistrationFee={needsRegistrationFee}
                isPayingInstallment2={isPayingInstallment2}
                coursePrice={course.price}
                registrationFee={registrationFee}
              />

            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <h2 className="font-bold text-slate-800 text-sm mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-[#0056D2] bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                  {course.level}
                </span>
                <h3 className="font-bold text-slate-800 mt-2 text-sm line-clamp-2">{orderItemTitle}</h3>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Item Price</span>
                <span className="font-semibold text-slate-800">€{orderItemPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm border-b border-slate-100 pb-4">
                <span className="text-slate-500">VAT (0%)</span>
                <span className="font-semibold text-slate-850">€0.00</span>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-900 pt-2">
                <span>Total</span>
                <span>€{orderItemPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
