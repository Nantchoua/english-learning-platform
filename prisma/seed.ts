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
          {
            title: 'Unit 1: Connect with English',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'A1-U1-L1: Introductions and Greetings',
                  order: 1,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U1-L1
- **CEFR "Can-Do" Statement:** Can introduce self and others, ask and answer questions about personal details.
- **Estimated Duration:** 20 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Introductions and Greetings.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Introduction | Noun | /ˌɪn.trəˈdʌk.ʃən/ | The act of making someone known by name to another. | Let's start with a brief introduction. |
| Greetings | Noun | /ˈɡriː.tɪŋz/ | Something said or done to show respect when you meet someone. | We exchanged warm greetings. |
| Hometown | Noun | /ˈhoʊm.taʊn/ | The town or city where you were born and grew up. | My hometown is Ganja, Azerbaijan. |
| Nice to meet you | Phrase | /naɪs tuː miːt juː/ | A polite phrase used when being introduced. | Hello Leyla, nice to meet you. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Be Verb (am/is/are) + Noun/Adjective
- **Explanation:** Use 'am' for 'I', 'is' for 'he/she/it', and 'are' for 'you/we/they'.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* I have 18 years old.
-  *Correct:* I am 18 years old. (In English, we use the verb 'to be' for age, not 'to have'.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Hello! What's your name?
- **Speaker B:** Hi! My name is Leyla. What's yours?

#### Roleplay Prompt:
Introduce yourself, state your name, your age, and your hometown.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Introductions and Greetings.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U1-L2: Talking About Family',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U1-L2
- **CEFR "Can-Do" Statement:** Can describe family members, where they live, and their occupations.
- **Estimated Duration:** 22 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Talking About Family.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Siblings | Noun | /ˈsɪb.lɪŋz/ | Brothers and sisters. | Do you have any siblings? |
| Close-knit | Adjective | /ˌkloʊsˈnɪt/ | Having strong relationships with each other. | Our family is very close-knit. |
| Tradition | Noun | /trəˈdɪʃ.ən/ | A specific practice of long-standing. | Gathering for New Year is a family tradition. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Have/Has + Count of Siblings
- **Explanation:** Use 'have' for I/you/we/they and 'has' for he/she/it.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* I have one brother younger.
-  *Correct:* I have a younger brother. (In English, adjectives like 'younger' go before the noun.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Do you have siblings?
- **Speaker B:** Yes, I have one younger brother.

#### Roleplay Prompt:
Describe your family members and what they do for a living.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Talking About Family.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U1-L3: Hobbies and Interests',
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U1-L3
- **CEFR "Can-Do" Statement:** Can discuss personal hobbies, interests, and free-time preferences.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Hobbies and Interests.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Leisure | Noun | /ˈleɪ.ʒʊr/ | Time spent in or free for relaxation or enjoyment. | What do you do in your leisure time? |
| Enjoy | Verb | /ɪnˈdʒɔɪ/ | To get pleasure from something. | I enjoy reading books. |
| Photography | Noun | /fəˈtɑː.ɡrə.fi/ | The art or practice of taking photographs. | Photography is a very popular hobby. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Enjoy/Like + Verb-ing (Gerund)
- **Explanation:** Use the -ing form of a verb after like, love, or enjoy.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* I enjoy to read.
-  *Correct:* I enjoy reading. (The verb 'enjoy' is followed by a gerund (-ing form).)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** What are your hobbies?
- **Speaker B:** My hobbies include reading, playing football, and cooking.

#### Roleplay Prompt:
Tell me about your favorite hobby and why you like it.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Hobbies and Interests.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U1-L4: Daily Routine',
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U1-L4
- **CEFR "Can-Do" Statement:** Can describe daily habits, routines, and schedules.
- **Estimated Duration:** 20 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Daily Routine.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Routine | Noun | /ruːˈtiːn/ | A sequence of actions regularly followed. | My morning routine is very simple. |
| Commute | Noun/Verb | /kəˈmjuːt/ | Travel some distance between home and work/school. | I take the bus for my daily commute. |
| Chores | Noun | /tʃɔːrz/ | A routine task, especially a household one. | I do my household chores on Saturday. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Simple Present Verb
- **Explanation:** Use simple present tense to talk about daily habits.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* I am waking up early every day.
-  *Correct:* I wake up early every day. (Habitual routines use Simple Present instead of Present Continuous.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Can you describe your daily routine?
- **Speaker B:** I wake up early, have breakfast, and then go to university.

#### Roleplay Prompt:
Describe your daily routine from morning to night.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Daily Routine.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U1-L5: School and University Life',
                  order: 5,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U1-L5
- **CEFR "Can-Do" Statement:** Can talk about topics related to school and university life in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on School and University Life.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| School | Noun | /tæst/ | Related to the theme of school and university life | We love to discuss school and university life. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to school and university life)
- **Explanation:** Ensure verb subject agreement when discussing school and university life.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like school and university life.
-  *Correct:* He does not like school and university life. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss school and university life.
- **Speaker B:** Yes, I think school and university life is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on school and university life.

---

### 6. Lesson Recap
1. Master structural grammar patterns for School and University Life.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
              ]
            }
          },
          {
            title: 'Unit 2: Connect with English',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'A1-U2-L6: Describing People and Characters',
                  order: 6,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U2-L6
- **CEFR "Can-Do" Statement:** Can talk about topics related to describing people and characters in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Describing People and Characters.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Describing | Noun | /tæst/ | Related to the theme of describing people and characters | We love to discuss describing people and characters. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to describing people and characters)
- **Explanation:** Ensure verb subject agreement when discussing describing people and characters.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like describing people and characters.
-  *Correct:* He does not like describing people and characters. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss describing people and characters.
- **Speaker B:** Yes, I think describing people and characters is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on describing people and characters.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Describing People and Characters.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U2-L7: Hometown and Landmarks',
                  order: 7,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U2-L7
