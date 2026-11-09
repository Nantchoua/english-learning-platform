import sys
import pypdf
import re
import json

test_dir = r"C:\Users\Dominic Nantchoua\Downloads\English File 5th beginner\English File 5th beginner\Tests\english_file_fifth_edition_beginner_all_quick_tests\english_file_fifth_edition_beginner_all_quick_tests"

def extract_all_unit_tests():
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
                    q_text = m.group(2).strip().replace("\n", " ")
                    optA = m.group(3).strip().replace("\n", " ")
                    optB = m.group(4).strip().replace("\n", " ")
                    optC = m.group(5).strip().replace("\n", " ")
                    correct_letter = grammar_ak.get(num, "A")
                    opt_idx = {"A": 0, "B": 1, "C": 2, "D": 3}.get(correct_letter, 0)
                    
                    q_clean = re.sub(r"[\uf0fc\uf0fd\uf0fe]+", "", q_text).strip()
                    oA_clean = re.sub(r"[\uf0fc\uf0fd\uf0fe]+", "", optA).strip()
                    oB_clean = re.sub(r"[\uf0fc\uf0fd\uf0fe]+", "", optB).strip()
                    oC_clean = re.sub(r"[\uf0fc\uf0fd\uf0fe]+", "", optC).strip()
                    
                    # Ensure options are clean and not empty
                    if oA_clean and oB_clean and oC_clean and q_clean:
                        questions.append({
                            "question": q_clean,
                            "optionA": oA_clean,
                            "optionB": oB_clean,
                            "optionC": oC_clean,
                            "optionD": "None of the above",
                            "correctOption": opt_idx
                        })
        all_tests[unit_num] = questions
    return all_tests

if __name__ == "__main__":
    tests = extract_all_unit_tests()
    for u in range(1, 13):
        print(f"Unit {u}: {len(tests[u])} questions")
        print(f"  Q1: {tests[u][0]['question']} -> Correct: {tests[u][0]['correctOption']}")
        print(f"  Q10: {tests[u][9]['question']} -> Correct: {tests[u][9]['correctOption']}")
