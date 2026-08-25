import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { redirect } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speaking Express English Academy",
  description: "Unlock English conversation and speaking fluency, one word at a time.",
  icons: {
    icon: '/logo.svg', // Sets tab icon to SpeakingExpress logo
  }
};

function isPublicPath(path: string) {
  const publicPaths = ['/', '/about', '/login', '/register', '/registration-fee'];
  if (publicPaths.includes(path)) return true;
  if (path.startsWith('/api/')) return true;
  if (path.startsWith('/_next/')) return true;
  return false;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const isPublic = isPublicPath(pathname);
    if (!isPublic) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, registrationFeePaid: true }
      });
      if (user && user.role === 'STUDENT' && !user.registrationFeePaid) {
        redirect('/registration-fee');
      }
    } else if (pathname === '/registration-fee') {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, registrationFeePaid: true }
      });
      if (user && (user.role !== 'STUDENT' || user.registrationFeePaid)) {
        redirect('/dashboard');
      }
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
