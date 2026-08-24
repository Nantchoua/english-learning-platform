'use client';

import { useState } from 'react';
import { Check, ClipboardList, RefreshCw, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type VerificationListProps = {
  registrations: {
    id: string;
    name: string | null;
    email: string | null;
    registrationFeeReference: string | null;
  }[];
  enrollments: any[];
};

export default function VerificationList({
  registrations: initialRegistrations,
  enrollments: initialEnrollments,
}: VerificationListProps) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApproveRegistration = async (userId: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch('/api/instructor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve-registration',
          userId,
        }),
      });

      if (!res.ok) throw new Error('Approval failed');

      // Update local state list
      setRegistrations(registrations.filter((r) => r.id !== userId));
      alert('Student registration approved successfully!');
    } catch (err: any) {
      alert(err.message || 'Verification failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveEnrollment = async (userId: string, courseId: string, actionType: string) => {
    const key = `${userId}-${courseId}`;
    setProcessingId(key);

    try {
      const res = await fetch('/api/instructor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          userId,
          courseId,
        }),
      });

      if (!res.ok) throw new Error('Enrollment approval failed');

      // Update local state list
      setEnrollments(enrollments.filter((e) => !(e.userId === userId && e.courseId === courseId)));
      alert('Enrollment payment approved! Access unlocked for student.');
    } catch (err: any) {
      alert(err.message || 'Verification failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const totalPending = registrations.length + enrollments.length;

  return (
    <div className="space-y-8">
      {totalPending === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
          <p className="text-slate-500 mt-1">There are no pending Revolut payments waiting for verification.</p>
        </div>
      ) : (
        <>
          {/* Section 1: Pending Student Registrations */}
          {registrations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Pending Registration Fees (€20.00)
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {registrations.map((reg) => (
                  <div key={reg.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900">{reg.name || 'Anonymous User'}</h4>
                      <p className="text-xs text-slate-500">{reg.email}</p>
                      <div className="inline-block bg-[#0056D2]/5 text-[#0056D2] rounded text-xs px-2.5 py-1 font-mono font-bold mt-1">
                        Proof Reference: "{reg.registrationFeeReference}"
                      </div>
                    </div>
                    <button
                      onClick={() => handleApproveRegistration(reg.id)}
                      disabled={processingId === reg.id}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-center cursor-pointer"
                    >
                      {processingId === reg.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Verify & Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Pending Course Access Enrollments */}
          {enrollments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Pending Course Purchases
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {enrollments.map((enr) => {
                  const key = `${enr.userId}-${enr.courseId}`;
                  const isSecondInstallment = enr.status === 'PENDING_INSTALLMENT_2';
                  const actionType = isSecondInstallment ? 'approve-installment-2' : 'approve-enrollment';
                  
                  return (
                    <div key={key} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {isSecondInstallment ? 'Installment 2/2' : enr.paymentType === 'INSTALLMENT' ? 'Installment 1/2' : 'Full Payment'}
                        </span>
                        <h4 className="font-bold text-slate-900 mt-1">{enr.user.name || 'Anonymous User'}</h4>
                        <p className="text-xs text-slate-500">{enr.user.email}</p>
                        <p className="text-sm text-slate-700 font-medium mt-1">
                          Enrolling in: <span className="text-slate-900 font-bold">"{enr.course.title}"</span>
                        </p>
                        <div className="inline-block bg-[#0056D2]/5 text-[#0056D2] rounded text-xs px-2.5 py-1 font-mono font-bold mt-1">
                          Proof Reference: "{enr.revolutReference}"
                        </div>
                      </div>
                      <button
                        onClick={() => handleApproveEnrollment(enr.userId, enr.courseId, actionType)}
                        disabled={processingId === key}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-center cursor-pointer"
                      >
                        {processingId === key ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Verify & Unlock
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
