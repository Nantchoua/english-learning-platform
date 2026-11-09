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
  console.log('Seeding English Beginner Course with authentic Oxford audio/video transcripts...');

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

  // Clean up old course cleanly
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

  console.log('Creating course modules, lessons with authentic video, audio, and Oxford tests...');

  const course = await prisma.course.create({
    data: {
      title: 'English Beginner Course: Vocabulary Essentials (A1)',
      slug: 'english-beginner-course',
      description: 'A compact, exercise-based vocabulary and speaking course for beginner and elementary learners. Features authentic Oxford English File video dialogues, native audio listening tracks, pronunciation drills, and comprehensive end-of-unit tests.',
      level: 'A1',
      isPublished: true,
      price: 20.00,
      accessPassword: 'EnglishBeginner2026!',
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
                  videoUrl: "[{\"title\": \"Scene 1: In the Coffee Shop (Helen & Barista)\", \"url\": \"/videos/beginner/ef5e_beg_1a_1_listening.mp4\"}, {\"title\": \"Scene 2: Meeting Tom (Hello & Introductions)\", \"url\": \"/videos/beginner/ef5e_beg_1a_2_listening.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **verb be (singular): I and you** and essential vocabulary for **numbers 0-10, days of the week, greetings**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_1.05_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Maria:** *\"A cappuccino, please.\"*\n- **Andrew:** *\"A tea for me.\"*\n- **Sally:** *\"And a tea for me, too.\"*\n- **Assistant:** *\"What's your name?\"*\n- **Maria:** *\"Maria.\"*\n- **Andrew:** *\"I'm Andrew.\"*\n- **Sally:** *\"I'm Sally.\"*\n- **Assistant:** *\"Two teas and one cappuccino.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Helen:** *\"Cappuccino, please.\"*\n- **Barista 1:** *\"What's your name?\"*\n- **Helen:** *\"Helen.\"*\n- **Barista 1:** *\"Ellen?\"*\n- **Helen:** *\"No, Helen.\"*\n- **Barista 1:** *\"Helen. OK.\"*\n- **Barista 2:** *\"Are you Diana?\"*\n- **Helen:** *\"No, I'm not. I'm Helen.\"*\n- **Barista 1:** *\"Sorry. Helen. Your cappuccino.\"*\n- **Helen:** *\"Thanks.\"*\n- **Tom:** *\"Hello. Are you Helen?\"*\n- **Helen:** *\"Yes, I am. And you're Tom.\"*\n- **Tom:** *\"Yes! Nice to meet you.\"*\n- **Helen:** *\"Nice to meet you.\"*\n- **Tom:** *\"Just a minute.\"*\n- **Tom:** *\"Hi. A tea, please.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Hello / Hi** | interjection | `/h\u0259\u02c8l\u0259\u028a/` | Standard friendly greeting used at any time | *\"Hello, nice to meet you!\"* |\n| **Cappuccino / Tea** | noun | `/\u02cck\u00e6p\u028a\u02c8t\u0283i\u02d0n\u0259\u028a/` | Hot beverages ordered in a caf\u00e9 | *\"A cappuccino, please.\"* |\n| **What's your name?** | question | `/w\u0252ts j\u0254\u02d0 ne\u026am/` | Asking someone's identity | *\"What's your name? - I'm Helen.\"* |\n| **Nice to meet you** | phrase | `/na\u026as tu\u02d0 mi\u02d0t ju\u02d0/` | Polite phrase used when introduced to someone | *\"Hi Tom, nice to meet you too.\"* |\n| **Numbers 0-10** | numbers | `/\u02c8z\u026a\u0259r\u0259\u028a/ - /t\u025bn/` | Cardinal digits: zero, one, two, three... | *\"Two teas and one cappuccino.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: verb be (singular): I and you\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Helen: A cappuccino, ________.",
                            optionA: "please",
                            optionB: "thank you",
                            optionC: "excuse me",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Barista: What's your name? Helen: ________ Helen.",
                            optionA: "I'm",
                            optionB: "Am",
                            optionC: "You're",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Tom: Are you Helen? Helen: Yes, I ________.",
                            optionA: "am",
                            optionB: "'m",
                            optionC: "is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Two teas and ________ cappuccino.",
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
                  title: "1B: Music Round the World",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: "/videos/beginner/ef5e_beg_1b_1_vocabulary.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **verb be (singular): he, she, it** and essential vocabulary for **countries (Spain, Japan, Brazil, UK, Mexico, Italy, China, USA)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_1.16_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **A:** *\"Where are you from?\"*\n- **B:** *\"I'm from Toledo.\"*\n- **A:** *\"Where's Toledo?\"*\n- **B:** *\"It's in Spain.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Where are you from?** | question | `/we\u0259r \u0251\u02d0 ju\u02d0 fr\u0252m/` | Asking a person's country or city of origin | *\"Where are you from? - I'm from Toledo.\"* |\n| **Toledo / Spain** | proper noun | `/t\u0259\u02c8li\u02d0d\u0259\u028a/ - /spe\u026an/` | Historical city in central Spain | *\"Where's Toledo? - It's in Spain.\"* |\n| **China / Chinese** | noun / adj | `/\u02c8t\u0283a\u026an\u0259/ - /\u02cct\u0283a\u026a\u02c8ni\u02d0z/` | Nation in East Asia / nationality | *\"She is from Beijing, China.\"* |\n| **Brazil / Brazilian** | noun / adj | `/br\u0259\u02c8z\u026al/ - /br\u0259\u02c8z\u026alj\u0259n/` | Country in South America | *\"Samba is from Brazil.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: verb be (singular): he, she, it\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Where ________ you from? - I'm from Toledo.",
                            optionA: "are",
                            optionB: "is",
                            optionC: "am",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Where's Toledo? - It's ________ Spain.",
                            optionA: "in",
                            optionB: "at",
                            optionC: "on",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Maria is from Mexico. ________ Mexican.",
                            optionA: "She's",
                            optionB: "He's",
                            optionC: "It's",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Tokyo ________ in Japan.",
                            optionA: "is",
                            optionB: "are",
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
                  title: "Practical English 1: How Do You Spell It?",
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: "[{\"title\": \"Scene 1: Rob in London & Poland\", \"url\": \"/videos/beginner/ef5e_beg_pe1_1.mp4\"}, {\"title\": \"Scene 2: Checking into the Hotel\", \"url\": \"/videos/beginner/ef5e_beg_pe1_2.mp4\"}, {\"title\": \"Scene 3: How Do You Spell It?\", \"url\": \"/videos/beginner/ef5e_beg_pe1_3.mp4\"}, {\"title\": \"Scene 4: In the Classroom\", \"url\": \"/videos/beginner/ef5e_beg_pe1_4.mp4\"}, {\"title\": \"Scene 5: Booking a Table\", \"url\": \"/videos/beginner/ef5e_beg_pe1_5.mp4\"}, {\"title\": \"Scene 6: Useful Social English Phrases\", \"url\": \"/videos/beginner/ef5e_beg_pe1_6.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **The English alphabet; classroom language; hotel check-in** and essential vocabulary for **surname, reservation, room key, spelling names**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_1.34_NEW.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **F:** *\"a coat\"*\n- **Narrator:** *\"2\"*\n- **M:** *\"the door\"*\n- **Narrator:** *\"3\"*\n- **F:** *\"a window\"*\n- **Narrator:** *\"4\"*\n- **F:** *\"the board\"*\n- **Narrator:** *\"5\"*\n- **M:** *\"a chair\"*\n- **Narrator:** *\"6\"*\n- **M:** *\"a table\"*\n- **Narrator:** *\"7\"*\n- **F:** *\"a laptop\"*\n- **Narrator:** *\"8\"*\n- **M:** *\"a dictionary\"*\n- **Narrator:** *\"9\"*\n- **F:** *\"a bag\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Rob:** *\"Hello.\"*\n- **Receptionist:** *\"Good afternoon.\"*\n- **Rob:** *\"My name's Rob Walker. I have a reservation.\"*\n- **Receptionist:** *\"Sorry, what's your surname?\"*\n- **Rob:** *\"Walker.\"*\n- **Receptionist:** *\"How do you spell it?\"*\n- **Rob:** *\"W-A-L-K-E-R.\"*\n- **Receptionist:** *\"Sorry?\"*\n- **Rob:** *\"W-A-L-K-E-R.\"*\n- **Receptionist:** *\"Thank you. OK, Mr Walker. You're in room 321.\"*\n- **Rob:** *\"Thanks.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Surname / Last name** | noun | `/\u02c8s\u025c\u02d0ne\u026am/` | Family name | *\"Sorry, what's your surname? - Walker.\"* |\n| **Reservation** | noun | `/\u02ccr\u025bz\u0259\u02c8ve\u026a\u0283\u0259n/` | Booking arrangement | *\"I have a reservation for two nights.\"* |\n| **How do you spell it?** | phrase | `/ha\u028a du\u02d0 ju\u02d0 sp\u025bl \u026at/` | Asking someone to name the letters | *\"W-A-L-K-E-R.\"* |\n| **Journalist** | noun | `/\u02c8d\u0292\u025c\u02d0n\u0259l\u026ast/` | A person who writes for newspapers or magazines | *\"Rob is a journalist from London.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: The English alphabet; classroom language; hotel check-in\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Rob: Hello. Receptionist: ________.",
                            optionA: "Good afternoon",
                            optionB: "Goodbye",
                            optionC: "Excuse me",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "My name's Rob Walker. I have a ________.",
                            optionA: "reservation",
                            optionB: "book",
                            optionC: "card",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Receptionist: Sorry, what's your ________? Rob: Walker.",
                            optionA: "surname",
                            optionB: "room",
                            optionC: "telephone",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "How do you ________ your surname? - W-A-L-K-E-R.",
                            optionA: "spell",
                            optionB: "write",
                            optionC: "say",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **verb be (plural): we, you, they** and essential vocabulary for **countries and nationalities (Brazil - Brazilian, China - Chinese, Spain - Spanish)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_2.01_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **M:** *\"Brazil\"*\n> *\"Brazilian\"*\n- **F:** *\"China\"*\n> *\"Chinese\"*\n> *\"Egypt\"*\n> *\"Egyptian\"*\n- **M:** *\"England\"*\n> *\"English\"*\n> *\"France\"*\n> *\"French\"*\n- **F:** *\"Germany\"*\n> *\"German\"*\n> *\"Italy\"*\n> *\"Italian\"*\n- **M:** *\"Japan\"*\n> *\"Japanese\"*\n> *\"Mexico\"*\n> *\"Mexican\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Holiday** | noun | `/\u02c8h\u0252l\u026ade\u026a/` | Vacation or leisure trip away from work | *\"Are you on holiday in London?\"* |\n| **Business** | noun | `/\u02c8b\u026azn\u0259s/` | Work, commercial activity | *\"No, we are here on business.\"* |\n| **Nationalities** | noun | `/\u02ccn\u00e6\u0283\u0259\u02c8n\u00e6l\u026atiz/` | Brazilian, Chinese, English, Mexican, Spanish | *\"They are from Spain; they're Spanish.\"* |\n| **We / They** | pronouns | `/wi\u02d0/ - /\u00f0e\u026a/` | Plural subjective pronouns | *\"We're from Rome.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: verb be (plural): we, you, they\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                  videoUrl: "[{\"title\": \"Part 1: Numbers 11\\u2013100\", \"url\": \"/videos/beginner/ef5e_beg_2b_1_vocabulary.mp4\"}, {\"title\": \"Part 2: Meet the Students (Lin & Pia)\", \"url\": \"/videos/beginner/ef5e_beg_2b_2_listening.mp4\"}, {\"title\": \"Part 3: Meet the Students (Interviews)\", \"url\": \"/videos/beginner/ef5e_beg_2b_3_listening.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Wh- and How questions with be (Who, What, Where, When, How)** and essential vocabulary for **numbers 11-100, phone numbers, bus lines**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_2.14_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Lin:** *\"Hi, Pia.\"*\n> *\"How are you?\"*\n- **Pia:** *\"Hi, Lin.\"*\n> *\"I'm fine, and you?\"*\n- **Lin:** *\"I'm fine too.\"*\n> *\"This is Alex.\"*\n> *\"He's in my class.\"*\n> *\"Alex, this is Pia.\"*\n- **Pia:** *\"Hi, Alex!\"*\n- **Alex:** *\"Hi. What class are you in?\"*\n- **Lin:** *\"That's my bus!\"*\n> *\"Bye. See you tomorrow!\"*\n- **Alex:** *\"Bye.\"*\n> *\"Where are you from Pia?\"*\n- **Pia:** *\"I'm from Italy.\"*\n> *\"This is my bus stop.\"*\n> *\"Bye, Alex. Nice to meet you.\"*\n- **Alex:** *\"Nice to meet you, too, Pia.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Alicia:** *\"Hello, I'm Alicia. Today I'm in Brighton. Brighton is in the south of England.\"*\n> *\"It's on the coast. It's a fantastic town, and it's famous for the Royal Pavilion, the pier, and the beach.\"*\n> *\"But I'm not on holiday. I'm here to visit an English language school.\"*\n> *\"This is the school. It's a big school with about three hundred and fifty students.\"*\n> *\"Rike and Woo are students at the school. Hyeongwoo is twenty-three years old.\"*\n> *\"He's from Korea. He's a beginner student. His class is small, with only five students.\"*\n> *\"His teacher is Stephen. He's English. He's very friendly, and he's a very good teacher.\"*\n> *\"Rike is nineteen years old. She's from Germany.\"*\n> *\"She's an intermediate student, and her class is big, with eleven students. Her teacher is Laura.\"*\n> *\"She's English. She's really nice, and she's a very good teacher, too.\"*\n> *\"When Rike and Woo aren't in class, they're in the computer room\u2026or here, in the canteen.\"*\n> *\"In the evening they're at home. Rike and Woo live in a student house. It's near the school.\"*\n> *\"It's a big house with five bedrooms, a kitchen, and a garden.\"*\n> *\"Brighton is great for students like Rike and Hyeongwoo.\"*\n> *\"The people are friendly, and the town is exciting and fun!\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **How are you?** | phrase | `/ha\u028a \u0251\u02d0 ju\u02d0/` | Polite greeting inquiring about well-being | *\"Hi Pia, how are you? - I'm fine, thanks.\"* |\n| **What number is the bus?** | question | `/w\u0252t \u02c8n\u028cmb\u0259r \u026az \u00f0\u0259 b\u028cs/` | Asking for the bus route number | *\"It's bus number twenty-four.\"* |\n| **Eleven to Twenty** | numbers | `/\u026a\u02c8l\u025bvn/ - /\u02c8tw\u025bnti/` | 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 | *\"She is fifteen years old.\"* |\n| **Phone number** | noun | `/f\u0259\u028an \u02c8n\u028cmb\u0259/` | Sequence of digits | *\"What's your phone number?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Wh- and How questions with be (Who, What, Where, When, How)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Lin: Hi Pia. How are you? Pia: I'm ________, and you?",
                            optionA: "fine",
                            optionB: "good morning",
                            optionC: "nice",
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
                  videoUrl: "/videos/beginner/ef5e_beg_rc_1and2_video.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of verb be (singular & plural), Wh- questions** and essential vocabulary for **Personal details, nationalities, phone numbers**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_2.25_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **A:** *\"Great. OK, see you on Tuesday.\"*\n- **B:** *\"Yes. Oh, what's your phone number?\"*\n- **A:** *\"It's, er, 020 7946 0415.\"*\n- **Narrator:** *\"2\"*\n- **A:** *\"Thank you.\"*\n> *\"What's your address, please?\"*\n- **B:** *\"It's 57 King Street. Very near here.\"*\n- **Narrator:** *\"3\"*\n- **A:** *\"Come in, sit down.\"*\n> *\"You're Martin Blunt, right?\"*\n- **B:** *\"Yes.\"*\n- **A:** *\"And how old are you, Mr Blunt?\"*\n- **B:** *\"I'm 39\u2026\"*\n- **Narrator:** *\"4\"*\n- **A:** *\"Thank you very much.\"*\n> *\"Er, one more thing. What's your email?\"*\n- **B:** *\"It's james.85@ukmail.com.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Interviewer:** *\"What's your name?\"*\n- **Jayna:** *\"Jayna.\"*\n- **Interviewer:** *\"How do you spell it?\"*\n- **Jayna:** *\"J-A-Y-N-A.\"*\n- **Interviewer:** *\"Where are you from?\"*\n- **Vera:** *\"I'm from Russia.\"*\n- **Interviewer:** *\"Where in Russia?\"*\n- **Vera:** *\"Er, Moscow \u2013 capital.\"*\n- **Interviewer:** *\"How old are you?\"*\n- **Richard:** *\"I'm sixty-six.\"*\n- **Interviewer:** *\"What's your phone number?\"*\n- **Mairi:** *\"It's 07564378.\"*\n- **Interviewer:** *\"What's your email address?\"*\n- **Iain:** *\"It's Iain.smith@yahoo.com.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **See you on Tuesday** | phrase | `/si\u02d0 ju\u02d0 \u0252n \u02c8tju\u02d0zde\u026a/` | Parting phrase specifying next meeting | *\"Great! OK, see you on Tuesday.\"* |\n| **Phone number** | noun | `/f\u0259\u028an \u02c8n\u028cmb\u0259/` | Telephone digits | *\"It's 020 7946 0415.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of verb be (singular & plural), Wh- questions\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                            question: "Great. OK, see you on ________.",
                            optionA: "Tuesday",
                            optionB: "tuesday",
                            optionC: "two",
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
                  videoUrl: "/videos/beginner/ef5e_beg_3a_1_pronunciation.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **singular and plural nouns; articles a / an; /s/ and /z/ endings** and essential vocabulary for **small things (phone, watch, keys, umbrella, wallet, bag, glasses)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_3.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **M:** *\"a phone\"*\n- **Narrator:** *\"2\"*\n- **F:** *\"a watch\"*\n- **Narrator:** *\"3\"*\n- **M:** *\"a tablet\"*\n- **Narrator:** *\"4\"*\n- **F:** *\"a bag\"*\n- **Narrator:** *\"5\"*\n- **M:** *\"a wallet\"*\n- **Narrator:** *\"6\"*\n- **F:** *\"a purse\"*\n- **Narrator:** *\"7\"*\n- **M:** *\"a pencil\"*\n- **Narrator:** *\"8\"*\n- **F:** *\"a notebook\"*\n- **Narrator:** *\"9\"*\n- **M:** *\"glasses\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **A phone / A watch** | noun | `/f\u0259\u028an/ - /w\u0252t\u0283/` | Everyday personal electronics and timepieces | *\"Where is my phone?\"* |\n| **An umbrella** | noun | `/\u028cm\u02c8br\u025bl\u0259/` | Canopy protecting against rain (uses 'an') | *\"Take an umbrella.\"* |\n| **Glasses** | noun (plural) | `/\u02c8\u0261l\u0251\u02d0s\u026az/` | Lenses used to correct vision (always plural) | *\"Here are your reading glasses.\"* |\n| **Keys** | noun (plural) | `/ki\u02d0z/` | Metal tools to open locks | *\"Where are my house keys?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: singular and plural nouns; articles a / an; /s/ and /z/ endings\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "It's ________ umbrella.",
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
                            question: "She has ________ identity card in her wallet.",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **this / that / these / those; sentence rhythm** and essential vocabulary for **souvenirs (T-shirts, mugs, postcards, caps, magnets)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_3.09.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Woman:** *\"Excuse me.\"*\n> *\"What are those?\"*\n- **Man:** *\"They're T-shirts.\"*\n- **Woman:** *\"How much are they?\"*\n- **Man:** *\"They're \u00a315.\"*\n- **Woman:** *\"And how much are these key rings?\"*\n- **Man:** *\"They're \u00a36.\"*\n- **Woman:** *\"And this mug?\"*\n- **Man:** *\"\u00a314.\"*\n- **Woman:** *\"Is that a Manchester United shirt?\"*\n- **Man:** *\"No, it's Arsenal.\"*\n- **Woman:** *\"How much is it?\"*\n- **Man:** *\"\u00a325.\"*\n- **Woman:** *\"Oh\u2026no.\"*\n> *\"Thank you. Bye.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **What are those?** | question | `/w\u0252t \u0251\u02d0 \u00f0\u0259\u028az/` | Asking about plural objects far away | *\"Excuse me, what are those? - They're T-shirts.\"* |\n| **How much are they?** | question | `/ha\u028a m\u028ct\u0283 \u0251\u02d0 \u00f0e\u026a/` | Inquiring about price of plural items | *\"How much are they? - They're fifteen pounds.\"* |\n| **This / That** | demonstratives | `/\u00f0\u026as/ - /\u00f0\u00e6t/` | Singular near vs far | *\"This is a mug, that is a hat.\"* |\n| **These / Those** | demonstratives | `/\u00f0i\u02d0z/ - /\u00f0\u0259\u028az/` | Plural near vs far | *\"These postcards are cheap.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: this / that / these / those; sentence rhythm\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Customer: Excuse me. What are ________? Shopkeeper: They're T-shirts.",
                            optionA: "those",
                            optionB: "that",
                            optionC: "this",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "How much ________ those sunglasses?",
                            optionA: "are",
                            optionB: "is",
                            optionC: "am",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "________ is my new London mug on the table.",
                            optionA: "This",
                            optionB: "These",
                            optionC: "Those",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "How much is ________ cap over there?",
                            optionA: "that",
                            optionB: "these",
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
                  videoUrl: "[{\"title\": \"Scene 1: In the Caf\\u00e9 with Rob & Jenny\", \"url\": \"/videos/beginner/ef5e_beg_pe2_1.mp4\"}, {\"title\": \"Scene 2: Ordering Food & Drinks\", \"url\": \"/videos/beginner/ef5e_beg_pe2_2.mp4\"}, {\"title\": \"Scene 3: Understanding Prices\", \"url\": \"/videos/beginner/ef5e_beg_pe2_3.mp4\"}, {\"title\": \"Scene 4: Social English: Can I Have...?\", \"url\": \"/videos/beginner/ef5e_beg_pe2_4.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Understanding prices, ordering food and drinks in a caf\u00e9** and essential vocabulary for **coffee, tea, orange juice, sandwich, mineral water, newspaper**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_3.17_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n> *[Authentic listening and pronunciation drill from Oxford English File]*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Barman:** *\"Who's next?\"*\n- **Rob:** *\"Can I have a cheese sandwich, please?\"*\n- **Barman:** *\"Anything else?\"*\n- **Rob:** *\"And a Coke, please.\"*\n- **Barman:** *\"Ice and lemon?\"*\n- **Rob:** *\"No, thanks.\"*\n- **Barman:** *\"There you go.\"*\n- **Rob:** *\"Thanks. How much is it?\"*\n- **Barman:** *\"Six pounds seventy-five.\"*\n- **Rob:** *\"Here you are.\"*\n- **Barman:** *\"Thanks.\"*\n> *\"Here's your change.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **The New York Times, please** | phrase | `Newspaper title` | The New York Times, please. - Here you are. | *\"-\"* |\n| **How much is it?** | question | `/ha\u028a m\u028ct\u0283 \u026az \u026at/` | Inquiring about single item cost | *\"How much is it? - It's two dollars fifty.\"* |\n| **Orange juice** | noun | `/\u02c8\u0252r\u026and\u0292 d\u0292u\u02d0s/` | Drink made from oranges | *\"An orange juice, please.\"* |\n| **Here you are** | phrase | `/h\u026a\u0259 ju\u02d0 \u0251\u02d0/` | Handing something to someone | *\"Here you are. - Thank you.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Understanding prices, ordering food and drinks in a caf\u00e9\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Customer: The New York Times, please. Clerk: ________ you are.",
                            optionA: "Here",
                            optionB: "There",
                            optionC: "Where",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "How much ________ that sandwich? - It's five pounds.",
                            optionA: "is",
                            optionB: "are",
                            optionC: "do",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "An orange juice, ________. - Regular or large?",
                            optionA: "please",
                            optionB: "thank you",
                            optionC: "excuse",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Clerk: That's four pounds fifty. Customer: ________ you.",
                            optionA: "Thank",
                            optionB: "Please",
                            optionC: "Welcome",
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
                  videoUrl: "/videos/beginner/ef5e_beg_4a_1_grammar.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **possessive adjectives (my, your, his, her, our, their); possessive 's** and essential vocabulary for **family (woman, man, boy, girl, mother, father, brother, sister, husband, wife)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_4.01_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **F:** *\"a woman\"*\n- **Narrator:** *\"2\"*\n- **M:** *\"a boy\"*\n- **Narrator:** *\"3\"*\n- **F:** *\"a girl\"*\n- **Narrator:** *\"4\"*\n- **M:** *\"a man\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Narrator:** *\"Who are the people?\"*\n- **F:** *\"This is Maria.\"*\n> *\"This is her family.\"*\n> *\"Who's Angela?\"*\n> *\"Who's Carlos?\"*\n> *\"Who's Sara?\"*\n> *\"Who's Andres?\"*\n> *\"Who's Luis?\"*\n- **M:** *\"This is Scott.\"*\n> *\"This is his family.\"*\n> *\"Who's Eddie?\"*\n> *\"Who's Linda?\"*\n> *\"Who's Sandra?\"*\n> *\"Who's Evie?\"*\n> *\"Who's Alan?\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Woman / Man** | noun | `/\u02c8w\u028am\u0259n/ - /m\u00e6n/` | Adult female and male humans | *\"A young woman and an older man.\"* |\n| **Boy / Girl** | noun | `/b\u0254\u026a/ - /\u0261\u025c\u02d0l/` | Male and female children | *\"A boy and his sister.\"* |\n| **Mother / Father** | noun | `/\u02c8m\u028c\u00f0\u0259/ - /\u02c8f\u0251\u02d0\u00f0\u0259/` | Parents | *\"Amy's mother is a doctor.\"* |\n| **Possessive 's** | grammar | `/s/ or /z/` | Showing family relationship or ownership | *\"This is Paul's sister.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: possessive adjectives (my, your, his, her, our, their); possessive 's\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                  videoUrl: "[{\"title\": \"Part 1: Grammar (Adjectives & Colours)\", \"url\": \"/videos/beginner/ef5e_beg_4b_1_grammar.mp4\"}, {\"title\": \"Part 2: Beaulieu Motor Museum\", \"url\": \"/videos/beginner/ef5e_beg_4b_2_listening.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **adjectives: position before nouns, no plural form** and essential vocabulary for **car brands and nationalities (Jaguar - English, Mercedes - German, Ferrari - Italian)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_4.12_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **M:** *\"Jaguar. It's English.\"*\n- **Narrator:** *\"2\"*\n- **M:** *\"Mercedes. It's German.\"*\n- **Narrator:** *\"3\"*\n- **M:** *\"Ferrari. It's Italian.\"*\n- **Narrator:** *\"4\"*\n- **M:** *\"Tesla. It's American.\"*\n- **Narrator:** *\"5\"*\n- **M:** *\"Peugeot. It's French.\"*\n- **Narrator:** *\"6\"*\n- **M:** *\"Honda. It's Japanese.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Louise:** *\"Hi! I'm Louise, and today I'm in Beaulieu.\"*\n> *\"Beaulieu is a small village.\"*\n> *\"It's in England, but Beaulieu is a French word.\"*\n- **In English, we say /Bju:** *\"li/, but in French it's Beau lieu \u2013 beautiful place.\"*\n> *\"And it really is beautiful!\"*\n> *\"Beaulieu is in the New Forest.\"*\n> *\"It's famous for its big house, old church, and fantastic motor museum.\"*\n> *\"The National Motor Museum in Beaulieu is sixty-two years old.\"*\n> *\"It's a very interesting place, with lots and lots of cars.\"*\n> *\"Let's go and see!\"*\n> *\"These are some of the cars. These are old, vintage cars.\"*\n> *\"These are fast, modern cars.\"*\n> *\"This is my favourite car. It's British and its name is Bluebird.\"*\n> *\"It's fifty-five years old and it's very, very fast!\"*\n> *\"These cars are from lots of different countries.\"*\n> *\"This is a Mercedes sixty hp. It's a German car.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Jaguar. It's English** | example | `Car origin` | Jaguar. It's an English car. | *\"-\"* |\n| **Mercedes. It's German** | example | `Car origin` | Mercedes. It's a German car. | *\"-\"* |\n| **Fast / Slow** | adjectives | `/f\u0251\u02d0st/ - /sl\u0259\u028a/` | Speed descriptions | *\"A very fast sports car.\"* |\n| **Expensive / Cheap** | adjectives | `/\u026ak\u02c8sp\u025bns\u026av/ - /t\u0283i\u02d0p/` | Cost descriptions | *\"An expensive red Ferrari.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: adjectives: position before nouns, no plural form\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Jaguar is an ________ car.",
                            optionA: "English",
                            optionB: "England",
                            optionC: "Englishs",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Mercedes is a ________ car.",
                            optionA: "German",
                            optionB: "Germany",
                            optionC: "Germans",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "They have two ________ cars.",
                            optionA: "fast",
                            optionB: "fasts",
                            optionC: "fastes",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "It's a ________ car.",
                            optionA: "red Italian",
                            optionB: "Italian red",
                            optionC: "reds Italian",
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
                  videoUrl: "/videos/beginner/ef5e_beg_rc_3and4_video.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of singular/plural, demonstratives, family, adjectives** and essential vocabulary for **Ugly house, easy exercise, family details**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_4.21_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **F:** *\"an ugly house\"*\n- **Narrator:** *\"2\"*\n- **M:** *\"an easy exercise\"*\n- **Narrator:** *\"3\"*\n- **F:** *\"my old ID card\"*\n- **Narrator:** *\"4\"*\n- **M:** *\"good evening\"*\n- **Narrator:** *\"5\"*\n- **F:** *\"an American friend\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Interviewer:** *\"What's in your bag?\"*\n- **Richard:** *\"Er, my coat, and water, and wallet.\"*\n- **Interviewer:** *\"What's in your bag?\"*\n- **Rachel:** *\"In my bag I keep my purse, my phone, and an umbrella.\"*\n- **Interviewer:** *\"Are you from a big or small family?\"*\n- **Kieran:** *\"I'm from a small family.\"*\n> *\"I have my mum, my dad, and one little sister.\"*\n- **Interviewer:** *\"How much is a cup of coffee in your local coffee shop?\"*\n- **Debra:** *\"It's four dollars.\"*\n- **Interviewer:** *\"Do you think it's cheap or expensive?\"*\n- **Debra:** *\"I think it's expensive.\"*\n- **Interviewer:** *\"Can you describe your car?\"*\n- **Susan:** *\"I have a Fiat five hundred automatic, so a small car.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **An ugly house** | noun phrase | `Descriptive adjective + noun` | An ugly house vs a beautiful home. | *\"-\"* |\n| **An easy exercise** | noun phrase | `Descriptive adjective + noun` | An easy exercise to practice adjectives. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of singular/plural, demonstratives, family, adjectives\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "It's ________ ugly house.",
                            optionA: "an",
                            optionB: "a",
                            optionC: "the",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "It's an ________ exercise.",
                            optionA: "easy",
                            optionB: "easies",
                            optionC: "easily",
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
                            question: "They are ________ students.",
                            optionA: "good",
                            optionB: "goods",
                            optionC: "a good",
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
                  videoUrl: "/videos/beginner/ef5e_beg_5a_1_vocabulary.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present simple (+) and (-): I, you, we, they** and essential vocabulary for **food and drink (tea, cheese, bread, fruit, fish, meat, pasta, coffee)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_5.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1, E\"*\n- **M:** *\"tea\"*\n- **Narrator:** *\"2, C\"*\n- **F:** *\"cheese\"*\n- **Narrator:** *\"3, B\"*\n- **M:** *\"orange juice\"*\n- **Narrator:** *\"4, A\"*\n- **F:** *\"sandwich\"*\n- **Narrator:** *\"5, D\"*\n- **M:** *\"eggs\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Tea / Coffee** | noun | `/ti\u02d0/ - /\u02c8k\u0252fi/` | Common hot breakfast drinks | *\"I drink hot tea in the morning.\"* |\n| **Cheese / Bread** | noun | `/t\u0283i\u02d0z/ - /br\u025bd/` | Staple breakfast foods | *\"Toast with cheese and butter.\"* |\n| **Breakfast / Lunch** | noun | `/\u02c8br\u025bkf\u0259st/ - /l\u028cnt\u0283/` | Morning and midday meals | *\"We have lunch at one o'clock.\"* |\n| **Don't eat / Don't drink** | verb phrase | `Present simple negative` | I don't eat meat; I am vegetarian. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present simple (+) and (-): I, you, we, they\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present simple (?): I, you, we, they; short answers** and essential vocabulary for **common verb phrases (live in a flat, have breakfast, read a book, watch TV, drink coffee)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_5.12_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **M:** *\"live in a flat\"*\n- **Narrator:** *\"2\"*\n- **F:** *\"have breakfast\"*\n- **Narrator:** *\"3\"*\n- **M:** *\"watch TV\"*\n- **Narrator:** *\"4\"*\n- **F:** *\"listen to the radio\"*\n- **Narrator:** *\"5\"*\n- **M:** *\"read the newspaper\"*\n- **Narrator:** *\"6\"*\n- **F:** *\"eat fast food\"*\n- **Narrator:** *\"7\"*\n- **M:** *\"drink tea\"*\n- **Narrator:** *\"8\"*\n- **F:** *\"speak English\"*\n- **Narrator:** *\"9\"*\n- **M:** *\"want a coffee\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Live in a flat** | verb phrase | `/l\u026av \u026an \u0259 fl\u00e6t/` | Reside in an apartment | *\"Do you live in a flat? - Yes, I do.\"* |\n| **Have breakfast** | verb phrase | `/h\u00e6v \u02c8br\u025bkf\u0259st/` | Eat morning meal | *\"What time do you have breakfast?\"* |\n| **Do you speak English?** | question | `/du\u02d0 ju\u02d0 spi\u02d0k \u02c8\u026a\u014b\u0261l\u026a\u0283/` | Present simple inquiry | *\"Yes, I do / No, I don't.\"* |\n| **Flight** | noun | `/fla\u026at/` | Journey by airplane | *\"A very long flight to Sydney.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present simple (?): I, you, we, they; short answers\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "________ you speak English? - Yes, I do.",
                            optionA: "Do",
                            optionB: "Are",
                            optionC: "Does",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Do they live in a flat? - No, they ________.",
                            optionA: "don't",
                            optionB: "doesn't",
                            optionC: "aren't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Where ________ you work?",
                            optionA: "do",
                            optionB: "are",
                            optionC: "does",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "What time do you ________ breakfast?",
                            optionA: "have",
                            optionB: "has",
                            optionC: "having",
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
                  videoUrl: "[{\"title\": \"Scene 1: Meeting in London\", \"url\": \"/videos/beginner/ef5e_beg_pe3_1.mp4\"}, {\"title\": \"Scene 2: Telling the Time\", \"url\": \"/videos/beginner/ef5e_beg_pe3_2.mp4\"}, {\"title\": \"Scene 3: Making Plans\", \"url\": \"/videos/beginner/ef5e_beg_pe3_3.mp4\"}, {\"title\": \"Scene 4: Saying How You Feel (Tired, Hungry, Thirsty)\", \"url\": \"/videos/beginner/ef5e_beg_pe3_4_useful_phrases.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Telling the time (o'clock, half past, quarter to/past); silent consonants** and essential vocabulary for **eight, half, hour, know; hungry, thirsty, tired**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_5.22_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **F:** *\"eight\"*\n- **M:** *\"half\"*\n- **F:** *\"hour\"*\n- **M:** *\"know\"*\n- **F:** *\"listen\"*\n- **M:** *\"tired\"*\n- **F:** *\"two\"*\n- **M:** *\"Wednesday\"*\n- **F:** *\"what\"*\n- **M:** *\"write\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Rob:** *\"I'm tired. What time is it?\"*\n- **Alan:** *\"It's eleven o'clock.\"*\n- **Rob:** *\"I need to go. I have a meeting in Oxford tomorrow morning.\"*\n- **Alan:** *\"One more drink?\"*\n- **Rob:** *\"Oh, OK!\"*\n- **Rob:** *\"Excuse me. What time is it?\"*\n- **Woman:** *\"It's a quarter to eight. What time's your train?\"*\n- **Rob:** *\"At seven forty-seven.\"*\n- **Woman:** *\"You need to hurry! You only have two minutes.\"*\n- **Rob:** *\"Thanks.\"*\n- **Rob:** *\"Hello. I'm Rob Walker. I'm sorry I'm late.\"*\n- **Man:** *\"You're an hour late. It's half past ten.\"*\n- **Rob:** *\"I know. I'm really sorry.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Silent consonants** | pronunciation | `Words with unpronounced letters` | half (/h\u0251\u02d0f/ silent l), hour (/a\u028a\u0259/ silent h). | *\"-\"* |\n| **What time is it?** | question | `/w\u0252t ta\u026am \u026az \u026at/` | Asking the current hour | *\"What time is it? - It's half past eight.\"* |\n| **I'm sorry I'm late** | phrase | `/a\u026am \u02c8s\u0252ri a\u026am le\u026at/` | Apologizing for tardiness | *\"I'm really sorry I'm late. - That's OK.\"* |\n| **Hungry / Tired** | adjectives | `/\u02c8h\u028c\u014b\u0261ri/ - /\u02c8ta\u026a\u0259d/` | Physical sensations | *\"Are you hungry? Let's eat.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Telling the time (o'clock, half past, quarter to/past); silent consonants\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "In the word 'half', the letter ________ is silent.",
                            optionA: "l",
                            optionB: "h",
                            optionC: "a",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "In the word 'hour', the letter ________ is silent.",
                            optionA: "h",
                            optionB: "o",
                            optionC: "u",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "What ________ is it? - It's quarter past seven.",
                            optionA: "time",
                            optionB: "clock",
                            optionC: "hour",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "I didn't eat dinner. I am very ________.",
                            optionA: "hungry",
                            optionB: "thirsty",
                            optionC: "tired",
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
                  videoUrl: "/videos/beginner/ef5e_beg_6a_1_grammar.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present simple: he, she, it (+, -, ?); third person -es** and essential vocabulary for **jobs and places of work (taxi driver, doctor, nurse, teacher, office, hospital)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_6.01_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **A:** *\"Where to?\"*\n- **B:** *\"Piccadilly Circus, please.\"*\n- **Narrator:** *\"2\"*\n- **Teacher:** *\"Can you be quiet, please?\"*\n> *\"Open your books at page fifty-nine. Quadratic equations.\"*\n- **Narrator:** *\"3\"*\n- **A:** *\"Here's your key, Mr Abrams.\"*\n> *\"It's room 205 on the second floor.\"*\n- **B:** *\"Thanks.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Julia:** *\"So who's that with you?\"*\n- **Sarah:** *\"It's Anna, you know, the intelligent girl.\"*\n- **Julia:** *\"Anna, wow! She's very different.\"*\n> *\"Her hair's blonde.\"*\n- **Sarah:** *\"Yes, and she doesn't wear glasses now.\"*\n- **Julia:** *\"What does she do?\"*\n- **Sarah:** *\"She's a journalist.\"*\n> *\"She works for a newspaper \u2013 The Times, I think.\"*\n- **Julia:** *\"Is she good?\"*\n- **Sarah:** *\"I don't know. I don't read The Times.\"*\n- **Julia:** *\"And who's that?\"*\n> *\"The man with grey hair.\"*\n- **Sarah:** *\"It's Matt! Remember?\"*\n- **Julia:** *\"Matt! No!\"*\n> *\"What does he do?\"*\n- **Sarah:** *\"He's a teacher. He teaches French.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Where to?** | phrase | `/we\u0259 tu\u02d0/` | Taxi driver greeting asking for destination | *\"Where to? - Piccadilly Circus, please.\"* |\n| **Piccadilly Circus** | proper noun | `Famous junction in London` | Take me to Piccadilly Circus. | *\"-\"* |\n| **A doctor / A nurse** | noun | `/\u02c8d\u0252kt\u0259/ - /n\u025c\u02d0s/` | Healthcare jobs | *\"He works as a doctor in a hospital.\"* |\n| **Third person -s** | grammar | `/s/, /z/, /\u026az/` | Present simple 3rd person suffix | *\"He works, she teaches, it rains.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present simple: he, she, it (+, -, ?); third person -es\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Taxi driver: Where to? Passenger: Piccadilly Circus, ________.",
                            optionA: "please",
                            optionB: "thank you",
                            optionC: "welcome",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "He ________ in a bank in central London.",
                            optionA: "works",
                            optionB: "work",
                            optionC: "working",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "She ________ like coffee; she drinks tea.",
                            optionA: "doesn't",
                            optionB: "don't",
                            optionC: "isn't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Where ________ he work? - In a hospital.",
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
                  title: "6B: Good Morning, Goodnight",
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: "[{\"title\": \"Part 1: Day in the Life of a New York Tour Guide\", \"url\": \"/videos/beginner/ef5e_beg_6b_1_listening.mp4\"}, {\"title\": \"Part 2: Tour Guide Interview (Part 2)\", \"url\": \"/videos/beginner/ef5e_beg_6b_2_listening.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **adverbs of frequency: always, usually, often, sometimes, never** and essential vocabulary for **What does he do? He's a nurse. Where does he work? In a hospital.**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_6.09.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **A:** *\"What does he do?\"*\n- **B:** *\"He's a nurse.\"*\n- **A:** *\"Where does he work?\"*\n- **B:** *\"He works in a hospital.\"*\n- **A:** *\"Does he speak English at work?\"*\n- **B:** *\"No, he doesn't.\"*\n- **A:** *\"Does he like his job?\"*\n- **B:** *\"Yes, he does.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Louisa:** *\"Hi! I'm Louisa.\"*\n> *\"I'm in New York.\"*\n> *\"I'm from England, but I'm here to learn about the life of a tour guide.\"*\n> *\"Peter Greenwald is a New York tour guide.\"*\n> *\"He lives in a small apartment in Brooklyn.\"*\n> *\"He usually gets up at eight o'clock.\"*\n> *\"Peter has a big breakfast.\"*\n> *\"He usually has fruit and cereal,\"*\n> *\"and sometimes he has an omelette.\"*\n> *\"He leaves the house at nine o'clock.\"*\n> *\"Peter works for a company called Real New York Tours.\"*\n> *\"His tours always begin in Times Square.\"*\n> *\"Every morning, he goes there by subway.\"*\n> *\"Peter usually arrives at about nine forty-five.\"*\n> *\"He meets his group and tells them about the tour.\"*\n> *\"At ten o'clock, the tour begins.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **What does he do?** | question | `/w\u0252t d\u028cz hi\u02d0 du\u02d0/` | Asking someone's profession | *\"What does he do? - He's a nurse.\"* |\n| **Where does he work?** | question | `/we\u0259 d\u028cz hi\u02d0 w\u025c\u02d0k/` | Inquiring about workplace | *\"Where does he work? - He works in a hospital.\"* |\n| **Always / Usually** | adverbs | `/\u02c8\u0254\u02d0lwe\u026az/ - /\u02c8ju\u02d0\u0292u\u0259li/` | Frequency indicators | *\"I always get up at six.\"* |\n| **Never** | adverb | `/\u02c8n\u025bv\u0259/` | At no time (0%) | *\"He never goes to bed late.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: adverbs of frequency: always, usually, often, sometimes, never\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "A: What does he do? B: He's a ________.",
                            optionA: "nurse",
                            optionB: "hospital",
                            optionC: "work",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "A: Where does he work? B: He works in a ________.",
                            optionA: "hospital",
                            optionB: "nurse",
                            optionC: "car",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "She ________ arrives on time for work.",
                            optionA: "always",
                            optionB: "always is",
                            optionC: "is always to",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "He ________ late for morning meetings.",
                            optionA: "is never",
                            optionB: "never is",
                            optionC: "never",
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
                  videoUrl: "/videos/beginner/ef5e_beg_rc_5and6_video.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of present simple all persons, adverbs of frequency, telling time** and essential vocabulary for **Lunch at half past one, dinner at eight o'clock**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_6.17_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **M:** *\"What time do you usually have lunch?\"*\n- **F:** *\"At half past one.\"*\n- **M:** *\"What time do you usually have dinner?\"*\n- **F:** *\"At about eight o'clock.\"*\n- **M:** *\"What time do you usually go to bed?\"*\n- **F:** *\"At half past eleven.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **I:** *\"What do you usually have for breakfast?\"*\n- **J:** *\"Um, just toast and a cup of tea, maybe.\"*\n- **I:** *\"Do you live in a house or a flat?\"*\n- **H:** *\"It's a house.\"*\n- **I:** *\"Where is it?\"*\n- **H:** *\"It's in Stockport, outside Manchester.\"*\n- **I:** *\"Do you have children?\"*\n- **L:** *\"I have children, yes I do. I have one son.\"*\n> *\"He is sixteen.\"*\n- **I:** *\"What do you do?\"*\n- **S:** *\"I'm retired.\"*\n- **I:** *\"Do you like being retired?\"*\n- **S:** *\"I do \u2026 very much.\"*\n- **I:** *\"What time do you get up during the week?\"*\n- **K:** *\"Um, quite early. Usually before 8 a.m.\"*\n- **I:** *\"And at weekends?\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **What time do you usually have lunch?** | question | `Routine question` | What time do you usually have lunch? - At half past one. | *\"-\"* |\n| **What time do you usually have dinner?** | question | `Routine question` | At about eight o'clock. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of present simple all persons, adverbs of frequency, telling time\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "What time do you usually ________ lunch? - At half past one.",
                            optionA: "have",
                            optionB: "has",
                            optionC: "having",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "What time do you usually have ________? - At about eight o'clock.",
                            optionA: "dinner",
                            optionB: "breakfast",
                            optionC: "lunch",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Does he ________ in London? - Yes, he does.",
                            optionA: "live",
                            optionB: "lives",
                            optionC: "living",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "She ________ TV in the evening.",
                            optionA: "watches",
                            optionB: "watch",
                            optionC: "watchs",
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
                  videoUrl: "/videos/beginner/ef5e_beg_7a_1_vocabulary.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **word order in questions: be and present simple (ASI / QUASI)** and essential vocabulary for **weekend activities (do the same thing, hard week at work, fun and exciting)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_7.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Speaker:** *\"Three out of four British people do the same thing every weekend!\"*\n> *\"After a hard week at work, the weekend is a time to do something fun and exciting.\"*\n> *\"But a new study says that 75% of British people do the same activities every Saturday and Sunday.\"*\n> *\"What do they do?\"*\n> *\"66% watch TV, 46% go shopping, and 48% do housework.\"*\n> *\"And 10% spend the weekend at home \u2013 they never leave the house!\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **At the weekend** | phrase | `/\u00e6t \u00f0\u0259 \u02ccwi\u02d0k\u02c8\u025bnd/` | Saturday and Sunday | *\"Three out of four British people do the same thing every weekend!\"* |\n| **After a hard week** | phrase | `Work recap` | After a hard week at work, the weekend is a time to do something fun. | *\"-\"* |\n| **Activities** | noun | `/\u00e6k\u02c8t\u026av\u026atiz/` | Things done for enjoyment | *\"75% do the same activities.\"* |\n| **QUASI** | grammar formula | `Question - Aux - Subject - Infinitive` | What do you do? | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: word order in questions: be and present simple (ASI / QUASI)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Three out of four British people do the ________ thing every weekend.",
                            optionA: "same",
                            optionB: "different",
                            optionC: "boring",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "After a hard week at ________, the weekend is time for fun.",
                            optionA: "work",
                            optionB: "school",
                            optionC: "shop",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Where ________ your parents live?",
                            optionA: "do",
                            optionB: "does",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "What time ________ the movie start?",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **imperatives; object pronouns: me, you, him, her, it, us, them** and essential vocabulary for **classroom imperatives and object pronouns (I'm your teacher. Listen to me! You're beautiful. I love you.)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_7.12_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n> *\"I'm your teacher.\"*\n> *\"Listen to me!\"*\n> *\"You're beautiful.\"*\n> *\"I love you.\"*\n> *\"He goes to my gym.\"*\n> *\"I see him every week.\"*\n> *\"She never listens.\"*\n> *\"Don't talk to her.\"*\n> *\"It's a nice coat!\"*\n> *\"I want it for Christmas.\"*\n> *\"We aren't friends.\"*\n> *\"They don't speak to us.\"*\n> *\"They're good books.\"*\n> *\"I want to read them.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Listen to me!** | imperative + pronoun | `Command with object pronoun` | I'm your teacher. Listen to me! | *\"-\"* |\n| **I love you** | phrase | `Subject + verb + object` | You're beautiful. I love you. | *\"-\"* |\n| **Object pronouns** | grammar | `me, him, her, us, them` | Pronouns receiving actions | *\"Call him; speak to her.\"* |\n| **Imperative** | grammar | `Base verb form` | Direct instruction or command | *\"Don't talk during the movie!\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: imperatives; object pronouns: me, you, him, her, it, us, them\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "I'm your teacher. Listen to ________!",
                            optionA: "me",
                            optionB: "I",
                            optionC: "my",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "You're beautiful. I love ________.",
                            optionA: "you",
                            optionB: "your",
                            optionC: "yours",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "________ talk during the movie!",
                            optionA: "Don't",
                            optionB: "No",
                            optionC: "Not",
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
                  videoUrl: "[{\"title\": \"Scene 1: Jenny's Birthday\", \"url\": \"/videos/beginner/ef5e_beg_pe4_1.mp4\"}, {\"title\": \"Scene 2: On the Phone with Rob\", \"url\": \"/videos/beginner/ef5e_beg_pe4_2.mp4\"}, {\"title\": \"Scene 3: Months and Dates\", \"url\": \"/videos/beginner/ef5e_beg_pe4_3.mp4\"}, {\"title\": \"Scene 4: Useful Social Phrases\", \"url\": \"/videos/beginner/ef5e_beg_pe4_4.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Saying the date, ordinal numbers (1st - 31st), talking on the phone** and essential vocabulary for **first, second, third, fourth; months of the year**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_7.21_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **F:** *\"first\"*\n- **M:** *\"second\"*\n- **F:** *\"third\"*\n- **M:** *\"fourth\"*\n- **F:** *\"fifth\"*\n- **M:** *\"sixth\"*\n- **F:** *\"seventh\"*\n- **M:** *\"eighth\"*\n- **F:** *\"ninth\"*\n- **M:** *\"tenth\"*\n- **F:** *\"eleventh\"*\n- **M:** *\"twelfth\"*\n- **F:** *\"thirteenth\"*\n- **M:** *\"fourteenth\"*\n- **F:** *\"fifteenth\"*\n- **M:** *\"sixteenth\"*\n- **F:** *\"seventeenth\"*\n- **M:** *\"eighteenth\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Rob:** *\"What's the date today?\"*\n- **Alan:** *\"I think it's the 2nd of June.\"*\n- **Rob:** *\"Are you sure? Isn't it the 1st?\"*\n- **Alan:** *\"No, definitely the 2nd.\"*\n- **Rob:** *\"Oh no!\"*\n> *\"It's my dad's birthday.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **First, second, third** | ordinal numbers | `/f\u025c\u02d0st/ - /\u02c8s\u025bk\u0259nd/ - /\u03b8\u025c\u02d0d/` | Numbered sequence | *\"The 1st, 2nd, and 3rd of the month.\"* |\n| **What's the date today?** | question | `/w\u0252ts \u00f0\u0259 de\u026at t\u0259\u02c8de\u026a/` | Inquiring about calendar date | *\"It's the second of November.\"* |\n| **Months of the year** | noun | `January to December` | Twelve months | *\"My birthday is in August.\"* |\n| **On the phone** | phrase | `Telephone conversation` | Hello, this is Rob speaking. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Saying the date, ordinal numbers (1st - 31st), talking on the phone\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "What comes after 'second'? - ________.",
                            optionA: "third",
                            optionB: "three",
                            optionC: "first",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "What's the ________ today? - It's the 15th of June.",
                            optionA: "date",
                            optionB: "day",
                            optionC: "time",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "His birthday is on the ________ of March.",
                            optionA: "twenty-first",
                            optionB: "twenty-one",
                            optionC: "twenty",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **can / can't: permission and ability; sentence rhythm** and essential vocabulary for **driving tests around the world (take the driving test, theory test, practical test, pass the test)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_8.01_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Speaker:** *\"In Qatar, you can take the driving test when you're 14.\"*\n> *\"In some states in Mexico, you only need to take a theory test, not a practical test.\"*\n> *\"In Vietnam, it's very difficult to pass the theory test. It has 450 questions!\"*\n> *\"In Croatia, you need to have 85 hours of driving lessons before you take the practical test.\"*\n> *\"In Ukraine, if you do two things wrong in your practical test, you fail.\"*\n> *\"In Brazil, after your driving test, you need to pass a psychological test to get your driving license.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Driving test** | noun | `/\u02c8dra\u026av\u026a\u014b t\u025bst/` | Official examination to drive a car | *\"You can take the driving test when you're 17.\"* |\n| **Theory test / Practical test** | noun | `Written exam vs driving exam` | In Vietnam, the theory test has 450 questions! | *\"-\"* |\n| **Can / Can't** | modal verbs | `/k\u00e6n/ - /k\u0251\u02d0nt/` | Permission or ability | *\"You can park here / You can't park here.\"* |\n| **Pass the test** | verb phrase | `/p\u0251\u02d0s \u00f0\u0259 t\u025bst/` | Succeed in an exam | *\"It's difficult to pass the driving test.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: can / can't: permission and ability; sentence rhythm\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "In Qatar, you ________ take the driving test when you're 14.",
                            optionA: "can",
                            optionB: "can to",
                            optionC: "are can",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "You ________ use mobile phones during the exam.",
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
                            question: "Where ________ we park our car?",
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
                  videoUrl: "[{\"title\": \"Part 1: Vocabulary (Activities & Hobbies)\", \"url\": \"/videos/beginner/ef5e_beg_8b_1_vocabulary_1.mp4\"}, {\"title\": \"Part 2: Singing in a Choir\", \"url\": \"/videos/beginner/ef5e_beg_8b_2_listening.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **like / love / don't mind / hate + verb + -ing** and essential vocabulary for **pronunciation of can and can't (We can park here. / I can't help you.)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_8.08_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **M:** *\"We can park here.\"*\n- **Narrator:** *\"2\"*\n- **F:** *\"I can't help you.\"*\n- **Narrator:** *\"3\"*\n- **M:** *\"You can't sit here.\"*\n- **Narrator:** *\"4\"*\n- **F:** *\"Max can go with me.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Interviewer:** *\"This is a choir.\"*\n> *\"They're called the Oxford Gargoyles.\"*\n> *\"A gargoyle is a type of statue.\"*\n> *\"You see them on a lot of old buildings in Oxford and other cities.\"*\n> *\"Today the Oxford Gargoyles have a rehearsal.\"*\n> *\"They have a new song to practise,\"*\n> *\"an old English folk song called Scarborough Fair.\"*\n> *\"Let's find out more about the choir and the people in it.\"*\n> *\"How many people are in the choir?\"*\n- **Freddie:** *\"There are thirteen people in the choir.\"*\n- **Interviewer:** *\"Are you all students?\"*\n- **Steph:** *\"Yes, we're all students at Oxford University.\"*\n- **Interviewer:** *\"What do you study?\"*\n- **Steph:** *\"I study music.\"*\n- **Alex:** *\"I study music.\"*\n- **Tegan:** *\"I study music.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **We can park here** | affirmative | `/wi k\u0259n p\u0251\u02d0k h\u026a\u0259/` | Permission statement | *\"We can park here for free.\"* |\n| **I can't help you** | negative | `/a\u026a k\u0251\u02d0nt h\u025blp ju\u02d0/` | Inability statement | *\"I'm sorry, I can't help you right now.\"* |\n| **Like / Love + -ing** | grammar | `Gerund after preference verbs` | I love singing in a choir. | *\"-\"* |\n| **Hate + -ing** | grammar | `Dislike intensely` | She hates waiting in long queues. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: like / love / don't mind / hate + verb + -ing\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "We ________ park here. Look at the sign.",
                            optionA: "can",
                            optionB: "are can",
                            optionC: "can to",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "I'm sorry, I ________ help you with your bags.",
                            optionA: "can't",
                            optionB: "don't",
                            optionC: "am not",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "I love ________ in a choir on Sundays.",
                            optionA: "singing",
                            optionB: "sing",
                            optionC: "sings",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "She hates ________ up early on cold mornings.",
                            optionA: "getting",
                            optionB: "get",
                            optionC: "gets",
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
                  videoUrl: "/videos/beginner/ef5e_beg_rc_7and8_video.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of can/can't, like + -ing, questions, imperatives** and essential vocabulary for **Cooking alone, eating with friends in a restaurant**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_8.15_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"Chris\"*\n- **Chris:** *\"I like cooking alone. I don't like having other people in the kitchen.\"*\n> *\"But I like eating with friends, especially when I'm out. I don't like being alone in a restaurant.\"*\n- **Narrator:** *\"Sarah\"*\n- **Sarah:** *\"I don't like travelling alone \u2013 I prefer going on holiday with friends.\"*\n> *\"But they need to be the right friends!\"*\n- **Narrator:** *\"Mike\"*\n- **Mike:** *\"I like shopping with friends.\"*\n> *\"When I go alone I usually buy things that look horrible on me.\"*\n> *\"I need a second opinion!\"*\n- **Narrator:** *\"Greta\"*\n- **Greta:** *\"I love dancing alone at home to really old music from the 70s, like Abba.\"*\n> *\"But I never dance with other people at parties because I know I'm a terrible dancer.\"*\n- **Narrator:** *\"Veronica\"*\n- **Veronica:** *\"I like watching films with friends. When the film finishes, we can talk about it,\"*\n> *\"and I like having someone with me so we can be happy or frightened together!\"*\n- **Narrator:** *\"Becca\"*\n- **Becca:** *\"I like running alone. It helps me to concentrate, and it's very peaceful!\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **I:** *\"What do you usually do in the evening after school?\"*\n- **S:** *\"Um, I usually go to sports practices, and finish homework,\"*\n> *\"and have dinner and things.\"*\n- **I:** *\"What kind of films do you like?\"*\n- **S:** *\"Normally action movies or comedy.\"*\n- **I:** *\"Do you usually watch films at home or at the cinema?\"*\n- **S:** *\"Depends.\"*\n> *\"If it's a good action movie, I like to go out and watch.\"*\n- **I:** *\"When's your birthday?\"*\n- **S:** *\"My birthday is the fifth of April.\"*\n- **I:** *\"What do you usually do on your birthday?\"*\n- **S:** *\"Go out for a meal with family and friends.\"*\n- **I:** *\"Do you drive to work?\"*\n- **K:** *\"Yes, I do.\"*\n- **I:** *\"Can you park near where you work?\"*\n- **K:** *\"Yes, there's a car park at my office.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **I like cooking alone** | example | `Personal preference` | Chris: I like cooking alone. I don't like having other people in the kitchen. | *\"-\"* |\n| **Eating with friends** | example | `Social preference` | I like eating with friends, especially when I'm out. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of can/can't, like + -ing, questions, imperatives\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Chris: I like ________ alone in my kitchen.",
                            optionA: "cooking",
                            optionB: "cook",
                            optionC: "cooks",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Chris: I like ________ with friends when I'm out.",
                            optionA: "eating",
                            optionB: "eat",
                            optionC: "eats",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Can they speak Italian? - No, they ________.",
                            optionA: "can't",
                            optionB: "don't",
                            optionC: "aren't",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "Don't ________ the door, please.",
                            optionA: "close",
                            optionB: "closing",
                            optionC: "closes",
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
                  videoUrl: "/videos/beginner/ef5e_beg_9a_1_pronunciation.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present continuous (be + verb-ing); sentence rhythm** and essential vocabulary for **phone call dialogue (Hello? Tony? - Oh hi darling, how's Zurich? Fine, fine. I'm staying in a nice hotel - but it's raining.)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_9.01_NEW2.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Carol:** *\"Hello? Tony?\"*\n- **Tony:** *\"Oh, hi, darling. How's Zurich?\"*\n- **Carol:** *\"Fine, fine. I'm staying in a nice hotel \u2013 but it's raining.\"*\n> *\"Can you hear it?\"*\n- **Tony:** *\"Yes, yes, I can.\"*\n- **Carol:** *\"How are the children?\"*\n- **Tony:** *\"Oh, they're fine.\"*\n- **Carol:** *\"Where are they? What are they doing?\"*\n- **Tony:** *\"Lily's in the living room. She's doing her homework.\"*\n- **Carol:** *\"And Matt and Josh?\"*\n- **Tony:** *\"They're in their bedroom. They're reading.\"*\n- **Carol:** *\"I think I can hear them. Are you sure they're reading?\"*\n- **Tony:** *\"Yes, yes. That noise is the TV.\"*\n> *\"Your mother's watching a film.\"*\n- **Carol:** *\"What about you? Are you OK?\"*\n- **Tony:** *\"I'm fine. I'm making dinner \u2013 fish and vegetables.\"*\n- **Carol:** *\"Oh, great! Very healthy.\"*\n> *\"OK darling, I need to go now. See you on Tuesday.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **How's Zurich?** | question | `Asking about city/trip` | Oh hi darling, how's Zurich? | *\"-\"* |\n| **I'm staying in a hotel** | present continuous | `Temporary ongoing action` | I'm staying in a nice hotel. | *\"-\"* |\n| **It's raining** | present continuous | `Weather right now` | It's raining. Can you hear it? | *\"-\"* |\n| **Sentence rhythm** | pronunciation | `Stress-timed English beats` | I'm staying in a nice hotel. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present continuous (be + verb-ing); sentence rhythm\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Tony: Oh hi darling. How's ________? Carol: Fine, fine.",
                            optionA: "Zurich",
                            optionB: "London",
                            optionC: "Paris",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Carol: I'm ________ in a nice hotel.",
                            optionA: "staying",
                            optionB: "stay",
                            optionC: "stays",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Look outside! It's ________ right now.",
                            optionA: "raining",
                            optionB: "rain",
                            optionC: "rains",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "What ________ you doing right now?",
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
                  videoUrl: "/videos/beginner/ef5e_beg_9b_1_vocabulary.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **present continuous or present simple? (habits vs right now)** and essential vocabulary for **day in the life of a Private Investigator; clothes (wear a suit, jacket, jeans, coat)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_9.09_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"A day in the life of a Private Investigator\"*\n> *\"People think a private investigator's job is exciting, but is it really true?\"*\n> *\"See what you think.\"*\n- **Speaker:** *\"On a typical day, I get up early and I go to my office. I don't need to wear a suit.\"*\n> *\"I usually wear a shirt and trousers.\"*\n> *\"I start work at about 9. I sit at my desk and work at my computer.\"*\n> *\"I answer phone calls. I speak to colleagues. Then at about 6.00, I finish work and go home.\"*\n> *\"The calls are usually from clients \u2013 new clients or current clients.\"*\n> *\"With a new client, first I usually meet them in person in our office.\"*\n> *\"Some clients are private individuals.\"*\n> *\"Perhaps they want us to find a missing person.\"*\n> *\"Other clients are companies.\"*\n> *\"Perhaps they want us to check out if an employee is really ill or not.\"*\n> *\"Then we need to investigate the problem. We usually do this online.\"*\n> *\"Clients pay for each day we work, and they don't want to pay a lot of money, so we try to work fast.\"*\n> *\"But sometimes our work is different, and today is one of those days.\"*\n> *\"I'm not working in the office, I'm working in the street.\"*\n> *\"I'm sitting in my car with my camera.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Private Investigator** | noun | `/\u02c8pra\u026av\u0259t \u026an\u02c8v\u025bst\u026a\u0261e\u026at\u0259/` | Detective hired for surveillance | *\"A day in the life of a Private Investigator.\"* |\n| **Wear a suit** | verb phrase | `/we\u0259r \u0259 su\u02d0t/` | Formal office clothing | *\"I don't need to wear a suit to work.\"* |\n| **Typical day** | phrase | `Daily routine` | On a typical day, I get up early and go to my office. | *\"-\"* |\n| **Present continuous vs simple** | grammar | `Right now vs Routine` | I wear jeans usually, but today I'm wearing a suit. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: present continuous or present simple? (habits vs right now)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "On a typical day, I don't need to wear a ________.",
                            optionA: "suit",
                            optionB: "jeans",
                            optionC: "shoes",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "He usually wears a t-shirt, but today he is ________ a suit.",
                            optionA: "wearing",
                            optionB: "wears",
                            optionC: "wear",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "What is the detective ________ right now?",
                            optionA: "doing",
                            optionB: "do",
                            optionC: "does",
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
                  videoUrl: "[{\"title\": \"Scene 1: Inviting Jenny to Dinner\", \"url\": \"/videos/beginner/ef5e_beg_pe5_1.mp4\"}, {\"title\": \"Scene 2: At the Restaurant\", \"url\": \"/videos/beginner/ef5e_beg_pe5_2.mp4\"}, {\"title\": \"Scene 3: Useful Social Phrases\", \"url\": \"/videos/beginner/ef5e_beg_pe5_3mp4.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Inviting and offering: Would you like a pizza? / Would you like to see a film?** and essential vocabulary for **invitations, accepting and declining politely**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_9.16_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **F:** *\"a pizza\"*\n> *\"like a pizza\"*\n> *\"Would you like a pizza?\"*\n- **M:** *\"see a film\"*\n> *\"to see a film\"*\n> *\"Would you like to see a film?\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Rob:** *\"Hey, Alan.\"*\n> *\"Would you like to come to the match with me on Sunday?\"*\n> *\"It's Norwich against Chelsea, and I have two tickets.\"*\n- **Alan:** *\"Wow!\"*\n> *\"What time's the match?\"*\n- **Rob:** *\"It's at four o'clock.\"*\n- **Alan:** *\"Yeah, I'd love to. Thanks.\"*\n- **Rob:** *\"Would you like to meet for lunch first?\"*\n- **Alan:** *\"Sorry, I can't.\"*\n> *\"It's my mum's birthday,\"*\n> *\"and I need to have lunch with her.\"*\n> *\"But I can meet you there.\"*\n- **Rob:** *\"Great.\"*\n> *\"Let's meet at half past three at the entrance to the Tube station.\"*\n- **Alan:** *\"Fine. See you there.\"*\n- **Alan:** *\"They are playing really badly.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Would you like a pizza?** | invitation/offer | `/w\u028ad ju\u02d0 la\u026ak \u0259 \u02c8pi\u02d0ts\u0259/` | Offering food politely | *\"Would you like a pizza?\"* |\n| **Would you like to see a film?** | invitation | `Inviting someone out` | Would you like to see a film tonight? | *\"-\"* |\n| **I'd love to** | phrase | `/a\u026ad l\u028cv tu\u02d0/` | Accepting enthusiastically | *\"Yes, I'd love to!\"* |\n| **I'm sorry, I can't** | phrase | `Polite refusal` | I'd love to, but I'm busy. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Inviting and offering: Would you like a pizza? / Would you like to see a film?\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Would you like ________ pizza?",
                            optionA: "a",
                            optionB: "an",
                            optionC: "the",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Would you like to ________ a film tonight?",
                            optionA: "see",
                            optionB: "seeing",
                            optionC: "sees",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "A: Would you like a cup of tea? B: Yes, ________.",
                            optionA: "please",
                            optionB: "I do",
                            optionC: "I like",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "I'd ________ to, but I have an exam tomorrow.",
                            optionA: "love",
                            optionB: "like",
                            optionC: "loving",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **there's a... / there are some...; prepositions: in, on, under, behind, opposite** and essential vocabulary for **Visit Scotland narrative (10,000 km of coast, 790 islands, 30,000 lochs, famous castles)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_10.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"Visit Scotland\"*\n- **Speaker:** *\"Scotland is one of the world's top tourist destinations, with 10,000 kilometres of coast,\"*\n> *\"790 islands, more than 30,000 'lochs' (the word in Scotland for lakes), famous castles,\"*\n> *\"and beautiful cities.\"*\n> *\"There's something for visitors of all ages.\"*\n- **Narrator:** *\"Why Loch Ness?\"*\n- **Speaker:** *\"Loch Ness is 10 km south west of the city of Inverness \u2013 perfect for day trips.\"*\n> *\"You can take a boat trip on the loch and visit the Loch Ness Centre to find out all about 'Nessie', the monster.\"*\n> *\"One of the most beautiful castles in the world, Urquhart Castle, is on the banks of the loch.\"*\n> *\"There are wonderful places for walking and cycling very near.\"*\n- **Narrator:** *\"Accommodation\"*\n- **Speaker:** *\"Stay at the Craigdarroch Hotel. It's the perfect place for a great view of the loch.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Visit Scotland** | reading topic | `Scottish tourism` | Scotland is one of the world's top tourist destinations. | *\"-\"* |\n| **Lochs / Castles** | noun | `/l\u0252ks/ - /\u02c8k\u0251\u02d0slz/` | Scottish lakes and historic fortresses | *\"More than 30,000 lochs and famous castles.\"* |\n| **There is / There are** | grammar | `/\u00f0e\u0259r \u026az/ - /\u00f0e\u0259r \u0251\u02d0/` | Stating presence or existence | *\"There's a castle on the hill.\"* |\n| **Coast / Islands** | noun | `/k\u0259\u028ast/ - /\u02c8a\u026al\u0259ndz/` | Geographic features | *\"790 beautiful Scottish islands.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: there's a... / there are some...; prepositions: in, on, under, behind, opposite\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Scotland has more than 30,000 ________ (the word for lakes).",
                            optionA: "lochs",
                            optionB: "rivers",
                            optionC: "seas",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "________ a comfortable double bed in the room.",
                            optionA: "There is",
                            optionB: "There are",
                            optionC: "It is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "Are there ________ clean towels in the bathroom?",
                            optionA: "any",
                            optionB: "some",
                            optionC: "a",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: "There are ________ pictures on the wall.",
                            optionA: "some",
                            optionB: "any",
                            optionC: "a",
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
                  videoUrl: "[{\"title\": \"Part 1: Vocabulary (in, on, at)\", \"url\": \"/videos/beginner/ef5e_beg_10b_1_vocabulary.mp4\"}, {\"title\": \"Part 2: Buildings with a Past\", \"url\": \"/videos/beginner/ef5e_beg_10b_2_listening.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **past simple: be (was / were, wasn't / weren't)** and essential vocabulary for **pronunciation /\u026a\u0259/ and /e\u0259/; in, on, at; past time expressions**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_10.09.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **M:** *\"ear\"*\n> *\"/\u026a\u0259/\"*\n> *\"beer\"*\n> *\"dear\"*\n> *\"idea\"*\n> *\"really\"*\n> *\"we're\"*\n> *\"year\"*\n- **F:** *\"chair\"*\n> *\"/e\u0259/\"*\n> *\"airport\"*\n> *\"repair\"*\n> *\"their\"*\n> *\"where\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Greg:** *\"Hi! I'm Greg.\"*\n> *\"Welcome to Oxford.\"*\n> *\"I'm visiting the Old Bank Hotel.\"*\n> *\"It's an unusual hotel in the centre of the city.\"*\n> *\"The Old Bank is in the High Street, in the centre of Oxford.\"*\n> *\"Today it's a luxury hotel, but these buildings \u2013\"*\n> *\"from number ninety-two to number ninety-four \u2013\"*\n> *\"have a very interesting history.\"*\n> *\"In the sixteenth century, they were part of Christ Church College.\"*\n> *\"In the eighteenth century, they were different shops.\"*\n> *\"And we know that in 1808 the buildings were one business \u2013\"*\n> *\"a bank.\"*\n> *\"There was a bank here for almost two hundred years,\"*\n> *\"but today it's a famous Oxford hotel.\"*\n> *\"Would you like to go in and look?\"*\n> *\"Let's go.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Was / Were** | past verb | `/w\u0252z/ - /w\u025c\u02d0/` | Past of be | *\"Where were you yesterday? - I was at home.\"* |\n| **Buildings with a past** | topic | `Historic structures` | This building was a hotel in 1920. | *\"-\"* |\n| **In, on, at** | prepositions | `Location markers` | At work, at school, in the kitchen, on the train. | *\"-\"* |\n| **Yesterday / Last night** | time expressions | `Past references` | We were at the theatre last night. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: past simple: be (was / were, wasn't / weren't)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                  videoUrl: "/videos/beginner/ef5e_beg_rc_9and10_video.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Review of present continuous, there is/are, was/were** and essential vocabulary for **Street interviews about birthplace, hometown, and hotels**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_10.16_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **A:** *\"Where were you at seven o'clock yesterday morning?\"*\n- **B:** *\"I was at home.\"*\n- **A:** *\"Were you in bed?\"*\n- **B:** *\"Yes, I was.\"*\n- **A:** *\"Where were you at ten o'clock?\"*\n- **B:** *\"I was in a caf\u00e9 with friends.\"*\n- **A:** *\"Were you there all morning?\"*\n- **B:** *\"No, we weren't. We were there for an hour.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Interviewer:** *\"What are you doing in Oxford today?\"*\n- **Anna:** *\"I'm here visiting a friend and just looking around.\"*\n- **Interviewer:** *\"What clothes do you usually wear for work?\"*\n- **Iain:** *\"I wear semi-formal clothes, so a shirt and trousers,\"*\n> *\"but I don't need to wear a tie.\"*\n- **Interviewer:** *\"Would you like to live in England?\"*\n- **Jayna:** *\"Yes.\"*\n- **Interviewer:** *\"Why?\"*\n- **Jayna:** *\"The history of the place, and just, um,\"*\n> *\"it really is a beautiful country.\"*\n- **Interviewer:** *\"Are you staying in a hotel?\"*\n- **Sandra:** *\"Yes.\"*\n- **Interviewer:** *\"Do you like it?\"*\n- **Sandra:** *\"Yes, I like it very much.\"*\n- **Interviewer:** *\"Why?\"*\n- **Sandra:** *\"It's situated near the river, it's really nice and cosy,\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Where were you born?** | question | `Birthplace inquiry` | Where were you born? - I was born in London. | *\"-\"* |\n| **Were you at home?** | question | `Past location inquiry` | No, I was at work all day. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Review of present continuous, there is/are, was/were\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Where ________ you born? - In Manchester.",
                            optionA: "were",
                            optionB: "was",
                            optionC: "are",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "There ________ three chairs in the hotel bedroom.",
                            optionA: "are",
                            optionB: "is",
                            optionC: "was",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **past simple: regular verbs (-ed endings: /t/, /d/, /\u026ad/); did / didn't** and essential vocabulary for **regular verbs (arrive, live, move, start, study, work, visit, play)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_11.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Dominic:** *\"We followed our dream. My wife and I always wanted to live abroad.\"*\n> *\"But Miriam and I both work in the UK \u2013 she's a doctor and I'm a designer \u2013\"*\n> *\"and we have two small children, Sacha and Elena.\"*\n> *\"Then an American university, Duke in Durham, North Carolina, asked Miriam to go and work there for a year.\"*\n> *\"At first, we weren't sure what to do. There were so many questions.\"*\n> *\"What about Sacha's school?\"*\n> *\"What do we do with our house?\"*\n> *\"But finally, we decided to go!\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Regular past -ed** | grammar | `/t/, /d/, or /\u026ad/` | Forming past tense with regular verbs | *\"arrived, lived, worked, studied.\"* |\n| **Did you live in New York?** | question | `Past simple interrogative with did` | Did you live in Manhattan? - No, we lived in Brooklyn. | *\"-\"* |\n| **Didn't arrive** | negative | `Past simple negative with didn't` | The ship didn't arrive until Tuesday. | *\"-\"* |\n| **New life in the USA** | topic | `Immigrant story` | In 1975, my family arrived in America. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: past simple: regular verbs (-ed endings: /t/, /d/, /\u026ad/); did / didn't\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **past simple irregular verbs: get, go, have, do (got, went, had, did)** and essential vocabulary for **verb phrases with get, go, have, do (get up, go out, have lunch, do homework)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_11.08_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Ben:** *\"Hi. I'm back. Linda! What are you doing at home?\"*\n- **Linda:** *\"Hi, Dad. You're very early.\"*\n- **Ben:** *\"Yes, I got an early flight.\"*\n- **Linda:** *\"Er, how was your day?\"*\n- **Ben:** *\"My day was fine. But what about your day? Why aren't you at school?\"*\n- **Linda:** *\"We didn't have classes today. We went to the British Museum in the morning.\"*\n> *\"It was great. And then we had lunch in the caf\u00e9 there.\"*\n- **Ben:** *\"Why didn't you go to school this afternoon?\"*\n- **Linda:** *\"We had a free afternoon. I stayed at home.\"*\n- **Ben:** *\"What did you do?\"*\n- **Linda:** *\"I did my homework. I had a lot of work.\"*\n- **Ben:** *\"Good girl. When are your exams?\"*\n- **Linda:** *\"They're next week.\"*\n- **Ben:** *\"Where's your mother?\"*\n- **Linda:** *\"She went out. I think she went shopping.\"*\n- **Ben:** *\"What's that?\"*\n- **Linda:** *\"What?\"*\n- **Ben:** *\"That noise.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Go -> Went** | irregular verb | `/w\u025bnt/` | Past of go | *\"Yesterday we went to the beach.\"* |\n| **Have -> Had** | irregular verb | `/h\u00e6d/` | Past of have | *\"We had lunch at an Italian restaurant.\"* |\n| **Get -> Got** | irregular verb | `/\u0261\u0252t/` | Past of get | *\"I got up early this morning.\"* |\n| **Do -> Did** | irregular verb | `/d\u026ad/` | Past of do | *\"What did you do on Saturday?\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: past simple irregular verbs: get, go, have, do (got, went, had, did)\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                  videoUrl: "[{\"title\": \"Scene 1: Rob Asking for Directions\", \"url\": \"/videos/beginner/ef5e_beg_pe6_1.mp4\"}, {\"title\": \"Scene 2: Finding the Bank\", \"url\": \"/videos/beginner/ef5e_beg_pe6_2.mp4\"}, {\"title\": \"Scene 3: Turn Left, Turn Right\", \"url\": \"/videos/beginner/ef5e_beg_pe6_3.mp4\"}, {\"title\": \"Scene 4: Social English Phrases\", \"url\": \"/videos/beginner/ef5e_beg_pe6_4.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Asking for and giving directions; polite intonation** and essential vocabulary for **turn left, turn right, go straight on, traffic lights, on your right**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_11.15_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"1\"*\n- **A:** *\"Excuse me?\"*\n- **B:** *\"Yes?\"*\n- **A:** *\"Is there a coffee shop near here?\"*\n- **B:** *\"Yes, there's one in South Street. It's next to the cinema, on the right.\"*\n- **A:** *\"Thanks.\"*\n- **Narrator:** *\"2\"*\n- **A:** *\"Excuse me. Is there a Chinese restaurant near here?\"*\n- **B:** *\"Yes, there's one in King Street, between the bank and the gym.\"*\n- **A:** *\"Thank you.\"*\n- **Narrator:** *\"3\"*\n- **A:** *\"Excuse me. Is there a phone shop near here?\"*\n- **B:** *\"Yes, there's one in North Street, next to the hotel, on the left.\"*\n- **A:** *\"Thanks.\"*\n- **Narrator:** *\"4\"*\n- **A:** *\"Excuse me. Where's the park?\"*\n- **B:** *\"It's in London Road, opposite the gym.\"*\n- **A:** *\"Oh, great. Thank you.\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **Rob:** *\"Excuse me.\"*\n> *\"Is there a cash machine near here?\"*\n- **Woman:** *\"Yes. There's one at Barclays Bank.\"*\n- **Rob:** *\"Sorry, where is that?\"*\n- **Woman:** *\"Turn left and go straight on.\"*\n> *\"Then turn right and it's on the right.\"*\n- **Rob:** *\"Thanks very much.\"*\n- **Woman:** *\"You're welcome.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Is there a bank near here?** | question | `/\u026az \u00f0e\u0259r \u0259 b\u00e6\u014bk n\u026a\u0259 h\u026a\u0259/` | Asking for nearby locations | *\"Excuse me, is there a bank near here?\"* |\n| **Go straight on** | direction phrase | `/\u0261\u0259\u028a stre\u026at \u0252n/` | Continue forward | *\"Go straight on and turn left.\"* |\n| **Traffic lights** | noun | `/\u02c8tr\u00e6f\u026ak la\u026ats/` | Road signals | *\"Turn right at the traffic lights.\"* |\n| **On your right** | direction phrase | `/\u0252n j\u0254\u02d0 ra\u026at/` | Located on the right side | *\"The bank is on your right.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Asking for and giving directions; polite intonation\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "Excuse me, ________ a bank near here?",
                            optionA: "is there",
                            optionB: "are there",
                            optionC: "there is",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "Go straight ________ and turn left at the lights.",
                            optionA: "on",
                            optionB: "in",
                            optionC: "to",
                            optionD: "None of the above",
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "The pharmacy is ________ your right.",
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
                  videoUrl: "[{\"title\": \"Scene 1: Strangers on a Train (Part 1)\", \"url\": \"/videos/beginner/ef5e_beg_12a_1_listening.mp4\"}, {\"title\": \"Scene 2: Strangers on a Train (Part 2)\", \"url\": \"/videos/beginner/ef5e_beg_12a_2_listening.mp4\"}, {\"title\": \"Scene 3: Strangers on a Train (Part 3)\", \"url\": \"/videos/beginner/ef5e_beg_12a_3_listening.mp4\"}]",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **past simple regular and irregular verbs storytelling sequence** and essential vocabulary for **storytelling verbs (sat, read, looked up, saw, smiled, said, changed)**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_12.01.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"Regular verbs\"*\n- **M:** *\"arrived\"*\n> *\"asked\"*\n> *\"exchanged\"*\n> *\"finished\"*\n> *\"looked\"*\n> *\"moved\"*\n> *\"opened\"*\n> *\"phoned\"*\n> *\"started\"*\n> *\"stopped\"*\n> *\"talked\"*\n> *\"waited\"*\n- **Narrator:** *\"Irregular verbs\"*\n- **F:** *\"bought\"*\n> *\"left\"*\n> *\"said\"*\n> *\"saw\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **David:** *\"Olivia's car was in the station car park.\"*\n> *\"'Nice car.'\"*\n> *\"It was a big BMW.\"*\n> *\"She was a very fast driver.\"*\n> *\"She stopped outside my flat.\"*\n> *\"We said goodbye and exchanged phone numbers.\"*\n> *\"The next morning there was a message from Olivia.\"*\n- **Olivia:** *\"I really want to see you again!\"*\n> *\"Friday?\"*\n- **David:** *\"On Friday morning, Olivia phoned me.\"*\n> *\"Hello.\"*\n- **Olivia:** *\"I have two tickets for a Beethoven concert tonight at the Royal Albert Hall!\"*\n> *\"Can you get them from the box office at seven fifteen?\"*\n> *\"We can meet in the bar at seven thirty.\"*\n> *\"The concert starts at eight.\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Strangers on a train** | narrative title | `Story` | A classic English storytelling narrative. | *\"-\"* |\n| **See -> Saw** | irregular verb | `/s\u0254\u02d0/` | Perceived with eyes | *\"He looked up and saw a mysterious woman.\"* |\n| **Say -> Said** | irregular verb | `/s\u025bd/` | Spoke words | *\"He smiled and said: 'Please sit down.'\"* |\n| **Meet -> Met** | irregular verb | `/m\u025bt/` | Encountered | *\"They met on a train to Paris.\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: past simple regular and irregular verbs storytelling sequence\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **revision of all past simple forms: affirmative, negative, interrogative, regular and irregular** and essential vocabulary for **revision of past time expressions and high-frequency verbs**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_12.05_new.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n> *[Authentic listening and pronunciation drill from Oxford English File]*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Revision** | noun | `/r\u026a\u02c8v\u026a\u0292\u0259n/` | Reviewing learned material | *\"Review all past forms before the final exam.\"* |\n| **Infinitive with did** | grammar | `Base verb after auxiliary` | Did you go? / I didn't see. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: revision of all past simple forms: affirmative, negative, interrogative, regular and irregular\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
                  videoUrl: "/videos/beginner/ef5e_beg_rc_11and12_video.mp4",
                  content: "### \ud83c\udfaf Can-Do Objective\nCan understand, pronounce, and confidently use **Comprehensive course review of past events, travel experiences, daily life** and essential vocabulary for **Vocabulary review across all 12 units**.\n\n---\n\n### \ud83c\udfa7 Audio Listening Drill\n<audio controls src=\"/audio/beginner/EF_5e_Beginner_SB_12.09_NEW_2.mp3\"></audio>\n\n#### \ud83d\udcdc Audio Transcript\n- **Narrator:** *\"11A\"*\n- **Speaker:** *\"a designer\"*\n> *\"a National Park\"*\n> *\"public transport\"*\n> *\"a trumpet\"*\n> *\"a sports club\"*\n> *\"blueberries\"*\n> *\"abroad\"*\n> *\"cheaper than\"*\n> *\"decide\"*\n> *\"invite\"*\n> *\"offer\"*\n> *\"miss\"*\n> *\"visit\"*\n> *\"pick\"*\n> *\"return\"*\n- **Narrator:** *\"11B\"*\n- **Speaker:** *\"an early flight\"*\n\n---\n\n### \ud83c\udfac Video Dialogue Transcript\n- **I:** *\"What did you do last weekend?\"*\n- **S:** *\"Last weekend it was my birthday, so I went out for a meal with friends,\"*\n> *\"and it was very sunny as well, so we went for a long walk afterwards.\"*\n- **I:** *\"Where did you go for your last holiday?\"*\n- **J:** *\"I went to Japan for Christmas.\"*\n- **I:** *\"When was the last time you went to a restaurant?\"*\n- **R:** *\"The last time I went to a restaurant, er,\"*\n> *\"was over the weekend.\"*\n> *\"I went to Sweetwater, in, er,\"*\n> *\"it's a French restaurant in Brooklyn.\"*\n- **I:** *\"Did you enjoy the meal?\"*\n- **R:** *\"I loved it. It was great.\"*\n- **I:** *\"Are you good at giving directions?\"*\n- **C:** *\"No, I'm not.\"*\n> *\"I am the worst person to ask for directions.\"*\n> *\"I myself am not good at finding places or following directions,\"*\n\n---\n\n### \ud83d\udcda Core Vocabulary Essentials\n| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |\n| :--- | :--- | :--- | :--- | :--- |\n| **Memorable trip** | phrase | `Travel recap` | What was the most memorable trip you took this year? | *\"-\"* |\n| **We travelled by train** | example | `Journey description` | We travelled by train across the entire country. | *\"-\"* |\n\n---\n\n### \ud83d\udca1 Grammar In Depth: Comprehensive course review of past events, travel experiences, daily life\nUnderstanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.\n\n> *\"Always pay attention to word order and listen to native sentence rhythm to sound more natural.\"*\n\n---\n\n### \ud83d\udde3\ufe0f Speaking & Conversation Practice\n- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.\n- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.\n\n---\n\n### \ud83c\udf1f Key Expressions to Memorize\n- Practice introducing the topic in conversation.\n- Use full sentences when answering questions.\n- Focus on clear vowel sounds and correct stress.\n",
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
