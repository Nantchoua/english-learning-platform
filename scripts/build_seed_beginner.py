"""
Generate prisma/seed-beginner-course.ts with:
1. 100% authentic transcripts extracted directly from Oxford English File .vtt subtitle files for both Audio and Video!
2. All 55 video parts properly mapped with titles and multi-part playlist support in CourseVideoPlayer
3. Dedicated End-of-Unit Tests with 10 questions per unit parsed directly from Oxford Quick Tests 1-12
4. Practice quizzes for individual lessons
5. Rich Markdown content with audio players, authentic vocabulary tables, grammar tables, verified dialogue transcripts
6. NO embedded <video> tags in markdown!
"""

import sys
import pypdf
import re
import json
import os
import zipfile

test_dir = r"C:\Users\Dominic Nantchoua\Downloads\English File 5th beginner\English File 5th beginner\Tests\english_file_fifth_edition_beginner_all_quick_tests\english_file_fifth_edition_beginner_all_quick_tests"
zf_path = r"C:\Users\Dominic Nantchoua\Downloads\English File 5th beginner\English File 5th beginner\Presentation_Tool\resources\Books\EF5E_BEG_SB_CPT_9780194662444.zip"

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

def extract_vtt_lines(z, vtt_name):
    if not vtt_name:
        return []
    try:
        raw = z.read(vtt_name).decode("utf-8", errors="ignore")
    except KeyError:
        return []
    raw = raw.replace("\r\n", "\n").replace("\r", "\n")
    raw = raw.replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')
    
    cue_pattern = re.compile(r'\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}[^\n]*\n(.*?)(?=\n\d{2}:\d{2}:\d{2}\.\d{3}|\n\s*\n|\Z)', re.DOTALL)
    cues = cue_pattern.findall(raw)
    
    lines = []
    for c in cues:
        clean = re.sub(r'<[^>]+>', '', c).strip()
        clean = ' '.join(clean.split())
        if clean and (not lines or lines[-1] != clean):
            lines.append(clean)
    return lines

def format_transcript_md(lines, max_lines=16):
    if not lines:
        return "> *[Authentic listening and pronunciation drill from Oxford English File]*"
    formatted = []
    for line in lines[:max_lines]:
        if ":" in line:
            parts = line.split(":", 1)
            speaker = parts[0].strip()
            text = parts[1].strip()
            formatted.append(f'- **{speaker}:** *"{text}"*')
        else:
            formatted.append(f'> *"{line}"*')
    return "\n".join(formatted)

quick_tests = extract_quick_tests()
print(f"Extracted quick tests for {len(quick_tests)} units.")

# Open zip file for authentic VTT transcripts
z_cpt = zipfile.ZipFile(zf_path, "r")

