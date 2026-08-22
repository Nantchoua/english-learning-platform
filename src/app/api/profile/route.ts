import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const formData = await req.formData();
  const action = formData.get('action') as string;
  const userId = session.user.id;

  // ── Update Name ──────────────────────────────────────────
  if (action === 'update-name') {
    const name = (formData.get('name') as string)?.trim();
    if (!name) {
      return NextResponse.redirect(new URL('/profile?error=name-empty', req.url));
    }
    await db.user.update({ where: { id: userId }, data: { name } });
    return NextResponse.redirect(new URL('/profile?success=name', req.url));
  }

  // ── Change Password ───────────────────────────────────────
  if (action === 'change-password') {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.redirect(new URL('/profile?error=password-missing', req.url));
    }
    if (newPassword.length < 6) {
      return NextResponse.redirect(new URL('/profile?error=password-short', req.url));
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.redirect(new URL('/profile?error=password-mismatch', req.url));
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      return NextResponse.redirect(new URL('/profile?error=password-none', req.url));
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.redirect(new URL('/profile?error=password-wrong', req.url));
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id: userId }, data: { password: hashed } });
    return NextResponse.redirect(new URL('/profile?success=password', req.url));
  }

  return NextResponse.redirect(new URL('/profile', req.url));
}
