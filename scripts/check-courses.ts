import "dotenv/config";
import { db } from '../src/lib/prisma';

async function main() {
  const courses = await db.course.findMany({
    include: {
      instructor: true,
      modules: {
        include: {
          lessons: true
        }
      }
    }
  });
  console.log("Found courses:", courses.length);
  for (const c of courses) {
    console.log(`Course: "${c.title}" (slug: ${c.slug}), Published: ${c.isPublished}`);
    console.log(`Instructor: ${c.instructor.name} (id: ${c.instructor.id})`);
    console.log(`Modules count: ${c.modules.length}`);
    for (const m of c.modules) {
      console.log(`  Module: "${m.title}", Lessons count: ${m.lessons.length}`);
    }
  }
}

main().finally(() => db.$disconnect());