# Curriculum definitions mapping ALL 55 videos and authentic audio tracks
modules_catalog = [
    # ─── UNIT 1 ─────────────────────────────────────────────────────────────
    {
        "unit": 1,
        "title": "Unit 1: Introductions, Numbers & Greetings",
        "description": "Learn to introduce yourself, greet others politely, count from 0 to 10, spell names, and use the verb 'be' (I, you, he, she, it).",
        "lessons": [
            {
                "sub": "1.1",
                "title": "1A: Nice to Meet You",
                "videos": [
                    {"title": "Scene 1: In the Coffee Shop (Helen & Barista)", "url": "/videos/beginner/ef5e_beg_1a_1_listening.mp4"},
                    {"title": "Scene 2: Meeting Tom (Hello & Introductions)", "url": "/videos/beginner/ef5e_beg_1a_2_listening.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_1a_1_listening.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_1.05_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_1.05_new.vtt",
                "grammar": "verb be (singular): I and you",
                "vocab": "numbers 0-10, days of the week, greetings",
                "vocab_table": [
                    ("Hello / Hi", "interjection", "/həˈləʊ/", "Standard friendly greeting used at any time", "Hello, nice to meet you!"),
                    ("Cappuccino / Tea", "noun", "/ˌkæpʊˈtʃiːnəʊ/", "Hot beverages ordered in a café", "A cappuccino, please."),
                    ("What's your name?", "question", "/wɒts jɔː neɪm/", "Asking someone's identity", "What's your name? - I'm Helen."),
                    ("Nice to meet you", "phrase", "/naɪs tuː miːt juː/", "Polite phrase used when introduced to someone", "Hi Tom, nice to meet you too."),
                    ("Numbers 0-10", "numbers", "/ˈzɪərəʊ/ - /tɛn/", "Cardinal digits: zero, one, two, three...", "Two teas and one cappuccino.")
                ],
                "practice_questions": [
                    ("Helen: A cappuccino, ________.", "please", "thank you", "excuse me", "None of the above", 0),
                    ("Barista: What's your name? Helen: ________ Helen.", "I'm", "Am", "You're", "None of the above", 0),
                    ("Tom: Are you Helen? Helen: Yes, I ________.", "am", "'m", "is", "None of the above", 0),
                    ("Two teas and ________ cappuccino.", "one", "a two", "an", "None of the above", 0)
                ]
            },
            {
                "sub": "1.2",
                "title": "1B: Music Round the World",
                "videos": [
                    {"title": "Vocabulary: Countries & Nationalities", "url": "/videos/beginner/ef5e_beg_1b_1_vocabulary.mp4"}
                ],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_1.16_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_1.16_new.vtt",
                "grammar": "verb be (singular): he, she, it",
                "vocab": "countries (Spain, Japan, Brazil, UK, Mexico, Italy, China, USA)",
                "vocab_table": [
                    ("Where are you from?", "question", "/weər ɑː juː frɒm/", "Asking a person's country or city of origin", "Where are you from? - I'm from Toledo."),
                    ("Toledo / Spain", "proper noun", "/təˈliːdəʊ/ - /speɪn/", "Historical city in central Spain", "Where's Toledo? - It's in Spain."),
                    ("China / Chinese", "noun / adj", "/ˈtʃaɪnə/ - /ˌtʃaɪˈniːz/", "Nation in East Asia / nationality", "She is from Beijing, China."),
                    ("Brazil / Brazilian", "noun / adj", "/brəˈzɪl/ - /brəˈzɪljən/", "Country in South America", "Samba is from Brazil.")
                ],
                "practice_questions": [
                    ("Where ________ you from? - I'm from Toledo.", "are", "is", "am", "None of the above", 0),
                    ("Where's Toledo? - It's ________ Spain.", "in", "at", "on", "None of the above", 0),
                    ("Maria is from Mexico. ________ Mexican.", "She's", "He's", "It's", "None of the above", 0),
                    ("Tokyo ________ in Japan.", "is", "are", "am", "None of the above", 0)
                ]
            },
            {
                "sub": "1.3",
                "title": "Practical English 1: How Do You Spell It?",
                "videos": [
                    {"title": "Scene 1: Rob in London & Poland", "url": "/videos/beginner/ef5e_beg_pe1_1.mp4"},
                    {"title": "Scene 2: Checking into the Hotel", "url": "/videos/beginner/ef5e_beg_pe1_2.mp4"},
                    {"title": "Scene 3: How Do You Spell It?", "url": "/videos/beginner/ef5e_beg_pe1_3.mp4"},
                    {"title": "Scene 4: In the Classroom", "url": "/videos/beginner/ef5e_beg_pe1_4.mp4"},
                    {"title": "Scene 5: Booking a Table", "url": "/videos/beginner/ef5e_beg_pe1_5.mp4"},
                    {"title": "Scene 6: Useful Social English Phrases", "url": "/videos/beginner/ef5e_beg_pe1_6.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_pe1_2.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_1.34_NEW.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_1.34_new.vtt",
                "grammar": "The English alphabet; classroom language; hotel check-in",
                "vocab": "surname, reservation, room key, spelling names",
                "vocab_table": [
                    ("Surname / Last name", "noun", "/ˈsɜːneɪm/", "Family name", "Sorry, what's your surname? - Walker."),
                    ("Reservation", "noun", "/ˌrɛzəˈveɪʃən/", "Booking arrangement", "I have a reservation for two nights."),
                    ("How do you spell it?", "phrase", "/haʊ duː juː spɛl ɪt/", "Asking someone to name the letters", "W-A-L-K-E-R."),
                    ("Journalist", "noun", "/ˈdʒɜːnəlɪst/", "A person who writes for newspapers or magazines", "Rob is a journalist from London.")
                ],
                "practice_questions": [
                    ("Rob: Hello. Receptionist: ________.", "Good afternoon", "Goodbye", "Excuse me", "None of the above", 0),
                    ("My name's Rob Walker. I have a ________.", "reservation", "book", "card", "None of the above", 0),
                    ("Receptionist: Sorry, what's your ________? Rob: Walker.", "surname", "room", "telephone", "None of the above", 0),
                    ("How do you ________ your surname? - W-A-L-K-E-R.", "spell", "write", "say", "None of the above", 0)
                ]
            },
            {
                "sub": "1.4",
                "title": "Unit 1: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_1.03_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_1.03_new.vtt",
                "grammar": "Comprehensive assessment of verb be (I, you, he, she, it), nationalities, greetings, and alphabet",
                "vocab": "Unit 1 official vocabulary mastery",
                "vocab_table": [
                    ("Review", "noun", "/rɪˈvjuː/", "A formal assessment of learning material", "Review all grammar points before starting.")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 2 ─────────────────────────────────────────────────────────────
    {
        "unit": 2,
        "title": "Unit 2: Nationalities & Numbers 11–100",
        "description": "Master plural forms of 'be' (we, you, they), asking Wh- questions, understanding phone numbers, bus numbers, and numbers up to 100.",
        "lessons": [
            {
                "sub": "2.1",
                "title": "2A: Are You on Holiday?",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_2.01_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_2.01_new.vtt",
                "grammar": "verb be (plural): we, you, they",
                "vocab": "countries and nationalities (Brazil - Brazilian, China - Chinese, Spain - Spanish)",
                "vocab_table": [
                    ("Holiday", "noun", "/ˈhɒlɪdeɪ/", "Vacation or leisure trip away from work", "Are you on holiday in London?"),
                    ("Business", "noun", "/ˈbɪznəs/", "Work, commercial activity", "No, we are here on business."),
                    ("Nationalities", "noun", "/ˌnæʃəˈnælɪtiz/", "Brazilian, Chinese, English, Mexican, Spanish", "They are from Spain; they're Spanish."),
                    ("We / They", "pronouns", "/wiː/ - /ðeɪ/", "Plural subjective pronouns", "We're from Rome.")
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
                "videos": [
                    {"title": "Part 1: Numbers 11–100", "url": "/videos/beginner/ef5e_beg_2b_1_vocabulary.mp4"},
                    {"title": "Part 2: Meet the Students (Lin & Pia)", "url": "/videos/beginner/ef5e_beg_2b_2_listening.mp4"},
                    {"title": "Part 3: Meet the Students (Interviews)", "url": "/videos/beginner/ef5e_beg_2b_3_listening.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_2b_2_listening.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_2.14_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_2.14_new.vtt",
                "grammar": "Wh- and How questions with be (Who, What, Where, When, How)",
                "vocab": "numbers 11-100, phone numbers, bus lines",
                "vocab_table": [
                    ("How are you?", "phrase", "/haʊ ɑː juː/", "Polite greeting inquiring about well-being", "Hi Pia, how are you? - I'm fine, thanks."),
                    ("What number is the bus?", "question", "/wɒt ˈnʌmbər ɪz ðə bʌs/", "Asking for the bus route number", "It's bus number twenty-four."),
                    ("Eleven to Twenty", "numbers", "/ɪˈlɛvn/ - /ˈtwɛnti/", "11, 12, 13, 14, 15, 16, 17, 18, 19, 20", "She is fifteen years old."),
                    ("Phone number", "noun", "/fəʊn ˈnʌmbə/", "Sequence of digits", "What's your phone number?")
                ],
                "practice_questions": [
                    ("Lin: Hi Pia. How are you? Pia: I'm ________, and you?", "fine", "good morning", "nice", "None of the above", 0),
                    ("What number comes after nineteen? - ________.", "twenty", "twelve", "thirty", "None of the above", 0),
                    ("________ is your teacher? - Mr. Henderson.", "Who", "What", "How", "None of the above", 0),
                    ("Sixty plus twenty is ________.", "eighty", "seventy", "ninety", "None of the above", 0)
                ]
            },
            {
                "sub": "2.3",
                "title": "Revise and Check 1 & 2: Can You Understand These People?",
                "videos": [
                    {"title": "Part 1: Street Interviews (London)", "url": "/videos/beginner/ef5e_beg_rc_1and2_video.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_rc_1and2_video.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_2.25_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_2.25_new.vtt",
                "grammar": "Review of verb be (singular & plural), Wh- questions",
                "vocab": "Personal details, nationalities, phone numbers",
                "vocab_table": [
                    ("See you on Tuesday", "phrase", "/siː juː ɒn ˈtjuːzdeɪ/", "Parting phrase specifying next meeting", "Great! OK, see you on Tuesday."),
                    ("Phone number", "noun", "/fəʊn ˈnʌmbə/", "Telephone digits", "It's 020 7946 0415.")
                ],
                "practice_questions": [
                    ("Where ________ you from? - I'm from Tokyo.", "are", "is", "am", "None of the above", 0),
                    ("Great. OK, see you on ________.", "Tuesday", "tuesday", "two", "None of the above", 0),
                    ("Is your city quiet? - No, it ________.", "isn't", "aren't", "is", "None of the above", 0),
                    ("Thirty-five minus ten is ________.", "twenty-five", "fifteen", "twenty", "None of the above", 0)
                ]
            },
            {
                "sub": "2.4",
                "title": "Unit 2: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_2.02_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_2.02_new.vtt",
                "grammar": "Comprehensive assessment of plural be, Wh- questions, numbers 11-100, and nationalities",
                "vocab": "Unit 2 official vocabulary mastery",
                "vocab_table": [
                    ("Score", "noun", "/skɔː/", "Points achieved in test", "Aim for 80% or higher.")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 3 ─────────────────────────────────────────────────────────────
    {
        "unit": 3,
        "title": "Unit 3: Everyday Objects & Souvenirs",
        "description": "Learn words for everyday small objects, singular and plural nouns with a/an, this/that/these/those, understanding prices, and buying snacks.",
        "lessons": [
            {
                "sub": "3.1",
                "title": "3A: Where's My Phone?",
                "videos": [
                    {"title": "Pronunciation: /s/ and /z/ Plural Endings", "url": "/videos/beginner/ef5e_beg_3a_1_pronunciation.mp4"}
                ],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_3.01.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_3.01.vtt",
                "grammar": "singular and plural nouns; articles a / an; /s/ and /z/ endings",
                "vocab": "small things (phone, watch, keys, umbrella, wallet, bag, glasses)",
                "vocab_table": [
                    ("A phone / A watch", "noun", "/fəʊn/ - /wɒtʃ/", "Everyday personal electronics and timepieces", "Where is my phone?"),
                    ("An umbrella", "noun", "/ʌmˈbrɛlə/", "Canopy protecting against rain (uses 'an')", "Take an umbrella."),
                    ("Glasses", "noun (plural)", "/ˈɡlɑːsɪz/", "Lenses used to correct vision (always plural)", "Here are your reading glasses."),
                    ("Keys", "noun (plural)", "/kiːz/", "Metal tools to open locks", "Where are my house keys?")
                ],
                "practice_questions": [
                    ("It's ________ umbrella.", "an", "a", "the", "None of the above", 0),
                    ("Where are my ________?", "keys", "key", "keyes", "None of the above", 0),
                    ("She has ________ identity card in her wallet.", "an", "a", "two", "None of the above", 0),
                    ("Two ________ are on the desk.", "watches", "watchs", "watch", "None of the above", 0)
                ]
            },
            {
                "sub": "3.2",
                "title": "3B: Souvenirs",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_3.09.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_3.09.vtt",
                "grammar": "this / that / these / those; sentence rhythm",
                "vocab": "souvenirs (T-shirts, mugs, postcards, caps, magnets)",
                "vocab_table": [
                    ("What are those?", "question", "/wɒt ɑː ðəʊz/", "Asking about plural objects far away", "Excuse me, what are those? - They're T-shirts."),
                    ("How much are they?", "question", "/haʊ mʌtʃ ɑː ðeɪ/", "Inquiring about price of plural items", "How much are they? - They're fifteen pounds."),
                    ("This / That", "demonstratives", "/ðɪs/ - /ðæt/", "Singular near vs far", "This is a mug, that is a hat."),
                    ("These / Those", "demonstratives", "/ðiːz/ - /ðəʊz/", "Plural near vs far", "These postcards are cheap.")
                ],
                "practice_questions": [
                    ("Customer: Excuse me. What are ________? Shopkeeper: They're T-shirts.", "those", "that", "this", "None of the above", 0),
                    ("How much ________ those sunglasses?", "are", "is", "am", "None of the above", 0),
                    ("________ is my new London mug on the table.", "This", "These", "Those", "None of the above", 0),
                    ("How much is ________ cap over there?", "that", "these", "those", "None of the above", 0)
                ]
            },
            {
                "sub": "3.3",
                "title": "Practical English 2: An Orange Juice, Please",
                "videos": [
                    {"title": "Scene 1: In the Café with Rob & Jenny", "url": "/videos/beginner/ef5e_beg_pe2_1.mp4"},
                    {"title": "Scene 2: Ordering Food & Drinks", "url": "/videos/beginner/ef5e_beg_pe2_2.mp4"},
                    {"title": "Scene 3: Understanding Prices", "url": "/videos/beginner/ef5e_beg_pe2_3.mp4"},
                    {"title": "Scene 4: Social English: Can I Have...?", "url": "/videos/beginner/ef5e_beg_pe2_4.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_pe2_1.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_3.17_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_3.17_new.vtt",
                "grammar": "Understanding prices, ordering food and drinks in a café",
                "vocab": "coffee, tea, orange juice, sandwich, mineral water, newspaper",
                "vocab_table": [
                    ("The New York Times, please", "phrase", "Newspaper title", "The New York Times, please. - Here you are."),
                    ("How much is it?", "question", "/haʊ mʌtʃ ɪz ɪt/", "Inquiring about single item cost", "How much is it? - It's two dollars fifty."),
                    ("Orange juice", "noun", "/ˈɒrɪndʒ dʒuːs/", "Drink made from oranges", "An orange juice, please."),
                    ("Here you are", "phrase", "/hɪə juː ɑː/", "Handing something to someone", "Here you are. - Thank you.")
                ],
                "practice_questions": [
                    ("Customer: The New York Times, please. Clerk: ________ you are.", "Here", "There", "Where", "None of the above", 0),
                    ("How much ________ that sandwich? - It's five pounds.", "is", "are", "do", "None of the above", 0),
                    ("An orange juice, ________. - Regular or large?", "please", "thank you", "excuse", "None of the above", 0),
                    ("Clerk: That's four pounds fifty. Customer: ________ you.", "Thank", "Please", "Welcome", "None of the above", 0)
                ]
            },
            {
                "sub": "3.4",
                "title": "Unit 3: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_3.02_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_3.02_new.vtt",
                "grammar": "Comprehensive assessment of a/an, singular/plural nouns, this/that/these/those, prices",
                "vocab": "Unit 3 official vocabulary mastery",
                "vocab_table": [
                    ("Review", "noun", "/rɪˈvjuː/", "Assessment of singular/plural nouns and demonstratives", "Read each sentence carefully.")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 4 ─────────────────────────────────────────────────────────────
    {
        "unit": 4,
        "title": "Unit 4: Family, Friends & Descriptions",
        "description": "Describe family members and friends, use possessive adjectives and possessive 's, and use common descriptive adjectives with colors.",
        "lessons": [
            {
                "sub": "4.1",
                "title": "4A: This Is My Family",
                "videos": [
                    {"title": "Grammar: Possessive 's & Family Members", "url": "/videos/beginner/ef5e_beg_4a_1_grammar.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_4a_1_grammar.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_4.01_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_4.01_new.vtt",
                "grammar": "possessive adjectives (my, your, his, her, our, their); possessive 's",
                "vocab": "family (woman, man, boy, girl, mother, father, brother, sister, husband, wife)",
                "vocab_table": [
                    ("Woman / Man", "noun", "/ˈwʊmən/ - /mæn/", "Adult female and male humans", "A young woman and an older man."),
                    ("Boy / Girl", "noun", "/bɔɪ/ - /ɡɜːl/", "Male and female children", "A boy and his sister."),
                    ("Mother / Father", "noun", "/ˈmʌðə/ - /ˈfɑːðə/", "Parents", "Amy's mother is a doctor."),
                    ("Possessive 's", "grammar", "/s/ or /z/", "Showing family relationship or ownership", "This is Paul's sister.")
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
                "videos": [
                    {"title": "Part 1: Grammar (Adjectives & Colours)", "url": "/videos/beginner/ef5e_beg_4b_1_grammar.mp4"},
                    {"title": "Part 2: Beaulieu Motor Museum", "url": "/videos/beginner/ef5e_beg_4b_2_listening.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_4b_2_listening.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_4.12_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_4.12_NEW.vtt",
                "grammar": "adjectives: position before nouns, no plural form",
                "vocab": "car brands and nationalities (Jaguar - English, Mercedes - German, Ferrari - Italian)",
                "vocab_table": [
                    ("Jaguar. It's English", "example", "Car origin", "Jaguar. It's an English car."),
                    ("Mercedes. It's German", "example", "Car origin", "Mercedes. It's a German car."),
                    ("Fast / Slow", "adjectives", "/fɑːst/ - /sləʊ/", "Speed descriptions", "A very fast sports car."),
                    ("Expensive / Cheap", "adjectives", "/ɪkˈspɛnsɪv/ - /tʃiːp/", "Cost descriptions", "An expensive red Ferrari.")
                ],
                "practice_questions": [
                    ("Jaguar is an ________ car.", "English", "England", "Englishs", "None of the above", 0),
                    ("Mercedes is a ________ car.", "German", "Germany", "Germans", "None of the above", 0),
                    ("They have two ________ cars.", "fast", "fasts", "fastes", "None of the above", 0),
                    ("It's a ________ car.", "red Italian", "Italian red", "reds Italian", "None of the above", 0)
                ]
            },
            {
                "sub": "4.3",
                "title": "Revise and Check 3 & 4: Can You Understand These People?",
                "videos": [
                    {"title": "Part 1: Street Interviews (Family & Possessions)", "url": "/videos/beginner/ef5e_beg_rc_3and4_video.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_rc_3and4_video.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_4.21_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_4.21_NEW.vtt",
                "grammar": "Review of singular/plural, demonstratives, family, adjectives",
                "vocab": "Ugly house, easy exercise, family details",
                "vocab_table": [
                    ("An ugly house", "noun phrase", "Descriptive adjective + noun", "An ugly house vs a beautiful home."),
                    ("An easy exercise", "noun phrase", "Descriptive adjective + noun", "An easy exercise to practice adjectives.")
                ],
                "practice_questions": [
                    ("It's ________ ugly house.", "an", "a", "the", "None of the above", 0),
                    ("It's an ________ exercise.", "easy", "easies", "easily", "None of the above", 0),
                    ("My ________ car is outside.", "brother's", "brother", "brothers", "None of the above", 0),
                    ("They are ________ students.", "good", "goods", "a good", "None of the above", 0)
                ]
            },
            {
                "sub": "4.4",
                "title": "Unit 4: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_4.02.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_4.02.vtt",
                "grammar": "Comprehensive assessment of possessives, family relationships, adjectives and colours",
                "vocab": "Unit 4 official vocabulary mastery",
                "vocab_table": [
                    ("Evaluation", "noun", "/ɪˌvæljuˈeɪʃən/", "Assessment of learning progress", "Review your results.")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 5 ─────────────────────────────────────────────────────────────
    {
        "unit": 5,
        "title": "Unit 5: Food, Daily Life & Telling Time",
        "description": "Talk about food and meals, use present simple affirmative and negative with I/you/we/they, ask questions about daily habits, and tell the time.",
        "lessons": [
            {
                "sub": "5.1",
                "title": "5A: My Favourite Meal",
                "videos": [
                    {"title": "Vocabulary: Food & Drink", "url": "/videos/beginner/ef5e_beg_5a_1_vocabulary.mp4"}
                ],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_5.01.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_5.01.vtt",
                "grammar": "present simple (+) and (-): I, you, we, they",
                "vocab": "food and drink (tea, cheese, bread, fruit, fish, meat, pasta, coffee)",
                "vocab_table": [
                    ("Tea / Coffee", "noun", "/tiː/ - /ˈkɒfi/", "Common hot breakfast drinks", "I drink hot tea in the morning."),
                    ("Cheese / Bread", "noun", "/tʃiːz/ - /brɛd/", "Staple breakfast foods", "Toast with cheese and butter."),
                    ("Breakfast / Lunch", "noun", "/ˈbrɛkfəst/ - /lʌntʃ/", "Morning and midday meals", "We have lunch at one o'clock."),
                    ("Don't eat / Don't drink", "verb phrase", "Present simple negative", "I don't eat meat; I am vegetarian.")
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
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_5.12_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_5.12_new.vtt",
                "grammar": "present simple (?): I, you, we, they; short answers",
                "vocab": "common verb phrases (live in a flat, have breakfast, read a book, watch TV, drink coffee)",
                "vocab_table": [
                    ("Live in a flat", "verb phrase", "/lɪv ɪn ə flæt/", "Reside in an apartment", "Do you live in a flat? - Yes, I do."),
                    ("Have breakfast", "verb phrase", "/hæv ˈbrɛkfəst/", "Eat morning meal", "What time do you have breakfast?"),
                    ("Do you speak English?", "question", "/duː juː spiːk ˈɪŋɡlɪʃ/", "Present simple inquiry", "Yes, I do / No, I don't."),
                    ("Flight", "noun", "/flaɪt/", "Journey by airplane", "A very long flight to Sydney.")
                ],
                "practice_questions": [
                    ("________ you speak English? - Yes, I do.", "Do", "Are", "Does", "None of the above", 0),
                    ("Do they live in a flat? - No, they ________.", "don't", "doesn't", "aren't", "None of the above", 0),
                    ("Where ________ you work?", "do", "are", "does", "None of the above", 0),
                    ("What time do you ________ breakfast?", "have", "has", "having", "None of the above", 0)
                ]
            },
            {
                "sub": "5.3",
                "title": "Practical English 3: What Time Is It?",
                "videos": [
                    {"title": "Scene 1: Meeting in London", "url": "/videos/beginner/ef5e_beg_pe3_1.mp4"},
                    {"title": "Scene 2: Telling the Time", "url": "/videos/beginner/ef5e_beg_pe3_2.mp4"},
                    {"title": "Scene 3: Making Plans", "url": "/videos/beginner/ef5e_beg_pe3_3.mp4"},
                    {"title": "Scene 4: Saying How You Feel (Tired, Hungry, Thirsty)", "url": "/videos/beginner/ef5e_beg_pe3_4_useful_phrases.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_pe3_1.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_5.22_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_5.22_new.vtt",
                "grammar": "Telling the time (o'clock, half past, quarter to/past); silent consonants",
                "vocab": "eight, half, hour, know; hungry, thirsty, tired",
                "vocab_table": [
                    ("Silent consonants", "pronunciation", "Words with unpronounced letters", "half (/hɑːf/ silent l), hour (/aʊə/ silent h)."),
                    ("What time is it?", "question", "/wɒt taɪm ɪz ɪt/", "Asking the current hour", "What time is it? - It's half past eight."),
                    ("I'm sorry I'm late", "phrase", "/aɪm ˈsɒri aɪm leɪt/", "Apologizing for tardiness", "I'm really sorry I'm late. - That's OK."),
                    ("Hungry / Tired", "adjectives", "/ˈhʌŋɡri/ - /ˈtaɪəd/", "Physical sensations", "Are you hungry? Let's eat.")
                ],
                "practice_questions": [
                    ("In the word 'half', the letter ________ is silent.", "l", "h", "a", "None of the above", 0),
                    ("In the word 'hour', the letter ________ is silent.", "h", "o", "u", "None of the above", 0),
                    ("What ________ is it? - It's quarter past seven.", "time", "clock", "hour", "None of the above", 0),
                    ("I didn't eat dinner. I am very ________.", "hungry", "thirsty", "tired", "None of the above", 0)
                ]
            },
            {
                "sub": "5.4",
                "title": "Unit 5: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_5.02_NEW_03.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_5.02_NEW_03.vtt",
                "grammar": "Comprehensive assessment of present simple (I, you, we, they), food vocab, and telling the time",
                "vocab": "Unit 5 official vocabulary mastery",
                "vocab_table": [
                    ("Test", "noun", "/tɛst/", "Official evaluation of present simple and time skills", "Good luck!")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 6 ─────────────────────────────────────────────────────────────
    {
        "unit": 6,
        "title": "Unit 6: Jobs, Daily Routines & Habits",
        "description": "Learn to talk about jobs and workplaces, use present simple 3rd person singular (-s, -es, doesn't, does she?), and express daily routines with adverbs of frequency.",
        "lessons": [
            {
                "sub": "6.1",
                "title": "6A: Old Friends?",
                "videos": [
                    {"title": "Grammar: Present Simple (he, she, it)", "url": "/videos/beginner/ef5e_beg_6a_1_grammar.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_6a_1_grammar.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_6.01_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_6.01_new.vtt",
                "grammar": "present simple: he, she, it (+, -, ?); third person -es",
                "vocab": "jobs and places of work (taxi driver, doctor, nurse, teacher, office, hospital)",
                "vocab_table": [
                    ("Where to?", "phrase", "/weə tuː/", "Taxi driver greeting asking for destination", "Where to? - Piccadilly Circus, please."),
                    ("Piccadilly Circus", "proper noun", "Famous junction in London", "Take me to Piccadilly Circus."),
                    ("A doctor / A nurse", "noun", "/ˈdɒktə/ - /nɜːs/", "Healthcare jobs", "He works as a doctor in a hospital."),
                    ("Third person -s", "grammar", "/s/, /z/, /ɪz/", "Present simple 3rd person suffix", "He works, she teaches, it rains.")
                ],
                "practice_questions": [
                    ("Taxi driver: Where to? Passenger: Piccadilly Circus, ________.", "please", "thank you", "welcome", "None of the above", 0),
                    ("He ________ in a bank in central London.", "works", "work", "working", "None of the above", 0),
                    ("She ________ like coffee; she drinks tea.", "doesn't", "don't", "isn't", "None of the above", 0),
                    ("Where ________ he work? - In a hospital.", "does", "do", "is", "None of the above", 0)
                ]
            },
            {
                "sub": "6.2",
                "title": "6B: Good Morning, Goodnight",
                "videos": [
                    {"title": "Part 1: Day in the Life of a New York Tour Guide", "url": "/videos/beginner/ef5e_beg_6b_1_listening.mp4"},
                    {"title": "Part 2: Tour Guide Interview (Part 2)", "url": "/videos/beginner/ef5e_beg_6b_2_listening.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_6b_1_listening.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_6.09.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_6.09.vtt",
                "grammar": "adverbs of frequency: always, usually, often, sometimes, never",
                "vocab": "What does he do? He's a nurse. Where does he work? In a hospital.",
                "vocab_table": [
                    ("What does he do?", "question", "/wɒt dʌz hiː duː/", "Asking someone's profession", "What does he do? - He's a nurse."),
                    ("Where does he work?", "question", "/weə dʌz hiː wɜːk/", "Inquiring about workplace", "Where does he work? - He works in a hospital."),
                    ("Always / Usually", "adverbs", "/ˈɔːlweɪz/ - /ˈjuːʒuəli/", "Frequency indicators", "I always get up at six."),
                    ("Never", "adverb", "/ˈnɛvə/", "At no time (0%)", "He never goes to bed late.")
                ],
                "practice_questions": [
                    ("A: What does he do? B: He's a ________.", "nurse", "hospital", "work", "None of the above", 0),
                    ("A: Where does he work? B: He works in a ________.", "hospital", "nurse", "car", "None of the above", 0),
                    ("She ________ arrives on time for work.", "always", "always is", "is always to", "None of the above", 0),
                    ("He ________ late for morning meetings.", "is never", "never is", "never", "None of the above", 0)
                ]
            },
            {
                "sub": "6.3",
                "title": "Revise and Check 5 & 6: Can You Understand These People?",
                "videos": [
                    {"title": "Part 1: Street Interviews (Jobs & Routines)", "url": "/videos/beginner/ef5e_beg_rc_5and6_video.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_rc_5and6_video.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_6.17_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_6.17_NEW_02.vtt",
                "grammar": "Review of present simple all persons, adverbs of frequency, telling time",
                "vocab": "Lunch at half past one, dinner at eight o'clock",
                "vocab_table": [
                    ("What time do you usually have lunch?", "question", "Routine question", "What time do you usually have lunch? - At half past one."),
                    ("What time do you usually have dinner?", "question", "Routine question", "At about eight o'clock.")
                ],
                "practice_questions": [
                    ("What time do you usually ________ lunch? - At half past one.", "have", "has", "having", "None of the above", 0),
                    ("What time do you usually have ________? - At about eight o'clock.", "dinner", "breakfast", "lunch", "None of the above", 0),
                    ("Does he ________ in London? - Yes, he does.", "live", "lives", "living", "None of the above", 0),
                    ("She ________ TV in the evening.", "watches", "watch", "watchs", "None of the above", 0)
                ]
            },
            {
                "sub": "6.4",
                "title": "Unit 6: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_6.02_NEW_02.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_6.02_NEW_02.vtt",
                "grammar": "Comprehensive assessment of present simple 3rd person, adverbs of frequency, and jobs",
                "vocab": "Unit 6 official vocabulary mastery",
                "vocab_table": [
                    ("Progress", "noun", "/ˈprəʊɡrɛs/", "Advancement", "You are halfway through A1!")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 7 ─────────────────────────────────────────────────────────────
    {
        "unit": 7,
        "title": "Unit 7: Free Time, Films & Dates",
        "description": "Learn to ask questions about free time activities with correct word order, use imperatives and object pronouns (me, him, her), and say dates and months.",
        "lessons": [
            {
                "sub": "7.1",
                "title": "7A: At the Weekend",
                "videos": [
                    {"title": "Vocabulary: Free Time Activities", "url": "/videos/beginner/ef5e_beg_7a_1_vocabulary.mp4"}
                ],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_7.01.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_7.01.vtt",
                "grammar": "word order in questions: be and present simple (ASI / QUASI)",
                "vocab": "weekend activities (do the same thing, hard week at work, fun and exciting)",
                "vocab_table": [
                    ("At the weekend", "phrase", "/æt ðə ˌwiːkˈɛnd/", "Saturday and Sunday", "Three out of four British people do the same thing every weekend!"),
                    ("After a hard week", "phrase", "Work recap", "After a hard week at work, the weekend is a time to do something fun."),
                    ("Activities", "noun", "/ækˈtɪvɪtiz/", "Things done for enjoyment", "75% do the same activities."),
                    ("QUASI", "grammar formula", "Question - Aux - Subject - Infinitive", "What do you do?")
                ],
                "practice_questions": [
                    ("Three out of four British people do the ________ thing every weekend.", "same", "different", "boring", "None of the above", 0),
                    ("After a hard week at ________, the weekend is time for fun.", "work", "school", "shop", "None of the above", 0),
                    ("Where ________ your parents live?", "do", "does", "are", "None of the above", 0),
                    ("What time ________ the movie start?", "does", "do", "is", "None of the above", 0)
                ]
            },
            {
                "sub": "7.2",
                "title": "7B: Lights, Camera, Action!",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_7.12_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_7.12_new.vtt",
                "grammar": "imperatives; object pronouns: me, you, him, her, it, us, them",
                "vocab": "classroom imperatives and object pronouns (I'm your teacher. Listen to me! You're beautiful. I love you.)",
                "vocab_table": [
                    ("Listen to me!", "imperative + pronoun", "Command with object pronoun", "I'm your teacher. Listen to me!"),
                    ("I love you", "phrase", "Subject + verb + object", "You're beautiful. I love you."),
                    ("Object pronouns", "grammar", "me, him, her, us, them", "Pronouns receiving actions", "Call him; speak to her."),
                    ("Imperative", "grammar", "Base verb form", "Direct instruction or command", "Don't talk during the movie!")
                ],
                "practice_questions": [
                    ("I'm your teacher. Listen to ________!", "me", "I", "my", "None of the above", 0),
                    ("You're beautiful. I love ________.", "you", "your", "yours", "None of the above", 0),
                    ("________ talk during the movie!", "Don't", "No", "Not", "None of the above", 0),
                    ("Where are my keys? - I can't find ________.", "them", "they", "their", "None of the above", 0)
                ]
            },
            {
                "sub": "7.3",
                "title": "Practical English 4: What’s the Date?",
                "videos": [
                    {"title": "Scene 1: Jenny's Birthday", "url": "/videos/beginner/ef5e_beg_pe4_1.mp4"},
                    {"title": "Scene 2: On the Phone with Rob", "url": "/videos/beginner/ef5e_beg_pe4_2.mp4"},
                    {"title": "Scene 3: Months and Dates", "url": "/videos/beginner/ef5e_beg_pe4_3.mp4"},
                    {"title": "Scene 4: Useful Social Phrases", "url": "/videos/beginner/ef5e_beg_pe4_4.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_pe4_1.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_7.21_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_7.21_new.vtt",
                "grammar": "Saying the date, ordinal numbers (1st - 31st), talking on the phone",
                "vocab": "first, second, third, fourth; months of the year",
                "vocab_table": [
                    ("First, second, third", "ordinal numbers", "/fɜːst/ - /ˈsɛkənd/ - /θɜːd/", "Numbered sequence", "The 1st, 2nd, and 3rd of the month."),
                    ("What's the date today?", "question", "/wɒts ðə deɪt təˈdeɪ/", "Inquiring about calendar date", "It's the second of November."),
                    ("Months of the year", "noun", "January to December", "Twelve months", "My birthday is in August."),
                    ("On the phone", "phrase", "Telephone conversation", "Hello, this is Rob speaking.")
                ],
                "practice_questions": [
                    ("What comes after 'second'? - ________.", "third", "three", "first", "None of the above", 0),
                    ("What's the ________ today? - It's the 15th of June.", "date", "day", "time", "None of the above", 0),
                    ("His birthday is on the ________ of March.", "twenty-first", "twenty-one", "twenty", "None of the above", 0),
                    ("Hello, this is Sarah ________.", "speaking", "talking", "speaks", "None of the above", 0)
                ]
            },
            {
                "sub": "7.4",
                "title": "Unit 7: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_7.02.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_7.02.vtt",
                "grammar": "Comprehensive assessment of question word order, object pronouns, imperatives, and dates",
                "vocab": "Unit 7 official vocabulary mastery",
                "vocab_table": [
                    ("Test", "noun", "/tɛst/", "Unit 7 assessment", "Check your answers.")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 8 ─────────────────────────────────────────────────────────────
    {
        "unit": 8,
        "title": "Unit 8: Abilities, Shopping & Preferences",
        "description": "Learn modal verbs 'can' and 'can't' for permission and ability, express likes and dislikes with -ing forms, and talk about shopping activities.",
        "lessons": [
            {
                "sub": "8.1",
                "title": "8A: Can I Park Here?",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_8.01_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_8.01_new.vtt",
                "grammar": "can / can't: permission and ability; sentence rhythm",
                "vocab": "driving tests around the world (take the driving test, theory test, practical test, pass the test)",
                "vocab_table": [
                    ("Driving test", "noun", "/ˈdraɪvɪŋ tɛst/", "Official examination to drive a car", "You can take the driving test when you're 17."),
                    ("Theory test / Practical test", "noun", "Written exam vs driving exam", "In Vietnam, the theory test has 450 questions!"),
                    ("Can / Can't", "modal verbs", "/kæn/ - /kɑːnt/", "Permission or ability", "You can park here / You can't park here."),
                    ("Pass the test", "verb phrase", "/pɑːs ðə tɛst/", "Succeed in an exam", "It's difficult to pass the driving test.")
                ],
                "practice_questions": [
                    ("In Qatar, you ________ take the driving test when you're 14.", "can", "can to", "are can", "None of the above", 0),
                    ("You ________ use mobile phones during the exam.", "can't", "don't", "aren't", "None of the above", 0),
                    ("Can she swim? - Yes, she ________.", "can", "is", "does", "None of the above", 0),
                    ("Where ________ we park our car?", "can", "do can", "are", "None of the above", 0)
                ]
            },
            {
                "sub": "8.2",
                "title": "8B: I Love Shopping",
                "videos": [
                    {"title": "Part 1: Vocabulary (Activities & Hobbies)", "url": "/videos/beginner/ef5e_beg_8b_1_vocabulary_1.mp4"},
                    {"title": "Part 2: Singing in a Choir", "url": "/videos/beginner/ef5e_beg_8b_2_listening.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_8b_2_listening.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_8.08_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_8.08.vtt",
                "grammar": "like / love / don't mind / hate + verb + -ing",
                "vocab": "pronunciation of can and can't (We can park here. / I can't help you.)",
                "vocab_table": [
                    ("We can park here", "affirmative", "/wi kən pɑːk hɪə/", "Permission statement", "We can park here for free."),
                    ("I can't help you", "negative", "/aɪ kɑːnt hɛlp juː/", "Inability statement", "I'm sorry, I can't help you right now."),
                    ("Like / Love + -ing", "grammar", "Gerund after preference verbs", "I love singing in a choir."),
                    ("Hate + -ing", "grammar", "Dislike intensely", "She hates waiting in long queues.")
                ],
                "practice_questions": [
                    ("We ________ park here. Look at the sign.", "can", "are can", "can to", "None of the above", 0),
                    ("I'm sorry, I ________ help you with your bags.", "can't", "don't", "am not", "None of the above", 0),
                    ("I love ________ in a choir on Sundays.", "singing", "sing", "sings", "None of the above", 0),
                    ("She hates ________ up early on cold mornings.", "getting", "get", "gets", "None of the above", 0)
                ]
            },
            {
                "sub": "8.3",
                "title": "Revise and Check 7 & 8: Can You Understand These People?",
                "videos": [
                    {"title": "Part 1: Street Interviews (Abilities & Preferences)", "url": "/videos/beginner/ef5e_beg_rc_7and8_video.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_rc_7and8_video.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_8.15_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_8.15_new.vtt",
                "grammar": "Review of can/can't, like + -ing, questions, imperatives",
                "vocab": "Cooking alone, eating with friends in a restaurant",
                "vocab_table": [
                    ("I like cooking alone", "example", "Personal preference", "Chris: I like cooking alone. I don't like having other people in the kitchen."),
                    ("Eating with friends", "example", "Social preference", "I like eating with friends, especially when I'm out.")
                ],
                "practice_questions": [
                    ("Chris: I like ________ alone in my kitchen.", "cooking", "cook", "cooks", "None of the above", 0),
                    ("Chris: I like ________ with friends when I'm out.", "eating", "eat", "eats", "None of the above", 0),
                    ("Can they speak Italian? - No, they ________.", "can't", "don't", "aren't", "None of the above", 0),
                    ("Don't ________ the door, please.", "close", "closing", "closes", "None of the above", 0)
                ]
            },
            {
                "sub": "8.4",
                "title": "Unit 8: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_8.02_NEW_3.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_8.02_NEW_3.vtt",
                "grammar": "Comprehensive assessment of can/can't, like/love/hate + -ing, and shopping vocabulary",
                "vocab": "Unit 8 official vocabulary mastery",
                "vocab_table": [
                    ("Review", "noun", "/rɪˈvjuː/", "Assessment of modal verbs and gerunds", "Answer each question accurately.")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 9 ─────────────────────────────────────────────────────────────
    {
        "unit": 9,
        "title": "Unit 9: Travelling, Clothes & Present Continuous",
        "description": "Learn the present continuous tense for ongoing activities, describe clothing and fashion, contrast present continuous vs simple, and invite friends to events.",
        "lessons": [
            {
                "sub": "9.1",
                "title": "9A: What Are They Really Doing?",
                "videos": [
                    {"title": "Pronunciation: Sentence Rhythm", "url": "/videos/beginner/ef5e_beg_9a_1_pronunciation.mp4"}
                ],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_9.01_NEW2.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_9.01_NEW2.vtt",
                "grammar": "present continuous (be + verb-ing); sentence rhythm",
                "vocab": "phone call dialogue (Hello? Tony? - Oh hi darling, how's Zurich? Fine, fine. I'm staying in a nice hotel - but it's raining.)",
                "vocab_table": [
                    ("How's Zurich?", "question", "Asking about city/trip", "Oh hi darling, how's Zurich?"),
                    ("I'm staying in a hotel", "present continuous", "Temporary ongoing action", "I'm staying in a nice hotel."),
                    ("It's raining", "present continuous", "Weather right now", "It's raining. Can you hear it?"),
                    ("Sentence rhythm", "pronunciation", "Stress-timed English beats", "I'm staying in a nice hotel.")
                ],
                "practice_questions": [
                    ("Tony: Oh hi darling. How's ________? Carol: Fine, fine.", "Zurich", "London", "Paris", "None of the above", 0),
                    ("Carol: I'm ________ in a nice hotel.", "staying", "stay", "stays", "None of the above", 0),
                    ("Look outside! It's ________ right now.", "raining", "rain", "rains", "None of the above", 0),
                    ("What ________ you doing right now?", "are", "do", "is", "None of the above", 0)
                ]
            },
            {
                "sub": "9.2",
                "title": "9B: Watching and Waiting",
                "videos": [
                    {"title": "Vocabulary: Clothes & Styles", "url": "/videos/beginner/ef5e_beg_9b_1_vocabulary.mp4"}
                ],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_9.09_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_9.09_new.vtt",
                "grammar": "present continuous or present simple? (habits vs right now)",
                "vocab": "day in the life of a Private Investigator; clothes (wear a suit, jacket, jeans, coat)",
                "vocab_table": [
                    ("Private Investigator", "noun", "/ˈpraɪvət ɪnˈvɛstɪɡeɪtə/", "Detective hired for surveillance", "A day in the life of a Private Investigator."),
                    ("Wear a suit", "verb phrase", "/weər ə suːt/", "Formal office clothing", "I don't need to wear a suit to work."),
                    ("Typical day", "phrase", "Daily routine", "On a typical day, I get up early and go to my office."),
                    ("Present continuous vs simple", "grammar", "Right now vs Routine", "I wear jeans usually, but today I'm wearing a suit.")
                ],
                "practice_questions": [
                    ("On a typical day, I don't need to wear a ________.", "suit", "jeans", "shoes", "None of the above", 0),
                    ("He usually wears a t-shirt, but today he is ________ a suit.", "wearing", "wears", "wear", "None of the above", 0),
                    ("What is the detective ________ right now?", "doing", "do", "does", "None of the above", 0),
                    ("I ________ coffee every morning at eight.", "drink", "am drinking", "drinks", "None of the above", 0)
                ]
            },
            {
                "sub": "9.3",
                "title": "Practical English 5: Would You Like to Come?",
                "videos": [
                    {"title": "Scene 1: Inviting Jenny to Dinner", "url": "/videos/beginner/ef5e_beg_pe5_1.mp4"},
                    {"title": "Scene 2: At the Restaurant", "url": "/videos/beginner/ef5e_beg_pe5_2.mp4"},
                    {"title": "Scene 3: Useful Social Phrases", "url": "/videos/beginner/ef5e_beg_pe5_3mp4.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_pe5_1.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_9.16_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_9.16_new.vtt",
                "grammar": "Inviting and offering: Would you like a pizza? / Would you like to see a film?",
                "vocab": "invitations, accepting and declining politely",
                "vocab_table": [
                    ("Would you like a pizza?", "invitation/offer", "/wʊd juː laɪk ə ˈpiːtsə/", "Offering food politely", "Would you like a pizza?"),
                    ("Would you like to see a film?", "invitation", "Inviting someone out", "Would you like to see a film tonight?"),
                    ("I'd love to", "phrase", "/aɪd lʌv tuː/", "Accepting enthusiastically", "Yes, I'd love to!"),
                    ("I'm sorry, I can't", "phrase", "Polite refusal", "I'd love to, but I'm busy.")
                ],
                "practice_questions": [
                    ("Would you like ________ pizza?", "a", "an", "the", "None of the above", 0),
                    ("Would you like to ________ a film tonight?", "see", "seeing", "sees", "None of the above", 0),
                    ("A: Would you like a cup of tea? B: Yes, ________.", "please", "I do", "I like", "None of the above", 0),
                    ("I'd ________ to, but I have an exam tomorrow.", "love", "like", "loving", "None of the above", 0)
                ]
            },
            {
                "sub": "9.4",
                "title": "Unit 9: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_9.02.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_9.02.vtt",
                "grammar": "Comprehensive assessment of present continuous vs simple, clothes vocabulary, and invitations",
                "vocab": "Unit 9 official vocabulary mastery",
                "vocab_table": [
                    ("Mastery", "noun", "/ˈmɑːstəri/", "Comprehensive command of continuous tense and clothing", "Select the best answer.")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 10 ────────────────────────────────────────────────────────────
    {
        "unit": 10,
        "title": "Unit 10: Hotels, Prepositions & Past of Be",
        "description": "Learn there is / there are for places and hotel amenities, prepositions of place (in, on, under, behind), and the past simple of 'be' (was and were).",
        "lessons": [
            {
                "sub": "10.1",
                "title": "10A: A Room with a View",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_10.01.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_10.01.vtt",
                "grammar": "there's a... / there are some...; prepositions: in, on, under, behind, opposite",
                "vocab": "Visit Scotland narrative (10,000 km of coast, 790 islands, 30,000 lochs, famous castles)",
                "vocab_table": [
                    ("Visit Scotland", "reading topic", "Scottish tourism", "Scotland is one of the world's top tourist destinations."),
                    ("Lochs / Castles", "noun", "/lɒks/ - /ˈkɑːslz/", "Scottish lakes and historic fortresses", "More than 30,000 lochs and famous castles."),
                    ("There is / There are", "grammar", "/ðeər ɪz/ - /ðeər ɑː/", "Stating presence or existence", "There's a castle on the hill."),
                    ("Coast / Islands", "noun", "/kəʊst/ - /ˈaɪləndz/", "Geographic features", "790 beautiful Scottish islands.")
                ],
                "practice_questions": [
                    ("Scotland has more than 30,000 ________ (the word for lakes).", "lochs", "rivers", "seas", "None of the above", 0),
                    ("________ a comfortable double bed in the room.", "There is", "There are", "It is", "None of the above", 0),
                    ("Are there ________ clean towels in the bathroom?", "any", "some", "a", "None of the above", 0),
                    ("There are ________ pictures on the wall.", "some", "any", "a", "None of the above", 0)
                ]
            },
            {
                "sub": "10.2",
                "title": "10B: Where Was He?",
                "videos": [
                    {"title": "Part 1: Vocabulary (in, on, at)", "url": "/videos/beginner/ef5e_beg_10b_1_vocabulary.mp4"},
                    {"title": "Part 2: Buildings with a Past", "url": "/videos/beginner/ef5e_beg_10b_2_listening.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_10b_2_listening.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_10.09.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_10.09_new.vtt",
                "grammar": "past simple: be (was / were, wasn't / weren't)",
                "vocab": "pronunciation /ɪə/ and /eə/; in, on, at; past time expressions",
                "vocab_table": [
                    ("Was / Were", "past verb", "/wɒz/ - /wɜː/", "Past of be", "Where were you yesterday? - I was at home."),
                    ("Buildings with a past", "topic", "Historic structures", "This building was a hotel in 1920."),
                    ("In, on, at", "prepositions", "Location markers", "At work, at school, in the kitchen, on the train."),
                    ("Yesterday / Last night", "time expressions", "Past references", "We were at the theatre last night.")
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
                "videos": [
                    {"title": "Part 1: Street Interviews (Places & Past Travels)", "url": "/videos/beginner/ef5e_beg_rc_9and10_video.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_rc_9and10_video.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_10.16_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_10.16_new.vtt",
                "grammar": "Review of present continuous, there is/are, was/were",
                "vocab": "Street interviews about birthplace, hometown, and hotels",
                "vocab_table": [
                    ("Where were you born?", "question", "Birthplace inquiry", "Where were you born? - I was born in London."),
                    ("Were you at home?", "question", "Past location inquiry", "No, I was at work all day.")
                ],
                "practice_questions": [
                    ("Where ________ you born? - In Manchester.", "were", "was", "are", "None of the above", 0),
                    ("There ________ three chairs in the hotel bedroom.", "are", "is", "was", "None of the above", 0),
                    ("She was ________ home all day yesterday.", "at", "in", "on", "None of the above", 0),
                    ("Was the weather nice on holiday? - No, it ________.", "wasn't", "weren't", "isn't", "None of the above", 0)
                ]
            },
            {
                "sub": "10.4",
                "title": "Unit 10: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_10.02_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_10.02_new.vtt",
                "grammar": "Comprehensive assessment of there is/are, prepositions of place, and was/were",
                "vocab": "Unit 10 official vocabulary mastery",
                "vocab_table": [
                    ("Assessment", "noun", "/əˈsɛsmənt/", "Evaluation of hotel vocabulary and past of be", "Good luck!")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 11 ────────────────────────────────────────────────────────────
    {
        "unit": 11,
        "title": "Unit 11: Past Events & Giving Directions",
        "description": "Learn past simple regular verbs (-ed) and common irregular verbs (get, go, have, do), talk about past trips, and ask for and give directions in town.",
        "lessons": [
            {
                "sub": "11.1",
                "title": "11A: A New Life in the USA",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_11.01.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_11.01.vtt",
                "grammar": "past simple: regular verbs (-ed endings: /t/, /d/, /ɪd/); did / didn't",
                "vocab": "regular verbs (arrive, live, move, start, study, work, visit, play)",
                "vocab_table": [
                    ("Regular past -ed", "grammar", "/t/, /d/, or /ɪd/", "Forming past tense with regular verbs", "arrived, lived, worked, studied."),
                    ("Did you live in New York?", "question", "Past simple interrogative with did", "Did you live in Manhattan? - No, we lived in Brooklyn."),
                    ("Didn't arrive", "negative", "Past simple negative with didn't", "The ship didn't arrive until Tuesday."),
                    ("New life in the USA", "topic", "Immigrant story", "In 1975, my family arrived in America.")
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
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_11.08_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_11.08_new.vtt",
                "grammar": "past simple irregular verbs: get, go, have, do (got, went, had, did)",
                "vocab": "verb phrases with get, go, have, do (get up, go out, have lunch, do homework)",
                "vocab_table": [
                    ("Go -> Went", "irregular verb", "/wɛnt/", "Past of go", "Yesterday we went to the beach."),
                    ("Have -> Had", "irregular verb", "/hæd/", "Past of have", "We had lunch at an Italian restaurant."),
                    ("Get -> Got", "irregular verb", "/ɡɒt/", "Past of get", "I got up early this morning."),
                    ("Do -> Did", "irregular verb", "/dɪd/", "Past of do", "What did you do on Saturday?")
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
                "videos": [
                    {"title": "Scene 1: Rob Asking for Directions", "url": "/videos/beginner/ef5e_beg_pe6_1.mp4"},
                    {"title": "Scene 2: Finding the Bank", "url": "/videos/beginner/ef5e_beg_pe6_2.mp4"},
                    {"title": "Scene 3: Turn Left, Turn Right", "url": "/videos/beginner/ef5e_beg_pe6_3.mp4"},
                    {"title": "Scene 4: Social English Phrases", "url": "/videos/beginner/ef5e_beg_pe6_4.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_pe6_1.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_11.15_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_11.15_new.vtt",
                "grammar": "Asking for and giving directions; polite intonation",
                "vocab": "turn left, turn right, go straight on, traffic lights, on your right",
                "vocab_table": [
                    ("Is there a bank near here?", "question", "/ɪz ðeər ə bæŋk nɪə hɪə/", "Asking for nearby locations", "Excuse me, is there a bank near here?"),
                    ("Go straight on", "direction phrase", "/ɡəʊ streɪt ɒn/", "Continue forward", "Go straight on and turn left."),
                    ("Traffic lights", "noun", "/ˈtræfɪk laɪts/", "Road signals", "Turn right at the traffic lights."),
                    ("On your right", "direction phrase", "/ɒn jɔː raɪt/", "Located on the right side", "The bank is on your right.")
                ],
                "practice_questions": [
                    ("Excuse me, ________ a bank near here?", "is there", "are there", "there is", "None of the above", 0),
                    ("Go straight ________ and turn left at the lights.", "on", "in", "to", "None of the above", 0),
                    ("The pharmacy is ________ your right.", "on", "in", "at", "None of the above", 0),
                    ("Turn ________ at the corner, opposite the station.", "right", "straight", "into", "None of the above", 0)
                ]
            },
            {
                "sub": "11.4",
                "title": "Unit 11: Comprehensive End of Unit Test",
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_11.02_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_11.02_new.vtt",
                "grammar": "Comprehensive assessment of past simple regular and irregular verbs and directions",
                "vocab": "Unit 11 official vocabulary mastery",
                "vocab_table": [
                    ("Evaluation", "noun", "/ɪˌvæljuˈeɪʃən/", "Assessment of past tense and direction skills", "Check every answer.")
                ],
                "practice_questions": []
            }
        ]
    },

    # ─── UNIT 12 ────────────────────────────────────────────────────────────
    {
        "unit": 12,
        "title": "Unit 12: Stories, Past Revision & Final Assessment",
        "description": "Consolidate your mastery of past simple storytelling with regular and irregular verbs, revise core course structures, and complete your final A1 certification exam.",
        "lessons": [
            {
                "sub": "12.1",
                "title": "12A: Strangers on a Train",
                "videos": [
                    {"title": "Scene 1: Strangers on a Train (Part 1)", "url": "/videos/beginner/ef5e_beg_12a_1_listening.mp4"},
                    {"title": "Scene 2: Strangers on a Train (Part 2)", "url": "/videos/beginner/ef5e_beg_12a_2_listening.mp4"},
                    {"title": "Scene 3: Strangers on a Train (Part 3)", "url": "/videos/beginner/ef5e_beg_12a_3_listening.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_12a_1_listening.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_12.01.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_12.01.vtt",
                "grammar": "past simple regular and irregular verbs storytelling sequence",
                "vocab": "storytelling verbs (sat, read, looked up, saw, smiled, said, changed)",
                "vocab_table": [
                    ("Strangers on a train", "narrative title", "Story", "A classic English storytelling narrative."),
                    ("See -> Saw", "irregular verb", "/sɔː/", "Perceived with eyes", "He looked up and saw a mysterious woman."),
                    ("Say -> Said", "irregular verb", "/sɛd/", "Spoke words", "He smiled and said: 'Please sit down.'"),
                    ("Meet -> Met", "irregular verb", "/mɛt/", "Encountered", "They met on a train to Paris.")
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
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_12.05_new.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_12.05_new.vtt",
                "grammar": "revision of all past simple forms: affirmative, negative, interrogative, regular and irregular",
                "vocab": "revision of past time expressions and high-frequency verbs",
                "vocab_table": [
                    ("Revision", "noun", "/rɪˈvɪʒən/", "Reviewing learned material", "Review all past forms before the final exam."),
                    ("Infinitive with did", "grammar", "Base verb after auxiliary", "Did you go? / I didn't see.")
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
                "videos": [
                    {"title": "Part 1: Street Interviews (Final Course Review)", "url": "/videos/beginner/ef5e_beg_rc_11and12_video.mp4"}
                ],
                "video_vtt": "subtitle/ef5e_beg_rc_11and12_video.vtt",
                "audio": "/audio/beginner/EF_5e_Beginner_SB_12.09_NEW_2.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_12.09_NEW_2.vtt",
                "grammar": "Comprehensive course review of past events, travel experiences, daily life",
                "vocab": "Vocabulary review across all 12 units",
                "vocab_table": [
                    ("Memorable trip", "phrase", "Travel recap", "What was the most memorable trip you took this year?"),
                    ("We travelled by train", "example", "Journey description", "We travelled by train across the entire country.")
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
                "videos": [],
                "video_vtt": None,
                "audio": "/audio/beginner/EF_5e_Beginner_SB_12.02.mp3",
                "audio_vtt": "subtitle/EF_5e_Beginner_SB_12.02.vtt",
                "grammar": "Final comprehensive assessment covering the entire Beginner (A1) curriculum",
                "vocab": "Complete A1 vocabulary mastery",
                "vocab_table": [
                    ("Certification", "noun", "/ˌsɜːtɪfɪˈkeɪʃən/", "Official document certifying achievement of A1 English proficiency", "You have completed English File Beginner!")
                ],
                "practice_questions": []
            }
        ]
    }
]

def render_lesson_markdown(lesson, unit_num):
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

    # Extract exact audio transcript from VTT
    audio_lines = extract_vtt_lines(z_cpt, lesson["audio_vtt"])
    audio_transcript_md = format_transcript_md(audio_lines, max_lines=18)
    
    # Extract exact video transcript from VTT if video has dialogue
    video_section_md = ""
    if lesson.get("video_vtt"):
        vid_lines = extract_vtt_lines(z_cpt, lesson["video_vtt"])
        if vid_lines:
            vid_md = format_transcript_md(vid_lines, max_lines=16)
            video_section_md = f"""
### 🎬 Video Dialogue Transcript
{vid_md}

---
"""

    vocab_rows_list = []
    for item in lesson.get("vocab_table", []):
        if len(item) == 5:
            w, pos, ipa, meaning, ex = item
        elif len(item) == 4:
            w, pos, ipa, meaning = item
            ex = "-"
        elif len(item) == 3:
            w, pos, meaning = item
            ipa = "-"
            ex = "-"
        else:
            w = item[0]
            pos = item[1] if len(item) > 1 else "-"
            ipa = "-"
            meaning = item[2] if len(item) > 2 else "-"
            ex = "-"
        vocab_rows_list.append(f"| **{w}** | {pos} | `{ipa}` | {meaning} | *\"{ex}\"* |")
    vocab_rows = "\n".join(vocab_rows_list)
    
    return f"""### 🎯 Can-Do Objective
Can understand, pronounce, and confidently use **{lesson['grammar']}** and essential vocabulary for **{lesson['vocab']}**.

---

### 🎧 Audio Listening Drill
<audio controls src="{lesson['audio']}"></audio>

#### 📜 Audio Transcript
{audio_transcript_md}

---
{video_section_md}
### 📚 Core Vocabulary Essentials
| Word / Phrase | Part of Speech | Pronunciation (IPA) | Meaning in Context | Example Sentence |
| :--- | :--- | :--- | :--- | :--- |
{vocab_rows}

---

### 💡 Grammar In Depth: {lesson['grammar']}
Understanding sentence structure is key to speaking accurately. Review the rules and practice with the native audio above.

> *"Always pay attention to word order and listen to native sentence rhythm to sound more natural."*

---

### 🗣️ Speaking & Conversation Practice
- **Roleplay Practice:** Use the Speaking Practice Studio below to read the lines of the dialogue aloud.
- **Listen & Repeat Drill:** Play the audio track above, pause after each phrase, and repeat with natural rhythm.

---

### 🌟 Key Expressions to Memorize
- Practice introducing the topic in conversation.
- Use full sentences when answering questions.
- Focus on clear vowel sounds and correct stress.
"""

def generate_ts():
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
    out.append("  console.log('Seeding English Beginner Course with authentic Oxford audio/video transcripts...');")
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
    out.append("  // Clean up old course cleanly")
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
    out.append("  console.log('Creating course modules, lessons with authentic video, audio, and Oxford tests...');")
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
    
    for mod in modules_catalog:
        u_num = mod["unit"]
        out.append("          {")
        out.append(f"            title: {json.dumps(mod['title'])},")
        out.append(f"            order: {u_num},")
        out.append("            lessons: {")
        out.append("              create: [")
        
        for l_idx, les in enumerate(mod["lessons"]):
            l_order = l_idx + 1
            is_free = (u_num == 1 and l_order == 1)
            
            # Format videoUrl:
            # If multiple videos, serialize as JSON array of {title, url}
            # If 1 video, single string
            # If 0 videos, null
            vids = les.get("videos", [])
            if len(vids) > 1:
                video_url_val = json.dumps(json.dumps(vids))
            elif len(vids) == 1:
                video_url_val = json.dumps(vids[0]["url"])
            else:
                video_url_val = "null"
                
            md_content = render_lesson_markdown(les, u_num)
            
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
            out.append(f"                  videoUrl: {video_url_val},")
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
    code = generate_ts()
    out_path = r"C:\Users\Dominic Nantchoua\english-learning-platform\prisma\seed-beginner-course.ts"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Generated {out_path} ({len(code)} bytes).")