- **CEFR "Can-Do" Statement:** Can talk about topics related to hometown and landmarks in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Hometown and Landmarks.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Hometown | Noun | /tæst/ | Related to the theme of hometown and landmarks | We love to discuss hometown and landmarks. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to hometown and landmarks)
- **Explanation:** Ensure verb subject agreement when discussing hometown and landmarks.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like hometown and landmarks.
-  *Correct:* He does not like hometown and landmarks. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss hometown and landmarks.
- **Speaker B:** Yes, I think hometown and landmarks is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on hometown and landmarks.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Hometown and Landmarks.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U2-L8: Food and Drinks',
                  order: 8,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U2-L8
- **CEFR "Can-Do" Statement:** Can talk about topics related to food and drinks in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Food and Drinks.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Food | Noun | /tæst/ | Related to the theme of food and drinks | We love to discuss food and drinks. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to food and drinks)
- **Explanation:** Ensure verb subject agreement when discussing food and drinks.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like food and drinks.
-  *Correct:* He does not like food and drinks. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss food and drinks.
- **Speaker B:** Yes, I think food and drinks is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on food and drinks.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Food and Drinks.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U2-L9: Shopping and Money',
                  order: 9,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U2-L9
- **CEFR "Can-Do" Statement:** Can talk about topics related to shopping and money in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Shopping and Money.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Shopping | Noun | /tæst/ | Related to the theme of shopping and money | We love to discuss shopping and money. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to shopping and money)
- **Explanation:** Ensure verb subject agreement when discussing shopping and money.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like shopping and money.
-  *Correct:* He does not like shopping and money. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss shopping and money.
- **Speaker B:** Yes, I think shopping and money is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on shopping and money.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Shopping and Money.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U2-L10: Weather and Seasons',
                  order: 10,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U2-L10
