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
  console.log('Clearing database for fresh seed...');
  // Delete related models to prevent foreign key constraint violations
  await prisma.progress.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({ where: { email: 'sarah@example.com' } });

  console.log('Seeding database with Connect with English (A1-A2)...');

  // Create Instructor
  const instructor = await prisma.user.create({
    data: {
      name: 'Hasan Alisoy',
      email: 'sarah@example.com',
      role: 'INSTRUCTOR',
    }
  });

  // Create Course
  const course = await prisma.course.create({
    data: {
      title: 'Connect with English (A1-A2)',
      slug: 'connect-with-english-a1-a2',
      description: 'A complete speaking handbook for beginner and elementary students to unlock real-world conversations confidently.',
      level: 'A1',
      isPublished: true,
      price: 20.00,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Unit 1: Social Introductions & Hobbies',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'A1-U1-L1: Introductions and Greetings',
                  order: 1,
                  isPublished: true,
                  isFree: true,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U1-L1
- **CEFR "Can-Do" Statement:** Can introduce self and others, ask and answer questions about personal details such as where they live, people they know and things they have.
- **Estimated Duration:** 20 Minutes (5 min video + 15 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Hasan. Today, we are learning the most important step in speaking English: Introductions and Greetings. 

Let's look at how to say hello and share basic information. Look at this formula:
**[On-Screen Graphic: Hello + My name is [Name] + I am [Age] years old]**

For example: 'Hello, my name is Leyla. I'm 18 years old.' 
If you want to introduce a friend, you can say: 'This is my friend, Mehmet. He is also from Ganja.'
Practice saying it out loud with me! Let's get started."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Introduction | Noun | /ˌɪn.trəˈdʌk.ʃən/ | Act of presenting someone | Let's start with a brief introduction. |
| Greetings | Noun | /ˈɡriː.tɪŋz/ | Welcoming words | We exchange friendly greetings. |
| Hometown | Noun | /ˈhoʊm.taʊn/ | Town where you grew up | My hometown is Ganja, Azerbaijan. |
| Nice to meet you | Phrase | /naɪs tuː miːt juː/ | Polite expression upon meeting | Hello Ali, nice to meet you. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Be Verb (am/is/are) + Noun/Adjective
- **Explanation:** Use "am" for "I", "is" for "he/she/it", and "are" for "you/we/they".

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* I have 18 years old.
-  *Correct:* I am 18 years old. (In English, we use the verb 'to be' for age, not 'to have').

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Hello! What's your name?
- **Speaker B:** Hi! My name is Leyla. What's yours?
- **Speaker A:** I'm Ali. Nice to meet you! Where are you from?
- **Speaker B:** I'm from Ganja, Azerbaijan. And you?

#### Roleplay Prompt:
Record an audio response introducing yourself. Say your name, your age, and your hometown.

---

### 6. Lesson Recap
1. Start conversations with "Hello" or "Hi", and close them with "Goodbye" or "See you later".
2. Use "I am [Age]" to talk about your age.
3. Introduce friends with "This is my friend [Name]".`
                },
                {
                  title: 'A1-U1-L2: Talking About Family',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U1-L2
- **CEFR "Can-Do" Statement:** Can describe family members, where they live, and their occupations using simple phrases.
- **Estimated Duration:** 22 Minutes (7 min video + 15 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Graphic of a family tree appearing next to the instructor]**
"Welcome back! Today we talk about family. Family is very important in our lives. How do we describe them?
You can use adjectives like 'kind', 'wise', or 'hardworking'.

For example: 'My mother is a teacher and she is very kind. My father is a doctor and he is hardworking.'
Let's learn how to specify relations and occupations."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Siblings | Noun | /ˈsɪb.lɪŋz/ | Brothers and sisters | I have two siblings. |
| Close-knit | Adjective | /ˌkloʊsˈnɪt/ | Bound together by strong relationships | Our family is very close-knit. |
| Tradition | Noun | /trəˈdɪʃ.ən/ | Long-standing custom | Gathering for New Year is a tradition. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Have/Has + Count of Siblings
- **Explanation:** Use "have" for "I/you/we/they" and "has" for "he/she/it".

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* I have one brother younger.
-  *Correct:* I have a younger brother. (Adjectives like 'younger' go before the noun).

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Do you have a big family?
- **Speaker B:** No, my family is small and close-knit. It consists of my parents, my younger brother, and me.
- **Speaker A:** What do your parents do?
- **Speaker B:** My mother is a teacher and my father is a doctor.

#### Roleplay Prompt:
Describe your family tree. State how many siblings you have, and describe one family member's occupation.
`
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Fetch created lessons
  const dbLessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' }
  });

  // Seed Quiz for Lesson 1
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[0].id,
      questions: {
        create: [
          {
            question: "Which verb do you use to state your age in English?",
            optionA: "Have (e.g., I have 18 years)",
            optionB: "Be (e.g., I am 18 years old)",
            optionC: "Do (e.g., I do 18 years)",
            optionD: "Make (e.g., I make 18 years)",
            correctOption: 1,
            order: 1
          },
          {
            question: "What is the English word for the town/city where you were born and grew up?",
            optionA: "National City",
            optionB: "Hometown",
            optionC: "House",
            optionD: "Birthplace",
            correctOption: 1,
            order: 2
          },
          {
            question: "Complete the sentence: 'This is my friend, Mehmet. ___ is also from Ganja.'",
            optionA: "She",
            optionB: "He",
            optionC: "It",
            optionD: "They",
            correctOption: 1,
            order: 3
          }
        ]
      }
    }
  });

  // Seed Quiz for Lesson 2
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[1].id,
      questions: {
        create: [
          {
            question: "What does the term 'siblings' mean?",
            optionA: "Parents and grandparents",
            optionB: "Brothers and sisters",
            optionC: "Cousins and relatives",
            optionD: "Aunt and uncle",
            correctOption: 1,
            order: 1
          },
          {
            question: "Which sentence is grammatically correct?",
            optionA: "She have a younger brother.",
            optionB: "She has a younger brother.",
            optionC: "She is a younger brother.",
            optionD: "She has a brother younger.",
            correctOption: 1,
            order: 2
          }
        ]
      }
    }
  });

  console.log('Database seeded successfully with speaking handbook courses!');
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
