import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DIRECT_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing courses to allow clean re-seeding
  await prisma.course.deleteMany({});
  console.log('Cleared existing courses from database.');

  // Find or Create instructor Nantchoua
  let instructor = await prisma.user.findFirst({
    where: { name: 'Nantchoua' },
  });

  if (!instructor) {
    instructor = await prisma.user.create({
      data: {
        name: 'Nantchoua',
        email: 'sarah@example.com',
        role: 'INSTRUCTOR',
      },
    });
  }

  const instructorId = instructor.id;

  console.log(`Using Instructor: ${instructor.name} (id: ${instructorId})`);


  // Course 1: Pre-Intermediate Business English (A2-B1)
  const course1 = await prisma.course.create({
    data: {
      title: 'Pre-Intermediate Business English (A2-B1)',
      slug: 'pre-intermediate-business-english',
      description: 'Master everyday business communication, professional telephoning, corporate email structure, and trade vocabulary.',
      price: 49.99,
      level: 'B1',
      isPublished: true,
      instructorId,
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

  console.log(`Seeded Course 1: ${course1.title}`);

  // Course 2: Intermediate Conversation Mastery (B1-B2)
  const course2 = await prisma.course.create({
    data: {
      title: 'Intermediate Conversation Mastery (B1-B2)',
      slug: 'intermediate-conversation-mastery',
      description: 'Enhance your conversational English, small talk competence, social icebreakers, and vocabulary for casual debates.',
      price: 59.99,
      level: 'B2',
      isPublished: true,
      instructorId,
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

  console.log(`Seeded Course 2: ${course2.title}`);

  // Course 3: Advanced Presentation & Speech (C1-C2)
  const course3 = await prisma.course.create({
    data: {
      title: 'Advanced Presentation & Speech (C1-C2)',
      slug: 'advanced-presentation-speech',
      description: 'Design and deliver professional speeches, lead academic debates, and master advanced rhetoric structures.',
      price: 79.99,
      level: 'C1',
      isPublished: true,
      instructorId,
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

  console.log(`Seeded Course 3: ${course3.title}`);
}

main()
  .catch(err => {
    console.error("Seeding Error:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