- **CEFR "Can-Do" Statement:** Can talk about topics related to weather and seasons in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Weather and Seasons.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Weather | Noun | /tæst/ | Related to the theme of weather and seasons | We love to discuss weather and seasons. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to weather and seasons)
- **Explanation:** Ensure verb subject agreement when discussing weather and seasons.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like weather and seasons.
-  *Correct:* He does not like weather and seasons. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss weather and seasons.
- **Speaker B:** Yes, I think weather and seasons is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on weather and seasons.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Weather and Seasons.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
              ]
            }
          },
          {
            title: 'Unit 3: Connect with English',
            order: 3,
            lessons: {
              create: [
                {
                  title: 'A1-U3-L11: Travel and Holidays',
                  order: 11,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U3-L11
- **CEFR "Can-Do" Statement:** Can talk about topics related to travel and holidays in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Travel and Holidays.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Travel | Noun | /tæst/ | Related to the theme of travel and holidays | We love to discuss travel and holidays. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to travel and holidays)
- **Explanation:** Ensure verb subject agreement when discussing travel and holidays.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like travel and holidays.
-  *Correct:* He does not like travel and holidays. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss travel and holidays.
- **Speaker B:** Yes, I think travel and holidays is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on travel and holidays.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Travel and Holidays.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U3-L12: Pets and Animals',
                  order: 12,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U3-L12
- **CEFR "Can-Do" Statement:** Can talk about topics related to pets and animals in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Pets and Animals.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Pets | Noun | /tæst/ | Related to the theme of pets and animals | We love to discuss pets and animals. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to pets and animals)
- **Explanation:** Ensure verb subject agreement when discussing pets and animals.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like pets and animals.
-  *Correct:* He does not like pets and animals. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss pets and animals.
- **Speaker B:** Yes, I think pets and animals is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on pets and animals.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Pets and Animals.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U3-L13: Jobs and Professions',
                  order: 13,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U3-L13
- **CEFR "Can-Do" Statement:** Can talk about topics related to jobs and professions in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Jobs and Professions.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Jobs | Noun | /tæst/ | Related to the theme of jobs and professions | We love to discuss jobs and professions. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to jobs and professions)
- **Explanation:** Ensure verb subject agreement when discussing jobs and professions.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like jobs and professions.
-  *Correct:* He does not like jobs and professions. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss jobs and professions.
- **Speaker B:** Yes, I think jobs and professions is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on jobs and professions.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Jobs and Professions.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U3-L14: Health and Wellness',
                  order: 14,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U3-L14
- **CEFR "Can-Do" Statement:** Can talk about topics related to health and wellness in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Health and Wellness.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Health | Noun | /tæst/ | Related to the theme of health and wellness | We love to discuss health and wellness. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to health and wellness)
- **Explanation:** Ensure verb subject agreement when discussing health and wellness.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like health and wellness.
-  *Correct:* He does not like health and wellness. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss health and wellness.
- **Speaker B:** Yes, I think health and wellness is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on health and wellness.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Health and Wellness.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U3-L15: Sports and Fitness',
                  order: 15,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U3-L15
- **CEFR "Can-Do" Statement:** Can talk about topics related to sports and fitness in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Sports and Fitness.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Sports | Noun | /tæst/ | Related to the theme of sports and fitness | We love to discuss sports and fitness. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to sports and fitness)
- **Explanation:** Ensure verb subject agreement when discussing sports and fitness.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like sports and fitness.
-  *Correct:* He does not like sports and fitness. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss sports and fitness.
- **Speaker B:** Yes, I think sports and fitness is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on sports and fitness.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Sports and Fitness.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
              ]
            }
          },
          {
            title: 'Unit 4: Connect with English',
            order: 4,
            lessons: {
              create: [
                {
                  title: 'A1-U4-L16: Housing and Neighborhood',
                  order: 16,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U4-L16
- **CEFR "Can-Do" Statement:** Can talk about topics related to housing and neighborhood in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Housing and Neighborhood.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Housing | Noun | /tæst/ | Related to the theme of housing and neighborhood | We love to discuss housing and neighborhood. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to housing and neighborhood)
- **Explanation:** Ensure verb subject agreement when discussing housing and neighborhood.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like housing and neighborhood.
-  *Correct:* He does not like housing and neighborhood. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss housing and neighborhood.
- **Speaker B:** Yes, I think housing and neighborhood is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on housing and neighborhood.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Housing and Neighborhood.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U4-L17: Music and Entertainment',
                  order: 17,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U4-L17
- **CEFR "Can-Do" Statement:** Can talk about topics related to music and entertainment in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Music and Entertainment.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Music | Noun | /tæst/ | Related to the theme of music and entertainment | We love to discuss music and entertainment. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to music and entertainment)
- **Explanation:** Ensure verb subject agreement when discussing music and entertainment.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like music and entertainment.
-  *Correct:* He does not like music and entertainment. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss music and entertainment.
- **Speaker B:** Yes, I think music and entertainment is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on music and entertainment.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Music and Entertainment.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U4-L18: Culture and Traditions',
                  order: 18,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U4-L18
- **CEFR "Can-Do" Statement:** Can talk about topics related to culture and traditions in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Culture and Traditions.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Culture | Noun | /tæst/ | Related to the theme of culture and traditions | We love to discuss culture and traditions. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to culture and traditions)
- **Explanation:** Ensure verb subject agreement when discussing culture and traditions.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like culture and traditions.
-  *Correct:* He does not like culture and traditions. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss culture and traditions.
- **Speaker B:** Yes, I think culture and traditions is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on culture and traditions.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Culture and Traditions.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U4-L19: Environment and Nature',
                  order: 19,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U4-L19
- **CEFR "Can-Do" Statement:** Can talk about topics related to environment and nature in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Environment and Nature.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Environment | Noun | /tæst/ | Related to the theme of environment and nature | We love to discuss environment and nature. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to environment and nature)
- **Explanation:** Ensure verb subject agreement when discussing environment and nature.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like environment and nature.
-  *Correct:* He does not like environment and nature. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss environment and nature.
- **Speaker B:** Yes, I think environment and nature is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on environment and nature.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Environment and Nature.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U4-L20: Fashion and Style',
                  order: 20,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U4-L20
