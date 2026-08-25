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
- **Lesson ID:** ${l.id}
- **CEFR "Can-Do" Statement:** ${l.cefr}
- **Estimated Duration:** ${l.duration} (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on ${l.title}.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
${wordsTable}

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** ${l.grammar.pattern}
- **Explanation:** ${l.grammar.explanation}

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* ${l.grammar.incorrect}
-  *Correct:* ${l.grammar.correct} (${l.grammar.errorExplain})

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** ${l.dialogue.speakerA}
- **Speaker B:** ${l.dialogue.speakerB}

#### Roleplay Prompt:
${l.dialogue.prompt}

---

### 6. Lesson Recap
1. Master structural grammar patterns for ${l.title}.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`;
}


async function run() {
  console.log("Generating full seed.ts script...");

  let seedCode = `import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = \`\${process.env.DIRECT_URL || process.env.DATABASE_URL}\`;
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

  console.log('Seeding other 3 courses...');
  // Course 2: Pre-Intermediate Business English (A2-B1)
  const course1 = await prisma.course.create({
    data: {
      title: 'Pre-Intermediate Business English (A2-B1)',
      slug: 'pre-intermediate-business-english',
      description: 'Master everyday business communication, professional telephoning, corporate email structure, and trade vocabulary.',
      price: 49.99,
      level: 'B1',
      isPublished: true,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Unit 1: Business Telephoning Basics',
            order: 1,
            lessons: {
              create: [
                {
                  title: '1.1 Making a Call & Taking Messages',
                  order: 1,
                  isPublished: true,
                  content: \`### Telephoning Protocols in English
When starting a phone call in a professional setting, follow this standard pattern:
1. **Greeting:** Good morning/afternoon, [Company Name], this is [Your Name] speaking.
2. **Reason for call:** I'm calling to speak with... / Could I speak to...?
3. **Leaving a Message:** Could you please tell him/her that...? / Would you mind taking a message?

#### Vocabulary Focus
| Term | Meaning | Context Example |
|---|---|---|
| **Hold the line** | Wait on the call | "Please hold the line while I transfer you." |
| **Put someone through** | Connect the call | "I will put you through to Mr. Smith now." |
| **Take a message** | Write down a note | "She is out of the office. Can I take a message?" |

#### Dialogue Study
* **Speaker A:** "Good morning, Speaking Express. How can I help you?"
* **Speaker B:** "Hello, this is Jane calling from London. May I speak to Nantchoua, please?"
* **Speaker A:** "I am sorry, but he is currently in a meeting. Would you like to leave a message?"
* **Speaker B:** "Yes, please ask him to call me back about the lesson schedule."\`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'What is the correct polite phrase to ask someone to wait on the phone?',
                            optionA: 'Wait here',
                            optionB: 'Hold the line',
                            optionC: 'Stop talking',
                            optionD: 'Connect call',
                            correctOption: 1,
                            order: 1
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },
          {
            title: 'Unit 2: Professional Email Structure',
            order: 2,
            lessons: {
              create: [
                {
                  title: '2.1 Formal vs Informal Email Drafts',
                  order: 1,
                  isPublished: true,
                  content: \`### Formality in Business Emails
Using correct register helps you communicate clearly and build trust with clients.

#### Key Patterns
* **Formal Salutation:** Dear Mr. / Ms. [Name]
* **Informal Salutation:** Hi [Name] / Hello [Name]
* **Formal Closing:** Sincerely, / Best regards,
* **Informal Closing:** Cheers, / All the best,

#### Email Sample (Formal)
\\\`\\\`\\\`text
Subject: Art and Design Conference Invitation

Dear Laura,

I am writing to inform you that next month's art and design conference will be held in London from October 12 to 15. The agenda is attached. Please review the sessions and let me know if you would like me to make a hotel reservation for you.

With best regards,
Lars Oluffson
\\\`\\\`\\\`\`,





                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Which closing phrase is appropriate for a formal business email?',
                            optionA: 'Cheers',
                            optionB: 'Best regards',
                            optionC: 'See ya',
                            optionD: 'Bye',
                            correctOption: 1,
                            order: 1
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Course 3: Intermediate Conversation Mastery (B1-B2)
  const course2 = await prisma.course.create({
    data: {
      title: 'Intermediate Conversation Mastery (B1-B2)',
      slug: 'intermediate-conversation-mastery',
      description: 'Enhance your conversational English, small talk competence, social icebreakers, and vocabulary for casual debates.',
      price: 59.99,
      level: 'B2',
      isPublished: true,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Unit 1: The Art of Small Talk',
            order: 1,
            lessons: {
              create: [
                {
                  title: '1.1 Safe Topics & Conversation Starters',
                  order: 1,
                  isPublished: true,
                  content: \`### Small Talk Rules & Techniques
Small talk is the bridge to building strong personal and business connections.

#### Rule Book
1. **Safe Topics:** The weather, travel plans, local events, or weekend activities.
2. **Taboo Topics:** Salaries, personal politics, religious beliefs, relationship status.
3. **Chameleon Technique:** Mirror the speaker's body language and speaking pace to build comfort.

#### Vocabulary Focus
| Phrase | Purpose | Example |
|---|---|---|
| **Break the ice** | Relieve initial tension | "I brought some coffee to break the ice." |
| **Common ground** | Shared interests | "We found common ground talking about sports." |
| **Keep it going** | Ask open questions | "That sounds interesting, how did it happen?" |

#### Dialogue
* **Speaker A:** "Lovely weather today, isn't it?"
* **Speaker B:** "Yes, absolutely! It's much warmer than last week."
* **Speaker A:** "Indeed. Did you do anything special over the weekend?"\`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Which of the following is considered a safe small talk topic?',
                            optionA: 'Monthly Salary',
                            optionB: 'The Weekend Weather',
                            optionC: 'Political Elections',
                            optionD: 'Personal Debts',
                            correctOption: 1,
                            order: 1
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Course 4: Advanced Presentation & Speech (C1-C2)
  const course3 = await prisma.course.create({
    data: {
      title: 'Advanced Presentation & Speech (C1-C2)',
      slug: 'advanced-presentation-speech',
      description: 'Design and deliver professional speeches, lead academic debates, and master advanced rhetoric structures.',
      price: 79.99,
      level: 'C1',
      isPublished: true,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Unit 1: Structuring a Keynote Presentation',
            order: 1,
            lessons: {
              create: [
                {
                  title: '1.1 Rhetoric Tools & Public Speaking',
                  order: 1,
                  isPublished: true,
                  content: \`### Rhetorical Structures in Presentations
To make a lasting impact on an audience, structure your keynote using the **Rule of Three**:
1. **Tell them what you are going to tell them:** Introduce the main points.
2. **Tell them:** Elaborate with supporting data.
3. **Tell them what you have told them:** Summarize the core takeaway.

#### Rhetoric Devices
* **Anaphora:** Repeating a key phrase at the start of consecutive sentences (e.g., "We will succeed because... We will succeed if...").
* **Signposting:** Guiding the audience through your slides (e.g., "Moving on to my next slide...", "Let's turn our attention to...").\`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'What is the "Rule of Three" in public speaking?',
                            optionA: 'Speak for exactly three hours',
                            optionB: 'Structure your speech into Introduction, Body, and Conclusion sections',
                            optionC: 'Use only three slides total',
                            optionD: 'Ask three questions to the audience',
                            correctOption: 1,
                            order: 1
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });
  console.log('Seeded all additional courses successfully!');
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
