import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  }
}
