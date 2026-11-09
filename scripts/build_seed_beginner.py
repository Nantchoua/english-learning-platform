"""
Generate prisma/seed-beginner-course.ts with:
1. Videos strictly corresponding to their units and lessons
2. Dedicated End-of-Unit Tests with 10 questions per unit parsed from Oxford Quick Tests 1-12
3. Practice quizzes for individual lessons (4 questions each)
4. Clean Markdown content with audio players, vocabulary tables, grammar tables, dialogue transcripts
5. NO embedded <video> tags in markdown!
"""

import sys
import pypdf
import re
import json
import os

test_dir = r"C:\Users\Dominic Nantchoua\Downloads\English File 5th beginner\English File 5th beginner\Tests\english_file_fifth_edition_beginner_all_quick_tests\english_file_fifth_edition_beginner_all_quick_tests"

def clean_str(s):
    if not s:
        return ""
    s = s.replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')
    s = s.replace("\u2013", "-").replace("\u2014", "-")
    s = re.sub(r"[\uf0fc\uf0fd\uf0fe]+", "", s)
    s = " ".join(s.split())
    s = s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return s

def extract_quick_tests():
    all_tests = {}
    for unit_num in range(1, 13):
        test_pdf = f"{test_dir}\\ef5e_beg_quick_test_{unit_num:02d}.pdf"
        ak_pdf = f"{test_dir}\\ef5e_beg_quick_test_{unit_num:02d}_ak.pdf"
        
        t_text = "\n".join([p.extract_text() for p in pypdf.PdfReader(test_pdf).pages])
        ak_text = "\n".join([p.extract_text() for p in pypdf.PdfReader(ak_pdf).pages])
        
        grammar_ak = {}
        g_match = re.search(r"GRAMMAR\s*\n(.*?)(?=VOCABULARY|\Z)", ak_text, re.DOTALL)
        if g_match:
            for line in g_match.group(1).splitlines():
                m = re.match(r"^\s*(\d+)\s+([A-D])\s*$", line)
                if m:
                    grammar_ak[int(m.group(1))] = m.group(2)
                    
        g_q_match = re.search(r"GRAMMAR\s*\nTick.*?\n(.*?)(?=VOCABULARY|\Z)", t_text, re.DOTALL)
        questions = []
        if g_q_match:
            raw_g = g_q_match.group(1)
            items = re.split(r"\n(?=\s*\d+\s+)", raw_g)
            for item in items:
                m = re.match(r"^\s*(\d+)\s+(.*?)\n\s*A\s+(.*?)\s+(?:|||\s)*B\s+(.*?)\s+(?:|||\s)*C\s+(.*?)(?:\s*(?:|||\d+|\Z))", item, re.DOTALL)
                if m:
                    num = int(m.group(1))
                    q_text = clean_str(m.group(2))
                    optA = clean_str(m.group(3))
                    optB = clean_str(m.group(4))
                    optC = clean_str(m.group(5))
                    correct_letter = grammar_ak.get(num, "A")
                    opt_idx = {"A": 0, "B": 1, "C": 2, "D": 3}.get(correct_letter, 0)
                    
                    if optA and optB and optC and q_text:
                        questions.append({
                            "question": q_text,
                            "optionA": optA,
                            "optionB": optB,
                            "optionC": optC,
                            "optionD": "None of the above",
                            "correctOption": opt_idx
                        })
        all_tests[unit_num] = questions[:10]
    return all_tests

quick_tests = extract_quick_tests()
print(f"Extracted quick tests for {len(quick_tests)} units.")

