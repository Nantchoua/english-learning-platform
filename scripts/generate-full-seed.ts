import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

// Define the 35 lessons from the speaking handbook
interface LessonOutline {
  id: string;
  title: string;
  cefr: string;
  duration: string;
  words: { word: string; pos: string; pron: string; meaning: string; ex: string }[];
  dialogue: { speakerA: string; speakerB: string; prompt: string };
  grammar: { pattern: string; explanation: string; incorrect: string; correct: string; errorExplain: string };
  questions: { question: string; a: string; b: string; c: string; d: string; correct: number }[];
}

const lessonsData: LessonOutline[] = [
  {
    id: "A1-U1-L1",
    title: "Introductions and Greetings",
    cefr: "Can introduce self and others, ask and answer questions about personal details.",
    duration: "20 Minutes",
    words: [
      { word: "Introduction", pos: "Noun", pron: "/ˌɪn.trəˈdʌk.ʃən/", meaning: "The act of making someone known by name to another.", ex: "Let's start with a brief introduction." },
      { word: "Greetings", pos: "Noun", pron: "/ˈɡriː.tɪŋz/", meaning: "Something said or done to show respect when you meet someone.", ex: "We exchanged warm greetings." },
      { word: "Hometown", pos: "Noun", pron: "/ˈhoʊm.taʊn/", meaning: "The town or city where you were born and grew up.", ex: "My hometown is Ganja, Azerbaijan." },
      { word: "Nice to meet you", pos: "Phrase", pron: "/naɪs tuː miːt juː/", meaning: "A polite phrase used when being introduced.", ex: "Hello Leyla, nice to meet you." }
    ],
    dialogue: {
      speakerA: "Hello! What's your name?",
      speakerB: "Hi! My name is Leyla. What's yours?",
      prompt: "Introduce yourself, state your name, your age, and your hometown."
    },
    grammar: {
      pattern: "Subject + Be Verb (am/is/are) + Noun/Adjective",
      explanation: "Use 'am' for 'I', 'is' for 'he/she/it', and 'are' for 'you/we/they'.",
      incorrect: "I have 18 years old.",
      correct: "I am 18 years old.",
      errorExplain: "In English, we use the verb 'to be' for age, not 'to have'."
    },
    questions: [
      { question: "Which verb do you use to state your age in English?", a: "Have", b: "Be", c: "Do", d: "Make", correct: 1 },
      { question: "What is the English word for the town/city where you were born?", a: "National City", b: "Hometown", c: "House", d: "Birthplace", correct: 1 }
    ]
  },
  {
    id: "A1-U1-L2",
    title: "Talking About Family",
    cefr: "Can describe family members, where they live, and their occupations.",
    duration: "22 Minutes",
    words: [
      { word: "Siblings", pos: "Noun", pron: "/ˈsɪb.lɪŋz/", meaning: "Brothers and sisters.", ex: "Do you have any siblings?" },
      { word: "Close-knit", pos: "Adjective", pron: "/ˌkloʊsˈnɪt/", meaning: "Having strong relationships with each other.", ex: "Our family is very close-knit." },
      { word: "Tradition", pos: "Noun", pron: "/trəˈdɪʃ.ən/", meaning: "A specific practice of long-standing.", ex: "Gathering for New Year is a family tradition." }
    ],
    dialogue: {
      speakerA: "Do you have siblings?",
      speakerB: "Yes, I have one younger brother.",
      prompt: "Describe your family members and what they do for a living."
    },
    grammar: {
      pattern: "Subject + Have/Has + Count of Siblings",
      explanation: "Use 'have' for I/you/we/they and 'has' for he/she/it.",
      incorrect: "I have one brother younger.",
      correct: "I have a younger brother.",
      errorExplain: "In English, adjectives like 'younger' go before the noun."
    },
    questions: [
      { question: "What does the term 'siblings' mean?", a: "Parents", b: "Brothers and sisters", c: "Cousins", d: "Uncle", correct: 1 },
      { question: "Which is correct?", a: "She have a brother.", b: "She has a brother.", c: "She is a brother.", d: "She has a brother younger.", correct: 1 }
    ]
  },
  {
    id: "A1-U1-L3",
    title: "Hobbies and Interests",
    cefr: "Can discuss personal hobbies, interests, and free-time preferences.",
    duration: "25 Minutes",
    words: [
      { word: "Leisure", pos: "Noun", pron: "/ˈleɪ.ʒʊr/", meaning: "Time spent in or free for relaxation or enjoyment.", ex: "What do you do in your leisure time?" },
      { word: "Enjoy", pos: "Verb", pron: "/ɪnˈdʒɔɪ/", meaning: "To get pleasure from something.", ex: "I enjoy reading books." },
      { word: "Photography", pos: "Noun", pron: "/fəˈtɑː.ɡrə.fi/", meaning: "The art or practice of taking photographs.", ex: "Photography is a very popular hobby." }
    ],
    dialogue: {
      speakerA: "What are your hobbies?",
      speakerB: "My hobbies include reading, playing football, and cooking.",
      prompt: "Tell me about your favorite hobby and why you like it."
    },
    grammar: {
      pattern: "Subject + Enjoy/Like + Verb-ing (Gerund)",
      explanation: "Use the -ing form of a verb after like, love, or enjoy.",
      incorrect: "I enjoy to read.",
      correct: "I enjoy reading.",
      errorExplain: "The verb 'enjoy' is followed by a gerund (-ing form)."
    },
    questions: [
      { question: "Which of the following is correct?", a: "I enjoy to swim.", b: "I enjoy swimming.", c: "I enjoy swim.", d: "I enjoy for swim.", correct: 1 }
    ]
  },
  {
    id: "A1-U1-L4",
    title: "Daily Routine",
    cefr: "Can describe daily habits, routines, and schedules.",
    duration: "20 Minutes",
    words: [
      { word: "Routine", pos: "Noun", pron: "/ruːˈtiːn/", meaning: "A sequence of actions regularly followed.", ex: "My morning routine is very simple." },
      { word: "Commute", pos: "Noun/Verb", pron: "/kəˈmjuːt/", meaning: "Travel some distance between home and work/school.", ex: "I take the bus for my daily commute." },
      { word: "Chores", pos: "Noun", pron: "/tʃɔːrz/", meaning: "A routine task, especially a household one.", ex: "I do my household chores on Saturday." }
    ],
    dialogue: {
      speakerA: "Can you describe your daily routine?",
      speakerB: "I wake up early, have breakfast, and then go to university.",
      prompt: "Describe your daily routine from morning to night."
    },
    grammar: {
      pattern: "Subject + Simple Present Verb",
      explanation: "Use simple present tense to talk about daily habits.",
      incorrect: "I am waking up early every day.",
      correct: "I wake up early every day.",
      errorExplain: "Habitual routines use Simple Present instead of Present Continuous."
    },
    questions: [
      { question: "What is the meaning of 'commute'?", a: "To cook dinner", b: "To travel to work/school", c: "To watch TV", d: "To sleep", correct: 1 }
    ]
  }
];

