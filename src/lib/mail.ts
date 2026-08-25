import { db } from './prisma';
import nodemailer from 'nodemailer';

type SendEmailParams = {
  userId: string;
  toEmail: string;
  subject: string;
  body: string;
  type: 'REGISTRATION' | 'ENROLLMENT' | 'INSTALLMENT';
};

// Lazily create the transporter only if SMTP config is present
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
    return transporter;
  }
  return null;
}

export async function sendEmailSimulated({
  userId,
  toEmail,
  subject,
  body,
  type,
}: SendEmailParams) {
  try {
    const activeTransporter = getTransporter();
    
    if (activeTransporter) {
      const from = process.env.SMTP_FROM || '"Speaking Express" <noreply@speakingexpress.com>';
      await activeTransporter.sendMail({
        from,
        to: toEmail,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>'), // Simple plain-text to HTML line break conversion
      });
      console.log(`📧 [REAL EMAIL SENT via SMTP]`);
    } else {
      console.log(`\n📧 [SIMULATED EMAIL LOGGED]`);
    }

    console.log(`To:      ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log(`──────────────────────────────────────────────────\n`);

    // Record in the database EmailLog table
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
    console.error('❌ Failed to send/log email:', error);
  }
}
