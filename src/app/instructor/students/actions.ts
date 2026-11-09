'use server';

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

async function verifyAdminOrInstructor() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');
  const role = session.user.role;
  if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
    throw new Error('Access denied: Admins or Instructors only');
  }
  return session.user;
}

export async function createStudent(formData: FormData) {
  await verifyAdminOrInstructor();

  const name = (formData.get('name') as string || '').trim();
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string;
  const courseId = formData.get('courseId') as string;
  const registrationFeePaid = formData.get('registrationFeePaid') === 'on' || formData.get('registrationFeePaid') === 'true';

  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error(`A user with email "${email}" already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'STUDENT',
      registrationFeePaid,
    },
  });

  // Automatically enroll in selected course if provided
  if (courseId && courseId.trim().length > 0) {
    await db.enrollment.create({
      data: {
        userId: newStudent.id,
        courseId,
        paymentType: 'FULL',
        installmentsPaid: 2,
        status: 'ACTIVE',
      },
    });
  }

  revalidatePath('/instructor/students');
  return { success: true, email: newStudent.email };
}

export async function deleteStudent(formData: FormData) {
  await verifyAdminOrInstructor();
  const studentId = formData.get('studentId') as string;

  const user = await db.user.findUnique({ where: { id: studentId } });
  if (!user || user.role === 'ADMIN') {
    throw new Error('Cannot delete this user');
  }

  await db.user.delete({ where: { id: studentId } });
  revalidatePath('/instructor/students');
}

export async function resetStudentPassword(formData: FormData) {
  await verifyAdminOrInstructor();
  const studentId = formData.get('studentId') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: studentId },
    data: { password: hashedPassword },
  });

  revalidatePath('/instructor/students');
}

export async function toggleStudentFee(formData: FormData) {
  await verifyAdminOrInstructor();
  const studentId = formData.get('studentId') as string;
  const currentPaid = formData.get('currentPaid') === 'true';

  await db.user.update({
    where: { id: studentId },
    data: { registrationFeePaid: !currentPaid },
  });

  revalidatePath('/instructor/students');
}

export async function assignCourse(formData: FormData) {
  await verifyAdminOrInstructor();
  const studentId = formData.get('studentId') as string;
  const courseId = formData.get('courseId') as string;

  if (!studentId || !courseId) {
    throw new Error('Student and course are required');
  }

  const [student, course] = await Promise.all([
    db.user.findUnique({ where: { id: studentId } }),
    db.course.findUnique({ where: { id: courseId } }),
  ]);
  if (!student) throw new Error('Student not found');
  if (!course) throw new Error('Course not found');

  // Create the enrollment, or re-activate it with full access if one already exists (e.g. PENDING)
  await db.enrollment.upsert({
    where: { userId_courseId: { userId: studentId, courseId } },
    update: { status: 'ACTIVE', paymentType: 'FULL', installmentsPaid: 2 },
    create: {
      userId: studentId,
      courseId,
      paymentType: 'FULL',
      installmentsPaid: 2,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/instructor/students');
  revalidatePath('/dashboard');
}

export async function removeEnrollment(formData: FormData) {
  await verifyAdminOrInstructor();
  const enrollmentId = formData.get('enrollmentId') as string;
  if (!enrollmentId) throw new Error('Enrollment is required');

  await db.enrollment.delete({ where: { id: enrollmentId } });

  revalidatePath('/instructor/students');
  revalidatePath('/dashboard');
}
