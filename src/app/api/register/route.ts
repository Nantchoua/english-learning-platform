import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const roleInput = formData.get('role') as string;

  if (!name || !email || !password) {
    return NextResponse.redirect(new URL('/register?error=missing', req.url));
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.redirect(new URL('/register?error=invalid_email', req.url));
  }

  // Password strength check (Minimum 8 chars, at least one letter and one number)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  if (!passwordRegex.test(password)) {
    return NextResponse.redirect(new URL('/register?error=weak_password', req.url));
  }

  // Only allow valid roles; default to STUDENT for safety
  const role: 'STUDENT' | 'INSTRUCTOR' =
    roleInput === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.redirect(new URL('/register?error=exists', req.url));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  // Send registration confirmation email log
  const { sendEmailSimulated } = await import('@/lib/mail');
  await sendEmailSimulated({
    userId: user.id,
    toEmail: email,
    subject: 'Welcome to EnglishPro!',
    body: `Hello ${name},\n\nThank you for registering on EnglishPro. Your account (${role}) has been created successfully!\n\nBest regards,\nThe EnglishPro Team`,
    type: 'REGISTRATION',
  });

  return NextResponse.redirect(new URL('/login?registered=1', req.url));
}
