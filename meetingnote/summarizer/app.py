import io

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import ollama

from summarize import build_pdf_bytes

app = Flask(__name__)
CORS(app)  # localhost:5173(React 화면)에서 오는 요청을 허용

def summarize_meeting(transcript: str) -> str:
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
    return response["message"]["content"]

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text", "")
    if not text.strip():
        return jsonify({"summary": "회의록 내용이 비어있습니다."}), 400
    result = summarize_meeting(text)
    return jsonify({"summary": result})

@app.route("/download-pdf", methods=["POST"])
def download_pdf():
    data = request.get_json()
    summary = data.get("summary", "")
    pdf_bytes = build_pdf_bytes(summary)
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name="meeting_summary.pdf",
    )

if __name__ == "__main__":
    app.run(port=5000, debug=True)