modules_data = [
    {
        "unit": 1,
        "title": "Unit 1: Introductions, Numbers & Greetings",
        "description": "Learn to introduce yourself, greet others politely, count from 0 to 10, spell names, and use the verb 'be' (I, you, he, she, it).",
        "lessons": [
            {
                "sub": "1.1",
                "title": "1A: Nice to Meet You",
                "video": "/videos/beginner/ef5e_beg_1a_1_listening.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_1.02_new.mp3",
                "grammar": "verb be (singular): I and you",
                "vocab": "numbers 0-10, days of the week, greetings",
                "dialogue": [
                    ("Sarah", "Hello, welcome to class! My name is Sarah Jenkins. What's your name?"),
                    ("Alex", "Hello Sarah! My name is Alex Santos. Nice to meet you."),
                    ("Sarah", "Nice to meet you too, Alex. Are you in Room 3?"),
                    ("Alex", "Yes, I am. I'm in Group A."),
                    ("Sarah", "Great! Welcome to the English Academy.")
                ],
                "vocab_table": [
                    ("Hello / Hi", "interjection", "/həˈləʊ/", "Standard friendly greeting used at any time", "Hello, nice to meet you!"),
                    ("Name", "noun", "/neɪm/", "A word by which a person is known", "What is your name?"),
                    ("Nice to meet you", "phrase", "/naɪs tuː miːt juː/", "Polite phrase used when introduced to someone", "Hi Alex, nice to meet you too."),
                    ("Goodbye / Bye", "interjection", "/ɡʊdˈbaɪ/", "Said when parting or leaving", "Goodbye, see you on Monday!"),
                    ("Zero to Ten", "numbers", "/ˈzɪərəʊ/ - /tɛn/", "Cardinal digits 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10", "My phone number ends in four, seven, zero.")
                ],
                "practice_questions": [
                    ("Hello, ________ Mark.", "I", "I'm", "Am", "None of the above", 1),
                    ("A: Nice to meet you. B: ________.", "Goodbye", "Nice to meet you, too", "I am fine", "None of the above", 1),
                    ("Are you in Room 4? - Yes, ________.", "I'm", "I am", "you are", "None of the above", 1),
                    ("What number comes after six? - ________.", "seven", "five", "eight", "None of the above", 0)
                ]
            },
            {
                "sub": "1.2",
                "title": "1B: Music Round the World",
                "video": "/videos/beginner/ef5e_beg_1b_1_vocabulary.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_1.16_new.mp3",
                "grammar": "verb be (singular): he, she, it",
                "vocab": "countries (Spain, Japan, Brazil, UK, Mexico, Italy)",
                "dialogue": [
                    ("Reporter", "Excuse me, where is this band from?"),
                    ("Tourist", "They are from Spain. The singer is from Madrid."),
                    ("Reporter", "Is she famous in Europe?"),
                    ("Tourist", "Yes, she is! Her music is popular all over the world.")
                ],
                "vocab_table": [
                    ("Country", "noun", "/ˈkʌntri/", "A nation with its own government", "Which country are you from?"),
                    ("Spain / Spanish", "noun / adj", "/speɪn/ - /ˈspænɪʃ/", "Country in southwestern Europe / language or nationality", "Carlos is from Spain."),
                    ("Japan / Japanese", "noun / adj", "/dʒəˈpæn/ - /ˌdʒæpəˈniːz/", "Island nation in East Asia", "Yuki is from Tokyo, Japan."),
                    ("Brazil / Brazilian", "noun / adj", "/brəˈzɪl/ - /brəˈzɪljən/", "Largest country in South America", "Samba music is from Brazil."),
                    ("Where", "adverb", "/weə(r)/", "Question word for asking about place or origin", "Where is she from?")
                ],
                "practice_questions": [
                    ("Where ________ Carlos from?", "is", "are", "am", "None of the above", 0),
                    ("Maria is from Mexico. ________ Mexican.", "She", "She's", "He's", "None of the above", 1),
                    ("Is Rio in Argentina? - No, it ________.", "isn't", "is", "not", "None of the above", 0),
                    ("Tokyo is in ________.", "Japan", "Japanese", "Spain", "None of the above", 0)
                ]
            },
            {
                "sub": "1.3",
                "title": "Practical English 1: How Do You Spell It?",
                "video": "/videos/beginner/ef5e_beg_pe1_1.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_1.31_new.mp3",
                "grammar": "The English alphabet, checking into a hotel",
                "vocab": "classroom language, spelling names, hotel reception",
                "dialogue": [
                    ("Receptionist", "Good afternoon. Welcome to the Grand Hotel."),
                    ("Rob", "Hello. I have a reservation. My name is Rob Walker."),
                    ("Receptionist", "How do you spell your surname, please?"),
                    ("Rob", "W-A-L-K-E-R."),
                    ("Receptionist", "Thank you, Mr. Walker. You are in Room 302.")
                ],
                "vocab_table": [
                    ("Spell", "verb", "/spɛl/", "Write or name the letters that form a word", "How do you spell your first name?"),
                    ("Surname / Last name", "noun", "/ˈsɜːneɪm/", "Family name inherited from parents", "My surname is Walker."),
                    ("Reservation", "noun", "/ˌrɛzəˈveɪʃən/", "An arrangement to have a room or table kept for you", "I have a reservation for two nights."),
                    ("Room", "noun", "/ruːm/", "A partitioned space inside a building or hotel", "Your key is for room 204."),
                    ("Please", "adverb", "/pliːz/", "Polite word used when requesting something", "Spell that again, please.")
                ],
                "practice_questions": [
                    ("How do you ________ your last name?", "spell", "spells", "write down", "None of the above", 0),
                    ("Good morning. I have a ________ for a single room.", "reservation", "book", "table", "None of the above", 0),
                    ("What letter comes between J and L? - ________.", "K", "M", "H", "None of the above", 0),
                    ("Excuse me, can you ________ that, please?", "repeat", "listen", "write", "None of the above", 0)
                ]
            },
            {
                "sub": "1.4",
                "title": "Unit 1: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_1.03_new.mp3",
                "grammar": "Comprehensive assessment of verb be (I, you, he, she, it), nationalities, greetings, and alphabet",
                "vocab": "Unit 1 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "Welcome to your Unit 1 Comprehensive Examination."),
                    ("Student", "Thank you. I am ready to begin."),
                    ("Examiner", "Read each question carefully and select the best answer from A, B, or C.")
                ],
                "vocab_table": [
                    ("Review", "noun", "/rɪˈvjuː/", "A formal assessment of learning material", "Review all grammar points before starting."),
                    ("Question", "noun", "/ˈkwɛstʃən/", "A sentence worded to elicit information", "Answer all 10 questions."),
                    ("Correct", "adjective", "/kəˈrɛkt/", "Free from error; accurate", "Choose the correct option.")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 2,
        "title": "Unit 2: Nationalities & Numbers 11–100",
        "description": "Master plural forms of 'be' (we, you, they), asking Wh- questions, understanding phone numbers, bus numbers, and numbers up to 100.",
        "lessons": [
            {
                "sub": "2.1",
                "title": "2A: Are You on Holiday?",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_2.01_new.mp3",
                "grammar": "verb be (plural): we, you, they",
                "vocab": "nationalities, on holiday, on business",
                "dialogue": [
                    ("David", "Hello! Are you on holiday here in London?"),
                    ("Elena", "No, we aren't. We're here on business."),
                    ("David", "Where are you and your colleagues from?"),
                    ("Elena", "We're from Rome. We're Italian.")
                ],
                "vocab_table": [
                    ("Holiday", "noun", "/ˈhɒlɪdeɪ/", "Vacation or leisure trip away from work", "Are you on holiday in Spain?"),
                    ("Business", "noun", "/ˈbɪznəs/", "Work, commercial, or professional activity", "No, they are here on business."),
                    ("Colleague", "noun", "/ˈkɒliːɡ/", "A person with whom one works", "These are my colleagues from Berlin."),
                    ("We / They", "pronoun", "/wiː/ - /ðeɪ/", "Plural subjective pronouns", "They are from Canada; we are from the UK.")
                ],
                "practice_questions": [
                    ("We ________ from Germany. We're Austrian.", "aren't", "isn't", "not", "None of the above", 0),
                    ("Are they on holiday? - No, they ________.", "aren't", "are not", "isn't", "None of the above", 0),
                    ("Marco and Paulo are from Italy. They are ________.", "Italian", "Italians", "Italy", "None of the above", 0),
                    ("________ you and Sara students? - Yes, we are.", "Are", "Is", "Am", "None of the above", 0)
                ]
            },
            {
                "sub": "2.2",
                "title": "2B: What Number Is the Bus?",
                "video": "/videos/beginner/ef5e_beg_2b_1_vocabulary.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_2.14_new.mp3",
                "grammar": "Wh- and How questions with be (Who, What, Where, When, How)",
                "vocab": "numbers 11-100, phone numbers, bus lines",
                "dialogue": [
                    ("Passenger", "Excuse me, what number is the bus to Oxford Street?"),
                    ("Clerk", "It's bus number twenty-four. It leaves from gate eleven."),
                    ("Passenger", "How much is the ticket?"),
                    ("Clerk", "It's three pounds fifty.")
                ],
                "vocab_table": [
                    ("Bus", "noun", "/bʌs/", "A large motor vehicle carrying passengers by road", "What number is the bus?"),
                    ("Phone number", "noun", "/fəʊn ˈnʌmbə/", "A sequence of numbers used to dial a telephone", "My phone number is 0794 332 108."),
                    ("Eleven to Twenty", "numbers", "/ɪˈlɛv.ən/ - /ˈtwɛn.ti/", "11, 12, 13, 14, 15, 16, 17, 18, 19, 20", "She is fifteen years old."),
                    ("Thirty to One Hundred", "numbers", "/ˈθɜː.ti/ - /wʌn ˈhʌn.drəd/", "30, 40, 50, 60, 70, 80, 90, 100", "The hotel is at 85 King's Road.")
                ],
                "practice_questions": [
                    ("________ is your phone number?", "What", "Who", "Where", "None of the above", 0),
                    ("What number comes after nineteen? - ________.", "twenty", "twelve", "thirty", "None of the above", 0),
                    ("________ is your teacher? - Mr. Henderson.", "Who", "What", "How", "None of the above", 0),
                    ("Sixty plus twenty is ________.", "eighty", "seventy", "ninety", "None of the above", 0)
                ]
            },
            {
                "sub": "2.3",
                "title": "Revise and Check 1 & 2: Can You Understand These People?",
                "video": "/videos/beginner/ef5e_beg_rc_1and2_video.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_2.25_new.mp3",
                "grammar": "Review of verb be (singular and plural), Wh- questions",
                "vocab": "Review of personal details, nationalities, numbers 0-100",
                "dialogue": [
                    ("Interviewer", "Hello. What's your name?"),
                    ("Passerby 1", "My name is Richard. I'm from London."),
                    ("Interviewer", "Are you a student?"),
                    ("Passerby 1", "No, I'm an architect."),
                    ("Interviewer", "Where are your friends from?"),
                    ("Passerby 1", "They are from Australia.")
                ],
                "vocab_table": [
                    ("Understand", "verb", "/ˌʌndəˈstænd/", "Perceive the intended meaning of words", "Can you understand native speakers?"),
                    ("Interview", "noun", "/ˈɪntəvjuː/", "A meeting where questions are asked", "Listen to this street interview."),
                    ("City", "noun", "/ˈsɪti/", "A large town", "London is a very big city.")
                ],
                "practice_questions": [
                    ("Where ________ you from? - I'm from Tokyo.", "are", "is", "am", "None of the above", 0),
                    ("________ are they? - They are my friends, Leo and Ana.", "Who", "What", "Where", "None of the above", 0),
                    ("Is your city quiet? - No, it ________.", "isn't", "aren't", "is", "None of the above", 0),
                    ("Thirty-five minus ten is ________.", "twenty-five", "fifteen", "twenty", "None of the above", 0)
                ]
            },
            {
                "sub": "2.4",
                "title": "Unit 2: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_2.02_new.mp3",
                "grammar": "Comprehensive assessment of plural be, Wh- questions, numbers 11-100, and nationalities",
                "vocab": "Unit 2 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 2 End of Unit Test."),
                    ("Student", "I am ready to complete the assessment."),
                    ("Examiner", "Select the correct option for each question below.")
                ],
                "vocab_table": [
                    ("Score", "noun", "/skɔː/", "The number of points achieved in a test", "Aim for a score of 80% or higher."),
                    ("Review", "verb", "/rɪˈvjuː/", "Look back over previously covered material", "Review all Unit 2 notes carefully.")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 3,
        "title": "Unit 3: Everyday Objects & Souvenirs",
        "description": "Learn words for everyday small objects, singular and plural nouns with a/an, this/that/these/those, understanding prices, and buying snacks.",
        "lessons": [
            {
                "sub": "3.1",
                "title": "3A: Where's My Phone?",
                "video": "/videos/beginner/ef5e_beg_3a_1_pronunciation.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_3.01.mp3",
                "grammar": "singular and plural nouns; articles a / an; /s/ and /z/ endings",
                "vocab": "small things (keys, wallet, umbrella, laptop, glasses, charger)",
                "dialogue": [
                    ("Mark", "Oh no! Where's my phone?"),
                    ("Lisa", "Is it in your backpack?"),
                    ("Mark", "No, it isn't. Here are my keys and my wallet, but no phone!"),
                    ("Lisa", "Look on the table. It's next to your glasses.")
                ],
                "vocab_table": [
                    ("Key / Keys", "noun", "/kiː/ - /kiːz/", "A small metal instrument used to open a lock", "Where are my house keys?"),
                    ("Wallet", "noun", "/ˈwɒlɪt/", "A pocket-sized flat folding case for money and cards", "My credit card is in my wallet."),
                    ("Umbrella", "noun", "/ʌmˈbrɛlə/", "A folding canopy used for protection against rain", "Take an umbrella, it is raining."),
                    ("Watch", "noun", "/wɒtʃ/", "A small timepiece worn on the wrist", "This is an expensive watch.")
                ],
                "practice_questions": [
                    ("It's ________ identity card.", "an", "a", "the", "None of the above", 0),
                    ("Where are my ________?", "keys", "key", "keyes", "None of the above", 0),
                    ("She has ________ umbrella in her bag.", "an", "a", "two", "None of the above", 0),
                    ("Two ________ are on the desk.", "watches", "watchs", "watch", "None of the above", 0)
                ]
            },
            {
                "sub": "3.2",
                "title": "3B: Souvenirs",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_3.09.mp3",
                "grammar": "this / that / these / those; sentence rhythm",
                "vocab": "souvenirs (postcard, mug, T-shirt, magnet, cap)",
                "dialogue": [
                    ("Shopkeeper", "Can I help you?"),
                    ("Customer", "Yes, how much is this London mug?"),
                    ("Shopkeeper", "This mug is six pounds, and that T-shirt is fifteen pounds."),
                    ("Customer", "And how much are these postcards?"),
                    ("Shopkeeper", "They are two pounds each.")
                ],
                "vocab_table": [
                    ("This / That", "demonstrative", "/ðɪs/ - /ðæt/", "Referring to a singular object near / far", "This is my bag, and that is yours."),
                    ("These / Those", "demonstrative", "/ðiːz/ - /ðəʊz/", "Referring to plural objects near / far", "These postcards are beautiful."),
                    ("Mug", "noun", "/mʌɡ/", "A large cup typically used for hot drinks", "A souvenir coffee mug."),
                    ("Price", "noun", "/praɪs/", "The amount of money expected in payment", "What is the price of that cap?")
                ],
                "practice_questions": [
                    ("How much is ________ T-shirt over there?", "that", "this", "these", "None of the above", 0),
                    ("________ are my photos from New York.", "These", "This", "That", "None of the above", 0),
                    ("How much ________ those sunglasses?", "are", "is", "am", "None of the above", 0),
                    ("Is ________ your wallet here on the table?", "this", "that", "those", "None of the above", 0)
                ]
            },
            {
                "sub": "3.3",
                "title": "Practical English 2: An Orange Juice, Please",
                "video": "/videos/beginner/ef5e_beg_pe2_1.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_3.17_new.mp3",
                "grammar": "Understanding prices, ordering food and drinks in a café",
                "vocab": "coffee, tea, orange juice, mineral water, sandwich, pounds and pence",
                "dialogue": [
                    ("Barista", "Hi, can I get you anything?"),
                    ("Jenny", "Yes, a cheese sandwich and an orange juice, please."),
                    ("Barista", "Anything else?"),
                    ("Jenny", "No thanks. How much is that?"),
                    ("Barista", "That's seven pounds forty, please.")
                ],
                "vocab_table": [
                    ("Orange juice", "noun", "/ˈɒrɪndʒ dʒuːs/", "Drink made from squeezed oranges", "An orange juice, please."),
                    ("Sandwich", "noun", "/ˈsænwɪtʃ/", "Food consisting of filling between bread", "A chicken salad sandwich."),
                    ("How much is that?", "phrase", "/haʊ mʌtʃ ɪz ðæt/", "Asking for the total bill or cost", "How much is that in euros?"),
                    ("Pound / Penny", "noun", "/paʊnd/ - /ˈpɛni/", "British currency units (£ and p)", "Ten pounds and fifty pence.")
                ],
                "practice_questions": [
                    ("A: Can I help you? B: An espresso, ________.", "please", "thank you", "excuse me", "None of the above", 0),
                    ("How much ________ the sandwiches?", "are", "is", "cost", "None of the above", 0),
                    ("That's five ________ and twenty pence.", "pounds", "pound", "moneys", "None of the above", 0),
                    ("Here's your change. - ________.", "Thank you", "Please", "You're welcome", "None of the above", 0)
                ]
            },
            {
                "sub": "3.4",
                "title": "Unit 3: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_3.02_new.mp3",
                "grammar": "Comprehensive assessment of a/an, singular/plural nouns, this/that/these/those, prices",
                "vocab": "Unit 3 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 3 End of Unit Test."),
                    ("Student", "I am prepared for the questions."),
                    ("Examiner", "Select the correct answer for each question.")
                ],
                "vocab_table": [
                    ("Review", "noun", "/rɪˈvjuː/", "Assessment of singular/plural nouns and demonstratives", "Read each sentence carefully.")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 4,
        "title": "Unit 4: Family, Friends & Descriptions",
        "description": "Describe family members and friends, use possessive adjectives and possessive 's, and use common descriptive adjectives with colors.",
        "lessons": [
            {
                "sub": "4.1",
                "title": "4A: This Is My Family",
                "video": "/videos/beginner/ef5e_beg_4a_1_grammar.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_4.01_new.mp3",
                "grammar": "possessive adjectives (my, your, his, her, our, their); possessive 's",
                "vocab": "family (mother, father, brother, sister, husband, wife, daughter, son)",
                "dialogue": [
                    ("Sarah", "Who is this in the photo?"),
                    ("Paul", "That's my sister, Amy. And that's her husband, David."),
                    ("Sarah", "Do they have children?"),
                    ("Paul", "Yes, they have a daughter. Her name is Emily.")
                ],
                "vocab_table": [
                    ("Mother / Father", "noun", "/ˈmʌðə/ - /ˈfɑːðə/", "Female and male parents", "My mother is a doctor."),
                    ("Brother / Sister", "noun", "/ˈbrʌðə/ - /ˈsɪstə/", "Male and female siblings", "His brother lives in Sydney."),
                    ("Husband / Wife", "noun", "/ˈhʌzbənd/ - /waɪf/", "A married man or woman", "Her husband is French."),
                    ("Possessive 's", "grammar", "/s/ or /z/", "Indicates ownership or family relation", "This is Sarah's car.")
                ],
                "practice_questions": [
                    ("This is John and ________ wife, Mary.", "his", "her", "their", "None of the above", 0),
                    ("That is ________ house.", "Emma's", "Emma", "Emmas", "None of the above", 0),
                    ("We live in Madrid. ________ flat is very modern.", "Our", "Their", "We", "None of the above", 0),
                    ("Who is David? - He is ________ brother.", "Sarah's", "Sarah", "Sarahs'", "None of the above", 0)
                ]
            },
            {
                "sub": "4.2",
                "title": "4B: The Right Car for Me",
                "video": "/videos/beginner/ef5e_beg_4b_1_grammar.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_4.12_new.mp3",
                "grammar": "adjectives: position before nouns, no plural form",
                "vocab": "colours and common adjectives (big, small, fast, slow, expensive, cheap, old, new)",
                "dialogue": [
                    ("Car Dealer", "Which car do you prefer, the blue one or the red one?"),
                    ("Customer", "The red car is very fast, but it's too expensive!"),
                    ("Car Dealer", "The blue car is smaller, economical, and very comfortable."),
                    ("Customer", "Perfect. That is the right car for me.")
                ],
                "vocab_table": [
                    ("Expensive / Cheap", "adj", "/ɪkˈspɛnsɪv/ - /tʃiːp/", "Costing a lot of money vs low in cost", "That sports car is very expensive."),
                    ("Fast / Slow", "adj", "/fɑːst/ - /sləʊ/", "Moving at high speed vs low speed", "It is a fast train."),
                    ("Old / New", "adj", "/əʊld/ - /njuː/", "Having lived/existed long vs newly made", "They live in a beautiful old house."),
                    ("Colours", "noun/adj", "/ˈkʌləz/", "Red, blue, green, black, white, silver, yellow", "She drives a red car.")
                ],
                "practice_questions": [
                    ("They have two ________ cars.", "fast", "fasts", "fastes", "None of the above", 0),
                    ("It's a ________ car.", "red Italian", "Italian red", "reds Italian", "None of the above", 0),
                    ("This watch isn't expensive; it's very ________.", "cheap", "big", "fast", "None of the above", 0),
                    ("Her house is ________.", "very big", "very bigs", "a big", "None of the above", 0)
                ]
            },
            {
                "sub": "4.3",
                "title": "Revise and Check 3 & 4: Can You Understand These People?",
                "video": "/videos/beginner/ef5e_beg_rc_3and4_video.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_4.21_new.mp3",
                "grammar": "Review of singular/plural, demonstratives, family, and adjectives",
                "vocab": "Personal items, family descriptions, everyday conversations",
                "dialogue": [
                    ("Interviewer", "Tell me about your family."),
                    ("Speaker", "I have a big family. I have three brothers and one sister."),
                    ("Interviewer", "What kind of car do you have?"),
                    ("Speaker", "I have an old blue estate car. It's slow but reliable.")
                ],
                "vocab_table": [
                    ("Understand", "verb", "/ˌʌndəˈstænd/", "Grasp the meaning of street responses", "Listen to native speakers describing possessions.")
                ],
                "practice_questions": [
                    ("Is that ________ phone on the sofa?", "your", "you", "yours", "None of the above", 0),
                    ("They are ________ students.", "good", "goods", "a good", "None of the above", 0),
                    ("My ________ car is outside.", "brother's", "brother", "brothers", "None of the above", 0),
                    ("How many sisters do you have? - I have ________ sister.", "one", "a two", "an", "None of the above", 0)
                ]
            },
            {
                "sub": "4.4",
                "title": "Unit 4: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_4.02.mp3",
                "grammar": "Comprehensive assessment of possessives, family relationships, adjectives and colours",
                "vocab": "Unit 4 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 4 End of Unit Test."),
                    ("Student", "Ready."),
                    ("Examiner", "Complete all 10 questions.")
                ],
                "vocab_table": [
                    ("Evaluation", "noun", "/ɪˌvæljuˈeɪʃən/", "Assessment of learning progress", "Review your results upon completion.")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 5,
        "title": "Unit 5: Food, Daily Life & Telling Time",
        "description": "Talk about food and meals, use present simple affirmative and negative with I/you/we/they, ask questions about daily habits, and tell the time.",
        "lessons": [
            {
                "sub": "5.1",
                "title": "5A: My Favourite Meal",
                "video": "/videos/beginner/ef5e_beg_5a_1_vocabulary.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_5.01.mp3",
                "grammar": "present simple (+) and (-): I, you, we, they",
                "vocab": "food and drink (breakfast, lunch, dinner, fruit, vegetables, meat, bread, coffee)",
                "dialogue": [
                    ("Chef", "What do you eat for breakfast in your country?"),
                    ("Guest", "I usually have coffee, toast, and fruit. I don't eat meat in the morning."),
                    ("Chef", "Do you like fresh orange juice?"),
                    ("Guest", "Yes, I love it! It's delicious.")
                ],
                "vocab_table": [
                    ("Breakfast", "noun", "/ˈbrɛkfəst/", "The first meal of the day", "I have breakfast at seven o'clock."),
                    ("Lunch", "noun", "/lʌntʃ/", "A meal eaten in the middle of the day", "We eat lunch in the cafeteria."),
                    ("Dinner", "noun", "/ˈdɪnə/", "The main meal of the day, usually in the evening", "Dinner is ready at eight."),
                    ("Vegetables", "noun", "/ˈvɛdʒtəblz/", "Plants used as food, such as carrots, peas, potatoes", "Eat plenty of green vegetables.")
                ],
                "practice_questions": [
                    ("I ________ coffee in the morning.", "drink", "drinks", "drinking", "None of the above", 0),
                    ("We ________ eat fast food during the week.", "don't", "doesn't", "not", "None of the above", 0),
                    ("They ________ cereal and milk for breakfast.", "have", "has", "having", "None of the above", 0),
                    ("I don't ________ sugar in my tea.", "like", "likes", "liking", "None of the above", 0)
                ]
            },
            {
                "sub": "5.2",
                "title": "5B: A Very Long Flight",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_5.12_new.mp3",
                "grammar": "present simple (?): I, you, we, they; short answers",
                "vocab": "common verb phrases (read, watch, listen, sleep, live, work)",
                "dialogue": [
                    ("Passenger A", "Excuse me, do you speak English?"),
                    ("Passenger B", "Yes, I do. Are you on your way to Sydney?"),
                    ("Passenger A", "Yes, it's a very long flight! Do you fly often?"),
                    ("Passenger B", "No, I don't. I usually read books or sleep.")
                ],
                "vocab_table": [
                    ("Flight", "noun", "/flaɪt/", "A journey made by flying in an aircraft", "It's a ten-hour flight."),
                    ("Read", "verb", "/riːd/", "Look at and comprehend written text", "I read novels on the plane."),
                    ("Watch", "verb", "/wɒtʃ/", "Look at something attentively", "We watch movies together."),
                    ("Do you...?", "question", "/duː juː/", "Auxiliary verb for present simple questions", "Do you live in Madrid?")
                ],
                "practice_questions": [
                    ("________ you speak German? - Yes, I do.", "Do", "Are", "Does", "None of the above", 0),
                    ("Do they work in an office? - No, they ________.", "don't", "doesn't", "aren't", "None of the above", 0),
                    ("Where ________ you live?", "do", "are", "does", "None of the above", 0),
                    ("What time do we ________ in London?", "arrive", "arrives", "arriving", "None of the above", 0)
                ]
            },
            {
                "sub": "5.3",
                "title": "Practical English 3: What Time Is It?",
                "video": "/videos/beginner/ef5e_beg_pe3_1.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_5.22_new.mp3",
                "grammar": "Telling the time (o'clock, half past, quarter to/past)",
                "vocab": "the time, saying how you feel (tired, hungry, thirsty, late)",
                "dialogue": [
                    ("Rob", "Hi Jenny! I'm really sorry I'm late."),
                    ("Jenny", "That's okay Rob. What time is it?"),
                    ("Rob", "It's quarter past eight. Traffic was terrible."),
                    ("Jenny", "No problem. Are you hungry? Let's get something to eat.")
                ],
                "vocab_table": [
                    ("O'clock", "adverb", "/əˈklɒk/", "Used to specify the exact hour", "It is nine o'clock."),
                    ("Half past", "phrase", "/hɑːf pɑːst/", "Thirty minutes past the hour", "It's half past seven (7:30)."),
                    ("Quarter past / to", "phrase", "/ˈkwɔːtə/", "15 minutes after or before the hour", "Quarter to six (5:45)."),
                    ("Hungry / Thirsty", "adjective", "/ˈhʌŋɡri/ - /ˈθɜːsti/", "Needing food / needing a drink", "I'm hungry, let's order lunch.")
                ],
                "practice_questions": [
                    ("What ________ is it? - It's half past four.", "time", "clock", "hour", "None of the above", 0),
                    ("It's 7:15. In English: It's quarter ________ seven.", "past", "to", "after", "None of the above", 0),
                    ("I didn't eat lunch. I am very ________.", "hungry", "thirsty", "tired", "None of the above", 0),
                    ("I'm really sorry I'm ________. - That's fine.", "late", "later", "lating", "None of the above", 0)
                ]
            },
            {
                "sub": "5.4",
                "title": "Unit 5: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_5.02_NEW_03.mp3",
                "grammar": "Comprehensive assessment of present simple (I, you, we, they), food vocab, and telling the time",
                "vocab": "Unit 5 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 5 End of Unit Test."),
                    ("Student", "Ready."),
                    ("Examiner", "Complete all 10 questions.")
                ],
                "vocab_table": [
                    ("Test", "noun", "/tɛst/", "Official evaluation of present simple and time skills", "Good luck!")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 6,
        "title": "Unit 6: Jobs, Daily Routines & Habits",
        "description": "Learn to talk about jobs and workplaces, use present simple 3rd person singular (-s, -es, doesn't, does she?), and express daily routines with adverbs of frequency.",
        "lessons": [
            {
                "sub": "6.1",
                "title": "6A: Old Friends?",
                "video": "/videos/beginner/ef5e_beg_6a_1_grammar.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_6.01_new.mp3",
                "grammar": "present simple: he, she, it (+, -, ?); third person -es",
                "vocab": "jobs and places of work (doctor, teacher, lawyer, nurse, shop assistant, office, hospital)",
                "dialogue": [
                    ("Helen", "Do you remember Jack from university?"),
                    ("George", "Yes! What does he do now?"),
                    ("Helen", "He works as a doctor in a big London hospital. He loves his job."),
                    ("George", "Does his wife work there too?"),
                    ("Helen", "No, she doesn't. She teaches music at a school.")
                ],
                "vocab_table": [
                    ("Doctor / Nurse", "noun", "/ˈdɒktə/ - /nɜːs/", "Healthcare professionals treating patients", "She works as a doctor in hospital."),
                    ("Teacher", "noun", "/ˈtiːtʃə/", "A person who educates students", "He teaches French at university."),
                    ("Hospital / Office", "noun", "/ˈhɒspɪtl/ - /ˈɒfɪs/", "Places where healthcare or desk work takes place", "My brother works in an office."),
                    ("Third person -s/-es", "grammar", "/s/, /z/, /ɪz/", "Verbs take -s in 3rd person singular", "He works, she watches, it rains.")
                ],
                "practice_questions": [
                    ("He ________ in a bank.", "works", "work", "working", "None of the above", 0),
                    ("She ________ like tea; she prefers coffee.", "doesn't", "don't", "isn't", "None of the above", 0),
                    ("What ________ your sister do? - She is a dentist.", "does", "do", "is", "None of the above", 0),
                    ("A doctor works in a ________.", "hospital", "school", "shop", "None of the above", 0)
                ]
            },
            {
                "sub": "6.2",
                "title": "6B: Good Morning, Goodnight",
                "video": "/videos/beginner/ef5e_beg_6b_1_listening.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_6.09.mp3",
                "grammar": "adverbs of frequency: always, usually, often, sometimes, never",
                "vocab": "a typical day (wake up, get up, take a shower, leave home, go to bed)",
                "dialogue": [
                    ("Interviewer", "Tell us about a typical day in New York."),
                    ("Guide", "I always wake up early at 6:00. I have breakfast and go to Central Park."),
                    ("Interviewer", "Do you usually finish late?"),
                    ("Guide", "Yes, I often finish tours at 7:00 PM, but I never work on Sundays.")
                ],
                "vocab_table": [
                    ("Always", "adverb", "/ˈɔːlweɪz/", "100% of the time", "I always brush my teeth before bed."),
                    ("Usually", "adverb", "/ˈjuːʒuəli/", "About 80% of the time; normally", "We usually eat dinner at home."),
                    ("Sometimes", "adverb", "/ˈsʌmtaɪmz/", "About 50% of the time; occasionally", "I sometimes drink herbal tea."),
                    ("Never", "adverb", "/ˈnɛvə/", "0% of the time; at no time", "He never goes to bed after midnight.")
                ],
                "practice_questions": [
                    ("She ________ arrives on time.", "always", "always is", "is always to", "None of the above", 0),
                    ("I ________ eat breakfast before going to school.", "usually", "am usually", "usually to", "None of the above", 0),
                    ("He ________ late for his meetings.", "is never", "never is", "never", "None of the above", 0),
                    ("What time do you ________ in the morning?", "wake up", "wakes up", "waking up", "None of the above", 0)
                ]
            },
            {
                "sub": "6.3",
                "title": "Revise and Check 5 & 6: Can You Understand These People?",
                "video": "/videos/beginner/ef5e_beg_rc_5and6_video.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_6.17_new.mp3",
                "grammar": "Review of present simple all persons (+, -, ?), daily habits, telling time",
                "vocab": "Jobs, routines, food & drink review",
                "dialogue": [
                    ("Interviewer", "What do you do?"),
                    ("Person 1", "I'm a software developer. I work from home."),
                    ("Interviewer", "What time do you start in the morning?"),
                    ("Person 1", "I usually start at 8:30 AM.")
                ],
                "vocab_table": [
                    ("Routine", "noun", "/ruːˈtiːn/", "A sequence of actions regularly followed", "Explain your weekly routine.")
                ],
                "practice_questions": [
                    ("Does he ________ in London? - Yes, he does.", "live", "lives", "living", "None of the above", 0),
                    ("She ________ TV in the evening.", "watches", "watch", "watchs", "None of the above", 0),
                    ("We never ________ tennis on weekdays.", "play", "plays", "playing", "None of the above", 0),
                    ("What time ________ your train leave?", "does", "do", "is", "None of the above", 0)
                ]
            },
            {
                "sub": "6.4",
                "title": "Unit 6: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_6.02_NEW_02.mp3",
                "grammar": "Comprehensive assessment of present simple 3rd person, adverbs of frequency, and jobs",
                "vocab": "Unit 6 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 6 End of Unit Test."),
                    ("Student", "Ready."),
                    ("Examiner", "Complete all 10 questions.")
                ],
                "vocab_table": [
                    ("Progress", "noun", "/ˈprəʊɡrɛs/", "Advance towards mastery", "You are halfway through A1!")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 7,
        "title": "Unit 7: Free Time, Films & Dates",
        "description": "Learn to ask questions about free time activities with correct word order, use imperatives and object pronouns (me, him, her), and say dates and months.",
        "lessons": [
            {
                "sub": "7.1",
                "title": "7A: At the Weekend",
                "video": "/videos/beginner/ef5e_beg_7a_1_vocabulary.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_7.01.mp3",
                "grammar": "word order in questions: be and present simple (ASI / QUASI)",
                "vocab": "common verb phrases: free time (play guitar, go out with friends, listen to music)",
                "dialogue": [
                    ("Sophie", "What do you do at the weekend, James?"),
                    ("James", "I usually play football with friends on Saturday morning."),
                    ("Sophie", "Do you go out on Saturday night?"),
                    ("James", "Yes, we often go to a restaurant or the cinema.")
                ],
                "vocab_table": [
                    ("Weekend", "noun", "/ˌwiːkˈɛnd/", "Saturday and Sunday", "Have a wonderful weekend!"),
                    ("Go out", "verb phrase", "/ɡəʊ aʊt/", "Leave home to go to a social event", "Do you go out often?"),
                    ("Cinema", "noun", "/ˈsɪnɪmə/", "A theatre where films are shown", "Let's go to the cinema tonight."),
                    ("QUASI", "grammar rule", "Q - Aux - S - Inf", "Question word + Auxiliary + Subject + Infinitive", "Where do you work?")
                ],
                "practice_questions": [
                    ("________ do you do on Saturday nights?", "What", "Who", "Where", "None of the above", 0),
                    ("Where ________ your parents live?", "do", "does", "are", "None of the above", 0),
                    ("Do you ________ to music when you study?", "listen", "listens", "listening", "None of the above", 0),
                    ("What time ________ the film start?", "does", "do", "is", "None of the above", 0)
                ]
            },
            {
                "sub": "7.2",
                "title": "7B: Lights, Camera, Action!",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_7.12_new.mp3",
                "grammar": "imperatives; object pronouns: me, you, him, her, it, us, them",
                "vocab": "kinds of film (action, comedy, drama, sci-fi, horror, animated)",
                "dialogue": [
                    ("Director", "Quiet please! Don't look at the camera. Look at him!"),
                    ("Actor", "Can you hear me clearly?"),
                    ("Director", "Yes, perfect! Action! Speak loudly and clearly.")
                ],
                "vocab_table": [
                    ("Imperative", "grammar", "Base verb form", "Used for direct commands and instructions", "Listen to me! Don't shout."),
                    ("Object pronouns", "grammar", "me, him, her, us, them", "Receive the action of the verb", "Call him tomorrow; I love her."),
                    ("Comedy", "noun", "/ˈkɒmɪdi/", "A film or play intended to make people laugh", "I love watching British comedies."),
                    ("Action film", "noun", "/ˈækʃən fɪlm/", "A film with exciting stunts and fights", "James Bond films are action films.")
                ],
                "practice_questions": [
                    ("Please listen to ________ carefully.", "me", "I", "my", "None of the above", 0),
                    ("________ talk during the movie!", "Don't", "No", "Not", "None of the above", 0),
                    ("I see Maria every day, but I never speak to ________.", "her", "she", "hers", "None of the above", 0),
                    ("Where are my keys? - I can't find ________.", "them", "they", "their", "None of the above", 0)
                ]
            },
            {
                "sub": "7.3",
                "title": "Practical English 4: What’s the Date?",
                "video": "/videos/beginner/ef5e_beg_pe4_1.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_7.21_new.mp3",
                "grammar": "Saying the date, ordinal numbers (1st - 31st), talking on the phone",
                "vocab": "months of the year (January - December), telephone expressions",
                "dialogue": [
                    ("Jenny", "Hello, Jenny Zielinski speaking."),
                    ("Rob", "Hi Jenny, it's Rob. What's the date today?"),
                    ("Jenny", "It's the second of November. Why?"),
                    ("Rob", "Because it's my birthday tomorrow, on the third of November!"),
                    ("Jenny", "Happy early birthday, Rob!")
                ],
                "vocab_table": [
                    ("Date", "noun", "/deɪt/", "Day of the month or year", "What's the date today?"),
                    ("Ordinal numbers", "numbers", "first, second, third, fourth...", "Express order or date", "The 1st of May."),
                    ("Months", "noun", "January to December", "Twelve calendar divisions", "My birthday is in August."),
                    ("On the phone", "phrase", "Hello, this is... / speaking", "Standard English telephone phrases", "This is Rob speaking.")
                ],
                "practice_questions": [
                    ("What's the ________ today? - It's the 15th of June.", "date", "day", "time", "None of the above", 0),
                    ("His birthday is on the ________ of March.", "twenty-first", "twenty-one", "twenty", "None of the above", 0),
                    ("What month comes after July? - ________.", "August", "September", "June", "None of the above", 0),
                    ("Hello, this is Sarah ________.", "speaking", "talking", "speaks", "None of the above", 0)
                ]
            },
            {
                "sub": "7.4",
                "title": "Unit 7: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_7.02.mp3",
                "grammar": "Comprehensive assessment of question word order, object pronouns, imperatives, and dates",
                "vocab": "Unit 7 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 7 End of Unit Test."),
                    ("Student", "Ready."),
                    ("Examiner", "Complete all 10 questions.")
                ],
                "vocab_table": [
                    ("Test", "noun", "/tɛst/", "Unit 7 assessment", "Check your answers.")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 8,
        "title": "Unit 8: Abilities, Shopping & Preferences",
        "description": "Learn modal verbs 'can' and 'can't' for permission and ability, express likes and dislikes with -ing forms, and talk about shopping activities.",
        "lessons": [
            {
                "sub": "8.1",
                "title": "8A: Can I Park Here?",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_8.01_new.mp3",
                "grammar": "can / can't: permission and ability; sentence rhythm",
                "vocab": "signs and more verb phrases (pay by card, smoke here, turn right, take photos)",
                "dialogue": [
                    ("Driver", "Excuse me, can I park here?"),
                    ("Traffic Warden", "No, you can't park here between 8:00 AM and 6:00 PM."),
                    ("Driver", "Where can I park?"),
                    ("Traffic Warden", "You can park in the pay-and-display car park down the street.")
                ],
                "vocab_table": [
                    ("Can", "modal verb", "/kæn/ - /kən/", "Expressing ability or permission", "You can pay with a credit card."),
                    ("Can't", "modal verb", "/kɑːnt/", "Expressing inability or prohibition", "You can't smoke inside the building."),
                    ("Park", "verb", "/pɑːk/", "Bring a vehicle that one is driving to a halt", "Can we park here for free?"),
                    ("Sign", "noun", "/saɪn/", "A notice displaying a warning or regulation", "Look at the 'No Parking' sign.")
                ],
                "practice_questions": [
                    ("Can I ________ by credit card?", "pay", "paying", "pays", "None of the above", 0),
                    ("You ________ use mobile phones in the exam room.", "can't", "don't", "aren't", "None of the above", 0),
                    ("Can she swim? - Yes, she ________.", "can", "is", "does", "None of the above", 0),
                    ("Where ________ we buy tickets?", "can", "do can", "are", "None of the above", 0)
                ]
            },
            {
                "sub": "8.2",
                "title": "8B: I Love Shopping",
                "video": "/videos/beginner/ef5e_beg_8b_1_vocabulary_1.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_8.08_new.mp3",
                "grammar": "like / love / don't mind / hate + verb + -ing",
                "vocab": "shopping and leisure activities (cooking, dancing, swimming, reading, buying clothes)",
                "dialogue": [
                    ("Emma", "Do you like shopping for clothes?"),
                    ("Liam", "No, I hate shopping in busy malls! I prefer buying things online."),
                    ("Emma", "I love shopping with my friends on Saturdays. We always have fun.")
                ],
                "vocab_table": [
                    ("Love", "verb", "/lʌv/", "Have a great liking or affection for", "I love cooking Italian pasta."),
                    ("Like", "verb", "/laɪk/", "Find agreeable or enjoyable", "She likes reading on the balcony."),
                    ("Don't mind", "phrase", "/dəʊnt maɪnd/", "Feel neutral towards an activity", "I don't mind doing the dishes."),
                    ("Hate", "verb", "/heɪt/", "Dislike intensely", "They hate waiting in long queues.")
                ],
                "practice_questions": [
                    ("I love ________ in the ocean.", "swimming", "swim", "swims", "None of the above", 0),
                    ("She hates ________ up early on cold mornings.", "getting", "get", "gets", "None of the above", 0),
                    ("Do you like ________ for clothes?", "shopping", "shop", "shops", "None of the above", 0),
                    ("He doesn't mind ________ dinner.", "cooking", "cook", "cooks", "None of the above", 0)
                ]
            },
            {
                "sub": "8.3",
                "title": "Revise and Check 7 & 8: Can You Understand These People?",
                "video": "/videos/beginner/ef5e_beg_rc_7and8_video.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_8.15_new.mp3",
                "grammar": "Review of can/can't, like + -ing, question word order, imperatives",
                "vocab": "Hobbies, abilities, shopping preferences",
                "dialogue": [
                    ("Interviewer", "Can you speak any other foreign languages?"),
                    ("Person 1", "Yes, I can speak Spanish and a little French."),
                    ("Interviewer", "What do you like doing in your free time?"),
                    ("Person 1", "I love cycling and playing the acoustic guitar.")
                ],
                "vocab_table": [
                    ("Ability", "noun", "/əˈbɪlɪti/", "Talent or capacity to do something", "Describe your personal abilities.")
                ],
                "practice_questions": [
                    ("Can they speak Italian? - No, they ________.", "can't", "don't", "aren't", "None of the above", 0),
                    ("I enjoy ________ books in English.", "reading", "read", "reads", "None of the above", 0),
                    ("Don't ________ the door, please.", "close", "closing", "closes", "None of the above", 0),
                    ("Can you play tennis? - Yes, I ________.", "can", "do", "am", "None of the above", 0)
                ]
            },
            {
                "sub": "8.4",
                "title": "Unit 8: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_8.02_NEW_3.mp3",
                "grammar": "Comprehensive assessment of can/can't, like/love/hate + -ing, and shopping vocabulary",
                "vocab": "Unit 8 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 8 End of Unit Test."),
                    ("Student", "Ready."),
                    ("Examiner", "Complete all 10 questions.")
                ],
                "vocab_table": [
                    ("Review", "noun", "/rɪˈvjuː/", "Assessment of modal verbs and gerunds", "Answer each question accurately.")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 9,
        "title": "Unit 9: Travelling, Clothes & Present Continuous",
        "description": "Learn the present continuous tense for ongoing activities, describe clothing and fashion, contrast present continuous vs simple, and invite friends to events.",
        "lessons": [
            {
                "sub": "9.1",
                "title": "9A: What Are They Really Doing?",
                "video": "/videos/beginner/ef5e_beg_9a_1_pronunciation.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_9.01_NEW2.mp3",
                "grammar": "present continuous (be + verb-ing); sentence rhythm",
                "vocab": "common verb phrases: travelling and actions right now",
                "dialogue": [
                    ("Tourist", "Look at that street artist! What is he painting?"),
                    ("Guide", "He's painting a panorama of the Eiffel Tower."),
                    ("Tourist", "And those people over there, are they waiting for the boat?"),
                    ("Guide", "Yes, they're waiting for the evening river cruise.")
                ],
                "vocab_table": [
                    ("Present continuous", "grammar", "am/is/are + verb-ing", "Action occurring right at this moment", "She is studying right now."),
                    ("Wait for", "verb phrase", "/weɪt fɔː/", "Stay where one is until someone arrives", "They are waiting for the bus."),
                    ("Travel", "verb", "/ˈtrævl/", "Make a journey, typically of some length", "We are travelling across Europe."),
                    ("Take photos", "phrase", "/teɪk ˈfəʊtəʊz/", "Capture images with a camera or phone", "He is taking photos of the monuments.")
                ],
                "practice_questions": [
                    ("What ________ you doing right now?", "are", "do", "is", "None of the above", 0),
                    ("She ________ wearing a yellow raincoat.", "is", "are", "does", "None of the above", 0),
                    ("They aren't ________ to the teacher.", "listening", "listen", "listens", "None of the above", 0),
                    ("Are they waiting for us? - Yes, they ________.", "are", "do", "is", "None of the above", 0)
                ]
            },
            {
                "sub": "9.2",
                "title": "9B: Watching and Waiting",
                "video": "/videos/beginner/ef5e_beg_9b_1_vocabulary.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_9.09_new.mp3",
                "grammar": "present continuous or present simple? (habits vs right now)",
                "vocab": "clothes (jacket, jeans, shirt, shoes, skirt, trousers, coat, hat)",
                "dialogue": [
                    ("Detective A", "What is the suspect wearing?"),
                    ("Detective B", "He's wearing dark blue jeans, a black jacket, and white trainers."),
                    ("Detective A", "Does he usually wear glasses?"),
                    ("Detective B", "No, but he's wearing sunglasses today.")
                ],
                "vocab_table": [
                    ("Jacket", "noun", "/ˈdʒækɪt/", "An outer garment extending either to the waist or hips", "A warm leather jacket."),
                    ("Jeans", "noun (plural)", "/dʒiːnz/", "Trousers made of denim", "He always wears blue jeans."),
                    ("Shirt", "noun", "/ʃɜːt/", "A garment for the upper body with collar and buttons", "A crisp white cotton shirt."),
                    ("Wear", "verb", "/weə/", "Have on one's body as clothing or ornament", "What are you wearing today?")
                ],
                "practice_questions": [
                    ("He usually ________ a suit to work, but today he is wearing jeans.", "wears", "is wearing", "wear", "None of the above", 0),
                    ("Look out the window! It ________ right now.", "is raining", "rains", "rain", "None of the above", 0),
                    ("What are those? - They're my new ________.", "shoes", "shoe", "shoess", "None of the above", 0),
                    ("I ________ coffee every morning at eight.", "drink", "am drinking", "drinks", "None of the above", 0)
                ]
            },
            {
                "sub": "9.3",
                "title": "Practical English 5: Would You Like to Come?",
                "video": "/videos/beginner/ef5e_beg_pe5_1.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_9.16_new.mp3",
                "grammar": "Inviting and offering: Would you like to...? / Would you like a...?",
                "vocab": "invitations, accepting and declining politely",
                "dialogue": [
                    ("Rob", "Hi Jenny! Are you free on Friday evening?"),
                    ("Jenny", "Yes, I am. Why?"),
                    ("Rob", "Would you like to come to a jazz concert with me?"),
                    ("Jenny", "I'd love to! What time does it start?"),
                    ("Rob", "At eight o'clock. I can pick you up at seven thirty.")
                ],
                "vocab_table": [
                    ("Would you like to...", "phrase", "/wʊd juː laɪk tuː/", "Polite formula for offering an invitation", "Would you like to have dinner?"),
                    ("I'd love to", "phrase", "/aɪd lʌv tuː/", "Enthusiastic and polite acceptance", "Yes, I'd love to come!"),
                    ("I'm sorry, I can't", "phrase", "/aɪm ˈsɒri aɪ kɑːnt/", "Polite refusal of an invitation", "I'd love to, but I'm busy."),
                    ("Concert", "noun", "/ˈkɒnsət/", "A musical performance before an audience", "A live rock concert.")
                ],
                "practice_questions": [
                    ("Would you like to ________ to the cinema tonight?", "come", "coming", "comes", "None of the above", 0),
                    ("A: Would you like a cup of tea? B: Yes, ________.", "please", "I do", "I like", "None of the above", 0),
                    ("I'd ________ to, but I have to study for my exam.", "love", "like", "loving", "None of the above", 0),
                    ("Are you ________ tomorrow evening? - Yes, I have no plans.", "free", "empty", "open", "None of the above", 0)
                ]
            },
            {
                "sub": "9.4",
                "title": "Unit 9: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_9.02.mp3",
                "grammar": "Comprehensive assessment of present continuous vs simple, clothes vocabulary, and invitations",
                "vocab": "Unit 9 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 9 End of Unit Test."),
                    ("Student", "Ready."),
                    ("Examiner", "Complete all 10 questions.")
                ],
                "vocab_table": [
                    ("Mastery", "noun", "/ˈmɑːstəri/", "Comprehensive command of continuous tense and clothing", "Select the best answer.")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 10,
        "title": "Unit 10: Hotels, Prepositions & Past of Be",
        "description": "Learn there is / there are for places and hotel amenities, prepositions of place (in, on, under, behind), and the past simple of 'be' (was and were).",
        "lessons": [
            {
                "sub": "10.1",
                "title": "10A: A Room with a View",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_10.01.mp3",
                "grammar": "there's a... / there are some...; prepositions: in, on, under, behind, opposite",
                "vocab": "hotels (lift, gym, swimming pool, reception, minibar, Wi-Fi)",
                "dialogue": [
                    ("Guest", "Excuse me, is there a swimming pool in this hotel?"),
                    ("Receptionist", "Yes, there is. There's a heated pool on the roof, and there is a gym on the second floor."),
                    ("Guest", "And are there any restaurants nearby?"),
                    ("Receptionist", "Yes, there are some wonderful Italian restaurants opposite the park.")
                ],
                "vocab_table": [
                    ("There is / There are", "grammar", "/ðeər ɪz/ - /ðeər ɑː/", "Used to indicate the presence or existence of things", "There is a king-sized bed in the room."),
                    ("Swimming pool", "noun", "/ˈswɪmɪŋ puːl/", "An artificial basin filled with water for swimming", "The hotel swimming pool is open until 10 PM."),
                    ("Gym", "noun", "/dʒɪm/", "A hall or room equipped for physical exercise", "Is there a gym in the hotel?"),
                    ("Opposite / Behind", "preposition", "/ˈɒpəzɪt/ - /bɪˈhaɪnd/", "Facing directly across / at the back of", "The pharmacy is opposite the bank.")
                ],
                "practice_questions": [
                    ("________ a comfortable double bed in the bedroom.", "There is", "There are", "It is", "None of the above", 0),
                    ("Are there ________ clean towels in the bathroom?", "any", "some", "a", "None of the above", 0),
                    ("There are ________ pictures on the wall.", "some", "any", "a", "None of the above", 0),
                    ("Is there a lift? - No, there ________.", "isn't", "aren't", "not", "None of the above", 0)
                ]
            },
            {
                "sub": "10.2",
                "title": "10B: Where Was He?",
                "video": "/videos/beginner/ef5e_beg_10b_1_vocabulary.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_10.09.mp3",
                "grammar": "past simple: be (was / were, wasn't / weren't)",
                "vocab": "in, on, at; historical places and past time expressions (yesterday, last night, in 2020)",
                "dialogue": [
                    ("Officer", "Where were you at eight o'clock yesterday evening?"),
                    ("Witness", "I was at home with my family. We were in the kitchen having dinner."),
                    ("Officer", "Was your brother with you?"),
                    ("Witness", "No, he wasn't. He was at work in the restaurant.")
                ],
                "vocab_table": [
                    ("Was / Were", "past verb", "/wɒz/ - /wɜː/", "Past forms of the verb be (I/he/she/it was; we/you/they were)", "Where were you born?"),
                    ("Yesterday", "adverb", "/ˈjɛstədeɪ/", "On the day before today", "I was at the library yesterday."),
                    ("Last night / week", "phrase", "/lɑːst naɪt/", "During the previous night or week", "We were at the theatre last night."),
                    ("At home / at work", "prepositional phrase", "/æt həʊm/", "Indicating specific locations", "She was at work until seven.")
                ],
                "practice_questions": [
                    ("Where ________ you yesterday afternoon?", "were", "was", "are", "None of the above", 0),
                    ("He ________ at work yesterday because he was ill.", "wasn't", "weren't", "isn't", "None of the above", 0),
                    ("Were they happy with the hotel? - Yes, they ________.", "were", "was", "are", "None of the above", 0),
                    ("Shakespeare ________ a famous English writer.", "was", "were", "is", "None of the above", 0)
                ]
            },
            {
                "sub": "10.3",
                "title": "Revise and Check 9 & 10: Can You Understand These People?",
                "video": "/videos/beginner/ef5e_beg_rc_9and10_video.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_10.16_new.mp3",
                "grammar": "Review of present continuous, there is/are, was/were, prepositions of place",
                "vocab": "Clothes, hotel amenities, buildings with a past",
                "dialogue": [
                    ("Interviewer", "Where were you born?"),
                    ("Person 1", "I was born in Manchester, in the north of England."),
                    ("Interviewer", "Were you in Manchester yesterday?"),
                    ("Person 1", "No, I was here in London on business.")
                ],
                "vocab_table": [
                    ("History", "noun", "/ˈhɪstəri/", "The study of past events", "This building has a fascinating history.")
                ],
                "practice_questions": [
                    ("There ________ three chairs in the room.", "are", "is", "was", "None of the above", 0),
                    ("Where ________ your parents born?", "were", "was", "are", "None of the above", 0),
                    ("She was ________ home all day yesterday.", "at", "in", "on", "None of the above", 0),
                    ("Was the weather nice on holiday? - No, it ________.", "wasn't", "weren't", "isn't", "None of the above", 0)
                ]
            },
            {
                "sub": "10.4",
                "title": "Unit 10: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_10.02_new.mp3",
                "grammar": "Comprehensive assessment of there is/are, prepositions of place, and was/were",
                "vocab": "Unit 10 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 10 End of Unit Test."),
                    ("Student", "Ready."),
                    ("Examiner", "Complete all 10 questions.")
                ],
                "vocab_table": [
                    ("Assessment", "noun", "/əˈsɛsmənt/", "Evaluation of hotel vocabulary and past of be", "Good luck!")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 11,
        "title": "Unit 11: Past Events & Giving Directions",
        "description": "Learn past simple regular verbs (-ed) and common irregular verbs (get, go, have, do), talk about past trips, and ask for and give directions in town.",
        "lessons": [
            {
                "sub": "11.1",
                "title": "11A: A New Life in the USA",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_11.01.mp3",
                "grammar": "past simple: regular verbs (-ed endings: /t/, /d/, /ɪd/); did / didn't",
                "vocab": "regular verbs (arrive, live, move, start, study, work, visit, play)",
                "dialogue": [
                    ("Grandmother", "In 1975, my family arrived in New York to start a new life."),
                    ("Grandson", "Did you live in Manhattan?"),
                    ("Grandmother", "No, we lived in Brooklyn. My father worked in a bakery and my mother studied English."),
                    ("Grandson", "Did you like living there?"),
                    ("Grandmother", "Yes, we loved it! It was an exciting time.")
                ],
                "vocab_table": [
                    ("Arrive", "regular verb", "/əˈraɪvd/", "Reach a destination", "The ship arrived in New York on Tuesday."),
                    ("Live", "regular verb", "/lɪvd/", "Make one's home in a particular place", "They lived in a small flat in Brooklyn."),
                    ("Work", "regular verb", "/wɜːkt/", "Perform labor or employment", "He worked in a local factory for twenty years."),
                    ("Pronunciation of -ed", "grammar", "/t/, /d/, or /ɪd/", "Pronounced /ɪd/ only after T and D sounds", "wanted (/ɪd/), worked (/t/), lived (/d/).")
                ],
                "practice_questions": [
                    ("They ________ to Canada five years ago.", "moved", "move", "movd", "None of the above", 0),
                    ("Did you ________ tennis yesterday? - Yes, I did.", "play", "played", "playing", "None of the above", 0),
                    ("We ________ arrive on time because the bus was late.", "didn't", "don't", "weren't", "None of the above", 0),
                    ("She ________ English at university for three years.", "studied", "studyed", "study", "None of the above", 0)
                ]
            },
            {
                "sub": "11.2",
                "title": "11B: How Was Your Day?",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_11.08_new.mp3",
                "grammar": "past simple irregular verbs: get, go, have, do (got, went, had, did)",
                "vocab": "verb phrases with get, go, have, do (get up, go out, have lunch, do homework)",
                "dialogue": [
                    ("Alex", "Hi Clara! How was your day?"),
                    ("Clara", "It was busy. I got up at seven, had breakfast, and went to the office."),
                    ("Alex", "Did you have lunch with colleagues?"),
                    ("Clara", "Yes, we had lunch at that new Italian place. What did you do?"),
                    ("Alex", "I did my chores and went to the gym.")
                ],
                "vocab_table": [
                    ("Go -> Went", "irregular verb", "/wɛnt/", "Past tense of go", "Yesterday we went to the beach."),
                    ("Have -> Had", "irregular verb", "/hæd/", "Past tense of have", "I had a wonderful conversation with her."),
                    ("Get -> Got", "irregular verb", "/ɡɒt/", "Past tense of get", "She got home late last night."),
                    ("Do -> Did", "irregular verb", "/dɪd/", "Past tense of do", "What did you do on Saturday?")
                ],
                "practice_questions": [
                    ("Yesterday I ________ to the supermarket and bought milk.", "went", "go", "gone", "None of the above", 0),
                    ("We ________ pizza for dinner last night.", "had", "have", "haved", "None of the above", 0),
                    ("What time did you ________ up this morning?", "get", "got", "getting", "None of the above", 0),
                    ("What ________ you do last weekend? - I went camping.", "did", "do", "done", "None of the above", 0)
                ]
            },
            {
                "sub": "11.3",
                "title": "Practical English 6: Is There a Bank Near Here?",
                "video": "/videos/beginner/ef5e_beg_pe6_1.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_11.15_new.mp3",
                "grammar": "Asking for and giving directions; polite intonation",
                "vocab": "prepositions of place (turn left, turn right, go straight on, on the corner, opposite)",
                "dialogue": [
                    ("Tourist", "Excuse me. Is there a bank near here?"),
                    ("Local", "Yes, there is. Go straight on and turn left at the traffic lights."),
                    ("Tourist", "Turn left at the lights?"),
                    ("Local", "That's right. The bank is on your right, next to the post office."),
                    ("Tourist", "Thank you very much!"),
                    ("Local", "You're welcome.")
                ],
                "vocab_table": [
                    ("Turn left / right", "direction phrase", "/tɜːn lɛft/ - /raɪt/", "Change course towards the left or right side", "Turn right at the bookstore."),
                    ("Go straight on", "direction phrase", "/ɡəʊ streɪt ɒn/", "Continue forward without turning", "Go straight on for two blocks."),
                    ("Traffic lights", "noun", "/ˈtræfɪk laɪts/", "Signals controlling road traffic", "Stop at the red traffic light."),
                    ("Near here", "phrase", "/nɪə hɪə/", "In this immediate vicinity", "Is there a good café near here?")
                ],
                "practice_questions": [
                    ("Excuse me, ________ a chemist near here?", "is there", "are there", "there is", "None of the above", 0),
                    ("Go straight ________ and turn right at the museum.", "on", "in", "to", "None of the above", 0),
                    ("The post office is ________ your left.", "on", "in", "at", "None of the above", 0),
                    ("Turn ________ at the corner, opposite the station.", "right", "straight", "into", "None of the above", 0)
                ]
            },
            {
                "sub": "11.4",
                "title": "Unit 11: Comprehensive End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_11.02_new.mp3",
                "grammar": "Comprehensive assessment of past simple regular and irregular verbs and directions",
                "vocab": "Unit 11 official vocabulary mastery",
                "dialogue": [
                    ("Examiner", "This is your Unit 11 End of Unit Test."),
                    ("Student", "Ready."),
                    ("Examiner", "Complete all 10 questions.")
                ],
                "vocab_table": [
                    ("Evaluation", "noun", "/ɪˌvæljuˈeɪʃən/", "Assessment of past tense and direction skills", "Check every answer.")
                ],
                "practice_questions": []
            }
        ]
    },
    {
        "unit": 12,
        "title": "Unit 12: Stories, Past Revision & Final Assessment",
        "description": "Consolidate your mastery of past simple storytelling with regular and irregular verbs, revise core course structures, and complete your final A1 certification exam.",
        "lessons": [
            {
                "sub": "12.1",
                "title": "12A: Strangers on a Train",
                "video": "/videos/beginner/ef5e_beg_12a_1_listening.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_12.01.mp3",
                "grammar": "past simple regular and irregular verbs storytelling sequence",
                "vocab": "storytelling words (saw, met, spoke, told, thought, suddenly)",
                "dialogue": [
                    ("Narrator", "It was a rainy Tuesday afternoon. Bernard sat in the train compartment reading a book."),
                    ("Woman", "Excuse me, is this seat free?"),
                    ("Narrator", "He looked up and saw a mysterious woman wearing an elegant black coat. He smiled and said: 'Yes, please sit down.' That conversation changed his life.")
                ],
                "vocab_table": [
                    ("See -> Saw", "irregular verb", "/sɔː/", "Past of see; perceived with eyes", "I saw an old friend at the train station."),
                    ("Meet -> Met", "irregular verb", "/mɛt/", "Past of meet; encountered for the first time", "They met on a train to Paris."),
                    ("Tell -> Told", "irregular verb", "/təʊld/", "Past of tell; recounted a story or information", "She told him the truth."),
                    ("Suddenly", "adverb", "/ˈsʌdənli/", "Quickly and unexpectedly", "Suddenly the train stopped in the tunnel.")
                ],
                "practice_questions": [
                    ("We ________ an exciting movie yesterday evening.", "saw", "see", "seed", "None of the above", 0),
                    ("She ________ her keys on the dining table.", "left", "leave", "leaved", "None of the above", 0),
                    ("He ________ me his phone number on a piece of paper.", "gave", "give", "gived", "None of the above", 0),
                    ("Did you ________ anyone at the party? - Yes, I met Carlos.", "meet", "met", "meeting", "None of the above", 0)
                ]
            },
            {
                "sub": "12.2",
                "title": "12B: Revise the Past",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_12.05_new.mp3",
                "grammar": "revision of all past simple forms: affirmative, negative, interrogative, regular and irregular",
                "vocab": "revision of past time expressions and high-frequency verbs",
                "dialogue": [
                    ("Teacher", "Let's review the past simple rules."),
                    ("Student", "For regular verbs we add -ed, like 'worked' and 'started'."),
                    ("Teacher", "Excellent! And for questions and negatives?"),
                    ("Student", "We use 'did' or 'didn't' with the infinitive: 'Did you go?' and 'I didn't see.'")
                ],
                "vocab_table": [
                    ("Revision", "noun", "/rɪˈvɪʒən/", "Reviewing previously learned material", "Do a thorough revision before the final exam."),
                    ("Infinitive", "grammar", "Base form of verb (go, see, have)", "Always use the infinitive after did or didn't", "Did you have lunch?")
                ],
                "practice_questions": [
                    ("Where ________ you spend your last vacation?", "did", "do", "were", "None of the above", 0),
                    ("I ________ go to the party because I was exhausted.", "didn't", "wasn't", "don't", "None of the above", 0),
                    ("They ________ to New York last summer.", "flew", "fly", "flyed", "None of the above", 0),
                    ("Did she ________ the letter? - Yes, she wrote it yesterday.", "write", "wrote", "writing", "None of the above", 0)
                ]
            },
            {
                "sub": "12.3",
                "title": "Revise and Check 11 & 12: Can You Understand These People?",
                "video": "/videos/beginner/ef5e_beg_rc_11and12_video.mp4",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_12.09_NEW_2.mp3",
                "grammar": "Comprehensive course review of past events, travel experiences, daily life",
                "vocab": "Vocabulary review across all 12 units",
                "dialogue": [
                    ("Interviewer", "What was the most memorable trip you took this year?"),
                    ("Person 1", "I went to Italy in July. I visited Rome and Florence, ate incredible pasta, and practiced speaking Italian!"),
                    ("Interviewer", "How did you travel?"),
                    ("Person 1", "We travelled by train across the entire country.")
                ],
                "vocab_table": [
                    ("Memorable", "adjective", "/ˈmɛmərəbl/", "Worth remembering; easily remembered", "It was a truly memorable journey.")
                ],
                "practice_questions": [
                    ("Did you ________ a good weekend? - Yes, it was fantastic.", "have", "had", "having", "None of the above", 0),
                    ("We ________ delicious seafood in Portugal.", "ate", "eat", "eated", "None of the above", 0),
                    ("She ________ born in Toronto.", "was", "were", "is", "None of the above", 0),
                    ("Turn left ________ the crossroads.", "at", "in", "on", "None of the above", 0)
                ]
            },
            {
                "sub": "12.4",
                "title": "Unit 12: Comprehensive Final End of Unit Test",
                "video": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_12.02.mp3",
                "grammar": "Final comprehensive assessment covering the entire Beginner (A1) curriculum",
                "vocab": "Complete A1 vocabulary mastery",
                "dialogue": [
                    ("Lead Examiner", "Congratulations on reaching the final assessment of the English Beginner Course."),
                    ("Student", "Thank you. I have completed all 12 units and practiced all exercises."),
                    ("Lead Examiner", "Begin your final comprehensive test. Score 80% or higher to complete your course certification.")
                ],
                "vocab_table": [
                    ("Certification", "noun", "/ˌsɜːtɪfɪˈkeɪʃən/", "Official document certifying achievement of A1 English proficiency", "You have completed English File Beginner!")
                ],
                "practice_questions": []
            }
        ]
    }
]

def render_markdown(lesson, unit_num):
    sub = lesson["sub"]
    is_test = sub.endswith(".4")
    
    if is_test:
        return f"""### 🎯 Can-Do Objective
Demonstrate comprehensive mastery of Unit {unit_num} language structures: grammar accuracy, vocabulary recall, and functional speaking expressions.

---

### 📝 End of Unit Assessment Instructions
- This test contains **10 official assessment questions** from Oxford University Press English File Beginner.
- Read each prompt and choose the single best option (A, B, or C).
- A passing score of **80% (8/10)** certifies your completion of Unit {unit_num}.
- After finishing, review any incorrect answers and re-listen to the unit audio drills if needed.

---

### 🎧 Unit Audio Review
<audio controls src="{lesson['audio']}"></audio>

---

### 📖 Summary of Assessed Language Points
- **Grammar Focus:** {lesson['grammar']}
- **Key Vocabulary:** {lesson['vocab']}

---

### 💡 Test-Taking Strategy
> *"Take your time to read the whole sentence before deciding. Check whether the subject is singular (he/she/it) or plural (we/they), and pay close attention to time words like 'yesterday', 'every day', or 'now'."*
"""

    dialogue_md = "\n".join([f'- **{speaker}:** *"{text}"*' for speaker, text in lesson["dialogue"]])
    
    vocab_rows = "\n".join([
        f"| **{w}** | {pos} | `{ipa}` | {meaning} | *\"{ex}\"* |"
        for w, pos, ipa, meaning, ex in lesson["vocab_table"]
    ])
    
    return f"""### 🎯 Can-Do Objective
Can understand, pronounce, and confidently use **{lesson['grammar']}** and essential vocabulary for **{lesson['vocab']}**.

---

### 🎧 Audio Listening & Pronunciation Practice
<audio controls src="{lesson['audio']}"></audio>

#### 📜 Audio Transcript & Dialogue
{dialogue_md}

---

### 📚 Core Vocabulary Essentials
| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |
| :--- | :--- | :--- | :--- | :--- |
{vocab_rows}

---

### 💡 Grammar In Depth: {lesson['grammar']}
Understanding sentence structure is key to speaking accurately. Review the rules and practice with the audio above.

> *"Always pay attention to word order and listen to native sentence rhythm to sound more natural."*

---

### 🗣️ Speaking & Conversation Practice
- **Roleplay Practice:** Use the Speaking Practice Studio below to read both parts of the dialogue aloud.
- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat clearly.

---

### 🌟 Key Expressions to Memorize
- Practice introducing the topic in conversation.
- Use full sentences when answering questions.
- Focus on clear vowel sounds and correct stress.
"""

def generate_file():
    out = []
    out.append('import "dotenv/config";')
    out.append("import { PrismaClient } from '@prisma/client';")
    out.append("import { Pool } from 'pg';")
    out.append("import { PrismaPg } from '@prisma/adapter-pg';")
    out.append("")
    out.append("const connectionString = `${process.env.DIRECT_URL || process.env.DATABASE_URL}`;")
    out.append("const pool = new Pool({")
    out.append("  connectionString,")
    out.append("  ssl: { rejectUnauthorized: false }")
    out.append("});")
    out.append("const adapter = new PrismaPg(pool);")
    out.append("const prisma = new PrismaClient({ adapter });")
    out.append("")
    out.append("async function main() {")
    out.append("  console.log('Seeding Comprehensive English Beginner Course: Vocabulary Essentials (A1)...');")
    out.append("")
    out.append("  let instructor = await prisma.user.findFirst({")
    out.append("    where: {")
    out.append("      OR: [")
    out.append("        { email: 'dominic.nantchoua@gmail.com' },")
    out.append("        { email: 'sarah@example.com' },")
    out.append("        { role: 'INSTRUCTOR' },")
    out.append("        { role: 'ADMIN' },")
    out.append("      ]")
    out.append("    }")
    out.append("  });")
    out.append("")
    out.append("  if (!instructor) {")
    out.append("    instructor = await prisma.user.create({")
    out.append("      data: {")
    out.append("        name: 'Nantchoua',")
    out.append("        email: 'dominic.nantchoua@gmail.com',")
    out.append("        role: 'ADMIN',")
    out.append("      }")
    out.append("    });")
    out.append("  }")
    out.append("")
    out.append("  // Clean up existing course cleanly")
    out.append("  const oldCourse = await prisma.course.findFirst({")
    out.append("    where: {")
    out.append("      OR: [")
    out.append("        { slug: 'connect-with-english-a1-a2' },")
    out.append("        { slug: 'english-beginner-course' },")
    out.append("      ]")
    out.append("    }")
    out.append("  });")
    out.append("")
    out.append("  if (oldCourse) {")
    out.append("    console.log(`Cleaning up old course: ${oldCourse.title} (${oldCourse.id})`);")
    out.append("    const modules = await prisma.module.findMany({")
    out.append("      where: { courseId: oldCourse.id },")
    out.append("      include: { lessons: { include: { quiz: true } } },")
    out.append("    });")
    out.append("    for (const mod of modules) {")
    out.append("      for (const les of mod.lessons) {")
    out.append("        if (les.quiz) {")
    out.append("          await prisma.quizAttempt.deleteMany({ where: { quizId: les.quiz.id } });")
    out.append("          await prisma.quizQuestion.deleteMany({ where: { quizId: les.quiz.id } });")
    out.append("          await prisma.quiz.delete({ where: { id: les.quiz.id } });")
    out.append("        }")
    out.append("        await prisma.progress.deleteMany({ where: { lessonId: les.id } });")
    out.append("        await prisma.comment.deleteMany({ where: { lessonId: les.id } });")
    out.append("      }")
    out.append("    }")
    out.append("    await prisma.module.deleteMany({ where: { courseId: oldCourse.id } });")
    out.append("    await prisma.course.delete({ where: { id: oldCourse.id } });")
    out.append("  }")
    out.append("")
    out.append("  console.log('Creating course modules and lessons with authentic video, audio, and Oxford tests...');")
    out.append("")
    out.append("  const course = await prisma.course.create({")
    out.append("    data: {")
    out.append("      title: 'English Beginner Course: Vocabulary Essentials (A1)',")
    out.append("      slug: 'english-beginner-course',")
    out.append("      description: 'A compact, exercise-based vocabulary and speaking course for beginner and elementary learners. Features authentic Oxford English File video dialogues, native audio listening tracks, pronunciation drills, and comprehensive end-of-unit tests.',")
    out.append("      level: 'A1',")
    out.append("      isPublished: true,")
    out.append("      price: 20.00,")
    out.append("      instructorId: instructor.id,")
    out.append("      modules: {")
    out.append("        create: [")
    
    for mod in modules_data:
        u_num = mod["unit"]
        out.append("          {")
        out.append(f"            title: {json.dumps(mod['title'])},")
        out.append(f"            order: {u_num},")
        out.append("            lessons: {")
        out.append("              create: [")
        
        for l_idx, les in enumerate(mod["lessons"]):
            l_order = l_idx + 1
            is_free = (u_num == 1 and l_order == 1)
            video_url = f"'{les['video']}'" if les["video"] else "null"
            md_content = render_markdown(les, u_num)
            
            # Determine questions: if test lesson, use quick_tests[u_num]; else use practice_questions
            if les["sub"].endswith(".4"):
                q_list = quick_tests[u_num]
            else:
                q_list = [
                    {
                        "question": q[0],
                        "optionA": q[1],
                        "optionB": q[2],
                        "optionC": q[3],
                        "optionD": q[4],
                        "correctOption": q[5]
                    }
                    for q in les["practice_questions"]
                ]
            
            out.append("                {")
            out.append(f"                  title: {json.dumps(les['title'])},")
            out.append(f"                  order: {l_order},")
            out.append("                  isPublished: true,")
            out.append(f"                  isFree: {'true' if is_free else 'false'},")
            out.append(f"                  videoUrl: {video_url},")
            out.append(f"                  content: {json.dumps(md_content)},")
            
            if q_list:
                out.append("                  quiz: {")
                out.append("                    create: {")
                out.append("                      questions: {")
                out.append("                        create: [")
                for q_idx, q in enumerate(q_list):
                    out.append("                          {")
                    out.append(f"                            question: {json.dumps(q['question'])},")
                    out.append(f"                            optionA: {json.dumps(q['optionA'])},")
                    out.append(f"                            optionB: {json.dumps(q['optionB'])},")
                    out.append(f"                            optionC: {json.dumps(q['optionC'])},")
                    out.append(f"                            optionD: {json.dumps(q['optionD'])},")
                    out.append(f"                            correctOption: {q['correctOption']},")
                    out.append(f"                            order: {q_idx + 1},")
                    out.append("                          },")
                out.append("                        ]")
                out.append("                      }")
                out.append("                    }")
                out.append("                  }")
            
            out.append("                },")
            
        out.append("              ]")
        out.append("            }")
        out.append("          },")
        
    out.append("        ]")
    out.append("      }")
    out.append("    }")
    out.append("  });")
    out.append("")
    out.append("  console.log(`Successfully seeded course: ${course.title} (${course.id})`);")
    out.append("}")
    out.append("")
    out.append("main()")
    out.append("  .catch((e) => {")
    out.append("    console.error(e);")
    out.append("    process.exit(1);")
    out.append("  })")
    out.append("  .finally(async () => {")
    out.append("    await prisma.$disconnect();")
    out.append("    await pool.end();")
    out.append("  });")
    out.append("")
    
    return "\n".join(out)

if __name__ == "__main__":
    code = generate_file()
    out_path = r"C:\Users\Dominic Nantchoua\english-learning-platform\prisma\seed-beginner-course.ts"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Generated {out_path} ({len(code)} bytes).")
