import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'instructor@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        const { loginSchema, sanitizeInput, checkAccountLockout, recordFailedLogin, clearFailedLogins } = await import('./security');

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Incorrect email or password');
        }

        const email = sanitizeInput(credentials.email);
        const password = credentials.password;

        // Parse with Zod
        const parseResult = loginSchema.safeParse({ email, password });
        if (!parseResult.success) {
          throw new Error('Incorrect email or password');
        }

        // Account Lockout check
        const lockout = checkAccountLockout(email);
        if (lockout.locked) {
          console.warn(`[SECURITY_ALERT] Authentication blocked: locked account attempt for ${email}`);
          throw new Error('Incorrect email or password');
        }

        const user = await db.user.findUnique({
          where: { email }
        });

        if (!user || !user.password) {
          recordFailedLogin(email);
          throw new Error('Incorrect email or password');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          recordFailedLogin(email);
          throw new Error('Incorrect email or password');
        }

        // Authentication success: clear failed tracking records
        clearFailedLogins(email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
};
