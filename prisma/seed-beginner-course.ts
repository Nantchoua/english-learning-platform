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
  console.log('Seeding English Beginner Course: Vocabulary Essentials (A1)...');

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

  // 2. Remove any old A1 beginner course to replace with the new compact version
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
    // Delete old progress, quiz attempts, quizzes, lessons, modules
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

  // 3. Create the brand new English Beginner Course: Vocabulary Essentials (A1)
  const course = await prisma.course.create({
    data: {
      title: 'English Beginner Course: Vocabulary Essentials (A1)',
      slug: 'english-beginner-course',
      description: 'A compact, exercise-based vocabulary and speaking course for beginner and elementary learners. Master essential high-frequency words, practical daily dialogues, pronunciation drills, and interactive quizzes.',
      level: 'A1',
      isPublished: true,
      price: 20.00,
      instructorId: instructor.id,
      modules: {
        create: [
          // Unit 1
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
Can greet people, introduce yourself with "I am" / "You are", and count numbers 0–10.

---

### 📚 Core Vocabulary Essentials
| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |
| :--- | :--- | :--- | :--- | :--- |
| **Hello / Hi** | interjection | /ˈhæˈləʊ/, /haɪ/ | Standard friendly greeting | *Hello! My name is Sarah.* |
| **Nice to meet you** | phrase | /naɪs tuː miːt juː/ | Polite phrase on first introduction | *Hello Alex, nice to meet you.* |
| **Name** | noun | /neɪm/ | A word by which a person is known | *What is your name?* |
| **Zero to Ten** | number | /ˈzɪərəʊ/ - /tɛn/ | Base counting numbers | *My room number is seven (7).* |
| **Goodbye / Bye** | interjection | /ɡʊdˈbaɪ/, /baɪ/ | Expression when leaving | *Goodbye! See you tomorrow.* |

---

### ⚡ Structural Blueprint
- **Affirmative:** \`I am [Name] / I'm [Name]\`
- **You are:** \`You are in room 4 / You're in room 4\`
- **Question:** \`What's your name? / Where are you from?\`

---

### 💬 Real-Life Mini Dialogue
- **A:** *"Hello! I'm Alex. What's your name?"*  
- **B:** *"Hi Alex! I'm Maria. Nice to meet you."*  
- **A:** *"Nice to meet you too, Maria. Are you in room three?"*  
- **B:** *"Yes, I am. See you in class!"*  

---

### 🗣️ Speaking Practice Drill
> *"Hello, my name is Alex. It is very nice to meet you."*  
*(Use the Speaking Practice Studio below to test your pronunciation score!)*
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

### 📚 Core Vocabulary Essentials
| Country | Pronunciation (IPA) | Nationality | Example Sentence |
| :--- | :--- | :--- | :--- |
| **Brazil** | /brəˈzɪl/ | Brazilian | *Rio de Janeiro is in Brazil.* |
| **China** | /ˈtʃaɪ.nə/ | Chinese | *She is from Beijing, China.* |
| **England** | /ˈɪŋ.ɡlənd/ | British | *London is the capital of England.* |
| **France** | /frɑːns/ | French | *He is from Paris, France.* |
| **Japan** | /dʒəˈpæn/ | Japanese | *Kenji is from Tokyo, Japan.* |
| **Spain** | /speɪn/ | Spanish | *Is Amanda from Spain?* |

---

### ⚡ Structural Blueprint
- **Third-person Singular:** \`He is from France / She is from China / It is in Spain\`
- **Short Answers:** \`Is she from Italy? — Yes, she is. / No, she isn't.\`

---

### 💬 Real-Life Mini Dialogue
- **A:** *"Where is Marco from?"*  
- **B:** *"He's from Italy. He lives in Rome."*  
- **A:** *"And is Yumiko from China?"*  
- **B:** *"No, she isn't. She is from Japan."*  

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
                        ]
                      }
                    }
                  }
                },
                {
                  title: '1.3 Practical English — How Do You Spell It?',
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe1_1.mp4',
                  content: `### 🎯 Can-Do Objective
Can recite the alphabet, spell your name clearly, and book a room or table.

---

### 📚 Core Vocabulary Essentials
| Term | Pronunciation (IPA) | Meaning | Example Sentence |
| :--- | :--- | :--- | :--- |
| **Surname / Last name** | /ˈsɜː.neɪm/ | Family name | *My surname is Jenkins.* |
| **Spell** | /spɛl/ | Say or write the letters of a word | *Can you spell that, please?* |
| **Reservation** | /ˌrez.əˈveɪ.ʃən/ | Booking a room or table | *I have a hotel reservation.* |
| **Passport** | /ˈpɑːs.pɔːt/ | Official travel identification | *Here is my passport.* |
| **Key card** | /ˈkiː ˌkɑːd/ | Plastic card to open hotel room door | *Here is your key card for room 12.* |

---

### ⚡ Structural Blueprint
- **Spelling Request:** \`How do you spell your surname? — J-E-N-K-I-N-S.\`
- **Hotel Desk:** \`Good afternoon, I have a reservation. My name is [Name].\`

---

### 🗣️ Speaking Practice Drill
> *"Good afternoon, I have a reservation for three nights."*
`,
                  quiz: {
                    create: {
                      questions: {
                        create: [
                          {
                            question: 'How do you ________ your surname?',
                            optionA: 'speak',
                            optionB: 'spell',
                            optionC: 'say',
                            optionD: 'tell',
                            correctOption: 1,
                            order: 1,
                          },
                          {
                            question: 'I have a ________ for two nights at this hotel.',
                            optionA: 'reservation',
                            optionB: 'reserve',
                            optionC: 'ticket',
                            optionD: 'passport',
                            correctOption: 0,
                            order: 2,
                          },
                          {
                            question: 'Friday, Saturday, Sunday, ________',
                            optionA: 'Tuesday',
                            optionB: 'Monday',
                            optionC: 'Wednesday',
                            optionD: 'Thursday',
                            correctOption: 1,
                            order: 3,
                          },
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 2
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

### 📚 Core Vocabulary Essentials
| Country | Nationality | Plural Example |
| :--- | :--- | :--- |
| **Germany** | German | *They are German tourists.* |
| **Italy** | Italian | *We are Italian students.* |
| **Mexico** | Mexican | *Are they Mexican? — Yes, they are.* |
| **United Kingdom** | British | *They aren't American, they're British.* |
| **Holiday / Vacation** | noun | *We are on holiday in London.* |

---

### ⚡ Structural Blueprint
- **Plural Statement:** \`We are / You are / They are [Nationality]\`
- **Negative:** \`We aren't / They aren't on business. We're on vacation.\`
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
                        ]
                      }
                    }
                  }
                },
                {
                  title: '2.2 What Number is the Bus? (Wh- Questions & 11–100)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_2b_2_listening.mp4',
                  content: `### 🎯 Can-Do Objective
Can understand numbers 11–100, ask for gate/bus numbers, and exchange phone numbers.

---

### 📚 Core Vocabulary Essentials
- **11–19:** eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen
- **Tens:** twenty (20), thirty (30), forty (40), fifty (50), sixty (60), seventy (70), eighty (80), ninety (90), one hundred (100)
- **Key terms:** *Bus number, Gate number, Phone number, Address, Street*

---

### ⚡ Structural Blueprint
- \`What number is the bus? — It's bus number twenty-two (22).\`
- \`What is your phone number? — It is 07911 123456.\`
- \`How old are you? — I am twenty-eight (28) years old.\`
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 3
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
Can identify everyday personal items and use singular/plural forms with *a/an*.

---

### 📚 Core Vocabulary Essentials
| Singular | Plural | Meaning |
| :--- | :--- | :--- |
| **a phone** | phones | mobile device |
| **a key** | keys | instrument to unlock doors |
| **a watch** | watches | timepiece worn on wrist |
| **a wallet** | wallets | small pocket case for money |
| **an umbrella** | umbrellas | portable rain protection |
| **glasses** | glasses (always plural) | eyewear |

---

### ⚡ Structural Blueprint
- **a vs. an:** \`a phone, a key\` vs. \`an umbrella, an orange, an apple\`
- **Plurals:** Add *-s* (keys) or *-es* after -ch/-sh/-x/-s (watches, glasses)
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
Can use demonstratives (*this, that, these, those*) to point to objects and order drinks or souvenirs with prices.

---

### 📚 Core Vocabulary Essentials
- **Demonstratives:**
  - *This* (singular, near): *This mug is €5.*
  - *That* (singular, far): *That shirt is €20.*
  - *These* (plural, near): *These postcards are beautiful.*
  - *Those* (plural, far): *Those bags are expensive.*
- **Café Vocabulary:** *sandwich, orange juice, coffee, mineral water, bill/check*

---

### 💬 Real-Life Mini Dialogue
- **Student:** *"Can I have a cheese sandwich and an orange juice, please?"*  
- **Clerk:** *"Certainly. That's seven euros fifty (€7.50)."*  
- **Student:** *"Here you are. Thank you!"*  
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 4
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
Can describe family members and talk about possessions using possessive adjectives and \`'s\`.

---

### 📚 Core Vocabulary Essentials
| Term | Pronunciation (IPA) | Meaning |
| :--- | :--- | :--- |
| **Father / Mother** | /ˈfɑː.ðər/, /ˈmʌð.ər/ | Male/female parent |
| **Brother / Sister** | /ˈbrʌð.ər/, /ˈsɪs.tər/ | Male/female sibling |
| **Husband / Wife** | /ˈhʌz.bənd/, /waɪf/ | Married partner |
| **Son / Daughter** | /sʌn/, /ˈdɔː.tər/ | Male/female child |
| **Parents / Children** | /ˈpeə.rənts/, /ˈtʃɪl.drən/ | Mother+father / Sons+daughters |

---

### ⚡ Structural Blueprint
- **Possessive Adjectives:** my, your, his, her, our, their
- **Possessive \`'s\`:** \`David's car / My mother's house / Sarah's husband\`
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
Can describe physical items using common opposite adjectives and colours.

---

### 📚 Core Vocabulary Essentials
| Adjective | Opposite | Meaning in Context |
| :--- | :--- | :--- |
| **big** | **small** | size |
| **fast** | **slow** | speed |
| **expensive** | **cheap** | cost |
| **new** | **old** | age |
| **beautiful** | **ugly** | appearance |
| **Colours:** | red, blue, green, yellow, black, white, silver |

---

### ⚡ Structural Blueprint
- Adjective goes **BEFORE** the noun: \`A fast car\` (NOT \`a car fast\`)
- Adjective goes **AFTER** verb *be*: \`The car is fast.\`
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 5
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
Can name common foods and drinks and use the Present Simple to express daily eating habits.

---

### 📚 Core Vocabulary Essentials
- **Meals:** breakfast, lunch, dinner
- **Food:** bread, rice, pasta, meat, fish, eggs, salad, vegetables, fruit
- **Drinks:** water, tea, coffee, milk, fruit juice

---

### ⚡ Structural Blueprint
- **Positive:** \`I eat fresh fruit every day. We drink tea in the morning.\`
- **Negative:** \`I don't drink milk. They don't eat meat.\`
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
Can tell the exact time and ask about flight departures and arrivals.

---

### 📚 Core Vocabulary Essentials
- **Telling the Time:**
  - *8:00* -> Eight o'clock
  - *8:15* -> Quarter past eight
  - *8:30* -> Half past eight
  - *8:45* -> Quarter to nine
- **Flight Verbs:** *leave, arrive, sleep, read, fly*

---

### 💬 Real-Life Mini Dialogue
- **Passenger:** *"Excuse me, what time is the flight to Rome?"*  
- **Agent:** *"It leaves at quarter past ten (10:15)."*  
- **Passenger:** *"Thank you very much."*  
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 6
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

### 📚 Core Vocabulary Essentials
| Job | Workplace | Action |
| :--- | :--- | :--- |
| **doctor / nurse** | hospital | *helps sick people* |
| **teacher** | school | *teaches students* |
| **waiter / waitress** | restaurant | *serves food* |
| **shop assistant** | shop / store | *sells clothes or food* |
| **engineer** | office / factory | *builds and designs systems* |

---

### ⚡ Structural Blueprint
- **Third Person \`-s\`:** \`He works in a hospital. She speaks three languages.\`
- **Question:** \`Does he work in an office? — Yes, he does. / No, he doesn't.\`
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
                        ]
                      }
                    }
                  }
                },
                {
                  title: '6.2 A Typical Day (Daily Routines & Adverbs)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_6b_1_listening.mp4',
                  content: `### 🎯 Can-Do Objective
Can explain your typical 24-hour routine from morning to night with frequency adverbs.

---

### 📚 Core Vocabulary Essentials
- **Routine Verbs:** *wake up, get up, have a shower, have breakfast, go to work, finish work, cook dinner, go to bed*
- **Adverbs of Frequency:** *always (100%), usually (80%), sometimes (50%), never (0%)*

---

### ⚡ Structural Blueprint
- Place the adverb **BEFORE** normal verbs: \`I always wake up at 7:00.\`
- Place the adverb **AFTER** the verb be: \`She is never late.\`
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 7
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
Can talk about leisure activities and ask friends what they do on Saturdays and Sundays.

---

### 📚 Core Vocabulary Essentials
- **Collocations:** *play tennis, go for a walk, meet friends, listen to music, watch TV, read books*
- **Question Structure (ASI):** \`Auxiliary (Do) + Subject (you) + Infinitive (play)?\`
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
                        ]
                      }
                    }
                  }
                },
                {
                  title: '7.2 Lights, Camera, Action! (Film Genres & Pronouns)',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe4_1.mp4',
                  content: `### 🎯 Can-Do Objective
Can identify movie genres and replace nouns with object pronouns (*me, you, him, her, it, us, them*).

---

### 📚 Core Vocabulary Essentials
- **Film Genres:** *action film, comedy, drama, horror film, animated film*
- **Object Pronouns:**
  - He -> *him* (I like him)
  - She -> *her* (Listen to her)
  - They -> *them* (I love them)
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 8
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
Can express what you can or cannot do, and understand public rules and permissions.

---

### 📚 Core Vocabulary Essentials
- **Abilities:** *swim, drive a car, cook, speak languages, play the guitar*
- **Permissions & Signs:** *park here, pay by card, smoke, enter, turn left*

---

### ⚡ Structural Blueprint
- \`I can swim.\` / \`You can't smoke here.\`
- \`Can you drive? — Yes, I can. / No, I can't.\`
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
Can talk about your passions, hobbies, and dislikes using verbs followed by *-ing*.

---

### 📚 Core Vocabulary Essentials
- **Verbs of emotion:** *love (❤️), like (👍), don't mind (😐), hate (👎)*
- **Activities with -ing:** *shopping, travelling, cooking, dancing, reading, running*

---

### ⚡ Structural Blueprint
- \`I love shopping.\` (NOT \`I love shop\`)
- \`He hates waiting for the train.\`
- \`Do you like cooking dinner?\`
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 9
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
Can describe ongoing actions happening right now at the moment of speaking.

---

### 📚 Core Vocabulary Essentials
- **Present Continuous actions:** *waiting for a friend, calling someone, walking in the park, working on a computer, travelling*
- **Time phrases:** *now, right now, at the moment*

---

### ⚡ Structural Blueprint
- \`Subject + am/is/are + Verb-ing\`
- \`I am waiting / She is talking on the phone / They are eating lunch\`
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
Can name essential clothing items and describe what people are wearing today.

---

### 📚 Core Vocabulary Essentials
- **Clothes:** *shirt, T-shirt, jacket, coat, trousers, jeans, dress, skirt, shoes, boots, hat*
- **Action:** *He is wearing a black jacket and blue jeans.*
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 10
          {
            title: 'Unit 10: Hotels, Accommodations & Past Locations',
            order: 10,
            lessons: {
              create: [
                {
                  title: '10.1 A Room with a View (There is / There are & Places)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_10b_1_vocabulary.mp4',
                  content: `### 🎯 Can-Do Objective
Can describe room amenities using *there is / there are* and prepositions (*in, on, under*).

---

### 📚 Core Vocabulary Essentials
- **Hotel terms:** *hotel, bedroom, bathroom, double bed, towels, swimming pool, reception, elevator/lift*
- **Prepositions of place:** *in, on, under, next to, behind*

---

### ⚡ Structural Blueprint
- Singular: \`There is a double bed in the room.\`
- Plural: \`There are clean towels in the bathroom.\`
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
Can state where you and others were in the past using *was* and *were*.

---

### 📚 Core Vocabulary Essentials
- **Past time expressions:** *yesterday, yesterday morning, last night, last week, in 2024*
- **Past Be Forms:**
  - I / He / She / It -> **was / wasn't**
  - We / You / They -> **were / weren't**
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 11
          {
            title: 'Unit 11: Past Experiences, Regular Verbs & Directions',
            order: 11,
            lessons: {
              create: [
                {
                  title: '11.1 A New Life (Regular Past Simple Verbs)',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  videoUrl: '/videos/beginner/ef5e_beg_pe6_1.mp4',
                  content: `### 🎯 Can-Do Objective
Can talk about past life events using regular verbs ending in *-ed*.

---

### 📚 Core Vocabulary Essentials
- **Regular Past Verbs:**
  - *live -> lived*
  - *work -> worked*
  - *start -> started*
  - *arrive -> arrived*
  - *visit -> visited*
- **Time phrase:** *two years ago, three months ago*
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
Can describe yesterday using top irregular past verbs (*went, had, got, did, saw, bought*).

---

### 📚 Core Vocabulary Essentials
| Present | Past Simple | Example Sentence |
| :--- | :--- | :--- |
| **go** | **went** | *I went to the supermarket.* |
| **have** | **had** | *We had a delicious dinner.* |
| **get** | **got** | *She got up early yesterday.* |
| **buy** | **bought** | *He bought a new jacket.* |
| **see** | **saw** | *I saw an exciting film.* |
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
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },

          // Unit 12
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
Can link sentences together using *and, but, because, so* to tell simple past stories.

---

### 📚 Core Vocabulary Essentials
- **Connectors:** *and* (addition), *but* (contrast), *because* (reason), *so* (result)
- **Story Verbs:** *met, talked, sat, looked, left, arrived*

---

### 💬 Real-Life Mini Story
> *"Yesterday I took the morning train to Manchester. The train was full, so I sat next to an interesting stranger. We talked about books and music for two hours because we both love jazz!"*
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
Congratulations! You have reached the final milestone of CEFR Level A1. You can now introduce yourself completely, describe your routine, food habits, family, and past experiences.

---

### 🏆 Final Speaking Self-Introduction Blueprint
1. **Greeting & Identity:** *"Hello! My name is [Name]. I am from [Country] and I live in [City]."*
2. **Work / Study:** *"I work as a [Job] in a [Workplace] / I am a student."*
3. **Daily Routine:** *"Every day, I usually wake up at 7:00 and have coffee."*
4. **Likes & Preferences:** *"In my free time, I love listening to music and cooking."*
5. **Recent Past Event:** *"Last weekend, I met my friends and we went to the cinema."*

---

### 🗣️ Speaking Practice Drill
> *"Hello! My name is Dominic. I live in Germany and I work in technology. In my free time, I love cooking and travelling. Last week I went to Berlin!"*
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
                            question: 'Congratulations on completing Level A1! What is your next level?',
                            optionA: 'Level A2',
                            optionB: 'Level A0',
                            optionC: 'Finish',
                            optionD: 'None',
                            correctOption: 0,
                            order: 3,
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
