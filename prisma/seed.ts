import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // Create an instructor
  const instructor = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah@example.com',
      role: 'INSTRUCTOR',
    }
  });

  // Create a course
  const course = await prisma.course.create({
    data: {
      title: 'Advanced Business English (C1)',
      slug: 'business-english-c1',
      description: 'Master negotiations, formal emails, and presentations.',
      level: 'C1',
      isPublished: true,
      price: 49.99,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Module 1: Grammar Foundations',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Present Perfect vs Past Simple',
                  order: 1,
                  isPublished: true,
                  isFree: true,
                },
                {
                  title: 'Conditionals Mastery',
                  order: 2,
                  isPublished: true,
                }
              ]
            }
          }
        ]
      }
    }
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'IELTS Band 8+ Masterclass',
      slug: 'ielts-masterclass',
      description: 'Everything you need to ace the IELTS exam.',
      level: 'B2',
      isPublished: true,
      instructorId: instructor.id,
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
