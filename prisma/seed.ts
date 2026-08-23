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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U1-L2: Talking About Family',
                  order: 2,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U1-L3: Hobbies and Interests',
                  order: 3,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U1-L4: Daily Routine',
                  order: 4,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U1-L5: School and University Life',
                  order: 5,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U2-L7: Hometown and Landmarks',
                  order: 7,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U2-L8: Food and Drinks',
                  order: 8,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U2-L9: Shopping and Money',
                  order: 9,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U2-L10: Weather and Seasons',
                  order: 10,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U3-L12: Pets and Animals',
                  order: 12,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U3-L13: Jobs and Professions',
                  order: 13,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U3-L14: Health and Wellness',
                  order: 14,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U3-L15: Sports and Fitness',
                  order: 15,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U4-L17: Music and Entertainment',
                  order: 17,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U4-L18: Culture and Traditions',
                  order: 18,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U4-L19: Environment and Nature',
                  order: 19,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U4-L20: Fashion and Style',
                  order: 20,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U5-L22: Books and Literature',
                  order: 22,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U5-L23: News and Media',
                  order: 23,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U5-L24: Public Transport',
                  order: 24,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U5-L25: Free Time and Weekend Activities',
                  order: 25,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U6-L27: Study Techniques and Tips',
                  order: 27,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U6-L28: Volunteering and Social Issues',
                  order: 28,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U6-L29: Globalization and Multiculturalism',
                  order: 29,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U6-L30: Art and Creativity',
                  order: 30,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U7-L32: Personal Achievements and Goals',
                  order: 32,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U7-L33: Etiquette and Manners',
                  order: 33,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
3. Record your speaking response to submit for grading.`
                },
                {
                  title: 'A1-U7-L34: Reflection and Progress',
                  order: 34,
                  isPublished: true,
                  isFree: false,
                  content: `### 1. Lesson Metadata
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