- **CEFR "Can-Do" Statement:** Can talk about topics related to fashion and style in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Fashion and Style.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Fashion | Noun | /tæst/ | Related to the theme of fashion and style | We love to discuss fashion and style. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to fashion and style)
- **Explanation:** Ensure verb subject agreement when discussing fashion and style.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like fashion and style.
-  *Correct:* He does not like fashion and style. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss fashion and style.
- **Speaker B:** Yes, I think fashion and style is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on fashion and style.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Fashion and Style.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
              ]
            }
          },
          {
            title: 'Unit 5: Connect with English',
            order: 5,
            lessons: {
              create: [
                {
                  title: 'A1-U5-L21: Technology and Internet',
                  order: 21,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U5-L21
- **CEFR "Can-Do" Statement:** Can talk about topics related to technology and internet in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Technology and Internet.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Technology | Noun | /tæst/ | Related to the theme of technology and internet | We love to discuss technology and internet. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to technology and internet)
- **Explanation:** Ensure verb subject agreement when discussing technology and internet.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like technology and internet.
-  *Correct:* He does not like technology and internet. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss technology and internet.
- **Speaker B:** Yes, I think technology and internet is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on technology and internet.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Technology and Internet.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U5-L22: Books and Literature',
                  order: 22,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U5-L22
- **CEFR "Can-Do" Statement:** Can talk about topics related to books and literature in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Books and Literature.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Books | Noun | /tæst/ | Related to the theme of books and literature | We love to discuss books and literature. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to books and literature)
- **Explanation:** Ensure verb subject agreement when discussing books and literature.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like books and literature.
-  *Correct:* He does not like books and literature. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss books and literature.
- **Speaker B:** Yes, I think books and literature is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on books and literature.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Books and Literature.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U5-L23: News and Media',
                  order: 23,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U5-L23
- **CEFR "Can-Do" Statement:** Can talk about topics related to news and media in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on News and Media.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| News | Noun | /tæst/ | Related to the theme of news and media | We love to discuss news and media. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to news and media)
- **Explanation:** Ensure verb subject agreement when discussing news and media.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like news and media.
-  *Correct:* He does not like news and media. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss news and media.
- **Speaker B:** Yes, I think news and media is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on news and media.

---

### 6. Lesson Recap
1. Master structural grammar patterns for News and Media.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U5-L24: Public Transport',
                  order: 24,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U5-L24
- **CEFR "Can-Do" Statement:** Can talk about topics related to public transport in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Public Transport.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Public | Noun | /tæst/ | Related to the theme of public transport | We love to discuss public transport. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to public transport)
- **Explanation:** Ensure verb subject agreement when discussing public transport.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like public transport.
-  *Correct:* He does not like public transport. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss public transport.
- **Speaker B:** Yes, I think public transport is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on public transport.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Public Transport.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U5-L25: Free Time and Weekend Activities',
                  order: 25,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U5-L25