// Dynamically generate A1-A2 handbook lessons up to 35 lessons based on textbook topics
const textbookTopics = [
  "School and University Life", "Describing People and Characters", "Hometown and Landmarks",
  "Food and Drinks", "Shopping and Money", "Weather and Seasons", "Travel and Holidays",
  "Pets and Animals", "Jobs and Professions", "Health and Wellness", "Sports and Fitness",
  "Housing and Neighborhood", "Music and Entertainment", "Culture and Traditions",
  "Environment and Nature", "Fashion and Style", "Technology and Internet", "Books and Literature",
  "News and Media", "Public Transport", "Free Time and Weekend Activities", "History and Important Events",
  "Study Techniques and Tips", "Volunteering and Social Issues", "Globalization and Multiculturalism",
  "Art and Creativity", "Science and Discovery", "Personal Achievements and Goals", "Etiquette and Manners",
  "Reflection and Progress"
];

for (let i = 0; i < textbookTopics.length; i++) {
  const lessonNumber = i + 5;
  const unit = Math.ceil(lessonNumber / 5);
  const title = textbookTopics[i];
  lessonsData.push({
    id: `A1-U${unit}-L${lessonNumber}`,
    title: title,
    cefr: `Can talk about topics related to ${title.toLowerCase()} in simple English.`,
    duration: "25 Minutes",
    words: [
      { word: title.split(" ")[0], pos: "Noun", pron: "/tæst/", meaning: `Related to the theme of ${title.toLowerCase()}`, ex: `We love to discuss ${title.toLowerCase()}.` },
      { word: "Practice", pos: "Verb", pron: "/ˈpræk.tɪs/", meaning: "To do something repeatedly to improve.", ex: "Practice makes perfect." }
    ],
    dialogue: {
      speakerA: `Let's discuss ${title.toLowerCase()}.`,
      speakerB: `Yes, I think ${title.toLowerCase()} is very interesting and important.`,
      prompt: `Record an audio speaking about your thoughts on ${title.toLowerCase()}.`
    },
    grammar: {
      pattern: `Subject + Verb + Object (related to ${title.toLowerCase()})`,
      explanation: `Ensure verb subject agreement when discussing ${title.toLowerCase()}.`,
      incorrect: `He do not like ${title.toLowerCase()}.`,
      correct: `He does not like ${title.toLowerCase()}.`,
      errorExplain: `Use 'does not' for singular third-person negative sentences.`
    },
    questions: [
      { question: `Which sentence is correct?`, a: `She like ${title.toLowerCase()}.`, b: `She likes ${title.toLowerCase()}.`, c: `She is like ${title.toLowerCase()}.`, d: `She does liking ${title.toLowerCase()}.`, correct: 1 }
    ]
  });
}

