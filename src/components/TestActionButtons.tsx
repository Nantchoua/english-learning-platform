'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Sparkles } from 'lucide-react';

type TestActionButtonsProps = {
  students: { id: string; name: string | null; email: string | null }[];
  courses: { id: string; title: string }[];
};

export default function TestActionButtons({ students, courses }: TestActionButtonsProps) {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '');
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (action: string) => {
    if (!selectedStudent) {
      alert('Please select or create a student first.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/instructor/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          studentId: selectedStudent,
          courseId: selectedCourse
        })
      });

      if (!res.ok) throw new Error('Simulation trigger failed');

      alert('Mock payment reference created successfully! Refreshing...');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error occurred during simulation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Student to Test
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name || 'Anonymous'} ({student.email})
              </option>
            ))}
          </select>
          {students.length === 0 && (
            <p className="text-xs text-red-500 font-medium">
              *Register a student account first by signing out and clicking Sign Up.
            </p>
          )}
        </div>

        {/* Course selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Course to Enroll
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
        <button
          onClick={() => handleSimulate('simulate-registration-pending')}
          disabled={loading || !selectedStudent}
          className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          Simulate Registration Reference
        </button>

        <button
          onClick={() => handleSimulate('simulate-enrollment-pending')}
          disabled={loading || !selectedStudent || !selectedCourse}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Play className="w-4 h-4" />
          Simulate Course Reference
        </button>
      </div>
    </div>
  );
}
