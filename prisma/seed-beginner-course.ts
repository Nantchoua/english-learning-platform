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

  // 1. Ensure instructor exists
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

  // 2. Remove old course cleanly
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

  // 3. Create the comprehensive 12-Unit course with embedded audio, video, transcripts, and 8-10 questions per Unit
  const course = await prisma.course.create({
    data: {
      title: 'English Beginner Course: Vocabulary Essentials (A1)',
      slug: 'english-beginner-course',
      description: 'A compact, exercise-based vocabulary and speaking course for beginner and elementary learners. Features embedded Oxford English File video dialogues, native audio listening tracks, pronunciation drills, and extensive interactive quizzes.',
      level: 'A1',
      isPublished: true,
      price: 20.00,
      instructorId: instructor.id,
      modules: {
        create: [
          // ─── UNIT 1 ────────────────────────────────────────────────────────
          {
            title: 'Unit 1: Introductions, Numbers & Greetings',
            order: 1,
            lessons: {
              create: [
                {
                  title: '1.1 Nice to Meet You',
                  order: 1,
                  isPublished: true,
                  isFree: true,
                  videoUrl: '/videos/beginner/ef5e_beg_1a_1_listening.mp4',
                  content: `### 🎯 Can-Do Objective
Can greet people politely, introduce yourself using "I am" / "You are", and count numbers 0–10.

---

### 🎬 Embedded Video Dialogue: In the Classroom
<video controls src="/videos/beginner/ef5e_beg_1a_1_listening.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Instructor:** *"Hello, welcome to class! My name is Sarah Jenkins. What's your name?"*
- **Alex:** *"Hello Sarah! My name is Alex. Nice to meet you."*
- **Instructor:** *"Nice to meet you too, Alex. Are you in room three?"*
- **Alex:** *"Yes, I am. I'm in group A."*
- **Instructor:** *"Great. Welcome to the academy!"*

---

### 🎧 Audio Listening & Repeat Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_1.02_new.mp3"></audio>

#### 📜 Audio Transcript
> *"One, two, three, four, five, six, seven, eight, nine, ten. Good morning, good afternoon, good evening, good night. Goodbye, see you tomorrow!"*

---

### 📚 Core Vocabulary Essentials
| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |
| :--- | :--- | :--- | :--- | :--- |
| **Hello / Hi** | interjection | /ˈhæˈləʊ/, /haɪ/ | Standard friendly greeting | *Hello! My name is Alex.* |
| **Nice to meet you** | phrase | /naɪs tuː miːt juː/ | Polite expression on first introduction | *Nice to meet you, Maria.* |
| **Name** | noun | /neɪm/ | A word by which a person is known | *What is your first name?* |
| **Numbers 0–10** | number | /ˈzɪərəʊ/ - /tɛn/ | Base counting numbers | *My classroom is room four (4).* |
| **Morning / Afternoon** | noun | /ˈmɔː.nɪŋ/, /ˌɑːf.təˈnuːn/ | Times of day for greetings | *Good morning, Mr. Davis.* |
| **Goodbye / Bye** | interjection | /ɡʊdˈbaɪ/, /baɪ/ | Expression when leaving | *Goodbye! See you on Monday.* |

---

### ⚡ Structural Blueprint
- **Affirmative:** \`I am [Name] / I'm [Name]\`
- **Addressing Others:** \`You are in room 4 / You're in room 4\`
- **Wh- Questions:** \`What is your name? / What's your name?\`

---

### 🗣️ Speaking Practice Drill
> *"Hello, my name is Alex. It is very nice to meet you. I am in room seven."*
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Hello, ________ Maria.',
                            optionA: "I'm",
                            optionB: 'I',
                            optionC: 'am',
                            optionD: 'me',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: "What's ________ name?",
                            optionA: 'you',
                            optionB: "you're",
                            optionC: 'your',
                            optionD: 'yours',
                            correctOption: 2,
                            order: 2,
                          },
                          {
                            question: 'Nice to ________ you.',
                            optionA: 'see',
                            optionB: 'meet',
                            optionC: 'know',
                            optionD: 'look',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'one, two, three, ________',
                            optionA: 'five',
                            optionB: 'four',
                            optionC: 'six',
                            optionD: 'seven',
                            correctOption: 1,
                            order: 4,
                          },
                          {
                            question: 'Which greeting is used at 9:00 AM?',
                            optionA: 'Good evening',
                            optionB: 'Good morning',
                            optionC: 'Good night',
                            optionD: 'Goodbye',
                            correctOption: 1,
                            order: 5,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '1.2 Music Round the World (Countries & Verb Be)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_1b_1_vocabulary.mp4',
                  content: `### 🎯 Can-Do Objective
Can identify countries and talk about other people using *he is / she is / it is*.

---

### 🎬 Embedded Video Dialogue: Global Musicians
<video controls src="/videos/beginner/ef5e_beg_1b_1_vocabulary.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Host:** *"Welcome to World Music! Look at this band. Where is the singer from?"*
- **Judge:** *"She is from Brazil! Her voice is incredible."*
- **Host:** *"And the guitarist? Is he from Brazil too?"*
- **Judge:** *"No, he isn't. He is from Spain. They are a global team!"*

---

### 🎧 Audio Listening: Countries of the World
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_1.08_new.mp3"></audio>

---

### 📚 Core Vocabulary Essentials
| Country | Pronunciation (IPA) | Nationality | Example Sentence |
| :--- | :--- | :--- | :--- |
| **Brazil** | /brəˈzɪl/ | Brazilian | *Rio de Janeiro is in Brazil.* |
| **China** | /ˈtʃaɪ.nə/ | Chinese | *She is from Beijing, China.* |
| **England** | /ˈɪŋ.ɡlənd/ | British | *London is the capital of England.* |
| **France** | /frɑːns/ | French | *He is from Paris, France.* |
| **Japan** | /dʒəˈpæn/ | Japanese | *Kenji is from Tokyo, Japan.* |
| **Spain** | /speɪn/ | Spanish | *Is Amanda from Spain? — Yes, she is.* |
| **United States** | /juːˌnaɪ.tɪd ˈsteɪts/ | American | *They are from the United States.* |

---

### ⚡ Structural Blueprint
- **Third-person Singular:** \`He is from France / She is from China / It is in Spain\`
- **Short Answers:** \`Is she from Italy? — Yes, she is. / No, she isn't.\`

---

### 🗣️ Speaking Practice Drill
> *"She is from Spain and he is from Japan."*
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Where ________ from?',
                            optionA: 'is he',
                            optionB: 'is',
                            optionC: 'he is',
                            optionD: 'does he',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'Is Amanda from the United States? — Yes, ________.',
                            optionA: 'is',
                            optionB: 'she is',
                            optionC: 'is she',
                            optionD: "she's",
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'Tom ________ from France.',
                            optionA: 'not',
                            optionB: "aren't",
                            optionC: "isn't",
                            optionD: "don't",
                            correctOption: 2,
                            order: 3,
                          },
                          {
                            question: 'Rio de Janeiro ________ in Brazil.',
                            optionA: "it's",
                            optionB: 'is',
                            optionC: 'are',
                            optionD: 'be',
                            correctOption: 1,
                            order: 4,
                          },
                          {
                            question: 'Where is Beijing? — It is in ________.',
                            optionA: 'Japan',
                            optionB: 'China',
                            optionC: 'France',
                            optionD: 'Brazil',
                            correctOption: 1,
                            order: 5,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 2 ────────────────────────────────────────────────────────
          {
            title: 'Unit 2: Countries, Nationalities & Numbers 11–100',
            order: 2,
            lessons: {
              create: [
                {
                  title: '2.1 Are You on Holiday? (Plural Be & Nationalities)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_2b_1_vocabulary.mp4',
                  content: `### 🎯 Can-Do Objective
Can use plural pronouns (*we, you, they*) with the verb *be* and state nationalities.

---

### 🎬 Embedded Video Dialogue: At the Airport Gate
<video controls src="/videos/beginner/ef5e_beg_2b_1_vocabulary.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Agent:** *"Good afternoon. Are you traveling together?"*
- **Tourist 1:** *"Yes, we are. We're on holiday."*
- **Agent:** *"Are you from Germany?"*
- **Tourist 2:** *"No, we aren't. We are from Zurich, Switzerland. We are Swiss!"*
- **Agent:** *"Welcome to London. Have a pleasant stay!"*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_2.01_new.mp3"></audio>

---

### 📚 Core Vocabulary Essentials
| Country | Nationality | Plural Subject Example |
| :--- | :--- | :--- |
| **Germany** | German | *They are German tourists.* |
| **Italy** | Italian | *We are Italian students.* |
| **Mexico** | Mexican | *Are they Mexican? — Yes, they are.* |
| **United Kingdom** | British | *They aren't American, they're British.* |
| **Holiday / Vacation** | noun | *We are on holiday in London.* |

---

### ⚡ Structural Blueprint
- **Affirmative:** \`We are / You are / They are [Nationality]\`
- **Negative:** \`We aren't / They aren't on business. We're on vacation.\`
- **Plural Question:** \`Are you Italian? — Yes, we are. / No, we aren't.\`
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'They are from Germany. They are ________.',
                            optionA: 'German',
                            optionB: 'Germany',
                            optionC: 'Germans',
                            optionD: 'Germanish',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'Are you on holiday? — Yes, ________.',
                            optionA: "we're",
                            optionB: 'we are',
                            optionC: 'are we',
                            optionD: 'we do',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'They ________ from the UK.',
                            optionA: "isn't",
                            optionB: "aren't",
                            optionC: 'not',
                            optionD: "don't",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'We are from Rome. We are ________.',
                            optionA: 'Italy',
                            optionB: 'Italian',
                            optionC: 'Italic',
                            optionD: 'Italians',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '2.2 What Number is the Bus? (Wh- Questions & Numbers 11–100)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_2b_2_listening.mp4',
                  content: `### 🎯 Can-Do Objective
Can understand numbers 11–100, ask for gate/bus numbers, and exchange contact numbers.

---

### 🎬 Embedded Video Dialogue: Finding the Right Bus
<video controls src="/videos/beginner/ef5e_beg_2b_2_listening.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Passenger:** *"Excuse me, what number is the bus to Oxford Street?"*
- **Officer:** *"It's bus number seventy-four (74). Look, it's at platform five."*
- **Passenger:** *"Thank you! How much is a single ticket?"*
- **Officer:** *"It is two pounds fifty (£2.50)."*

---

### 🎧 Audio Listening: Numbers 11 to 100
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_2.03_new.mp3"></audio>

---

### 📚 Core Vocabulary Essentials
- **Teens (11–19):** eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen
- **Tens (20–100):** twenty (20), thirty (30), forty (40), fifty (50), sixty (60), seventy (70), eighty (80), ninety (90), one hundred (100)
- **Key terms:** *bus stop, gate number, phone number, address, ticket*
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "What number is the bus? — It's ________.",
                            optionA: 'thirty-three',
                            optionB: 'thirteen-three',
                            optionC: 'thirty-third',
                            optionD: 'three-ten',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'ten, twenty, thirty, ________',
                            optionA: 'fourteen',
                            optionB: 'forty',
                            optionC: 'fourty',
                            optionD: 'fifteen',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'What ________ your phone number?',
                            optionA: 'is',
                            optionB: 'are',
                            optionC: 'am',
                            optionD: 'have',
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: 'How old ________ you?',
                            optionA: 'is',
                            optionB: 'are',
                            optionC: 'have',
                            optionD: 'do',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 3 ────────────────────────────────────────────────────────
          {
            title: 'Unit 3: Personal Objects, Souvenirs & Prices',
            order: 3,
            lessons: {
              create: [
                {
                  title: "3.1 Where's My Phone? (Everyday Things & Plurals)",
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_3a_1_pronunciation.mp4',
                  content: `### 🎯 Can-Do Objective
Can identify everyday personal items and form regular plurals (*-s, -es*).

---

### 🎬 Embedded Video Dialogue: Checking the Backpack
<video controls src="/videos/beginner/ef5e_beg_3a_1_pronunciation.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Emma:** *"Oh no! Where is my phone?"*
- **Tom:** *"Look in your bag. What's that next to your keys?"*
- **Emma:** *"Here it is! And my glasses and wallet are here too. Thanks!"*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_3.01.mp3"></audio>

---

### 📚 Core Vocabulary Essentials
| Singular | Plural | Meaning |
| :--- | :--- | :--- |
| **a phone** | phones | mobile smartphone |
| **a key** | keys | instrument to unlock doors |
| **a watch** | watches | timepiece worn on the wrist |
| **a wallet** | wallets | small case for cash & cards |
| **an umbrella** | umbrellas | portable rain canopy |
| **glasses** | glasses (always plural) | corrective eyewear |
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Where are my ________?',
                            optionA: 'key',
                            optionB: 'keys',
                            optionC: 'a key',
                            optionD: "key's",
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'I have ________ umbrella in my bag.',
                            optionA: 'a',
                            optionB: 'an',
                            optionC: 'two',
                            optionD: 'some',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "It's ________ credit card.",
                            optionA: 'a',
                            optionB: 'an',
                            optionC: 'the',
                            optionD: 'one',
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: 'Plural of "watch" is ________.',
                            optionA: 'watchs',
                            optionB: 'watches',
                            optionC: 'watching',
                            optionD: 'watchies',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '3.2 Souvenirs & Buying Lunch (This/That & Prices)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe2_1.mp4',
                  content: `### 🎯 Can-Do Objective
Can use demonstratives (*this, that, these, those*) to point to items and purchase lunch at a café.

---

### 🎬 Embedded Video Dialogue: At the Café Counter
<video controls src="/videos/beginner/ef5e_beg_pe2_1.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Barista:** *"Hi there. What can I get for you?"*
- **Jenny:** *"Can I have an orange juice and a tuna sandwich, please?"*
- **Barista:** *"Certainly. Anything else?"*
- **Jenny:** *"How much is that chocolate muffin?"*
- **Barista:** *"That's two euros fifty. Total is eight euros (€8.00)."*
- **Jenny:** *"Here you are. Thank you!"*

---

### 🎧 Audio Listening: Practical English 2
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_3.03.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'How much ________ this souvenir mug?',
                            optionA: 'is',
                            optionB: 'are',
                            optionC: 'does',
                            optionD: 'cost',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'How much are ________ postcards over there?',
                            optionA: 'this',
                            optionB: 'that',
                            optionC: 'those',
                            optionD: 'these',
                            correctOption: 2,
                            order: 2,
                          },
                          {
                            question: 'Can I ________ an orange juice, please?',
                            optionA: 'have',
                            optionB: 'has',
                            optionC: 'take',
                            optionD: 'drink',
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: 'Here is your change. — ________.',
                            optionA: 'Please',
                            optionB: 'Thank you',
                            optionC: 'Hello',
                            optionD: 'Excuse me',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 4 ────────────────────────────────────────────────────────
          {
            title: 'Unit 4: Family, People & Descriptions',
            order: 4,
            lessons: {
              create: [
                {
                  title: '4.1 This is My Family (Family Members & Possessives)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_4a_1_grammar.mp4',
                  content: `### 🎯 Can-Do Objective
Can describe family members and talk about relationships using possessive adjectives and \`'s\`.

---

### 🎬 Embedded Video Dialogue: Family Photos
<video controls src="/videos/beginner/ef5e_beg_4a_1_grammar.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Mark:** *"Who is that in the photo with you?"*
- **Sarah:** *"That's my brother, David. And next to him is his wife, Laura."*
- **Mark:** *"Do they have children?"*
- **Sarah:** *"Yes, two children: a boy and a girl. They live in Manchester."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_4.01_new.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'I have two ________: a boy and a girl.',
                            optionA: 'child',
                            optionB: 'childs',
                            optionC: 'children',
                            optionD: 'childrens',
                            correctOption: 2,
                            order: 1,
                          },
                          {
                            question: 'This is David. ________ wife is a doctor.',
                            optionA: 'Her',
                            optionB: 'His',
                            optionC: 'Their',
                            optionD: 'Its',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'My ________ car is blue.',
                            optionA: 'brother',
                            optionB: "brother's",
                            optionC: "brothers'",
                            optionD: 'of brother',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'My sister\'s son is my ________.',
                            optionA: 'nephew',
                            optionB: 'niece',
                            optionC: 'cousin',
                            optionD: 'brother',
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '4.2 The Right Car for Me (Adjectives & Colours)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_4b_1_grammar.mp4',
                  content: `### 🎯 Can-Do Objective
Can describe physical items using common opposite adjectives and colour words.

---

### 🎬 Embedded Video Dialogue: Buying a Car
<video controls src="/videos/beginner/ef5e_beg_4b_1_grammar.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Buyer:** *"I like that red sports car! Is it fast?"*
- **Dealer:** *"Yes, it's very fast, but it is also very expensive!"*
- **Buyer:** *"What about the silver one over there?"*
- **Dealer:** *"That is a small, modern car. It is quiet and cheap to run."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_4.03_new.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'A Ferrari is a very ________ car.',
                            optionA: 'fast',
                            optionB: 'fastly',
                            optionC: 'speed',
                            optionD: 'slow',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'Which phrase is grammatically correct?',
                            optionA: 'A car red',
                            optionB: 'A red car',
                            optionC: 'Red a car',
                            optionD: 'Car a red',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "The opposite of 'expensive' is ________.",
                            optionA: 'rich',
                            optionB: 'cheap',
                            optionC: 'small',
                            optionD: 'old',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: "The opposite of 'big' is ________.",
                            optionA: 'tall',
                            optionB: 'small',
                            optionC: 'clean',
                            optionD: 'new',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 5 ────────────────────────────────────────────────────────
          {
            title: 'Unit 5: Food, Drink & Daily Schedules',
            order: 5,
            lessons: {
              create: [
                {
                  title: '5.1 My Favourite Meal (Food & Present Simple)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_5a_1_vocabulary.mp4',
                  content: `### 🎯 Can-Do Objective
Can name everyday foods and drinks and use the Present Simple to express dietary preferences.

---

### 🎬 Embedded Video Dialogue: What's for Dinner?
<video controls src="/videos/beginner/ef5e_beg_5a_1_vocabulary.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Liam:** *"Do you eat meat?"*
- **Chloe:** *"No, I don't. I'm a vegetarian. I eat vegetables, rice, pasta, and fish."*
- **Liam:** *"Do you drink milk in the morning?"*
- **Chloe:** *"No, I prefer hot green tea or fresh orange juice."*

---

### 🎧 Audio Listening: Food & Drink Vocabulary
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_5.01.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'I ________ meat. I am a vegetarian.',
                            optionA: "don't eat",
                            optionB: "doesn't eat",
                            optionC: 'not eat',
                            optionD: 'no eat',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'We eat ________ in the morning.',
                            optionA: 'dinner',
                            optionB: 'lunch',
                            optionC: 'breakfast',
                            optionD: 'dessert',
                            correctOption: 2,
                            order: 2,
                          },
                          {
                            question: 'They ________ fresh fruit every afternoon.',
                            optionA: 'eats',
                            optionB: 'eat',
                            optionC: 'eating',
                            optionD: 'are eat',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'tea, coffee, water, ________ (drinks)',
                            optionA: 'bread',
                            optionB: 'milk',
                            optionC: 'cheese',
                            optionD: 'rice',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '5.2 A Very Long Flight & Telling the Time',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe3_1.mp4',
                  content: `### 🎯 Can-Do Objective
Can ask and tell the exact time and speak about flight itineraries.

---

### 🎬 Embedded Video Dialogue: What Time is It?
<video controls src="/videos/beginner/ef5e_beg_pe3_1.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Passenger:** *"Excuse me, what time is the flight to New York?"*
- **Gate Agent:** *"It departs at quarter past ten (10:15). Boarding starts at half past nine (9:30)."*
- **Passenger:** *"Thank you! Where is gate forty-two?"*
- **Gate Agent:** *"Go straight ahead, it's on the right."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_5.03_new.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: "What time is it? (8:30) — It's ________.",
                            optionA: 'half past eight',
                            optionB: 'eight past half',
                            optionC: 'eight thirty o\'clock',
                            optionD: 'half eight o\'clock',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'The plane ________ at 10:00 PM.',
                            optionA: 'arrive',
                            optionB: 'arrives',
                            optionC: 'arriving',
                            optionD: 'is arrive',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: '8:15 is ________.',
                            optionA: 'quarter to eight',
                            optionB: 'quarter past eight',
                            optionC: 'half past eight',
                            optionD: 'eight fifteen o\'clock',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: '9:45 is ________.',
                            optionA: 'quarter to ten',
                            optionB: 'quarter past nine',
                            optionC: 'ten to quarter',
                            optionD: 'nine forty-five o\'clock',
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 6 ────────────────────────────────────────────────────────
          {
            title: 'Unit 6: Work, Occupations & Daily Routines',
            order: 6,
            lessons: {
              create: [
                {
                  title: '6.1 Old Friends? (Jobs & Workplaces, 3rd Person -s)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_6a_1_grammar.mp4',
                  content: `### 🎯 Can-Do Objective
Can name professions and state where people work using 3rd-person singular present simple.

---

### 🎬 Embedded Video Dialogue: Meeting an Old Friend
<video controls src="/videos/beginner/ef5e_beg_6a_1_grammar.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Rachel:** *"David! Long time no see! Where do you work now?"*
- **David:** *"I work in St. Mary's Hospital. I am a doctor now!"*
- **Rachel:** *"Wow, congratulations! And your sister?"*
- **David:** *"She works at an architectural office in the city center."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_6.01_new.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'A nurse works in a ________.',
                            optionA: 'shop',
                            optionB: 'hospital',
                            optionC: 'school',
                            optionD: 'factory',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'He ________ in an international bank.',
                            optionA: 'work',
                            optionB: 'works',
                            optionC: 'working',
                            optionD: 'is work',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'Does she speak Spanish? — Yes, ________.',
                            optionA: 'she does',
                            optionB: 'she speaks',
                            optionC: 'she is',
                            optionD: 'does she',
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: 'A teacher works in a ________.',
                            optionA: 'hospital',
                            optionB: 'school',
                            optionC: 'restaurant',
                            optionD: 'bank',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '6.2 A Typical Day (Daily Routines & Frequency Adverbs)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_6b_1_listening.mp4',
                  content: `### 🎯 Can-Do Objective
Can explain your full daily routine from waking up to sleeping using adverbs of frequency.

---

### 🎬 Embedded Video Dialogue: A Day in the Life
<video controls src="/videos/beginner/ef5e_beg_6b_1_listening.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Interviewer:** *"Tell us about your day, Marco."*
- **Marco:** *"I always get up at 6:30. I have a shower, drink coffee, and catch the 7:15 train."*
- **Interviewer:** *"Do you cook in the evening?"*
- **Marco:** *"I usually cook dinner at home, but on Fridays I sometimes meet friends for pizza."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_6.03.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'I ________ wake up at 6:30 AM on weekdays.',
                            optionA: 'always',
                            optionB: 'never always',
                            optionC: 'ever',
                            optionD: 'all',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'He ________ to work by bus.',
                            optionA: 'go usually',
                            optionB: 'usually goes',
                            optionC: 'usually go',
                            optionD: 'goes usually',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: "The opposite of 'always' is ________.",
                            optionA: 'sometimes',
                            optionB: 'usually',
                            optionC: 'never',
                            optionD: 'often',
                            correctOption: 2,
                            order: 3,
                          },
                          {
                            question: 'What do you do in the morning? — I ________ a shower.',
                            optionA: 'take',
                            optionB: 'have',
                            optionC: 'do',
                            optionD: 'make',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 7 ────────────────────────────────────────────────────────
          {
            title: 'Unit 7: Free Time, Hobbies & Cinema',
            order: 7,
            lessons: {
              create: [
                {
                  title: '7.1 At the Weekend (Free-Time Activities)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_7a_1_vocabulary.mp4',
                  content: `### 🎯 Can-Do Objective
Can describe leisure activities and ask friends about their weekend plans.

---

### 🎬 Embedded Video Dialogue: Weekend Plans
<video controls src="/videos/beginner/ef5e_beg_7a_1_vocabulary.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Paul:** *"What do you do at the weekend, Sophie?"*
- **Sophie:** *"I usually play tennis on Saturday morning and go for a long walk in the park."*
- **Paul:** *"Do you listen to music or read books?"*
- **Sophie:** *"Yes, I love reading history books on Sunday afternoons."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_7.01.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Do you ________ tennis after work?',
                            optionA: 'do',
                            optionB: 'go',
                            optionC: 'play',
                            optionD: 'make',
                            correctOption: 2,
                            order: 1,
                          },
                          {
                            question: 'We ________ TV in the evening.',
                            optionA: 'watch',
                            optionB: 'look',
                            optionC: 'see',
                            optionD: 'listen',
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: 'I ________ to music when I study.',
                            optionA: 'hear',
                            optionB: 'listen',
                            optionC: 'sound',
                            optionD: 'play',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'Where ________ you go on Sundays?',
                            optionA: 'do',
                            optionB: 'does',
                            optionC: 'are',
                            optionD: 'is',
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '7.2 Lights, Camera, Action! (Film Genres & Object Pronouns)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe4_1.mp4',
                  content: `### 🎯 Can-Do Objective
Can identify film genres and replace nouns with object pronouns (*me, you, him, her, it, us, them*).

---

### 🎬 Embedded Video Dialogue: Choosing a Film
<video controls src="/videos/beginner/ef5e_beg_pe4_1.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Leo:** *"Do you like comedies?"*
- **Mia:** *"Yes, I love them! They make me laugh."*
- **Leo:** *"Look at that new Tom Cruise movie. Do you like him?"*
- **Mia:** *"He is an amazing actor. Let's buy two tickets for it!"*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_7.03.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Do you like action films? — Yes, I love ________.',
                            optionA: 'they',
                            optionB: 'them',
                            optionC: 'their',
                            optionD: 'it',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'Look at that actor! Do you know ________?',
                            optionA: 'he',
                            optionB: 'his',
                            optionC: 'him',
                            optionD: 'himself',
                            correctOption: 2,
                            order: 2,
                          },
                          {
                            question: 'A funny movie is a ________.',
                            optionA: 'horror',
                            optionB: 'comedy',
                            optionC: 'thriller',
                            optionD: 'documentary',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'Come to the cinema with ________ tonight!',
                            optionA: 'we',
                            optionB: 'our',
                            optionC: 'us',
                            optionD: 'they',
                            correctOption: 2,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 8 ────────────────────────────────────────────────────────
          {
            title: 'Unit 8: Skills, Abilities & Preferences',
            order: 8,
            lessons: {
              create: [
                {
                  title: '8.1 Can I Park Here? (Can / Can’t for Ability & Rules)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_8b_1_vocabulary_1.mp4',
                  content: `### 🎯 Can-Do Objective
Can express physical abilities and permissions with modal *can / can't*.

---

### 🎬 Embedded Video Dialogue: Rules and Signs
<video controls src="/videos/beginner/ef5e_beg_8b_1_vocabulary_1.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Driver:** *"Excuse me officer, can I park here for ten minutes?"*
- **Officer:** *"No, I'm sorry, you can't park here. It is for buses only."*
- **Driver:** *"Where can I park?"*
- **Officer:** *"You can park in the multi-story car park on Elm Street."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_8.01_new.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: '________ you speak English? — Yes, a little.',
                            optionA: 'Do',
                            optionB: 'Can',
                            optionC: 'Are',
                            optionD: 'Have',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'You ________ park here. It is illegal.',
                            optionA: 'can',
                            optionB: "can't",
                            optionC: 'no can',
                            optionD: 'not can',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'She can ________ five different languages.',
                            optionA: 'speaks',
                            optionB: 'speak',
                            optionC: 'to speak',
                            optionD: 'speaking',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'Can I pay by credit card? — Yes, you ________.',
                            optionA: 'can',
                            optionB: 'do',
                            optionC: 'are',
                            optionD: 'have',
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '8.2 I Love Shopping (Like / Love / Hate + -ing)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_8b_2_listening.mp4',
                  content: `### 🎯 Can-Do Objective
Can talk about passions, hobbies, and dislikes using verbs followed by *-ing*.

---

### 🎬 Embedded Video Dialogue: What Do You Like Doing?
<video controls src="/videos/beginner/ef5e_beg_8b_2_listening.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Interviewer:** *"Do you like shopping for clothes?"*
- **Sam:** *"No, I hate shopping! It's so crowded. But I love cooking for my family."*
- **Interviewer:** *"What about sports?"*
- **Sam:** *"I love running in the morning. It gives me energy!"*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_8.03-02.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'David hates ________ to the supermarket on Saturdays.',
                            optionA: 'go',
                            optionB: 'going',
                            optionC: 'goes',
                            optionD: 'went',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'She loves ________ Italian food for dinner.',
                            optionA: 'cook',
                            optionB: 'cooking',
                            optionC: 'cooks',
                            optionD: 'to cooking',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'Do you like ________ books in English?',
                            optionA: 'read',
                            optionB: 'reading',
                            optionC: 'reads',
                            optionD: 'to read',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'I ________ mind cleaning the kitchen.',
                            optionA: 'not',
                            optionB: "don't",
                            optionC: 'am not',
                            optionD: 'no',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 9 ────────────────────────────────────────────────────────
          {
            title: 'Unit 9: Present Actions, Travel & Clothes',
            order: 9,
            lessons: {
              create: [
                {
                  title: '9.1 What Are They Really Doing? (Present Continuous)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_9a_1_pronunciation.mp4',
                  content: `### 🎯 Can-Do Objective
Can describe actions happening right now at this exact moment (*am/is/are + verb-ing*).

---

### 🎬 Embedded Video Dialogue: Calling from the Train
<video controls src="/videos/beginner/ef5e_beg_9a_1_pronunciation.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Jack:** *"Hi Lisa, where are you? Are you at home?"*
- **Lisa:** *"No, I'm travelling on the train. I'm listening to music and watching the view."*
- **Jack:** *"Is your brother with you?"*
- **Lisa:** *"No, he is working on his laptop at the office right now."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_9.01_NEW2.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'What ________ you doing right now?',
                            optionA: 'do',
                            optionB: 'are',
                            optionC: 'is',
                            optionD: 'have',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'She ________ on the phone with her manager.',
                            optionA: 'talks',
                            optionB: 'is talking',
                            optionC: 'talking',
                            optionD: 'are talking',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'They ________ for the taxi outside.',
                            optionA: 'is waiting',
                            optionB: 'are waiting',
                            optionC: 'wait',
                            optionD: 'waiting',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'Look outside! It ________.',
                            optionA: 'is raining',
                            optionB: 'rains',
                            optionC: 'raining',
                            optionD: 'does rain',
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '9.2 Watching and Waiting (Clothes & Style)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_9b_1_vocabulary.mp4',
                  content: `### 🎯 Can-Do Objective
Can name wardrobe items and describe what someone is wearing today.

---

### 🎬 Embedded Video Dialogue: Spotting Someone in the Crowd
<video controls src="/videos/beginner/ef5e_beg_9b_1_vocabulary.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Detective:** *"Can you see him? What is he wearing?"*
- **Agent:** *"Yes, he is wearing a dark blue coat, black jeans, and brown leather boots."*
- **Detective:** *"Is he carrying a bag?"*
- **Agent:** *"Yes, he is carrying a grey backpack."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_9.03_NEW2.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'He is ________ a warm winter coat.',
                            optionA: 'wear',
                            optionB: 'wearing',
                            optionC: 'wears',
                            optionD: 'dress',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'trousers, jeans, shorts, ________ (legwear)',
                            optionA: 'hat',
                            optionB: 'skirt',
                            optionC: 'shoes',
                            optionD: 'glasses',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'Which item do you wear on your feet?',
                            optionA: 'Shoes',
                            optionB: 'Gloves',
                            optionC: 'Scarf',
                            optionD: 'Shirt',
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: 'Today she ________ a red dress.',
                            optionA: 'is wearing',
                            optionB: 'wears',
                            optionC: 'wear',
                            optionD: 'wearing',
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 10 ───────────────────────────────────────────────────────
          {
            title: 'Unit 10: Hotels, Accommodations & Past Locations',
            order: 10,
            lessons: {
              create: [
                {
                  title: '10.1 A Room with a View (There is / There are & Hotels)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_10b_1_vocabulary.mp4',
                  content: `### 🎯 Can-Do Objective
Can describe room amenities using *there is / there are* and prepositions of place (*in, on, under*).

---

### 🎬 Embedded Video Dialogue: Checking the Hotel Room
<video controls src="/videos/beginner/ef5e_beg_10b_1_vocabulary.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Guest:** *"Hello reception. Is there a hair dryer in the room?"*
- **Reception:** *"Yes, madam. There is one in the bathroom cabinet under the sink."*
- **Guest:** *"And are there clean towels?"*
- **Reception:** *"Yes, there are four fresh white towels on the shelf."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_10.01.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: '________ a nice restaurant in this hotel?',
                            optionA: 'Is there',
                            optionB: 'Are there',
                            optionC: 'There is',
                            optionD: 'Have there',
                            correctOption: 0,
                            order: 1,
                          },
                          {
                            question: 'There ________ three pillows on the bed.',
                            optionA: 'is',
                            optionB: 'are',
                            optionC: 'have',
                            optionD: 'be',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'The towels are ________ the shelf in the bathroom.',
                            optionA: 'on',
                            optionB: 'under',
                            optionC: 'into',
                            optionD: 'at',
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: '________ any drinks in the mini-bar?',
                            optionA: 'Is there',
                            optionB: 'Are there',
                            optionC: 'Have there',
                            optionD: 'There are',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '10.2 Where Was He? (Past Simple of Be: Was / Were)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_10b_2_listening.mp4',
                  content: `### 🎯 Can-Do Objective
Can talk about past locations and states using *was* and *were*.

---

### 🎬 Embedded Video Dialogue: Where Were You Yesterday?
<video controls src="/videos/beginner/ef5e_beg_10b_2_listening.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Boss:** *"Where were you yesterday at three o'clock, Kevin?"*
- **Kevin:** *"I was at the dentist's office. I had a bad toothache."*
- **Boss:** *"And were your colleagues with you?"*
- **Kevin:** *"No, they weren't. They were in the sales meeting."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_10.03.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Where ________ you yesterday afternoon?',
                            optionA: 'was',
                            optionB: 'were',
                            optionC: 'did',
                            optionD: 'are',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'She ________ at the office last Monday.',
                            optionA: 'was',
                            optionB: 'were',
                            optionC: 'is',
                            optionD: 'been',
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: "They ________ at the party because they were tired.",
                            optionA: "wasn't",
                            optionB: "weren't",
                            optionC: "didn't",
                            optionD: "aren't",
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'Was the hotel good? — Yes, it ________.',
                            optionA: 'were',
                            optionB: 'was',
                            optionC: 'is',
                            optionD: 'did',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 11 ───────────────────────────────────────────────────────
          {
            title: 'Unit 11: Past Experiences, Regular Verbs & Directions',
            order: 11,
            lessons: {
              create: [
                {
                  title: '11.1 A New Life in the USA (Past Simple Regular Verbs)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe6_1.mp4',
                  content: `### 🎯 Can-Do Objective
Can talk about past life experiences using regular verbs ending in *-ed*.

---

### 🎬 Embedded Video Dialogue: Moving to New York
<video controls src="/videos/beginner/ef5e_beg_pe6_1.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Friend:** *"When did you arrive in the United States?"*
- **Migrant:** *"I arrived three years ago. I lived with my uncle and worked in a bakery."*
- **Friend:** *"Did you enjoy the work?"*
- **Migrant:** *"Yes, I loved it! I learned English and met so many wonderful people."*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_11.01.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'He ________ in New York five years ago.',
                            optionA: 'live',
                            optionB: 'lived',
                            optionC: 'living',
                            optionD: 'was live',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'We ________ our journey at nine o\'clock.',
                            optionA: 'start',
                            optionB: 'started',
                            optionC: 'starting',
                            optionD: 'was start',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'Did you ________ the exhibition? — Yes, I did.',
                            optionA: 'visit',
                            optionB: 'visited',
                            optionC: 'visiting',
                            optionD: 'visits',
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: 'Three days ________ means three days in the past.',
                            optionA: 'before',
                            optionB: 'ago',
                            optionC: 'past',
                            optionD: 'since',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '11.2 How Was Your Day? (Common Irregular Past Verbs)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe6_2.mp4',
                  content: `### 🎯 Can-Do Objective
Can describe events from yesterday using top irregular past verbs (*went, had, got, did, saw, bought*).

---

### 🎬 Embedded Video Dialogue: Asking for Directions
<video controls src="/videos/beginner/ef5e_beg_pe6_2.mp4"></video>

#### 📜 Video Dialogue Transcript
- **Tourist:** *"Excuse me, how do I get to the central train station?"*
- **Local:** *"Go straight ahead for two blocks, then turn left at the traffic lights. It's on your right."*
- **Tourist:** *"Thank you so much!"*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_11.03.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Yesterday I ________ a great movie with my family.',
                            optionA: 'see',
                            optionB: 'saw',
                            optionC: 'seen',
                            optionD: 'was see',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'We ________ to an authentic Italian restaurant last night.',
                            optionA: 'go',
                            optionB: 'went',
                            optionC: 'gone',
                            optionD: 'goes',
                            correctOption: 1,
                            order: 2,
                          },
                          {
                            question: 'She ________ breakfast before leaving the house.',
                            optionA: 'had',
                            optionB: 'have',
                            optionC: 'has',
                            optionD: 'having',
                            correctOption: 0,
                            order: 3,
                          },
                          {
                            question: 'Where is the bank? — Go ________ ahead for two blocks.',
                            optionA: 'straight',
                            optionB: 'direct',
                            optionC: 'forward',
                            optionD: 'right',
                            correctOption: 0,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // ─── UNIT 12 ───────────────────────────────────────────────────────
          {
            title: 'Unit 12: Storytelling & Level A1 Milestone',
            order: 12,
            lessons: {
              create: [
                {
                  title: '12.1 Strangers on a Train (Storytelling with Past Verbs)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_12a_1_listening.mp4',
                  content: `### 🎯 Can-Do Objective
Can link sentences together using *and, but, because, so* to narrate simple stories in the past.

---

### 🎬 Embedded Video Dialogue: Strangers on a Train
<video controls src="/videos/beginner/ef5e_beg_12a_1_listening.mp4"></video>

#### 📜 Video Dialogue Transcript
> *"Yesterday morning, I took the 8:30 train from London to Edinburgh. The carriage was completely full, so I sat next to an interesting passenger named David. We talked about photography and travel for three hours because we both love nature. It was a wonderful journey!"*

---

### 🎧 Audio Listening Drill
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_12.01.mp3"></audio>
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'He ________ on the train and read his book.',
                            optionA: 'sit',
                            optionB: 'sat',
                            optionC: 'sitting',
                            optionD: 'sitted',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'They were late ________ the train was delayed.',
                            optionA: 'because',
                            optionB: 'so',
                            optionC: 'but',
                            optionD: 'although',
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: 'I wanted coffee, ________ the cafe was closed.',
                            optionA: 'and',
                            optionB: 'but',
                            optionC: 'so',
                            optionD: 'because',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'We ________ our tickets to the inspector.',
                            optionA: 'show',
                            optionB: 'showed',
                            optionC: 'shown',
                            optionD: 'was show',
                            correctOption: 1,
                            order: 4,
                          },
                        ]
                      }
                    }
                  }
                },
                {
                  title: '12.2 A1 Milestone Review & Self-Introduction Challenge',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_rc_11and12_video.mp4',
                  content: `### 🎯 Can-Do Objective
Congratulations! You have achieved CEFR Level A1 English Fluency. You can introduce yourself, describe your routines, hobbies, and past experiences confidently.

---

### 🎬 Embedded Video: Revise & Check Milestone
<video controls src="/videos/beginner/ef5e_beg_rc_11and12_video.mp4"></video>

---

### 🎧 Audio Listening Drill: Level A1 Final Consolidation
<audio controls src="/audio/beginner/EF_5e_Beginner_SB_12.03.mp3"></audio>

---

### 🏆 Final Speaking Self-Introduction Blueprint
1. **Greeting & Identity:** *"Hello! My name is Dominic. I am from Cameroon and I live in Germany."*
2. **Work / Profession:** *"I work in technology and software development."*
3. **Daily Routine:** *"Every day, I usually wake up at 7:00, have coffee, and work with my team."*
4. **Hobbies & Passion:** *"In my free time, I love cooking, travelling, and learning languages."*
5. **Recent Past Event:** *"Last weekend, I went on a trip and saw beautiful places!"*
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'Which tense describes your daily routines and habits?',
                            optionA: 'Present Continuous',
                            optionB: 'Present Simple',
                            optionC: 'Past Simple',
                            optionD: 'Future',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'Which tense describes what you did yesterday?',
                            optionA: 'Past Simple',
                            optionB: 'Present Simple',
                            optionC: 'Future',
                            optionD: 'Present Continuous',
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: 'I am interested ________ learning English.',
                            optionA: 'on',
                            optionB: 'in',
                            optionC: 'at',
                            optionD: 'with',
                            correctOption: 1,
                            order: 3,
                          },
                          {
                            question: 'Congratulations on completing Level A1! What is your next level?',
                            optionA: 'Level A2',
                            optionB: 'Level A0',
                            optionC: 'Finish',
                            optionD: 'None',
                            correctOption: 0,
                            order: 4,
                          },
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

  console.log(`Successfully created course: ${course.title} (ID: ${course.id}) with 12 Units and 24 Lessons!`);
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
