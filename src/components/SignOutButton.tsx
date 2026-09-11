'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function SignOutButton({
  className = "flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition cursor-pointer",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={className}
    >
      {children || (
        <>
          <LogOut className="w-4 h-4" /> Sign out
        </>
      )}
    </button>
  );
}
