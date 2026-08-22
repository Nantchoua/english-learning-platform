import { db } from './prisma';

type SendEmailParams = {
  userId: string;
  toEmail: string;
  subject: string;
  body: string;
  type: 'REGISTRATION' | 'ENROLLMENT' | 'INSTALLMENT';
};

export async function sendEmailSimulated({
  userId,
  toEmail,
  subject,
  body,
  type,
}: SendEmailParams) {
  try {
    // 1. Log the simulated email payload to terminal console
    console.log(`\n📧 [SIMULATED EMAIL SENT]`);
    console.log(`To:      ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log(`──────────────────────────────────────────────────\n`);

    // 2. Record it in the database EmailLog table
    await db.emailLog.create({
      data: {
        userId,
        toEmail,
        subject,
        body,
        type,
      },
    });
  } catch (error) {
    console.error('❌ Failed to log simulated email:', error);
  }
}
