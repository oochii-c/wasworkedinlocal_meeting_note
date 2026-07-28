import os
import tempfile

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from stt import transcribe
from summary import summarize

load_dotenv()

app = Flask(__name__)
CORS(app)  # 프론트(브라우저)에서 오는 요청 허용


@app.post("/transcribe")
def transcribe_route():
    if "file" not in request.files:
        return jsonify({"error": "오디오 파일이 없습니다."}), 400

    upload = request.files["file"]
    suffix = os.path.splitext(upload.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        upload.save(tmp.name)
        path = tmp.name

    try:
        return jsonify({"text": transcribe(path, upload.mimetype)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(path)


@app.post("/summarize")
def summarize_route():
    data = request.get_json(force=True, silent=True) or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "회의록 내용이 비어있습니다."}), 400

    try:
        return jsonify({"result": summarize(text)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5000)), debug=True)
