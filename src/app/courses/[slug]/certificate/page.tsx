import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PrintButton from '@/components/PrintButton';
import { Award, ShieldCheck } from 'lucide-react';

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = session.user.id;

  const course = await db.course.findUnique({
    where: { slug, isPublished: true },
    select: { id: true, title: true, level: true },
  });

  if (!course) notFound();

  // Load user certificate
  const certificate = await db.certificate.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
    include: {
      user: { select: { name: true } },
    },
  });

  if (!certificate) {
    redirect(`/courses/${slug}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white print:p-0">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-6">
        {/* Certificate Frame */}
        <div className="w-full aspect-[4/3] bg-white border-[16px] border-double border-amber-600 rounded-lg p-10 flex flex-col justify-between items-center text-center shadow-xl print:shadow-none print:border-amber-600 relative overflow-hidden">
          {/* Decorative Corner Seals */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/30" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/30" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/30" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/30" />

          {/* Header */}
          <div className="space-y-2 mt-4">
            <span className="text-xs font-bold tracking-widest text-[#0056D2] uppercase">EnglishPro Academy</span>
            <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide">Certificate of Completion</h1>
            <div className="w-24 h-0.5 bg-amber-500 mx-auto mt-2" />
          </div>

          {/* Body */}
          <div className="space-y-4 my-6">
            <p className="text-slate-500 font-serif italic text-sm">This is proudly presented to</p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-normal underline decoration-amber-500 decoration-1 underline-offset-8">
              {certificate.user.name || 'Anonymous Learner'}
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              for successfully completing all curriculum standards and modules for the language course:
            </p>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight font-serif italic">
              "{course.title}" ({course.level} Level)
            </h3>
          </div>

          {/* Footer Seals & Signatures */}
          <div className="w-full grid grid-cols-3 items-end border-t border-slate-100 pt-8 mt-4">
            <div className="text-center space-y-1">
              <span className="block text-slate-800 font-bold text-xs">Dominic Nantchoua</span>
              <span className="block text-[9px] text-slate-400 uppercase tracking-wider border-t border-slate-200 pt-1.5 mx-8">
                Academy Principal
              </span>
            </div>
            
            <div className="flex justify-center">
              <Award className="w-16 h-16 text-amber-500" />
            </div>

            <div className="text-center space-y-1">
              <span className="block text-slate-800 font-bold text-xs">
                {new Date(certificate.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="block text-[9px] text-slate-400 uppercase tracking-wider border-t border-slate-200 pt-1.5 mx-8 font-medium">
                Date Issued
              </span>
            </div>
          </div>
        </div>

        {/* Print Buttons Container */}
        <div className="flex items-center gap-4 print:hidden">
          <PrintButton />
        </div>
      </main>
    </div>
  );
}
