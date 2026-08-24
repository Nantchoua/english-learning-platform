import { z } from 'zod';

// Input sanitization: strips HTML tags, scripts, and unsafe markup
export function sanitizeInput(val: string): string {
  if (!val) return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/<[^>]*>/g, '') // Strip standard HTML tags
    .trim();
}

// 1. Zod schemas for strict format validation
export const registrationSchema = z.object({
  name: z.string().min(2, "Name too short").max(50, "Name too long"),
  email: z.string().email("Invalid email format").max(100),
  password: z.string().min(8, "Password too short").max(100),
  role: z.enum(['STUDENT', 'INSTRUCTOR'])
});

export const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(100)
});

// 2. In-Memory tracking cache for Rate Limiting & Lockout
interface RateLimitData {
  attempts: number;
  lastAttempt: number;
}

interface LockoutData {
  failedAttempts: number;
  lockoutUntil: number;
}

const rateLimitCache = new Map<string, RateLimitData>();
const lockoutCache = new Map<string, LockoutData>();

// Rate Limiter: Max 10 requests per IP per minute
export function checkRateLimit(ip: string): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  const limitWindow = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const data = rateLimitCache.get(ip);

  if (!data) {
    rateLimitCache.set(ip, { attempts: 1, lastAttempt: now });
    return { allowed: true, waitSeconds: 0 };
  }

  if (now - data.lastAttempt > limitWindow) {
    // Reset window
    rateLimitCache.set(ip, { attempts: 1, lastAttempt: now });
    return { allowed: true, waitSeconds: 0 };
  }

  if (data.attempts >= maxRequests) {
    const remainingTime = Math.ceil((limitWindow - (now - data.lastAttempt)) / 1000);
    return { allowed: false, waitSeconds: remainingTime };
  }

  data.attempts += 1;
  rateLimitCache.set(ip, data);
  return { allowed: true, waitSeconds: 0 };
}

// Account Lockout check: 15 minutes lockout after 5 consecutive failures
export function checkAccountLockout(email: string): { locked: boolean; waitMinutes: number } {
  const now = Date.now();
  const data = lockoutCache.get(email);

  if (!data) {
    return { locked: false, waitMinutes: 0 };
  }

  if (data.lockoutUntil > now) {
    const remainingMinutes = Math.ceil((data.lockoutUntil - now) / (60 * 1000));
    return { locked: true, waitMinutes: remainingMinutes };
  }

  // Lockout expired, reset lockout date but keep tracking attempts
  if (data.lockoutUntil !== 0 && data.lockoutUntil <= now) {
    lockoutCache.delete(email);
  }

  return { locked: false, waitMinutes: 0 };
}

// Log failed login and handle lockout triggers
export function recordFailedLogin(email: string): void {
  const now = Date.now();
  const data = lockoutCache.get(email) || { failedAttempts: 0, lockoutUntil: 0 };

  data.failedAttempts += 1;

  if (data.failedAttempts >= 5) {
    data.lockoutUntil = now + 15 * 60 * 1000; // 15 mins lockout
    console.warn(`[SECURITY LOCKOUT] Account locked: ${email} for 15 minutes after 5 failures.`);
    
    // Simulate Lockout Alert Mail
    import('@/lib/mail').then(({ sendEmailSimulated }) => {
      sendEmailSimulated({
        userId: 'system',
        toEmail: email,
        subject: 'Security Alert: Account Locked',
        body: `Hello,\n\nYour account has been locked for 15 minutes due to 5 consecutive failed login attempts.\n\nIf you want to reset your password, you can do so here: https://www.speakingexpressenglish.com/reset-password\n\nBest regards,\nThe Security Team`,
        type: 'SECURITY_ALERT'
      });
    });
  }

  lockoutCache.set(email, data);
}

// Clear lockouts on successful login
export function clearFailedLogins(email: string): void {
  lockoutCache.delete(email);
}