- **CEFR "Can-Do" Statement:** Can talk about topics related to free time and weekend activities in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Free Time and Weekend Activities.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Free | Noun | /tæst/ | Related to the theme of free time and weekend activities | We love to discuss free time and weekend activities. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to free time and weekend activities)
- **Explanation:** Ensure verb subject agreement when discussing free time and weekend activities.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like free time and weekend activities.
-  *Correct:* He does not like free time and weekend activities. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss free time and weekend activities.
- **Speaker B:** Yes, I think free time and weekend activities is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on free time and weekend activities.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Free Time and Weekend Activities.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
              ]
            }
          },
          {
            title: 'Unit 6: Connect with English',
            order: 6,
            lessons: {
              create: [
                {
                  title: 'A1-U6-L26: History and Important Events',
                  order: 26,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U6-L26
- **CEFR "Can-Do" Statement:** Can talk about topics related to history and important events in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on History and Important Events.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| History | Noun | /tæst/ | Related to the theme of history and important events | We love to discuss history and important events. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to history and important events)
- **Explanation:** Ensure verb subject agreement when discussing history and important events.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like history and important events.
-  *Correct:* He does not like history and important events. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss history and important events.
- **Speaker B:** Yes, I think history and important events is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on history and important events.

---

### 6. Lesson Recap
1. Master structural grammar patterns for History and Important Events.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U6-L27: Study Techniques and Tips',
                  order: 27,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U6-L27
- **CEFR "Can-Do" Statement:** Can talk about topics related to study techniques and tips in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Study Techniques and Tips.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Study | Noun | /tæst/ | Related to the theme of study techniques and tips | We love to discuss study techniques and tips. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to study techniques and tips)
- **Explanation:** Ensure verb subject agreement when discussing study techniques and tips.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like study techniques and tips.
-  *Correct:* He does not like study techniques and tips. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss study techniques and tips.
- **Speaker B:** Yes, I think study techniques and tips is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on study techniques and tips.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Study Techniques and Tips.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U6-L28: Volunteering and Social Issues',
                  order: 28,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U6-L28
- **CEFR "Can-Do" Statement:** Can talk about topics related to volunteering and social issues in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Volunteering and Social Issues.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Volunteering | Noun | /tæst/ | Related to the theme of volunteering and social issues | We love to discuss volunteering and social issues. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to volunteering and social issues)
- **Explanation:** Ensure verb subject agreement when discussing volunteering and social issues.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like volunteering and social issues.
-  *Correct:* He does not like volunteering and social issues. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss volunteering and social issues.
- **Speaker B:** Yes, I think volunteering and social issues is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on volunteering and social issues.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Volunteering and Social Issues.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U6-L29: Globalization and Multiculturalism',
                  order: 29,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U6-L29
- **CEFR "Can-Do" Statement:** Can talk about topics related to globalization and multiculturalism in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Globalization and Multiculturalism.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Globalization | Noun | /tæst/ | Related to the theme of globalization and multiculturalism | We love to discuss globalization and multiculturalism. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to globalization and multiculturalism)
- **Explanation:** Ensure verb subject agreement when discussing globalization and multiculturalism.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like globalization and multiculturalism.
-  *Correct:* He does not like globalization and multiculturalism. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss globalization and multiculturalism.
- **Speaker B:** Yes, I think globalization and multiculturalism is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on globalization and multiculturalism.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Globalization and Multiculturalism.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U6-L30: Art and Creativity',
                  order: 30,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U6-L30
