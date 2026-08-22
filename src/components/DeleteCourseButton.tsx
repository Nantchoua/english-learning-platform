'use client';

import { deleteCourse } from '@/app/instructor/courses/[id]/edit/actions';

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Are you absolutely sure you want to delete this course? This action is permanent and cannot be undone.')) {
      e.preventDefault();
    }
  };

  return (
    <form action={deleteCourse} onSubmit={handleSubmit}>
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-750 text-white font-semibold py-2 rounded-md text-sm transition cursor-pointer text-center"
      >
        Delete Course
      </button>
    </form>
  );
}
