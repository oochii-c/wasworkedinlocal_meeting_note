import ollama
from fpdf import FPDF
from fpdf.enums import XPos, YPos

FONT_REGULAR = "C:/Windows/Fonts/malgun.ttf"
FONT_BOLD = "C:/Windows/Fonts/malgunbd.ttf"

def summarize_meeting(transcript: str) -> dict:
    prompt = f"""다음은 회의 녹취록입니다. 아래 형식으로 정리해주세요.

[요약]
(핵심 내용을 5줄 이내로)

[할 일]
(액션 아이템을 담당자와 함께 목록으로. 없으면 '없음')

회의록:
{transcript}
"""
    response = ollama.chat(
        model="qwen2.5:7b",
        messages=[{"role": "user", "content": prompt}]
    )
    result_text = response["message"]["content"]
    return {"original": transcript, "result": result_text}

def _build_pdf(result_text: str) -> FPDF:
    pdf = FPDF()
    pdf.add_page()
    pdf.add_font("Malgun", "", FONT_REGULAR)
    pdf.add_font("Malgun", "B", FONT_BOLD)

    pdf.set_font("Malgun", "B", 18)
    pdf.cell(0, 12, "회의록 요약", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)

    for raw_line in result_text.split("\n"):
        line = raw_line.strip()
        if not line:
            pdf.ln(3)
            continue
        if line.startswith("**") and line.endswith("**"):
            pdf.set_font("Malgun", "B", 14)
            pdf.ln(4)
            pdf.multi_cell(0, 9, line.replace("**", ""), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        elif line.startswith("*"):
            pdf.set_font("Malgun", "", 11)
            pdf.multi_cell(0, 8, "   • " + line.lstrip("* ").strip(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        else:
            pdf.set_font("Malgun", "", 11)
            pdf.multi_cell(0, 8, line, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    return pdf

def build_pdf_bytes(result_text: str) -> bytes:
    return bytes(_build_pdf(result_text).output())

def save_as_pdf(result_text: str, filename: str = "meeting_summary.pdf"):
    _build_pdf(result_text).output(filename)

if __name__ == "__main__":
    print("회의록 텍스트를 붙여넣고 Enter, 그다음 Ctrl+Z 후 Enter를 눌러주세요:")
    transcript = ""
    try:
        while True:
            line = input()
            transcript += line + "\n"
    except EOFError:
        pass

    print("\n요약 생성 중입니다... 잠시만 기다려주세요.\n")
    result = summarize_meeting(transcript)

    print("===== 요약/할 일 =====")
    print(result["result"])

    save_as_pdf(result["result"])
    print("\n결과를 meeting_summary.pdf 파일로 저장했습니다.")