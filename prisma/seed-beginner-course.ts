import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DIRECT_URL || process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Comprehensive English Beginner Course: Vocabulary Essentials (A1)...');

  let instructor = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'dominic.nantchoua@gmail.com' },
        { email: 'sarah@example.com' },
        { role: 'INSTRUCTOR' },
        { role: 'ADMIN' },
      ]
    }
  });

  if (!instructor) {
    instructor = await prisma.user.create({
      data: {
        name: 'Nantchoua',
        email: 'dominic.nantchoua@gmail.com',
        role: 'ADMIN',
      }
    });
  }

  // Clean up existing course cleanly
  const oldCourse = await prisma.course.findFirst({
    where: {
      OR: [
        { slug: 'connect-with-english-a1-a2' },
        { slug: 'english-beginner-course' },
      ]
    }
  });

  if (oldCourse) {
    console.log(`Cleaning up old course: ${oldCourse.title} (${oldCourse.id})`);
    const modules = await prisma.module.findMany({
      where: { courseId: oldCourse.id },
      include: { lessons: { include: { quiz: true } } },
    });
    for (const mod of modules) {
      for (const les of mod.lessons) {
        if (les.quiz) {
          await prisma.quizAttempt.deleteMany({ where: { quizId: les.quiz.id } });
          await prisma.quizQuestion.deleteMany({ where: { quizId: les.quiz.id } });
          await prisma.quiz.delete({ where: { id: les.quiz.id } });
        }
        await prisma.progress.deleteMany({ where: { lessonId: les.id } });
        await prisma.comment.deleteMany({ where: { lessonId: les.id } });
      }
    }
    await prisma.module.deleteMany({ where: { courseId: oldCourse.id } });
    await prisma.course.delete({ where: { id: oldCourse.id } });
  }

  console.log('Creating course modules and lessons with authentic video, audio, and Oxford tests...');

  const course = await prisma.course.create({
    data: {
      title: 'English Beginner Course: Vocabulary Essentials (A1)',
      slug: 'english-beginner-course',
      description: 'A compact, exercise-based vocabulary and speaking course for beginner and elementary learners. Features authentic Oxford English File video dialogues, native audio listening tracks, pronunciation drills, and comprehensive end-of-unit tests.',
      level: 'A1',
      isPublished: true,
      price: 20.00,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: "Unit 1: Introductions, Numbers & Greetings",
            order: 1,
            lessons: {
              create: [
                {
                  title: "1A: Nice to Meet You",
                  order: 1,
                  isPublished: true,
                  isFree: true,
                  videoUrl: '/videos/beginner/ef5e_beg_1a_1_listening.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **verb be (singular): I and you** and essential vocabulary for **numbers 0-10, days of the week, greetings**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_1.02_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Sarah:** *\"Hello, welcome to class! My name is Sarah Jenkins. What's your name?\"*\n- **Alex:** *\"Hello Sarah! My name is Alex Santos. Nice to meet you.\"*\n- **Sarah:** *\"Nice to meet you too, Alex. Are you in Room 3?\"*\n- **Alex:** *\"Yes, I am. I'm in Group A.\"*\n- **Sarah:** *\"Great! Welcome to the English Academy.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Hello / Hi** | interjection | `/h\u0259\u02c8l\u0259\u028a/` | Standard friendly greeting used at any time | *\"Hello, nice to meet you!\"* |\n| **Name** | noun | `/ne\u026am/` | A word by which a person is known | *\"What is your name?\"* |\n| **Nice to meet you** | phrase | `/na\u026as tu\u02d0 mi\u02d0t ju\u02d0/` | Polite phrase used when introduced to someone | *\"Hi Alex, nice to meet you too.\"* |\n| **Goodbye / Bye** | interjection | `/\u0261\u028ad\u02c8ba\u026a/` | Said when parting or leaving | *\"Goodbye, see you on Monday!\"* |\n| **Zero to Ten** | numbers | `/\u02c8z\u026a\u0259r\u0259\u028a/ - /t\u025bn/` | Cardinal digits 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | *\"My phone number ends in four, seven, zero.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: verb be (singular): I and you\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Hello, ________ Mark.",
                            optionA: "I",
                            optionB: "I'm",
                            optionC: "Am",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: "A: Nice to meet you. B: ________.",
                            optionA: "Goodbye",
                            optionB: "Nice to meet you, too",
                            optionC: "I am fine",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "Are you in Room 4? - Yes, ________.",
                            optionA: "I'm",
                            optionB: "I am",
                            optionC: "you are",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: "What number comes after six? - ________.",
                            optionA: "seven",
                            optionB: "five",
                            optionC: "eight",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "1B: Music Round the World",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_1b_1_vocabulary.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **verb be (singular): he, she, it** and essential vocabulary for **countries (Spain, Japan, Brazil, UK, Mexico, Italy)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_1.16_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Reporter:** *\"Excuse me, where is this band from?\"*\n- **Tourist:** *\"They are from Spain. The singer is from Madrid.\"*\n- **Reporter:** *\"Is she famous in Europe?\"*\n- **Tourist:** *\"Yes, she is! Her music is popular all over the world.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Country** | noun | `/\u02c8k\u028cntri/` | A nation with its own government | *\"Which country are you from?\"* |\n| **Spain / Spanish** | noun / adj | `/spe\u026an/ - /\u02c8sp\u00e6n\u026a\u0283/` | Country in southwestern Europe / language or nationality | *\"Carlos is from Spain.\"* |\n| **Japan / Japanese** | noun / adj | `/d\u0292\u0259\u02c8p\u00e6n/ - /\u02ccd\u0292\u00e6p\u0259\u02c8ni\u02d0z/` | Island nation in East Asia | *\"Yuki is from Tokyo, Japan.\"* |\n| **Brazil / Brazilian** | noun / adj | `/br\u0259\u02c8z\u026al/ - /br\u0259\u02c8z\u026alj\u0259n/` | Largest country in South America | *\"Samba music is from Brazil.\"* |\n| **Where** | adverb | `/we\u0259(r)/` | Question word for asking about place or origin | *\"Where is she from?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: verb be (singular): he, she, it\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Where ________ Carlos from?",
                            optionA: "is",
                            optionB: "are",
                            optionC: "am",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Maria is from Mexico. ________ Mexican.",
                            optionA: "She",
                            optionB: "She's",
                            optionC: "He's",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "Is Rio in Argentina? - No, it ________.",
                            optionA: "isn't",
                            optionB: "is",
                            optionC: "not",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Tokyo is in ________.",
                            optionA: "Japan",
                            optionB: "Japanese",
                            optionC: "Spain",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Practical English 1: How Do You Spell It?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe1_1.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **The English alphabet, checking into a hotel** and essential vocabulary for **classroom language, spelling names, hotel reception**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_1.31_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Receptionist:** *\"Good afternoon. Welcome to the Grand Hotel.\"*\n- **Rob:** *\"Hello. I have a reservation. My name is Rob Walker.\"*\n- **Receptionist:** *\"How do you spell your surname, please?\"*\n- **Rob:** *\"W-A-L-K-E-R.\"*\n- **Receptionist:** *\"Thank you, Mr. Walker. You are in Room 302.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Spell** | verb | `/sp\u025bl/` | Write or name the letters that form a word | *\"How do you spell your first name?\"* |\n| **Surname / Last name** | noun | `/\u02c8s\u025c\u02d0ne\u026am/` | Family name inherited from parents | *\"My surname is Walker.\"* |\n| **Reservation** | noun | `/\u02ccr\u025bz\u0259\u02c8ve\u026a\u0283\u0259n/` | An arrangement to have a room or table kept for you | *\"I have a reservation for two nights.\"* |\n| **Room** | noun | `/ru\u02d0m/` | A partitioned space inside a building or hotel | *\"Your key is for room 204.\"* |\n| **Please** | adverb | `/pli\u02d0z/` | Polite word used when requesting something | *\"Spell that again, please.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: The English alphabet, checking into a hotel\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "How do you ________ your last name?",
                            optionA: "spell",
                            optionB: "spells",
                            optionC: "write down",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Good morning. I have a ________ for a single room.",
                            optionA: "reservation",
                            optionB: "book",
                            optionC: "table",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "What letter comes between J and L? - ________.",
                            optionA: "K",
                            optionB: "M",
                            optionC: "H",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Excuse me, can you ________ that, please?",
                            optionA: "repeat",
                            optionB: "listen",
                            optionC: "write",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 1: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 1 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 1.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_1.03_new.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of verb be (I, you, he, she, it), nationalities, greetings, and alphabet\n- **Key Vocabulary:** Unit 1 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Where ________ from?",
                            optionA: "is he",
                            optionB: "is",
                            optionC: "he is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Hello, ________ Maria.",
                            optionA: "I'm",
                            optionB: "I",
                            optionC: "am",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "A Is she a good student? B ________.",
                            optionA: "Yes, is",
                            optionB: "Yes, she is",
                            optionC: "Yes, is she",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: "A Are you from Italy? B ________.",
                            optionA: "No, I not",
                            optionB: "No, am I not",
                            optionC: "No, I'm not",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 4,
                          },
                          {
                            question: "What's ________ name?",
                            optionA: "you",
                            optionB: "you're",
                            optionC: "your",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 5,
                          },
                          {
                            question: "________ Amanda from the United States?",
                            optionA: "Am",
                            optionB: "Are",
                            optionC: "Is",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 6,
                          },
                          {
                            question: "Tom ________ from France.",
                            optionA: "not",
                            optionB: "aren't",
                            optionC: "isn't",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 7,
                          },
                          {
                            question: "Are ________ Yumiko?",
                            optionA: "he",
                            optionB: "you",
                            optionC: "she",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 8,
                          },
                          {
                            question: "Where ________ from?",
                            optionA: "you",
                            optionB: "you are",
                            optionC: "are you",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 9,
                          },
                          {
                            question: "Rio de Janeiro ________ in Brazil.",
                            optionA: "it's",
                            optionB: "is",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 2: Nationalities & Numbers 11\u2013100",
            order: 2,
            lessons: {
              create: [
                {
                  title: "2A: Are You on Holiday?",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **verb be (plural): we, you, they** and essential vocabulary for **nationalities, on holiday, on business**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_2.01_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **David:** *\"Hello! Are you on holiday here in London?\"*\n- **Elena:** *\"No, we aren't. We're here on business.\"*\n- **David:** *\"Where are you and your colleagues from?\"*\n- **Elena:** *\"We're from Rome. We're Italian.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Holiday** | noun | `/\u02c8h\u0252l\u026ade\u026a/` | Vacation or leisure trip away from work | *\"Are you on holiday in Spain?\"* |\n| **Business** | noun | `/\u02c8b\u026azn\u0259s/` | Work, commercial, or professional activity | *\"No, they are here on business.\"* |\n| **Colleague** | noun | `/\u02c8k\u0252li\u02d0\u0261/` | A person with whom one works | *\"These are my colleagues from Berlin.\"* |\n| **We / They** | pronoun | `/wi\u02d0/ - /\u00f0e\u026a/` | Plural subjective pronouns | *\"They are from Canada; we are from the UK.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: verb be (plural): we, you, they\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "We ________ from Germany. We're Austrian.",
                            optionA: "aren't",
                            optionB: "isn't",
                            optionC: "not",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Are they on holiday? - No, they ________.",
                            optionA: "aren't",
                            optionB: "are not",
                            optionC: "isn't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Marco and Paulo are from Italy. They are ________.",
                            optionA: "Italian",
                            optionB: "Italians",
                            optionC: "Italy",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "________ you and Sara students? - Yes, we are.",
                            optionA: "Are",
                            optionB: "Is",
                            optionC: "Am",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "2B: What Number Is the Bus?",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_2b_1_vocabulary.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Wh- and How questions with be (Who, What, Where, When, How)** and essential vocabulary for **numbers 11-100, phone numbers, bus lines**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_2.14_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Passenger:** *\"Excuse me, what number is the bus to Oxford Street?\"*\n- **Clerk:** *\"It's bus number twenty-four. It leaves from gate eleven.\"*\n- **Passenger:** *\"How much is the ticket?\"*\n- **Clerk:** *\"It's three pounds fifty.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Bus** | noun | `/b\u028cs/` | A large motor vehicle carrying passengers by road | *\"What number is the bus?\"* |\n| **Phone number** | noun | `/f\u0259\u028an \u02c8n\u028cmb\u0259/` | A sequence of numbers used to dial a telephone | *\"My phone number is 0794 332 108.\"* |\n| **Eleven to Twenty** | numbers | `/\u026a\u02c8l\u025bv.\u0259n/ - /\u02c8tw\u025bn.ti/` | 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 | *\"She is fifteen years old.\"* |\n| **Thirty to One Hundred** | numbers | `/\u02c8\u03b8\u025c\u02d0.ti/ - /w\u028cn \u02c8h\u028cn.dr\u0259d/` | 30, 40, 50, 60, 70, 80, 90, 100 | *\"The hotel is at 85 King's Road.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Wh- and How questions with be (Who, What, Where, When, How)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "________ is your phone number?",
                            optionA: "What",
                            optionB: "Who",
                            optionC: "Where",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "What number comes after nineteen? - ________.",
                            optionA: "twenty",
                            optionB: "twelve",
                            optionC: "thirty",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "________ is your teacher? - Mr. Henderson.",
                            optionA: "Who",
                            optionB: "What",
                            optionC: "How",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Sixty plus twenty is ________.",
                            optionA: "eighty",
                            optionB: "seventy",
                            optionC: "ninety",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Revise and Check 1 & 2: Can You Understand These People?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_rc_1and2_video.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of verb be (singular and plural), Wh- questions** and essential vocabulary for **Review of personal details, nationalities, numbers 0-100**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_2.25_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Interviewer:** *\"Hello. What's your name?\"*\n- **Passerby 1:** *\"My name is Richard. I'm from London.\"*\n- **Interviewer:** *\"Are you a student?\"*\n- **Passerby 1:** *\"No, I'm an architect.\"*\n- **Interviewer:** *\"Where are your friends from?\"*\n- **Passerby 1:** *\"They are from Australia.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Understand** | verb | `/\u02cc\u028cnd\u0259\u02c8st\u00e6nd/` | Perceive the intended meaning of words | *\"Can you understand native speakers?\"* |\n| **Interview** | noun | `/\u02c8\u026ant\u0259vju\u02d0/` | A meeting where questions are asked | *\"Listen to this street interview.\"* |\n| **City** | noun | `/\u02c8s\u026ati/` | A large town | *\"London is a very big city.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of verb be (singular and plural), Wh- questions\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Where ________ you from? - I'm from Tokyo.",
                            optionA: "are",
                            optionB: "is",
                            optionC: "am",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "________ are they? - They are my friends, Leo and Ana.",
                            optionA: "Who",
                            optionB: "What",
                            optionC: "Where",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Is your city quiet? - No, it ________.",
                            optionA: "isn't",
                            optionB: "aren't",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Thirty-five minus ten is ________.",
                            optionA: "twenty-five",
                            optionB: "fifteen",
                            optionC: "twenty",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 2: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 2 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 2.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_2.02_new.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of plural be, Wh- questions, numbers 11-100, and nationalities\n- **Key Vocabulary:** Unit 2 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "A How are you? B I'm ________, thanks.",
                            optionA: "fine",
                            optionB: "19",
                            optionC: "Brazilian",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "A ________ are they? B They're 18.",
                            optionA: "How",
                            optionB: "How old",
                            optionC: "Old how",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "They're from Italy. They ________ German.",
                            optionA: "aren't",
                            optionB: "isn't",
                            optionC: "not",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "A ________ the next class? B It's tomorrow at 10.00.",
                            optionA: "Where's",
                            optionB: "What's",
                            optionC: "When's",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 4,
                          },
                          {
                            question: "A ________ Miguel? B He's a friend from school.",
                            optionA: "Who is",
                            optionB: "How is",
                            optionC: "Who are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 5,
                          },
                          {
                            question: "A ________ your email? B It's matt35@themail.com.",
                            optionA: "Where's",
                            optionB: "What's",
                            optionC: "Who's",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 6,
                          },
                          {
                            question: "A Are Tom and Tim brothers? B Yes, ________.",
                            optionA: "are they",
                            optionB: "they aren't",
                            optionC: "they are",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 7,
                          },
                          {
                            question: "Where are they ________?",
                            optionA: "for",
                            optionB: "good",
                            optionC: "from",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 8,
                          },
                          {
                            question: "________ they in my class?",
                            optionA: "Is",
                            optionB: "Are",
                            optionC: "Am",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 9,
                          },
                          {
                            question: "A When's your birthday? B ________ Tuesday.",
                            optionA: "It's on",
                            optionB: "On it",
                            optionC: "It's to",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 3: Everyday Objects & Souvenirs",
            order: 3,
            lessons: {
              create: [
                {
                  title: "3A: Where's My Phone?",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_3a_1_pronunciation.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **singular and plural nouns; articles a / an; /s/ and /z/ endings** and essential vocabulary for **small things (keys, wallet, umbrella, laptop, glasses, charger)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_3.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Mark:** *\"Oh no! Where's my phone?\"*\n- **Lisa:** *\"Is it in your backpack?\"*\n- **Mark:** *\"No, it isn't. Here are my keys and my wallet, but no phone!\"*\n- **Lisa:** *\"Look on the table. It's next to your glasses.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Key / Keys** | noun | `/ki\u02d0/ - /ki\u02d0z/` | A small metal instrument used to open a lock | *\"Where are my house keys?\"* |\n| **Wallet** | noun | `/\u02c8w\u0252l\u026at/` | A pocket-sized flat folding case for money and cards | *\"My credit card is in my wallet.\"* |\n| **Umbrella** | noun | `/\u028cm\u02c8br\u025bl\u0259/` | A folding canopy used for protection against rain | *\"Take an umbrella, it is raining.\"* |\n| **Watch** | noun | `/w\u0252t\u0283/` | A small timepiece worn on the wrist | *\"This is an expensive watch.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: singular and plural nouns; articles a / an; /s/ and /z/ endings\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "It's ________ identity card.",
                            optionA: "an",
                            optionB: "a",
                            optionC: "the",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Where are my ________?",
                            optionA: "keys",
                            optionB: "key",
                            optionC: "keyes",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "She has ________ umbrella in her bag.",
                            optionA: "an",
                            optionB: "a",
                            optionC: "two",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Two ________ are on the desk.",
                            optionA: "watches",
                            optionB: "watchs",
                            optionC: "watch",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "3B: Souvenirs",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **this / that / these / those; sentence rhythm** and essential vocabulary for **souvenirs (postcard, mug, T-shirt, magnet, cap)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_3.09.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Shopkeeper:** *\"Can I help you?\"*\n- **Customer:** *\"Yes, how much is this London mug?\"*\n- **Shopkeeper:** *\"This mug is six pounds, and that T-shirt is fifteen pounds.\"*\n- **Customer:** *\"And how much are these postcards?\"*\n- **Shopkeeper:** *\"They are two pounds each.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **This / That** | demonstrative | `/\u00f0\u026as/ - /\u00f0\u00e6t/` | Referring to a singular object near / far | *\"This is my bag, and that is yours.\"* |\n| **These / Those** | demonstrative | `/\u00f0i\u02d0z/ - /\u00f0\u0259\u028az/` | Referring to plural objects near / far | *\"These postcards are beautiful.\"* |\n| **Mug** | noun | `/m\u028c\u0261/` | A large cup typically used for hot drinks | *\"A souvenir coffee mug.\"* |\n| **Price** | noun | `/pra\u026as/` | The amount of money expected in payment | *\"What is the price of that cap?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: this / that / these / those; sentence rhythm\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "How much is ________ T-shirt over there?",
                            optionA: "that",
                            optionB: "this",
                            optionC: "these",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "________ are my photos from New York.",
                            optionA: "These",
                            optionB: "This",
                            optionC: "That",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "How much ________ those sunglasses?",
                            optionA: "are",
                            optionB: "is",
                            optionC: "am",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Is ________ your wallet here on the table?",
                            optionA: "this",
                            optionB: "that",
                            optionC: "those",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Practical English 2: An Orange Juice, Please",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe2_1.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Understanding prices, ordering food and drinks in a caf\u00e9** and essential vocabulary for **coffee, tea, orange juice, mineral water, sandwich, pounds and pence**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_3.17_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Barista:** *\"Hi, can I get you anything?\"*\n- **Jenny:** *\"Yes, a cheese sandwich and an orange juice, please.\"*\n- **Barista:** *\"Anything else?\"*\n- **Jenny:** *\"No thanks. How much is that?\"*\n- **Barista:** *\"That's seven pounds forty, please.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Orange juice** | noun | `/\u02c8\u0252r\u026and\u0292 d\u0292u\u02d0s/` | Drink made from squeezed oranges | *\"An orange juice, please.\"* |\n| **Sandwich** | noun | `/\u02c8s\u00e6nw\u026at\u0283/` | Food consisting of filling between bread | *\"A chicken salad sandwich.\"* |\n| **How much is that?** | phrase | `/ha\u028a m\u028ct\u0283 \u026az \u00f0\u00e6t/` | Asking for the total bill or cost | *\"How much is that in euros?\"* |\n| **Pound / Penny** | noun | `/pa\u028and/ - /\u02c8p\u025bni/` | British currency units (\u00a3 and p) | *\"Ten pounds and fifty pence.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Understanding prices, ordering food and drinks in a caf\u00e9\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "A: Can I help you? B: An espresso, ________.",
                            optionA: "please",
                            optionB: "thank you",
                            optionC: "excuse me",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "How much ________ the sandwiches?",
                            optionA: "are",
                            optionB: "is",
                            optionC: "cost",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "That's five ________ and twenty pence.",
                            optionA: "pounds",
                            optionB: "pound",
                            optionC: "moneys",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Here's your change. - ________.",
                            optionA: "Thank you",
                            optionB: "Please",
                            optionC: "You're welcome",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 3: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 3 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 3.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_3.02_new.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of a/an, singular/plural nouns, this/that/these/those, prices\n- **Key Vocabulary:** Unit 3 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "It's ________ purse.",
                            optionA: "these",
                            optionB: "a",
                            optionC: "an",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: "A What are those? B They're ________.",
                            optionA: "dictionary",
                            optionB: "dictionaries",
                            optionC: "dictionarys",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "It's ________ ID card.",
                            optionA: "a",
                            optionB: "an",
                            optionC: "two",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: "Those are ________.",
                            optionA: "T-shirt",
                            optionB: "a T-shirt",
                            optionC: "T-shirts",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 4,
                          },
                          {
                            question: "________ a pen.",
                            optionA: "These are",
                            optionB: "It's",
                            optionC: "This are",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 5,
                          },
                          {
                            question: "I have two ________ in my bag.",
                            optionA: "keyes",
                            optionB: "key",
                            optionC: "keys",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 6,
                          },
                          {
                            question: "How much are these ________?",
                            optionA: "watchs",
                            optionB: "watches",
                            optionC: "watch",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 7,
                          },
                          {
                            question: "A What is that? B It's ________ purse.",
                            optionA: "a",
                            optionB: "an",
                            optionC: "the",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 8,
                          },
                          {
                            question: "Those ________ nice sunglasses.",
                            optionA: "is",
                            optionB: "am",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 9,
                          },
                          {
                            question: "Who are ________ boys over there?",
                            optionA: "that",
                            optionB: "these",
                            optionC: "those",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 4: Family, Friends & Descriptions",
            order: 4,
            lessons: {
              create: [
                {
                  title: "4A: This Is My Family",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_4a_1_grammar.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **possessive adjectives (my, your, his, her, our, their); possessive 's** and essential vocabulary for **family (mother, father, brother, sister, husband, wife, daughter, son)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_4.01_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Sarah:** *\"Who is this in the photo?\"*\n- **Paul:** *\"That's my sister, Amy. And that's her husband, David.\"*\n- **Sarah:** *\"Do they have children?\"*\n- **Paul:** *\"Yes, they have a daughter. Her name is Emily.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Mother / Father** | noun | `/\u02c8m\u028c\u00f0\u0259/ - /\u02c8f\u0251\u02d0\u00f0\u0259/` | Female and male parents | *\"My mother is a doctor.\"* |\n| **Brother / Sister** | noun | `/\u02c8br\u028c\u00f0\u0259/ - /\u02c8s\u026ast\u0259/` | Male and female siblings | *\"His brother lives in Sydney.\"* |\n| **Husband / Wife** | noun | `/\u02c8h\u028czb\u0259nd/ - /wa\u026af/` | A married man or woman | *\"Her husband is French.\"* |\n| **Possessive 's** | grammar | `/s/ or /z/` | Indicates ownership or family relation | *\"This is Sarah's car.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: possessive adjectives (my, your, his, her, our, their); possessive 's\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "This is John and ________ wife, Mary.",
                            optionA: "his",
                            optionB: "her",
                            optionC: "their",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "That is ________ house.",
                            optionA: "Emma's",
                            optionB: "Emma",
                            optionC: "Emmas",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "We live in Madrid. ________ flat is very modern.",
                            optionA: "Our",
                            optionB: "Their",
                            optionC: "We",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Who is David? - He is ________ brother.",
                            optionA: "Sarah's",
                            optionB: "Sarah",
                            optionC: "Sarahs'",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "4B: The Right Car for Me",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_4b_1_grammar.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **adjectives: position before nouns, no plural form** and essential vocabulary for **colours and common adjectives (big, small, fast, slow, expensive, cheap, old, new)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_4.12_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Car Dealer:** *\"Which car do you prefer, the blue one or the red one?\"*\n- **Customer:** *\"The red car is very fast, but it's too expensive!\"*\n- **Car Dealer:** *\"The blue car is smaller, economical, and very comfortable.\"*\n- **Customer:** *\"Perfect. That is the right car for me.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Expensive / Cheap** | adj | `/\u026ak\u02c8sp\u025bns\u026av/ - /t\u0283i\u02d0p/` | Costing a lot of money vs low in cost | *\"That sports car is very expensive.\"* |\n| **Fast / Slow** | adj | `/f\u0251\u02d0st/ - /sl\u0259\u028a/` | Moving at high speed vs low speed | *\"It is a fast train.\"* |\n| **Old / New** | adj | `/\u0259\u028ald/ - /nju\u02d0/` | Having lived/existed long vs newly made | *\"They live in a beautiful old house.\"* |\n| **Colours** | noun/adj | `/\u02c8k\u028cl\u0259z/` | Red, blue, green, black, white, silver, yellow | *\"She drives a red car.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: adjectives: position before nouns, no plural form\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "They have two ________ cars.",
                            optionA: "fast",
                            optionB: "fasts",
                            optionC: "fastes",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "It's a ________ car.",
                            optionA: "red Italian",
                            optionB: "Italian red",
                            optionC: "reds Italian",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "This watch isn't expensive; it's very ________.",
                            optionA: "cheap",
                            optionB: "big",
                            optionC: "fast",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Her house is ________.",
                            optionA: "very big",
                            optionB: "very bigs",
                            optionC: "a big",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Revise and Check 3 & 4: Can You Understand These People?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_rc_3and4_video.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of singular/plural, demonstratives, family, and adjectives** and essential vocabulary for **Personal items, family descriptions, everyday conversations**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_4.21_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Interviewer:** *\"Tell me about your family.\"*\n- **Speaker:** *\"I have a big family. I have three brothers and one sister.\"*\n- **Interviewer:** *\"What kind of car do you have?\"*\n- **Speaker:** *\"I have an old blue estate car. It's slow but reliable.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Understand** | verb | `/\u02cc\u028cnd\u0259\u02c8st\u00e6nd/` | Grasp the meaning of street responses | *\"Listen to native speakers describing possessions.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of singular/plural, demonstratives, family, and adjectives\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Is that ________ phone on the sofa?",
                            optionA: "your",
                            optionB: "you",
                            optionC: "yours",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "They are ________ students.",
                            optionA: "good",
                            optionB: "goods",
                            optionC: "a good",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "My ________ car is outside.",
                            optionA: "brother's",
                            optionB: "brother",
                            optionC: "brothers",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "How many sisters do you have? - I have ________ sister.",
                            optionA: "one",
                            optionB: "a two",
                            optionC: "an",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 4: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 4 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 4.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_4.02.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of possessives, family relationships, adjectives and colours\n- **Key Vocabulary:** Unit 4 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "A What's ________ name? B I'm Jia. I'm from China.",
                            optionA: "her",
                            optionB: "your",
                            optionC: "their",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: "Where are ________ bags?",
                            optionA: "our",
                            optionB: "ours",
                            optionC: "we",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Six hundred pounds? That ________.",
                            optionA: "an expensive camera is",
                            optionB: "is a camera expensive",
                            optionC: "is an expensive camera",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 3,
                          },
                          {
                            question: "Is that ________ car?",
                            optionA: "Carlos",
                            optionB: "Carloses",
                            optionC: "Carlos's",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 4,
                          },
                          {
                            question: "A Are those your friends? B No. ________ friends aren't here today.",
                            optionA: "Her",
                            optionB: "Their",
                            optionC: "Our",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 5,
                          },
                          {
                            question: "A Is your husband here? B Yes. ________ husband is over there.",
                            optionA: "Our",
                            optionB: "Your",
                            optionC: "My",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 6,
                          },
                          {
                            question: "These books are very ________.",
                            optionA: "old",
                            optionB: "fast",
                            optionC: "slow",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 7,
                          },
                          {
                            question: "This is our ________ house.",
                            optionA: "parents",
                            optionB: "parent's",
                            optionC: "parents'",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 8,
                          },
                          {
                            question: "Chantelle and Veronique are French. ________ husbands are Italian.",
                            optionA: "Their",
                            optionB: "They",
                            optionC: "Her",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 9,
                          },
                          {
                            question: "Here are ________ sandwiches: one cheese, and one tuna.",
                            optionA: "your",
                            optionB: "yours",
                            optionC: "your's",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 5: Food, Daily Life & Telling Time",
            order: 5,
            lessons: {
              create: [
                {
                  title: "5A: My Favourite Meal",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_5a_1_vocabulary.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present simple (+) and (-): I, you, we, they** and essential vocabulary for **food and drink (breakfast, lunch, dinner, fruit, vegetables, meat, bread, coffee)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_5.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Chef:** *\"What do you eat for breakfast in your country?\"*\n- **Guest:** *\"I usually have coffee, toast, and fruit. I don't eat meat in the morning.\"*\n- **Chef:** *\"Do you like fresh orange juice?\"*\n- **Guest:** *\"Yes, I love it! It's delicious.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Breakfast** | noun | `/\u02c8br\u025bkf\u0259st/` | The first meal of the day | *\"I have breakfast at seven o'clock.\"* |\n| **Lunch** | noun | `/l\u028cnt\u0283/` | A meal eaten in the middle of the day | *\"We eat lunch in the cafeteria.\"* |\n| **Dinner** | noun | `/\u02c8d\u026an\u0259/` | The main meal of the day, usually in the evening | *\"Dinner is ready at eight.\"* |\n| **Vegetables** | noun | `/\u02c8v\u025bd\u0292t\u0259blz/` | Plants used as food, such as carrots, peas, potatoes | *\"Eat plenty of green vegetables.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present simple (+) and (-): I, you, we, they\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "I ________ coffee in the morning.",
                            optionA: "drink",
                            optionB: "drinks",
                            optionC: "drinking",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "We ________ eat fast food during the week.",
                            optionA: "don't",
                            optionB: "doesn't",
                            optionC: "not",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "They ________ cereal and milk for breakfast.",
                            optionA: "have",
                            optionB: "has",
                            optionC: "having",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "I don't ________ sugar in my tea.",
                            optionA: "like",
                            optionB: "likes",
                            optionC: "liking",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "5B: A Very Long Flight",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present simple (?): I, you, we, they; short answers** and essential vocabulary for **common verb phrases (read, watch, listen, sleep, live, work)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_5.12_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Passenger A:** *\"Excuse me, do you speak English?\"*\n- **Passenger B:** *\"Yes, I do. Are you on your way to Sydney?\"*\n- **Passenger A:** *\"Yes, it's a very long flight! Do you fly often?\"*\n- **Passenger B:** *\"No, I don't. I usually read books or sleep.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Flight** | noun | `/fla\u026at/` | A journey made by flying in an aircraft | *\"It's a ten-hour flight.\"* |\n| **Read** | verb | `/ri\u02d0d/` | Look at and comprehend written text | *\"I read novels on the plane.\"* |\n| **Watch** | verb | `/w\u0252t\u0283/` | Look at something attentively | *\"We watch movies together.\"* |\n| **Do you...?** | question | `/du\u02d0 ju\u02d0/` | Auxiliary verb for present simple questions | *\"Do you live in Madrid?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present simple (?): I, you, we, they; short answers\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "________ you speak German? - Yes, I do.",
                            optionA: "Do",
                            optionB: "Are",
                            optionC: "Does",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Do they work in an office? - No, they ________.",
                            optionA: "don't",
                            optionB: "doesn't",
                            optionC: "aren't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Where ________ you live?",
                            optionA: "do",
                            optionB: "are",
                            optionC: "does",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "What time do we ________ in London?",
                            optionA: "arrive",
                            optionB: "arrives",
                            optionC: "arriving",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Practical English 3: What Time Is It?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe3_1.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Telling the time (o'clock, half past, quarter to/past)** and essential vocabulary for **the time, saying how you feel (tired, hungry, thirsty, late)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_5.22_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Rob:** *\"Hi Jenny! I'm really sorry I'm late.\"*\n- **Jenny:** *\"That's okay Rob. What time is it?\"*\n- **Rob:** *\"It's quarter past eight. Traffic was terrible.\"*\n- **Jenny:** *\"No problem. Are you hungry? Let's get something to eat.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **O'clock** | adverb | `/\u0259\u02c8kl\u0252k/` | Used to specify the exact hour | *\"It is nine o'clock.\"* |\n| **Half past** | phrase | `/h\u0251\u02d0f p\u0251\u02d0st/` | Thirty minutes past the hour | *\"It's half past seven (7:30).\"* |\n| **Quarter past / to** | phrase | `/\u02c8kw\u0254\u02d0t\u0259/` | 15 minutes after or before the hour | *\"Quarter to six (5:45).\"* |\n| **Hungry / Thirsty** | adjective | `/\u02c8h\u028c\u014b\u0261ri/ - /\u02c8\u03b8\u025c\u02d0sti/` | Needing food / needing a drink | *\"I'm hungry, let's order lunch.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Telling the time (o'clock, half past, quarter to/past)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "What ________ is it? - It's half past four.",
                            optionA: "time",
                            optionB: "clock",
                            optionC: "hour",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "It's 7:15. In English: It's quarter ________ seven.",
                            optionA: "past",
                            optionB: "to",
                            optionC: "after",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "I didn't eat lunch. I am very ________.",
                            optionA: "hungry",
                            optionB: "thirsty",
                            optionC: "tired",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "I'm really sorry I'm ________. - That's fine.",
                            optionA: "late",
                            optionB: "later",
                            optionC: "lating",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 5: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 5 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 5.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_5.02_NEW_03.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of present simple (I, you, we, they), food vocab, and telling the time\n- **Key Vocabulary:** Unit 5 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "A Do you drink coffee in the morning? B Yes, ________.",
                            optionA: "do I",
                            optionB: "I am",
                            optionC: "I do",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 1,
                          },
                          {
                            question: "We ________ TV in the morning.",
                            optionA: "don't watch",
                            optionB: "are watch",
                            optionC: "not watch",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "________ you live in a house?",
                            optionA: "Are",
                            optionB: "Do",
                            optionC: "Have",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: "Marco and Giulia ________ Italian.",
                            optionA: "speak",
                            optionB: "speaks",
                            optionC: "is speak",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                          {
                            question: "I ________ newspapers.",
                            optionA: "don't read",
                            optionB: "read not",
                            optionC: "\u02bcm not read",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 5,
                          },
                          {
                            question: "I ________ chocolate.",
                            optionA: "like",
                            optionB: "likes",
                            optionC: "are like",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 6,
                          },
                          {
                            question: "A Do people in Germany have a big breakfast? B No, they ________.",
                            optionA: "not",
                            optionB: "don't",
                            optionC: "do",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 7,
                          },
                          {
                            question: "________ work at weekends?",
                            optionA: "Do",
                            optionB: "Do you",
                            optionC: "You",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 8,
                          },
                          {
                            question: "We ________ coffee.",
                            optionA: "don't drink",
                            optionB: "not drink",
                            optionC: "don't drinks",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 9,
                          },
                          {
                            question: "They ________ to the radio in the morning.",
                            optionA: "are listen",
                            optionB: "listen",
                            optionC: "listens",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 6: Jobs, Daily Routines & Habits",
            order: 6,
            lessons: {
              create: [
                {
                  title: "6A: Old Friends?",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_6a_1_grammar.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present simple: he, she, it (+, -, ?); third person -es** and essential vocabulary for **jobs and places of work (doctor, teacher, lawyer, nurse, shop assistant, office, hospital)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_6.01_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Helen:** *\"Do you remember Jack from university?\"*\n- **George:** *\"Yes! What does he do now?\"*\n- **Helen:** *\"He works as a doctor in a big London hospital. He loves his job.\"*\n- **George:** *\"Does his wife work there too?\"*\n- **Helen:** *\"No, she doesn't. She teaches music at a school.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Doctor / Nurse** | noun | `/\u02c8d\u0252kt\u0259/ - /n\u025c\u02d0s/` | Healthcare professionals treating patients | *\"She works as a doctor in hospital.\"* |\n| **Teacher** | noun | `/\u02c8ti\u02d0t\u0283\u0259/` | A person who educates students | *\"He teaches French at university.\"* |\n| **Hospital / Office** | noun | `/\u02c8h\u0252sp\u026atl/ - /\u02c8\u0252f\u026as/` | Places where healthcare or desk work takes place | *\"My brother works in an office.\"* |\n| **Third person -s/-es** | grammar | `/s/, /z/, /\u026az/` | Verbs take -s in 3rd person singular | *\"He works, she watches, it rains.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present simple: he, she, it (+, -, ?); third person -es\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "He ________ in a bank.",
                            optionA: "works",
                            optionB: "work",
                            optionC: "working",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "She ________ like tea; she prefers coffee.",
                            optionA: "doesn't",
                            optionB: "don't",
                            optionC: "isn't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "What ________ your sister do? - She is a dentist.",
                            optionA: "does",
                            optionB: "do",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "A doctor works in a ________.",
                            optionA: "hospital",
                            optionB: "school",
                            optionC: "shop",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "6B: Good Morning, Goodnight",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_6b_1_listening.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **adverbs of frequency: always, usually, often, sometimes, never** and essential vocabulary for **a typical day (wake up, get up, take a shower, leave home, go to bed)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_6.09.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Interviewer:** *\"Tell us about a typical day in New York.\"*\n- **Guide:** *\"I always wake up early at 6:00. I have breakfast and go to Central Park.\"*\n- **Interviewer:** *\"Do you usually finish late?\"*\n- **Guide:** *\"Yes, I often finish tours at 7:00 PM, but I never work on Sundays.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Always** | adverb | `/\u02c8\u0254\u02d0lwe\u026az/` | 100% of the time | *\"I always brush my teeth before bed.\"* |\n| **Usually** | adverb | `/\u02c8ju\u02d0\u0292u\u0259li/` | About 80% of the time; normally | *\"We usually eat dinner at home.\"* |\n| **Sometimes** | adverb | `/\u02c8s\u028cmta\u026amz/` | About 50% of the time; occasionally | *\"I sometimes drink herbal tea.\"* |\n| **Never** | adverb | `/\u02c8n\u025bv\u0259/` | 0% of the time; at no time | *\"He never goes to bed after midnight.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: adverbs of frequency: always, usually, often, sometimes, never\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "She ________ arrives on time.",
                            optionA: "always",
                            optionB: "always is",
                            optionC: "is always to",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "I ________ eat breakfast before going to school.",
                            optionA: "usually",
                            optionB: "am usually",
                            optionC: "usually to",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "He ________ late for his meetings.",
                            optionA: "is never",
                            optionB: "never is",
                            optionC: "never",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "What time do you ________ in the morning?",
                            optionA: "wake up",
                            optionB: "wakes up",
                            optionC: "waking up",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Revise and Check 5 & 6: Can You Understand These People?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_rc_5and6_video.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of present simple all persons (+, -, ?), daily habits, telling time** and essential vocabulary for **Jobs, routines, food & drink review**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_6.17_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Interviewer:** *\"What do you do?\"*\n- **Person 1:** *\"I'm a software developer. I work from home.\"*\n- **Interviewer:** *\"What time do you start in the morning?\"*\n- **Person 1:** *\"I usually start at 8:30 AM.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Routine** | noun | `/ru\u02d0\u02c8ti\u02d0n/` | A sequence of actions regularly followed | *\"Explain your weekly routine.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of present simple all persons (+, -, ?), daily habits, telling time\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Does he ________ in London? - Yes, he does.",
                            optionA: "live",
                            optionB: "lives",
                            optionC: "living",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "She ________ TV in the evening.",
                            optionA: "watches",
                            optionB: "watch",
                            optionC: "watchs",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "We never ________ tennis on weekdays.",
                            optionA: "play",
                            optionB: "plays",
                            optionC: "playing",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "What time ________ your train leave?",
                            optionA: "does",
                            optionB: "do",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 6: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 6 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 6.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_6.02_NEW_02.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of present simple 3rd person, adverbs of frequency, and jobs\n- **Key Vocabulary:** Unit 6 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "A Does Maria live in a flat? B No, she ________.",
                            optionA: "not",
                            optionB: "don't",
                            optionC: "doesn't",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 1,
                          },
                          {
                            question: "I ________ drink tea.",
                            optionA: "don't never",
                            optionB: "never",
                            optionC: "not",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "What ________ do you go to bed?",
                            optionA: "time",
                            optionB: "is time",
                            optionC: "is the time",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "________ Rita live?",
                            optionA: "Where does",
                            optionB: "Where is",
                            optionC: "Where do",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                          {
                            question: "Huang ________ work in an office.",
                            optionA: "don't usually",
                            optionB: "doesn't usually",
                            optionC: "usually",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 5,
                          },
                          {
                            question: "________ coffee?",
                            optionA: "Does he drinks",
                            optionB: "Is he drink",
                            optionC: "Does he drink",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 6,
                          },
                          {
                            question: "My father ________ newspapers.",
                            optionA: "don't read",
                            optionB: "reads not",
                            optionC: "doesn't read",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 7,
                          },
                          {
                            question: "A Do you work in a factory? B Yes, ________.",
                            optionA: "do I",
                            optionB: "I am",
                            optionC: "I do",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 8,
                          },
                          {
                            question: "My sister ________ TV in the evening.",
                            optionA: "watch",
                            optionB: "watchs",
                            optionC: "watches",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 9,
                          },
                          {
                            question: "Ravi ________ eats eggs for breakfast.",
                            optionA: "sometime",
                            optionB: "sometimes",
                            optionC: "some",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 7: Free Time, Films & Dates",
            order: 7,
            lessons: {
              create: [
                {
                  title: "7A: At the Weekend",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_7a_1_vocabulary.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **word order in questions: be and present simple (ASI / QUASI)** and essential vocabulary for **common verb phrases: free time (play guitar, go out with friends, listen to music)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_7.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Sophie:** *\"What do you do at the weekend, James?\"*\n- **James:** *\"I usually play football with friends on Saturday morning.\"*\n- **Sophie:** *\"Do you go out on Saturday night?\"*\n- **James:** *\"Yes, we often go to a restaurant or the cinema.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Weekend** | noun | `/\u02ccwi\u02d0k\u02c8\u025bnd/` | Saturday and Sunday | *\"Have a wonderful weekend!\"* |\n| **Go out** | verb phrase | `/\u0261\u0259\u028a a\u028at/` | Leave home to go to a social event | *\"Do you go out often?\"* |\n| **Cinema** | noun | `/\u02c8s\u026an\u026am\u0259/` | A theatre where films are shown | *\"Let's go to the cinema tonight.\"* |\n| **QUASI** | grammar rule | `Q - Aux - S - Inf` | Question word + Auxiliary + Subject + Infinitive | *\"Where do you work?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: word order in questions: be and present simple (ASI / QUASI)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "________ do you do on Saturday nights?",
                            optionA: "What",
                            optionB: "Who",
                            optionC: "Where",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Where ________ your parents live?",
                            optionA: "do",
                            optionB: "does",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Do you ________ to music when you study?",
                            optionA: "listen",
                            optionB: "listens",
                            optionC: "listening",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "What time ________ the film start?",
                            optionA: "does",
                            optionB: "do",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "7B: Lights, Camera, Action!",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **imperatives; object pronouns: me, you, him, her, it, us, them** and essential vocabulary for **kinds of film (action, comedy, drama, sci-fi, horror, animated)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_7.12_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Director:** *\"Quiet please! Don't look at the camera. Look at him!\"*\n- **Actor:** *\"Can you hear me clearly?\"*\n- **Director:** *\"Yes, perfect! Action! Speak loudly and clearly.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Imperative** | grammar | `Base verb form` | Used for direct commands and instructions | *\"Listen to me! Don't shout.\"* |\n| **Object pronouns** | grammar | `me, him, her, us, them` | Receive the action of the verb | *\"Call him tomorrow; I love her.\"* |\n| **Comedy** | noun | `/\u02c8k\u0252m\u026adi/` | A film or play intended to make people laugh | *\"I love watching British comedies.\"* |\n| **Action film** | noun | `/\u02c8\u00e6k\u0283\u0259n f\u026alm/` | A film with exciting stunts and fights | *\"James Bond films are action films.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: imperatives; object pronouns: me, you, him, her, it, us, them\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Please listen to ________ carefully.",
                            optionA: "me",
                            optionB: "I",
                            optionC: "my",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "________ talk during the movie!",
                            optionA: "Don't",
                            optionB: "No",
                            optionC: "Not",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "I see Maria every day, but I never speak to ________.",
                            optionA: "her",
                            optionB: "she",
                            optionC: "hers",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Where are my keys? - I can't find ________.",
                            optionA: "them",
                            optionB: "they",
                            optionC: "their",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Practical English 4: What\u2019s the Date?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe4_1.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Saying the date, ordinal numbers (1st - 31st), talking on the phone** and essential vocabulary for **months of the year (January - December), telephone expressions**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_7.21_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Jenny:** *\"Hello, Jenny Zielinski speaking.\"*\n- **Rob:** *\"Hi Jenny, it's Rob. What's the date today?\"*\n- **Jenny:** *\"It's the second of November. Why?\"*\n- **Rob:** *\"Because it's my birthday tomorrow, on the third of November!\"*\n- **Jenny:** *\"Happy early birthday, Rob!\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Date** | noun | `/de\u026at/` | Day of the month or year | *\"What's the date today?\"* |\n| **Ordinal numbers** | numbers | `first, second, third, fourth...` | Express order or date | *\"The 1st of May.\"* |\n| **Months** | noun | `January to December` | Twelve calendar divisions | *\"My birthday is in August.\"* |\n| **On the phone** | phrase | `Hello, this is... / speaking` | Standard English telephone phrases | *\"This is Rob speaking.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Saying the date, ordinal numbers (1st - 31st), talking on the phone\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "What's the ________ today? - It's the 15th of June.",
                            optionA: "date",
                            optionB: "day",
                            optionC: "time",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "His birthday is on the ________ of March.",
                            optionA: "twenty-first",
                            optionB: "twenty-one",
                            optionC: "twenty",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "What month comes after July? - ________.",
                            optionA: "August",
                            optionB: "September",
                            optionC: "June",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Hello, this is Sarah ________.",
                            optionA: "speaking",
                            optionB: "talking",
                            optionC: "speaks",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 7: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 7 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 7.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_7.02.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of question word order, object pronouns, imperatives, and dates\n- **Key Vocabulary:** Unit 7 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "________ does your brother start university?",
                            optionA: "What",
                            optionB: "Who",
                            optionC: "When",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 1,
                          },
                          {
                            question: "Ask ________. She knows the answer!",
                            optionA: "her",
                            optionB: "it",
                            optionC: "him",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "________ do you live now?",
                            optionA: "When",
                            optionB: "Why",
                            optionC: "Where",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 3,
                          },
                          {
                            question: "________ you late?",
                            optionA: "Do",
                            optionB: "Why",
                            optionC: "Why are",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 4,
                          },
                          {
                            question: "________ down, please. I want to talk to you.",
                            optionA: "Sit",
                            optionB: "Sitting",
                            optionC: "To sit",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 5,
                          },
                          {
                            question: "________ kind of films do you like?",
                            optionA: "How",
                            optionB: "What",
                            optionC: "Who",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 6,
                          },
                          {
                            question: "How old ________ your girlfriend?",
                            optionA: "is",
                            optionB: "are",
                            optionC: "does",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 7,
                          },
                          {
                            question: "________ you meet your friends on Saturdays?",
                            optionA: "Are",
                            optionB: "Is",
                            optionC: "Do",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 8,
                          },
                          {
                            question: "A ________ do you usually have dinner with? B My children.",
                            optionA: "How",
                            optionB: "Who",
                            optionC: "When",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 9,
                          },
                          {
                            question: "________ live in Mexico City.",
                            optionA: "They're",
                            optionB: "Us",
                            optionC: "We",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 8: Abilities, Shopping & Preferences",
            order: 8,
            lessons: {
              create: [
                {
                  title: "8A: Can I Park Here?",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **can / can't: permission and ability; sentence rhythm** and essential vocabulary for **signs and more verb phrases (pay by card, smoke here, turn right, take photos)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_8.01_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Driver:** *\"Excuse me, can I park here?\"*\n- **Traffic Warden:** *\"No, you can't park here between 8:00 AM and 6:00 PM.\"*\n- **Driver:** *\"Where can I park?\"*\n- **Traffic Warden:** *\"You can park in the pay-and-display car park down the street.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Can** | modal verb | `/k\u00e6n/ - /k\u0259n/` | Expressing ability or permission | *\"You can pay with a credit card.\"* |\n| **Can't** | modal verb | `/k\u0251\u02d0nt/` | Expressing inability or prohibition | *\"You can't smoke inside the building.\"* |\n| **Park** | verb | `/p\u0251\u02d0k/` | Bring a vehicle that one is driving to a halt | *\"Can we park here for free?\"* |\n| **Sign** | noun | `/sa\u026an/` | A notice displaying a warning or regulation | *\"Look at the 'No Parking' sign.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: can / can't: permission and ability; sentence rhythm\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Can I ________ by credit card?",
                            optionA: "pay",
                            optionB: "paying",
                            optionC: "pays",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "You ________ use mobile phones in the exam room.",
                            optionA: "can't",
                            optionB: "don't",
                            optionC: "aren't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Can she swim? - Yes, she ________.",
                            optionA: "can",
                            optionB: "is",
                            optionC: "does",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Where ________ we buy tickets?",
                            optionA: "can",
                            optionB: "do can",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "8B: I Love Shopping",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_8b_1_vocabulary_1.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **like / love / don't mind / hate + verb + -ing** and essential vocabulary for **shopping and leisure activities (cooking, dancing, swimming, reading, buying clothes)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_8.08_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Emma:** *\"Do you like shopping for clothes?\"*\n- **Liam:** *\"No, I hate shopping in busy malls! I prefer buying things online.\"*\n- **Emma:** *\"I love shopping with my friends on Saturdays. We always have fun.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Love** | verb | `/l\u028cv/` | Have a great liking or affection for | *\"I love cooking Italian pasta.\"* |\n| **Like** | verb | `/la\u026ak/` | Find agreeable or enjoyable | *\"She likes reading on the balcony.\"* |\n| **Don't mind** | phrase | `/d\u0259\u028ant ma\u026and/` | Feel neutral towards an activity | *\"I don't mind doing the dishes.\"* |\n| **Hate** | verb | `/he\u026at/` | Dislike intensely | *\"They hate waiting in long queues.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: like / love / don't mind / hate + verb + -ing\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "I love ________ in the ocean.",
                            optionA: "swimming",
                            optionB: "swim",
                            optionC: "swims",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "She hates ________ up early on cold mornings.",
                            optionA: "getting",
                            optionB: "get",
                            optionC: "gets",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Do you like ________ for clothes?",
                            optionA: "shopping",
                            optionB: "shop",
                            optionC: "shops",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "He doesn't mind ________ dinner.",
                            optionA: "cooking",
                            optionB: "cook",
                            optionC: "cooks",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Revise and Check 7 & 8: Can You Understand These People?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_rc_7and8_video.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of can/can't, like + -ing, question word order, imperatives** and essential vocabulary for **Hobbies, abilities, shopping preferences**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_8.15_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Interviewer:** *\"Can you speak any other foreign languages?\"*\n- **Person 1:** *\"Yes, I can speak Spanish and a little French.\"*\n- **Interviewer:** *\"What do you like doing in your free time?\"*\n- **Person 1:** *\"I love cycling and playing the acoustic guitar.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Ability** | noun | `/\u0259\u02c8b\u026al\u026ati/` | Talent or capacity to do something | *\"Describe your personal abilities.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of can/can't, like + -ing, question word order, imperatives\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Can they speak Italian? - No, they ________.",
                            optionA: "can't",
                            optionB: "don't",
                            optionC: "aren't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "I enjoy ________ books in English.",
                            optionA: "reading",
                            optionB: "read",
                            optionC: "reads",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Don't ________ the door, please.",
                            optionA: "close",
                            optionB: "closing",
                            optionC: "closes",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Can you play tennis? - Yes, I ________.",
                            optionA: "can",
                            optionB: "do",
                            optionC: "am",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 8: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 8 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 8.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_8.02_NEW_3.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of can/can't, like/love/hate + -ing, and shopping vocabulary\n- **Key Vocabulary:** Unit 8 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Where ________ I park my car?",
                            optionA: "can",
                            optionB: "is",
                            optionC: "can't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Stephan loves ________ at the weekend.",
                            optionA: "cycle",
                            optionB: "cycling",
                            optionC: "cycleing",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "A Can I use my mobile phone here? B No, ________. I'm sorry.",
                            optionA: "you can't use",
                            optionB: "you can't",
                            optionC: "you don't",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: "Marta doesn't like ________ TV.",
                            optionA: "watches",
                            optionB: "watching",
                            optionC: "watch",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 4,
                          },
                          {
                            question: "My brother doesn't like ________ out.",
                            optionA: "go eat",
                            optionB: "eat",
                            optionC: "eating",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 5,
                          },
                          {
                            question: "You ________ football in the park.",
                            optionA: "can't play",
                            optionB: "can't to play",
                            optionC: "can't playing",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 6,
                          },
                          {
                            question: "Do you ________?",
                            optionA: "driving like",
                            optionB: "like drive",
                            optionC: "like driving",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 7,
                          },
                          {
                            question: "I'm sorry. You ________ take photos here.",
                            optionA: "can't",
                            optionB: "don't can",
                            optionC: "can't to",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 8,
                          },
                          {
                            question: "Do you like ________?",
                            optionA: "shop",
                            optionB: "shoping",
                            optionC: "shopping",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 9,
                          },
                          {
                            question: "At work, I ________ at 3.30 on Fridays.",
                            optionA: "can home go",
                            optionB: "go home can",
                            optionC: "can go home",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 9: Travelling, Clothes & Present Continuous",
            order: 9,
            lessons: {
              create: [
                {
                  title: "9A: What Are They Really Doing?",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_9a_1_pronunciation.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present continuous (be + verb-ing); sentence rhythm** and essential vocabulary for **common verb phrases: travelling and actions right now**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_9.01_NEW2.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Tourist:** *\"Look at that street artist! What is he painting?\"*\n- **Guide:** *\"He's painting a panorama of the Eiffel Tower.\"*\n- **Tourist:** *\"And those people over there, are they waiting for the boat?\"*\n- **Guide:** *\"Yes, they're waiting for the evening river cruise.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Present continuous** | grammar | `am/is/are + verb-ing` | Action occurring right at this moment | *\"She is studying right now.\"* |\n| **Wait for** | verb phrase | `/we\u026at f\u0254\u02d0/` | Stay where one is until someone arrives | *\"They are waiting for the bus.\"* |\n| **Travel** | verb | `/\u02c8tr\u00e6vl/` | Make a journey, typically of some length | *\"We are travelling across Europe.\"* |\n| **Take photos** | phrase | `/te\u026ak \u02c8f\u0259\u028at\u0259\u028az/` | Capture images with a camera or phone | *\"He is taking photos of the monuments.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present continuous (be + verb-ing); sentence rhythm\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "What ________ you doing right now?",
                            optionA: "are",
                            optionB: "do",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "She ________ wearing a yellow raincoat.",
                            optionA: "is",
                            optionB: "are",
                            optionC: "does",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "They aren't ________ to the teacher.",
                            optionA: "listening",
                            optionB: "listen",
                            optionC: "listens",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Are they waiting for us? - Yes, they ________.",
                            optionA: "are",
                            optionB: "do",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "9B: Watching and Waiting",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_9b_1_vocabulary.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present continuous or present simple? (habits vs right now)** and essential vocabulary for **clothes (jacket, jeans, shirt, shoes, skirt, trousers, coat, hat)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_9.09_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Detective A:** *\"What is the suspect wearing?\"*\n- **Detective B:** *\"He's wearing dark blue jeans, a black jacket, and white trainers.\"*\n- **Detective A:** *\"Does he usually wear glasses?\"*\n- **Detective B:** *\"No, but he's wearing sunglasses today.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Jacket** | noun | `/\u02c8d\u0292\u00e6k\u026at/` | An outer garment extending either to the waist or hips | *\"A warm leather jacket.\"* |\n| **Jeans** | noun (plural) | `/d\u0292i\u02d0nz/` | Trousers made of denim | *\"He always wears blue jeans.\"* |\n| **Shirt** | noun | `/\u0283\u025c\u02d0t/` | A garment for the upper body with collar and buttons | *\"A crisp white cotton shirt.\"* |\n| **Wear** | verb | `/we\u0259/` | Have on one's body as clothing or ornament | *\"What are you wearing today?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present continuous or present simple? (habits vs right now)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "He usually ________ a suit to work, but today he is wearing jeans.",
                            optionA: "wears",
                            optionB: "is wearing",
                            optionC: "wear",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Look out the window! It ________ right now.",
                            optionA: "is raining",
                            optionB: "rains",
                            optionC: "rain",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "What are those? - They're my new ________.",
                            optionA: "shoes",
                            optionB: "shoe",
                            optionC: "shoess",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "I ________ coffee every morning at eight.",
                            optionA: "drink",
                            optionB: "am drinking",
                            optionC: "drinks",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Practical English 5: Would You Like to Come?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe5_1.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Inviting and offering: Would you like to...? / Would you like a...?** and essential vocabulary for **invitations, accepting and declining politely**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_9.16_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Rob:** *\"Hi Jenny! Are you free on Friday evening?\"*\n- **Jenny:** *\"Yes, I am. Why?\"*\n- **Rob:** *\"Would you like to come to a jazz concert with me?\"*\n- **Jenny:** *\"I'd love to! What time does it start?\"*\n- **Rob:** *\"At eight o'clock. I can pick you up at seven thirty.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Would you like to...** | phrase | `/w\u028ad ju\u02d0 la\u026ak tu\u02d0/` | Polite formula for offering an invitation | *\"Would you like to have dinner?\"* |\n| **I'd love to** | phrase | `/a\u026ad l\u028cv tu\u02d0/` | Enthusiastic and polite acceptance | *\"Yes, I'd love to come!\"* |\n| **I'm sorry, I can't** | phrase | `/a\u026am \u02c8s\u0252ri a\u026a k\u0251\u02d0nt/` | Polite refusal of an invitation | *\"I'd love to, but I'm busy.\"* |\n| **Concert** | noun | `/\u02c8k\u0252ns\u0259t/` | A musical performance before an audience | *\"A live rock concert.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Inviting and offering: Would you like to...? / Would you like a...?\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Would you like to ________ to the cinema tonight?",
                            optionA: "come",
                            optionB: "coming",
                            optionC: "comes",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "A: Would you like a cup of tea? B: Yes, ________.",
                            optionA: "please",
                            optionB: "I do",
                            optionC: "I like",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "I'd ________ to, but I have to study for my exam.",
                            optionA: "love",
                            optionB: "like",
                            optionC: "loving",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Are you ________ tomorrow evening? - Yes, I have no plans.",
                            optionA: "free",
                            optionB: "empty",
                            optionC: "open",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 9: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 9 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 9.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_9.02.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of present continuous vs simple, clothes vocabulary, and invitations\n- **Key Vocabulary:** Unit 9 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Vanya ________ a shower in the morning.",
                            optionA: "always has",
                            optionB: "having always",
                            optionC: "is always having",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "What ________?",
                            optionA: "are you watching",
                            optionB: "are you watch",
                            optionC: "you watching",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "A Would you like to go out tonight? B Yes, ________.",
                            optionA: "I love",
                            optionB: "I love to",
                            optionC: "I'd love to",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 3,
                          },
                          {
                            question: "It ________ at the moment.",
                            optionA: "rains",
                            optionB: "raining",
                            optionC: "isn't raining",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 4,
                          },
                          {
                            question: "Where is your brother ________ now?",
                            optionA: "live",
                            optionB: "living",
                            optionC: "lives",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 5,
                          },
                          {
                            question: "A Are you watching TV? B No, I'm not. I ________.",
                            optionA: "is working",
                            optionB: "work",
                            optionC: "am working",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 6,
                          },
                          {
                            question: "Maya ________ music in her bedroom.",
                            optionA: "listens",
                            optionB: "listening to",
                            optionC: "is listening to",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 7,
                          },
                          {
                            question: "A Are you ________ jeans? B Yes, I am.",
                            optionA: "wear",
                            optionB: "wears",
                            optionC: "wearing",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 8,
                          },
                          {
                            question: "________ for us?",
                            optionA: "Is Antonio wait",
                            optionB: "Is Antonio waiting",
                            optionC: "Is waiting Antonio",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 9,
                          },
                          {
                            question: "________ anything important now?",
                            optionA: "Do you do",
                            optionB: "Is you doing",
                            optionC: "Are you doing",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 10: Hotels, Prepositions & Past of Be",
            order: 10,
            lessons: {
              create: [
                {
                  title: "10A: A Room with a View",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **there's a... / there are some...; prepositions: in, on, under, behind, opposite** and essential vocabulary for **hotels (lift, gym, swimming pool, reception, minibar, Wi-Fi)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_10.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Guest:** *\"Excuse me, is there a swimming pool in this hotel?\"*\n- **Receptionist:** *\"Yes, there is. There's a heated pool on the roof, and there is a gym on the second floor.\"*\n- **Guest:** *\"And are there any restaurants nearby?\"*\n- **Receptionist:** *\"Yes, there are some wonderful Italian restaurants opposite the park.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **There is / There are** | grammar | `/\u00f0e\u0259r \u026az/ - /\u00f0e\u0259r \u0251\u02d0/` | Used to indicate the presence or existence of things | *\"There is a king-sized bed in the room.\"* |\n| **Swimming pool** | noun | `/\u02c8sw\u026am\u026a\u014b pu\u02d0l/` | An artificial basin filled with water for swimming | *\"The hotel swimming pool is open until 10 PM.\"* |\n| **Gym** | noun | `/d\u0292\u026am/` | A hall or room equipped for physical exercise | *\"Is there a gym in the hotel?\"* |\n| **Opposite / Behind** | preposition | `/\u02c8\u0252p\u0259z\u026at/ - /b\u026a\u02c8ha\u026and/` | Facing directly across / at the back of | *\"The pharmacy is opposite the bank.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: there's a... / there are some...; prepositions: in, on, under, behind, opposite\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "________ a comfortable double bed in the bedroom.",
                            optionA: "There is",
                            optionB: "There are",
                            optionC: "It is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Are there ________ clean towels in the bathroom?",
                            optionA: "any",
                            optionB: "some",
                            optionC: "a",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "There are ________ pictures on the wall.",
                            optionA: "some",
                            optionB: "any",
                            optionC: "a",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Is there a lift? - No, there ________.",
                            optionA: "isn't",
                            optionB: "aren't",
                            optionC: "not",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "10B: Where Was He?",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_10b_1_vocabulary.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **past simple: be (was / were, wasn't / weren't)** and essential vocabulary for **in, on, at; historical places and past time expressions (yesterday, last night, in 2020)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_10.09.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Officer:** *\"Where were you at eight o'clock yesterday evening?\"*\n- **Witness:** *\"I was at home with my family. We were in the kitchen having dinner.\"*\n- **Officer:** *\"Was your brother with you?\"*\n- **Witness:** *\"No, he wasn't. He was at work in the restaurant.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Was / Were** | past verb | `/w\u0252z/ - /w\u025c\u02d0/` | Past forms of the verb be (I/he/she/it was; we/you/they were) | *\"Where were you born?\"* |\n| **Yesterday** | adverb | `/\u02c8j\u025bst\u0259de\u026a/` | On the day before today | *\"I was at the library yesterday.\"* |\n| **Last night / week** | phrase | `/l\u0251\u02d0st na\u026at/` | During the previous night or week | *\"We were at the theatre last night.\"* |\n| **At home / at work** | prepositional phrase | `/\u00e6t h\u0259\u028am/` | Indicating specific locations | *\"She was at work until seven.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: past simple: be (was / were, wasn't / weren't)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Where ________ you yesterday afternoon?",
                            optionA: "were",
                            optionB: "was",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "He ________ at work yesterday because he was ill.",
                            optionA: "wasn't",
                            optionB: "weren't",
                            optionC: "isn't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Were they happy with the hotel? - Yes, they ________.",
                            optionA: "were",
                            optionB: "was",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Shakespeare ________ a famous English writer.",
                            optionA: "was",
                            optionB: "were",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Revise and Check 9 & 10: Can You Understand These People?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_rc_9and10_video.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of present continuous, there is/are, was/were, prepositions of place** and essential vocabulary for **Clothes, hotel amenities, buildings with a past**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_10.16_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Interviewer:** *\"Where were you born?\"*\n- **Person 1:** *\"I was born in Manchester, in the north of England.\"*\n- **Interviewer:** *\"Were you in Manchester yesterday?\"*\n- **Person 1:** *\"No, I was here in London on business.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **History** | noun | `/\u02c8h\u026ast\u0259ri/` | The study of past events | *\"This building has a fascinating history.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of present continuous, there is/are, was/were, prepositions of place\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "There ________ three chairs in the room.",
                            optionA: "are",
                            optionB: "is",
                            optionC: "was",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Where ________ your parents born?",
                            optionA: "were",
                            optionB: "was",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "She was ________ home all day yesterday.",
                            optionA: "at",
                            optionB: "in",
                            optionC: "on",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Was the weather nice on holiday? - No, it ________.",
                            optionA: "wasn't",
                            optionB: "weren't",
                            optionC: "isn't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 10: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 10 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 10.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_10.02_new.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of there is/are, prepositions of place, and was/were\n- **Key Vocabulary:** Unit 10 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "There ________ people at Reception.",
                            optionA: "aren't any",
                            optionB: "aren't some",
                            optionC: "isn't any",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Petra ________ tired last night.",
                            optionA: "wasn't",
                            optionB: "were",
                            optionC: "weren't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "There are ________ chairs in the kitchen.",
                            optionA: "any",
                            optionB: "some",
                            optionC: "a",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: "Where ________ you last week?",
                            optionA: "were",
                            optionB: "was",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                          {
                            question: "________ any shops near here.",
                            optionA: "There aren't",
                            optionB: "There isn't",
                            optionC: "There are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 5,
                          },
                          {
                            question: "________ a good view in that room.",
                            optionA: "They is",
                            optionB: "There is",
                            optionC: "There are",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 6,
                          },
                          {
                            question: "Is there ________ park in this town?",
                            optionA: "a",
                            optionB: "some",
                            optionC: "any",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 7,
                          },
                          {
                            question: "A Were you in London last week? B No, I ________.",
                            optionA: "was",
                            optionB: "wasn't",
                            optionC: "weren't",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 8,
                          },
                          {
                            question: "I think there are ________ hotels in the town.",
                            optionA: "not",
                            optionB: "some",
                            optionC: "any",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 9,
                          },
                          {
                            question: "________ any towels in the bathroom?",
                            optionA: "Is there",
                            optionB: "Are there",
                            optionC: "There are",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 11: Past Events & Giving Directions",
            order: 11,
            lessons: {
              create: [
                {
                  title: "11A: A New Life in the USA",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **past simple: regular verbs (-ed endings: /t/, /d/, /\u026ad/); did / didn't** and essential vocabulary for **regular verbs (arrive, live, move, start, study, work, visit, play)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_11.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Grandmother:** *\"In 1975, my family arrived in New York to start a new life.\"*\n- **Grandson:** *\"Did you live in Manhattan?\"*\n- **Grandmother:** *\"No, we lived in Brooklyn. My father worked in a bakery and my mother studied English.\"*\n- **Grandson:** *\"Did you like living there?\"*\n- **Grandmother:** *\"Yes, we loved it! It was an exciting time.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Arrive** | regular verb | `/\u0259\u02c8ra\u026avd/` | Reach a destination | *\"The ship arrived in New York on Tuesday.\"* |\n| **Live** | regular verb | `/l\u026avd/` | Make one's home in a particular place | *\"They lived in a small flat in Brooklyn.\"* |\n| **Work** | regular verb | `/w\u025c\u02d0kt/` | Perform labor or employment | *\"He worked in a local factory for twenty years.\"* |\n| **Pronunciation of -ed** | grammar | `/t/, /d/, or /\u026ad/` | Pronounced /\u026ad/ only after T and D sounds | *\"wanted (/\u026ad/), worked (/t/), lived (/d/).\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: past simple: regular verbs (-ed endings: /t/, /d/, /\u026ad/); did / didn't\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "They ________ to Canada five years ago.",
                            optionA: "moved",
                            optionB: "move",
                            optionC: "movd",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Did you ________ tennis yesterday? - Yes, I did.",
                            optionA: "play",
                            optionB: "played",
                            optionC: "playing",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "We ________ arrive on time because the bus was late.",
                            optionA: "didn't",
                            optionB: "don't",
                            optionC: "weren't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "She ________ English at university for three years.",
                            optionA: "studied",
                            optionB: "studyed",
                            optionC: "study",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "11B: How Was Your Day?",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **past simple irregular verbs: get, go, have, do (got, went, had, did)** and essential vocabulary for **verb phrases with get, go, have, do (get up, go out, have lunch, do homework)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_11.08_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Alex:** *\"Hi Clara! How was your day?\"*\n- **Clara:** *\"It was busy. I got up at seven, had breakfast, and went to the office.\"*\n- **Alex:** *\"Did you have lunch with colleagues?\"*\n- **Clara:** *\"Yes, we had lunch at that new Italian place. What did you do?\"*\n- **Alex:** *\"I did my chores and went to the gym.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Go -> Went** | irregular verb | `/w\u025bnt/` | Past tense of go | *\"Yesterday we went to the beach.\"* |\n| **Have -> Had** | irregular verb | `/h\u00e6d/` | Past tense of have | *\"I had a wonderful conversation with her.\"* |\n| **Get -> Got** | irregular verb | `/\u0261\u0252t/` | Past tense of get | *\"She got home late last night.\"* |\n| **Do -> Did** | irregular verb | `/d\u026ad/` | Past tense of do | *\"What did you do on Saturday?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: past simple irregular verbs: get, go, have, do (got, went, had, did)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Yesterday I ________ to the supermarket and bought milk.",
                            optionA: "went",
                            optionB: "go",
                            optionC: "gone",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "We ________ pizza for dinner last night.",
                            optionA: "had",
                            optionB: "have",
                            optionC: "haved",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "What time did you ________ up this morning?",
                            optionA: "get",
                            optionB: "got",
                            optionC: "getting",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "What ________ you do last weekend? - I went camping.",
                            optionA: "did",
                            optionB: "do",
                            optionC: "done",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Practical English 6: Is There a Bank Near Here?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe6_1.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Asking for and giving directions; polite intonation** and essential vocabulary for **prepositions of place (turn left, turn right, go straight on, on the corner, opposite)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_11.15_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Tourist:** *\"Excuse me. Is there a bank near here?\"*\n- **Local:** *\"Yes, there is. Go straight on and turn left at the traffic lights.\"*\n- **Tourist:** *\"Turn left at the lights?\"*\n- **Local:** *\"That's right. The bank is on your right, next to the post office.\"*\n- **Tourist:** *\"Thank you very much!\"*\n- **Local:** *\"You're welcome.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Turn left / right** | direction phrase | `/t\u025c\u02d0n l\u025bft/ - /ra\u026at/` | Change course towards the left or right side | *\"Turn right at the bookstore.\"* |\n| **Go straight on** | direction phrase | `/\u0261\u0259\u028a stre\u026at \u0252n/` | Continue forward without turning | *\"Go straight on for two blocks.\"* |\n| **Traffic lights** | noun | `/\u02c8tr\u00e6f\u026ak la\u026ats/` | Signals controlling road traffic | *\"Stop at the red traffic light.\"* |\n| **Near here** | phrase | `/n\u026a\u0259 h\u026a\u0259/` | In this immediate vicinity | *\"Is there a good caf\u00e9 near here?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Asking for and giving directions; polite intonation\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Excuse me, ________ a chemist near here?",
                            optionA: "is there",
                            optionB: "are there",
                            optionC: "there is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Go straight ________ and turn right at the museum.",
                            optionA: "on",
                            optionB: "in",
                            optionC: "to",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "The post office is ________ your left.",
                            optionA: "on",
                            optionB: "in",
                            optionC: "at",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Turn ________ at the corner, opposite the station.",
                            optionA: "right",
                            optionB: "straight",
                            optionC: "into",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 11: Comprehensive End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 11 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 11.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_11.02_new.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Comprehensive assessment of past simple regular and irregular verbs and directions\n- **Key Vocabulary:** Unit 11 official vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Georgina ________ for three hours yesterday.",
                            optionA: "study",
                            optionB: "studied",
                            optionC: "studies",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: "What time ________ last night?",
                            optionA: "does the train arrive",
                            optionB: "did the train arrive",
                            optionC: "did the train arrived",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "They ________ to have a coffee.",
                            optionA: "did stop",
                            optionB: "stoped",
                            optionC: "stopped",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 3,
                          },
                          {
                            question: "Pavel ________ lunch at home yesterday.",
                            optionA: "has",
                            optionB: "have",
                            optionC: "had",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 4,
                          },
                          {
                            question: "A Where did Maggie go for lunch? B She ________ to a small caf\u00e9.",
                            optionA: "went",
                            optionB: "goed",
                            optionC: "did go",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 5,
                          },
                          {
                            question: "Laura ________ help her daughter with her homework yesterday.",
                            optionA: "doesn't",
                            optionB: "didn't",
                            optionC: "not",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 6,
                          },
                          {
                            question: "A What did you do in Europe? B I ________ a lot of beautiful places.",
                            optionA: "visited",
                            optionB: "visitd",
                            optionC: "visit",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 7,
                          },
                          {
                            question: "The children didn't ________ to sleep on the plane.",
                            optionA: "go",
                            optionB: "goed",
                            optionC: "went",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 8,
                          },
                          {
                            question: "I ________ at the end of the film.",
                            optionA: "cryed",
                            optionB: "cried",
                            optionC: "cryd",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 9,
                          },
                          {
                            question: "Did Anita ________ Turkish at university?",
                            optionA: "study",
                            optionB: "studies",
                            optionC: "studied",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
          {
            title: "Unit 12: Stories, Past Revision & Final Assessment",
            order: 12,
            lessons: {
              create: [
                {
                  title: "12A: Strangers on a Train",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_12a_1_listening.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **past simple regular and irregular verbs storytelling sequence** and essential vocabulary for **storytelling words (saw, met, spoke, told, thought, suddenly)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_12.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Narrator:** *\"It was a rainy Tuesday afternoon. Bernard sat in the train compartment reading a book.\"*\n- **Woman:** *\"Excuse me, is this seat free?\"*\n- **Narrator:** *\"He looked up and saw a mysterious woman wearing an elegant black coat. He smiled and said: 'Yes, please sit down.' That conversation changed his life.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **See -> Saw** | irregular verb | `/s\u0254\u02d0/` | Past of see; perceived with eyes | *\"I saw an old friend at the train station.\"* |\n| **Meet -> Met** | irregular verb | `/m\u025bt/` | Past of meet; encountered for the first time | *\"They met on a train to Paris.\"* |\n| **Tell -> Told** | irregular verb | `/t\u0259\u028ald/` | Past of tell; recounted a story or information | *\"She told him the truth.\"* |\n| **Suddenly** | adverb | `/\u02c8s\u028cd\u0259nli/` | Quickly and unexpectedly | *\"Suddenly the train stopped in the tunnel.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: past simple regular and irregular verbs storytelling sequence\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "We ________ an exciting movie yesterday evening.",
                            optionA: "saw",
                            optionB: "see",
                            optionC: "seed",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "She ________ her keys on the dining table.",
                            optionA: "left",
                            optionB: "leave",
                            optionC: "leaved",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "He ________ me his phone number on a piece of paper.",
                            optionA: "gave",
                            optionB: "give",
                            optionC: "gived",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Did you ________ anyone at the party? - Yes, I met Carlos.",
                            optionA: "meet",
                            optionB: "met",
                            optionC: "meeting",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "12B: Revise the Past",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **revision of all past simple forms: affirmative, negative, interrogative, regular and irregular** and essential vocabulary for **revision of past time expressions and high-frequency verbs**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_12.05_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Teacher:** *\"Let's review the past simple rules.\"*\n- **Student:** *\"For regular verbs we add -ed, like 'worked' and 'started'.\"*\n- **Teacher:** *\"Excellent! And for questions and negatives?\"*\n- **Student:** *\"We use 'did' or 'didn't' with the infinitive: 'Did you go?' and 'I didn't see.'\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Revision** | noun | `/r\u026a\u02c8v\u026a\u0292\u0259n/` | Reviewing previously learned material | *\"Do a thorough revision before the final exam.\"* |\n| **Infinitive** | grammar | `Base form of verb (go, see, have)` | Always use the infinitive after did or didn't | *\"Did you have lunch?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: revision of all past simple forms: affirmative, negative, interrogative, regular and irregular\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Where ________ you spend your last vacation?",
                            optionA: "did",
                            optionB: "do",
                            optionC: "were",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "I ________ go to the party because I was exhausted.",
                            optionA: "didn't",
                            optionB: "wasn't",
                            optionC: "don't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "They ________ to New York last summer.",
                            optionA: "flew",
                            optionB: "fly",
                            optionC: "flyed",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Did she ________ the letter? - Yes, she wrote it yesterday.",
                            optionA: "write",
                            optionB: "wrote",
                            optionC: "writing",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Revise and Check 11 & 12: Can You Understand These People?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_rc_11and12_video.mp4',
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Comprehensive course review of past events, travel experiences, daily life** and essential vocabulary for **Vocabulary review across all 12 units**.\n\n---\n\n### \ud83c\udfa7 Audio Listening & Pronunciation Practice\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_12.09_NEW_2.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript & Dialogue\n- **Interviewer:** *\"What was the most memorable trip you took this year?\"*\n- **Person 1:** *\"I went to Italy in July. I visited Rome and Florence, ate incredible pasta, and practiced speaking Italian!\"*\n- **Interviewer:** *\"How did you travel?\"*\n- **Person 1:** *\"We travelled by train across the entire country.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Memorable** | adjective | `/\u02c8m\u025bm\u0259r\u0259bl/` | Worth remembering; easily remembered | *\"It was a truly memorable journey.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Comprehensive course review of past events, travel experiences, daily life\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Did you ________ a good weekend? - Yes, it was fantastic.",
                            optionA: "have",
                            optionB: "had",
                            optionC: "having",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "We ________ delicious seafood in Portugal.",
                            optionA: "ate",
                            optionB: "eat",
                            optionC: "eated",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "She ________ born in Toronto.",
                            optionA: "was",
                            optionB: "were",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Turn left ________ the crossroads.",
                            optionA: "at",
                            optionB: "in",
                            optionC: "on",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: "Unit 12: Comprehensive Final End of Unit Test",
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  videoUrl: null,
                  content: "### \ud83c\udfaf Can-Do Objective\nDemonstrate comprehensive mastery of Unit 12 language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.\n\n---\n\n### \ud83d\udcdd End of Unit Assessment Instructions\n- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.\n- Read each prompt and choose the single best option (A, B, or C).\n- A passing score of **80% (8/10)** certifies your completion of Unit 12.\n- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.\n\n---\n\n### \ud83c\udfa7 Unit Audio Review\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_12.02.mp3\"></audio>\n\n---\n\n### \ud83d\udcd6 Summary of Assessed Language Points\n- **Grammar Focus:** Final comprehensive assessment covering the entire Beginner (A1) curriculum\n- **Key Vocabulary:** Complete A1 vocabulary mastery\n\n---\n\n### \ud83d\udca1 Test-Taking Strategy\n> *\"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'.\"*\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Sofia ________ anything at the shops.",
                            optionA: "didn't bought",
                            optionB: "bought",
                            optionC: "didn't buy",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 1,
                          },
                          {
                            question: "A How much ________ your trousers?",
                            optionA: "were",
                            optionB: "was",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "A Did Julia and Matteus leave the office at six o'clock? B No, they ________.",
                            optionA: "don't",
                            optionB: "didn't",
                            optionC: "left",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: "The bus ________ on the corner of King's Street.",
                            optionA: "stop",
                            optionB: "stoped",
                            optionC: "stopped",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 4,
                          },
                          {
                            question: "Michelle ________ me an email yesterday.",
                            optionA: "didn't sent",
                            optionB: "didn't send",
                            optionC: "send",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 5,
                          },
                          {
                            question: "I ________ a really good time at the party last night.",
                            optionA: "have",
                            optionB: "was have",
                            optionC: "had",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 6,
                          },
                          {
                            question: "When ________ you visit the new school?",
                            optionA: "did",
                            optionB: "had",
                            optionC: "went",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 7,
                          },
                          {
                            question: "Alex ________ his friends he was sorry.",
                            optionA: "asked",
                            optionB: "said",
                            optionC: "told",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 8,
                          },
                          {
                            question: "________ you late for work today?",
                            optionA: "Is",
                            optionB: "Were",
                            optionC: "Was",
                            optionD: "None of the above",
                            correctOption: 1,
                            order: 9,
                          },
                          {
                            question: "Tania ________ some new jeans in the market.",
                            optionA: "buy",
                            optionB: "buyed",
                            optionC: "bought",
                            optionD: "None of the above",
                            correctOption: 2,
                            order: 10,
                          },
                        ]
                      }
                    }
                  }
                },
              ]
            }
          },
        ]
      }
    }
  });

  console.log(`Successfully seeded course: ${course.title} (${course.id})`);
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
