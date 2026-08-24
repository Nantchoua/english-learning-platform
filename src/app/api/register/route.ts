import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registrationSchema, sanitizeInput } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Sanitize and validate inputs
    const rawName = sanitizeInput(formData.get('name') as string || '');
    const rawEmail = sanitizeInput(formData.get('email') as string || '');
    const rawPassword = formData.get('password') as string || '';
    const rawRole = (formData.get('role') as string) === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';

    const parseResult = registrationSchema.safeParse({
      name: rawName,
      email: rawEmail,
      password: rawPassword,
      role: rawRole
    });

    if (!parseResult.success) {
      console.warn('[VALIDATION_FAILURE] Invalid registration format parameters.');
      return NextResponse.redirect(new URL('/register?error=generic', req.url));
    }

    const { name, email, password, role } = parseResult.data;

    // Check if account already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Return a generic response redirect to prevent user enumeration
      console.warn(`[REGISTRATION] Signup attempted on existing email: ${email}`);
      return NextResponse.redirect(new URL('/login?registered=1', req.url));
    }

    // Hash password with 12 salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    // Send registration confirmation email log
    const { sendEmailSimulated } = await import('@/lib/mail');
    await sendEmailSimulated({
      userId: user.id,
      toEmail: email,
      subject: 'Welcome to Speaking Express!',
      body: `Hello ${name},\n\nThank you for registering on Speaking Express English Academy. Your account has been created successfully!\n\nBest regards,\nThe Speaking Express Team`,
      type: 'REGISTRATION',
    });

    return NextResponse.redirect(new URL('/login?registered=1', req.url));
  } catch (err: any) {
    console.error('[REGISTRATION_ERROR]', err);
    return NextResponse.redirect(new URL('/register?error=generic', req.url));
  }
}
