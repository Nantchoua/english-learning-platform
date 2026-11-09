'use client';

import { useState } from 'react';
import { User, KeyRound, Trash2, CheckCircle2, XCircle, ShieldCheck, BookOpen, AlertTriangle, Plus, X, Sparkles, GraduationCap } from 'lucide-react';
import { deleteStudent, resetStudentPassword, toggleStudentFee, assignCourse, removeEnrollment, toggleUserRole } from './actions';

type CourseOption = {
  id: string;
  title: string;
  level: string;
  isPublished?: boolean;
};

type StudentItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'STUDENT' | 'INSTRUCTOR';
  createdAt: string;
  registrationFeePaid: boolean;
  enrollments: Array<{
    id: string;
    courseId: string;
    course: {
      title: string;
      slug: string;
    };
    status: string;
  }>;
  progressCount: number;
};

export default function StudentTable({ students, courses = [] }: { students: StudentItem[]; courses?: CourseOption[] }) {
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const handleAssignSubmit = async (studentId: string) => {
    if (!selectedCourseId) {
      alert('Please select a course');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set('studentId', studentId);
    formData.set('courseId', selectedCourseId);
    try {
      await assignCourse(formData);
      setAssigningId(null);
      setSelectedCourseId('');
    } catch (err: any) {
      alert(err.message || 'Failed to assign course');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string, courseTitle: string, email: string) => {
    if (!confirm(`Remove "${courseTitle}" from ${email}? Their access to this course will be revoked.`)) return;
    const formData = new FormData();
    formData.set('enrollmentId', enrollmentId);
    try {
      await removeEnrollment(formData);
    } catch (err: any) {
      alert(err.message || 'Failed to remove course');
    }
  };

  const handleResetSubmit = async (studentId: string) => {
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set('studentId', studentId);
    formData.set('newPassword', newPassword);
    try {
      await resetStudentPassword(formData);
      alert('Password updated successfully!');
      setResettingId(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'STUDENT' | 'INSTRUCTOR', nameOrEmail: string) => {
    const targetRole = currentRole === 'INSTRUCTOR' ? 'STUDENT' : 'INSTRUCTOR';
    const actionDesc = targetRole === 'INSTRUCTOR'
      ? `grant Instructor write permissions to ${nameOrEmail}? They will be able to create, edit, and publish courses.`
      : `switch ${nameOrEmail} back to a regular Student account?`;

    if (!confirm(`Are you sure you want to ${actionDesc}`)) return;

    setLoading(true);
    const formData = new FormData();
    formData.set('userId', userId);
    formData.set('targetRole', targetRole);
    try {
      await toggleUserRole(formData);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId: string, email: string) => {
    if (confirm(`Are you sure you want to delete student account "${email}"? This will remove all their enrollments and progress.`)) {
      const formData = new FormData();
      formData.set('studentId', studentId);
      await deleteStudent(formData);
    }
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No accounts added yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Use the form above to add your first student or instructor account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">
          Active Student & Instructor Roster ({students.length})
        </h3>
        <span className="text-xs text-slate-400">
          Manage roles, instructor write permissions, fee status & course enrollments
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role & Writes</th>
              <th className="py-3 px-4">Registration Fee</th>
              <th className="py-3 px-4">Enrolled Courses</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {(student.name || student.email || 'S').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{student.name || 'Student'}</div>
                      <div className="text-xs text-slate-500 font-mono">{student.email}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {student.role === 'INSTRUCTOR' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        Instructor (Write)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <GraduationCap className="w-3 h-3 text-slate-500" />
                        Student
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleToggleRole(student.id, student.role, student.name || student.email || 'User')}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer disabled:opacity-50"
                      title={student.role === 'INSTRUCTOR' ? 'Revoke instructor writes' : 'Grant instructor write permissions'}
                    >
                      {student.role === 'INSTRUCTOR' ? 'Make Student' : 'Make Instructor'}
                    </button>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <form action={toggleStudentFee}>
                    <input type="hidden" name="studentId" value={student.id} />
                    <input type="hidden" name="currentPaid" value={String(student.registrationFeePaid)} />
                    <button
                      type="submit"
                      title="Click to toggle fee paid status"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                        student.registrationFeePaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {student.registrationFeePaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Paid (€20)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Unpaid</span>
                        </>
                      )}
                    </button>
                  </form>
                </td>

                <td className="py-3 px-4 align-top">
                  {student.enrollments.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No courses</span>
                  ) : (
                    <div className="space-y-1">
                      {student.enrollments.map((e) => (
                        <div key={e.id} className="group flex items-center gap-1.5 text-xs text-slate-700">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium truncate max-w-[200px]" title={e.course.title}>
                            {e.course.title}
                          </span>
                          {e.status !== 'ACTIVE' && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1">
                              {e.status}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveEnrollment(e.id, e.course.title, student.email || '')}
                            title="Remove this course"
                            className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {(() => {
                    const available = courses.filter(
                      (c) => !student.enrollments.some((e) => e.courseId === c.id && e.status === 'ACTIVE')
                    );
                    if (assigningId === student.id) {
                      return (
                        <div className="mt-2 flex items-center gap-1.5">
                          <select
                            value={selectedCourseId}
                            onChange={(ev) => setSelectedCourseId(ev.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 text-xs bg-white max-w-[200px]"
                          >
                            <option value="">Select a course…</option>
                            {available.map((c) => (
                              <option key={c.id} value={c.id}>
                                [{c.level}] {c.title}{c.isPublished === false ? ' (Draft)' : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleAssignSubmit(student.id)}
                            className="bg-emerald-600 text-white text-xs px-2 py-1 rounded font-bold hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                          >
                            Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAssigningId(null); setSelectedCourseId(''); }}
                            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    }
                    if (available.length === 0) return null;
                    return (
                      <button
                        type="button"
                        onClick={() => { setAssigningId(student.id); setSelectedCourseId(''); }}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Assign course
                      </button>
                    );
                  })()}
                </td>

                <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                  {student.createdAt}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResettingId(resettingId === student.id ? null : student.id);
                        setNewPassword('');
                      }}
                      title="Reset Password"
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(student.id, student.email || '')}
                      title="Delete Student Account"
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {resettingId === student.id && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left space-y-2">
                      <div className="text-xs font-bold text-slate-700">Reset Password:</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-xs w-full font-mono bg-white"
                        />
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleResetSubmit(student.id)}
                          className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded font-bold hover:bg-emerald-700 transition shrink-0 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