- **CEFR "Can-Do" Statement:** Can talk about topics related to art and creativity in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Art and Creativity.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Art | Noun | /tæst/ | Related to the theme of art and creativity | We love to discuss art and creativity. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to art and creativity)
- **Explanation:** Ensure verb subject agreement when discussing art and creativity.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like art and creativity.
-  *Correct:* He does not like art and creativity. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss art and creativity.
- **Speaker B:** Yes, I think art and creativity is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on art and creativity.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Art and Creativity.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
              ]
            }
          },
          {
            title: 'Unit 7: Connect with English',
            order: 7,
            lessons: {
              create: [
                {
                  title: 'A1-U7-L31: Science and Discovery',
                  order: 31,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U7-L31
- **CEFR "Can-Do" Statement:** Can talk about topics related to science and discovery in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Science and Discovery.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Science | Noun | /tæst/ | Related to the theme of science and discovery | We love to discuss science and discovery. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to science and discovery)
- **Explanation:** Ensure verb subject agreement when discussing science and discovery.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like science and discovery.
-  *Correct:* He does not like science and discovery. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss science and discovery.
- **Speaker B:** Yes, I think science and discovery is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on science and discovery.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Science and Discovery.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U7-L32: Personal Achievements and Goals',
                  order: 32,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U7-L32
- **CEFR "Can-Do" Statement:** Can talk about topics related to personal achievements and goals in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Personal Achievements and Goals.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Personal | Noun | /tæst/ | Related to the theme of personal achievements and goals | We love to discuss personal achievements and goals. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to personal achievements and goals)
- **Explanation:** Ensure verb subject agreement when discussing personal achievements and goals.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like personal achievements and goals.
-  *Correct:* He does not like personal achievements and goals. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss personal achievements and goals.
- **Speaker B:** Yes, I think personal achievements and goals is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on personal achievements and goals.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Personal Achievements and Goals.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U7-L33: Etiquette and Manners',
                  order: 33,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U7-L33
- **CEFR "Can-Do" Statement:** Can talk about topics related to etiquette and manners in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Etiquette and Manners.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Etiquette | Noun | /tæst/ | Related to the theme of etiquette and manners | We love to discuss etiquette and manners. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to etiquette and manners)
- **Explanation:** Ensure verb subject agreement when discussing etiquette and manners.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like etiquette and manners.
-  *Correct:* He does not like etiquette and manners. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss etiquette and manners.
- **Speaker B:** Yes, I think etiquette and manners is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on etiquette and manners.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Etiquette and Manners.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U7-L34: Reflection and Progress',
                  order: 34,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
- **Lesson ID:** A1-U7-L34
- **CEFR "Can-Do" Statement:** Can talk about topics related to reflection and progress in simple English.
- **Estimated Duration:** 25 Minutes (5 min video + 20 min practice)

---

### 2. Core Video Lesson Script & Transcript
**[Visual Cue: Instructor standing in front of a warm classroom background with a whiteboard graphic reading: "Connect with English"]**
"Hi everyone! Welcome to Connect with English. I am your instructor, Nantchoua. Today, we are focusing on Reflection and Progress.

This is an essential topic for real-world fluency. Let's learn how to structure sentences using our grammar blueprints and practice vocabulary key terms."

---

### 3. Vocabulary & Collocations
| Term | Part of Speech | Pronunciation Note | Meaning in Context | Example Sentence |
|------|----------------|-------------------|--------------------|------------------|
| Reflection | Noun | /tæst/ | Related to the theme of reflection and progress | We love to discuss reflection and progress. |
| Practice | Verb | /ˈpræk.tɪs/ | To do something repeatedly to improve. | Practice makes perfect. |

---

### 4. Grammar & Structural Blueprint
- **Core Pattern:** Subject + Verb + Object (related to reflection and progress)
- **Explanation:** Ensure verb subject agreement when discussing reflection and progress.

#### Common Mistakes to Avoid:
- ❌ *Incorrect:* He do not like reflection and progress.
-  *Correct:* He does not like reflection and progress. (Use 'does not' for singular third-person negative sentences.)

---

### 5. Interactive Speaking Dialogue & Roleplay
#### Dialogue:
- **Speaker A:** Let's discuss reflection and progress.
- **Speaker B:** Yes, I think reflection and progress is very interesting and important.

#### Roleplay Prompt:
Record an audio speaking about your thoughts on reflection and progress.

---

### 6. Lesson Recap
1. Master structural grammar patterns for Reflection and Progress.
2. Study the target vocabulary collocations.
3. Record your speaking response to submit for grading.`
                },
              ]
            }
          },
        ]
      }
    }
  });

  // Fetch created lessons
  const dbLessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' }
  });

  console.log('Seeding quizzes for all lessons...');
  // Quiz for Lesson 1
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[0].id,
      questions: {
        create: [
          {
            question: "Which verb do you use to state your age in English?",
            optionA: "Have",
            optionB: "Be",
            optionC: "Do",
            optionD: "Make",
            correctOption: 1,
            order: 1
          },
          {
            question: "What is the English word for the town/city where you were born?",
            optionA: "National City",
            optionB: "Hometown",
            optionC: "House",
            optionD: "Birthplace",
            correctOption: 1,
            order: 2
          },
        ]
      }
    }
  });

  // Quiz for Lesson 2
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[1].id,
      questions: {
        create: [
          {
            question: "What does the term 'siblings' mean?",
            optionA: "Parents",
            optionB: "Brothers and sisters",
            optionC: "Cousins",
            optionD: "Uncle",
            correctOption: 1,
            order: 1
          },
          {
            question: "Which is correct?",
            optionA: "She have a brother.",
            optionB: "She has a brother.",
            optionC: "She is a brother.",
            optionD: "She has a brother younger.",
            correctOption: 1,
            order: 2
          },
        ]
      }
    }
  });

  // Quiz for Lesson 3
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[2].id,
      questions: {
        create: [
          {
            question: "Which of the following is correct?",
            optionA: "I enjoy to swim.",
            optionB: "I enjoy swimming.",
            optionC: "I enjoy swim.",
            optionD: "I enjoy for swim.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 4
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[3].id,
      questions: {
        create: [
          {
            question: "What is the meaning of 'commute'?",
            optionA: "To cook dinner",
            optionB: "To travel to work/school",
            optionC: "To watch TV",
            optionD: "To sleep",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 5
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[4].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like school and university life.",
            optionB: "She likes school and university life.",
            optionC: "She is like school and university life.",
            optionD: "She does liking school and university life.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 6
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[5].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like describing people and characters.",
            optionB: "She likes describing people and characters.",
            optionC: "She is like describing people and characters.",
            optionD: "She does liking describing people and characters.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 7
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[6].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like hometown and landmarks.",
            optionB: "She likes hometown and landmarks.",
            optionC: "She is like hometown and landmarks.",
            optionD: "She does liking hometown and landmarks.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 8
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[7].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like food and drinks.",
            optionB: "She likes food and drinks.",
            optionC: "She is like food and drinks.",
            optionD: "She does liking food and drinks.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 9
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[8].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like shopping and money.",
            optionB: "She likes shopping and money.",
            optionC: "She is like shopping and money.",
            optionD: "She does liking shopping and money.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 10
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[9].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like weather and seasons.",
            optionB: "She likes weather and seasons.",
            optionC: "She is like weather and seasons.",
            optionD: "She does liking weather and seasons.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 11
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[10].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like travel and holidays.",
            optionB: "She likes travel and holidays.",
            optionC: "She is like travel and holidays.",
            optionD: "She does liking travel and holidays.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 12
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[11].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like pets and animals.",
            optionB: "She likes pets and animals.",
            optionC: "She is like pets and animals.",
            optionD: "She does liking pets and animals.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 13
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[12].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like jobs and professions.",
            optionB: "She likes jobs and professions.",
            optionC: "She is like jobs and professions.",
            optionD: "She does liking jobs and professions.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 14
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[13].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like health and wellness.",
            optionB: "She likes health and wellness.",
            optionC: "She is like health and wellness.",
            optionD: "She does liking health and wellness.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 15
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[14].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like sports and fitness.",
            optionB: "She likes sports and fitness.",
            optionC: "She is like sports and fitness.",
            optionD: "She does liking sports and fitness.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 16
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[15].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like housing and neighborhood.",
            optionB: "She likes housing and neighborhood.",
            optionC: "She is like housing and neighborhood.",
            optionD: "She does liking housing and neighborhood.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 17
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[16].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like music and entertainment.",
            optionB: "She likes music and entertainment.",
            optionC: "She is like music and entertainment.",
            optionD: "She does liking music and entertainment.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 18
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[17].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like culture and traditions.",
            optionB: "She likes culture and traditions.",
            optionC: "She is like culture and traditions.",
            optionD: "She does liking culture and traditions.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 19
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[18].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like environment and nature.",
            optionB: "She likes environment and nature.",
            optionC: "She is like environment and nature.",
            optionD: "She does liking environment and nature.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 20
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[19].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like fashion and style.",
            optionB: "She likes fashion and style.",
            optionC: "She is like fashion and style.",
            optionD: "She does liking fashion and style.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 21
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[20].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like technology and internet.",
            optionB: "She likes technology and internet.",
            optionC: "She is like technology and internet.",
            optionD: "She does liking technology and internet.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 22
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[21].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like books and literature.",
            optionB: "She likes books and literature.",
            optionC: "She is like books and literature.",
            optionD: "She does liking books and literature.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 23
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[22].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like news and media.",
            optionB: "She likes news and media.",
            optionC: "She is like news and media.",
            optionD: "She does liking news and media.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 24
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[23].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like public transport.",
            optionB: "She likes public transport.",
            optionC: "She is like public transport.",
            optionD: "She does liking public transport.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 25
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[24].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like free time and weekend activities.",
            optionB: "She likes free time and weekend activities.",
            optionC: "She is like free time and weekend activities.",
            optionD: "She does liking free time and weekend activities.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 26
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[25].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like history and important events.",
            optionB: "She likes history and important events.",
            optionC: "She is like history and important events.",
            optionD: "She does liking history and important events.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 27
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[26].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like study techniques and tips.",
            optionB: "She likes study techniques and tips.",
            optionC: "She is like study techniques and tips.",
            optionD: "She does liking study techniques and tips.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 28
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[27].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like volunteering and social issues.",
            optionB: "She likes volunteering and social issues.",
            optionC: "She is like volunteering and social issues.",
            optionD: "She does liking volunteering and social issues.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 29
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[28].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like globalization and multiculturalism.",
            optionB: "She likes globalization and multiculturalism.",
            optionC: "She is like globalization and multiculturalism.",
            optionD: "She does liking globalization and multiculturalism.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 30
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[29].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like art and creativity.",
            optionB: "She likes art and creativity.",
            optionC: "She is like art and creativity.",
            optionD: "She does liking art and creativity.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 31
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[30].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like science and discovery.",
            optionB: "She likes science and discovery.",
            optionC: "She is like science and discovery.",
            optionD: "She does liking science and discovery.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 32
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[31].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like personal achievements and goals.",
            optionB: "She likes personal achievements and goals.",
            optionC: "She is like personal achievements and goals.",
            optionD: "She does liking personal achievements and goals.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 33
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[32].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like etiquette and manners.",
            optionB: "She likes etiquette and manners.",
            optionC: "She is like etiquette and manners.",
            optionD: "She does liking etiquette and manners.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  // Quiz for Lesson 34
  await prisma.quiz.create({
    data: {
      lessonId: dbLessons[33].id,
      questions: {
        create: [
          {
            question: "Which sentence is correct?",
            optionA: "She like reflection and progress.",
            optionB: "She likes reflection and progress.",
            optionC: "She is like reflection and progress.",
            optionD: "She does liking reflection and progress.",
            correctOption: 1,
            order: 1
          },
        ]
      }
    }
  });

  console.log('Database seeded successfully with all 34 speaking handbook courses!');

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
                  content: `### Telephoning Protocols in English
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
* **Speaker B:** "Yes, please ask him to call me back about the lesson schedule."`,
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
                  content: `### Formality in Business Emails
Using correct register helps you communicate clearly and build trust with clients.

#### Key Patterns
* **Formal Salutation:** Dear Mr. / Ms. [Name]
* **Informal Salutation:** Hi [Name] / Hello [Name]
* **Formal Closing:** Sincerely, / Best regards,
* **Informal Closing:** Cheers, / All the best,

#### Email Sample (Formal)
\`\`\`text
Subject: Art and Design Conference Invitation

Dear Laura,

I am writing to inform you that next month's art and design conference will be held in London from October 12 to 15. The agenda is attached. Please review the sessions and let me know if you would like me to make a hotel reservation for you.

With best regards,
Lars Oluffson
\`\`\``,





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
                  content: `### Small Talk Rules & Techniques
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
* **Speaker A:** "Indeed. Did you do anything special over the weekend?"`,
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
                  content: `### Rhetorical Structures in Presentations
To make a lasting impact on an audience, structure your keynote using the **Rule of Three**:
1. **Tell them what you are going to tell them:** Introduce the main points.
2. **Tell them:** Elaborate with supporting data.
3. **Tell them what you have told them:** Summarize the core takeaway.

#### Rhetoric Devices
* **Anaphora:** Repeating a key phrase at the start of consecutive sentences (e.g., "We will succeed because... We will succeed if...").
* **Signposting:** Guiding the audience through your slides (e.g., "Moving on to my next slide...", "Let's turn our attention to...").`,
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