function buildLessonContent(l: LessonOutline): string {
  const wordsTable = l.words.map(w => `| ${w.word} | ${w.pos} | ${w.pron} | ${w.meaning} | ${w.ex} |`).join('\n');
  return `### 1. Lesson Metadata
- **Lesson ID:** \${l.id}
- **CEFR "Can-Do" Statement:** \${l.cefr}
- **Estimated Duration:** \${l.duration} (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on \${l.title}.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
\${wordsTable}

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** \${l.grammar.pattern}
- **Explanation:** \${l.grammar.explanation}

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* \${l.grammar.incorrect}
-  *Correct:* \${l.grammar.correct} (\${l.grammar.errorExplain})

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** \${l.dialogue.speakerA}
- **Speaker B:** \${l.dialogue.speakerB}

#### Roleplay Prompt:
\${l.dialogue.prompt}

---

### 6. Lesson Recap
1. Master structural grammar patterns for \${l.title}.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`;
}

async function run() {
  console.log("Generating full seed.ts script...");

  let seedCode = `import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = \`\${process.env.DATABASE_URL}\`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database for fresh seed...');
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

  // Create Instructor with name "Nantchoua"
  const instructor = await prisma.user.create({
    data: {
      name: 'Nantchoua',
      email: 'sarah@example.com',
      role: 'INSTRUCTOR',
    }
  });

  // Ensure user accounts with email containing "Dominic" or "Nantchoua" are ADMIN
  await prisma.user.updateMany({
    where: {
      OR: [
        { email: { contains: 'dominic' } },
        { email: { contains: 'nantchoua' } },
        { email: 'dominic.nantchoua@gmail.com' }
      ]
    },
    data: {
      role: 'ADMIN'
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
`;

  // Group lessons into Units of 5 lessons each
  for (let unit = 1; unit <= 7; unit++) {
    seedCode += `          {
            title: 'Unit ${unit}: Connect with English',
            order: ${unit},
            lessons: {
              create: [
`;
    const unitLessons = lessonsData.filter((l, idx) => Math.ceil((idx + 1) / 5) === unit);
    unitLessons.forEach((l) => {
      const escapedContent = buildLessonContent(l).replace(/`/g, '\\`').replace(/\$/g, '\\$');
      seedCode += `                {
                  title: '${l.id}: ${l.title}',
                  order: ${l.id.split('-L')[1]},
                  isPublished: true,
                  isFree: false,
                  content: \`${escapedContent}\`
                },
`;
    });

    seedCode += `              ]
            }
          },
`;
  }

  seedCode += `        ]
      }
    }
  });

  // Fetch created lessons
  const dbLessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' }
  });

  console.log('Seeding quizzes for all lessons...');
`;

  // Seed quizzes
  lessonsData.forEach((l, idx) => {
    seedCode += `  // Quiz for Lesson ${idx + 1}
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[${idx}].id,
      questions: {
        create: [
`;
    l.questions.forEach((q, qIdx) => {
      seedCode += `          {
            question: "${q.question}",
            optionA: "${q.a}",
            optionB: "${q.b}",
            optionC: "${q.c}",
            optionD: "${q.d}",
            correctOption: ${q.correct},
            order: ${qIdx + 1}
          },
`;
    });
    seedCode += `        ]
      }
    }
  });

`;
  });

  seedCode += `  console.log('Database seeded successfully with all 34 speaking handbook courses!');
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
`;

  fs.writeFileSync(path.join(__dirname, '../prisma/seed.ts'), seedCode, 'utf-8');
  console.log("seed.ts file generated successfully!");
}

run();
