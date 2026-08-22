'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnenrollButton({
  studentId,
  courseId,
  studentName,
}: {
  studentId: string;
  courseId: string;
  studentName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUnenroll = async () => {
    if (
      !confirm(
        `Are you sure you want to remove ${studentName} from this course? This will permanently delete their progress and quiz scores.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/instructor/enrollment?courseId=${courseId}&studentId=${studentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove student');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUnenroll}
      disabled={loading}
      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition disabled:opacity-50"
      title="Remove Student from Course"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
