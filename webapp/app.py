import os
import sys
import tempfile
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from flask import Flask, abort, redirect, render_template, request, send_from_directory, session, url_for

from providers import FileTooLargeError, transcribe_groq, transcribe_openai
from writer import write_srt, write_txt

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

SUPPORTED_EXTENSIONS = {".webm", ".mp4", ".mp3"}
RESULTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results")

app = Flask(__name__)
app.secret_key = os.environ["FLASK_SECRET_KEY"]


@app.before_request
def _require_login():
    if os.environ.get("SKIP_LOGIN") == "1":
        return
    if request.endpoint in ("login", "static"):
        return
    if not session.get("logged_in"):
        return redirect(url_for("login"))


def _fmt_hhmmss(seconds: float) -> str:
    total = int(seconds)
    h, rem = divmod(total, 3600)
    m, s = divmod(rem, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        if request.form.get("password") == os.environ.get("SITE_PASSWORD"):
            session["logged_in"] = True
            return redirect(url_for("index"))
        error = "비밀번호가 올바르지 않습니다."
    return render_template("login.html", error=error)


@app.route("/")
def index():
    return render_template("upload.html", result=None, error=None, provider="groq")


@app.route("/transcribe", methods=["POST"])
def transcribe():
    file = request.files.get("file")
    provider_selected = request.form.get("provider")
    provider = provider_selected or "groq"
    user_api_key = "" if provider_selected == "" else (request.form.get("api_key") or "").strip()

    if not file or file.filename == "":
        return render_template("upload.html", result=None, error="파일을 선택해주세요.", provider=provider)

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return render_template(
            "upload.html", result=None,
            error=f"지원하지 않는 확장자입니다: {ext} (webm/mp4/mp3만 지원)",
            provider=provider,
        )

    if provider not in ("openai", "groq"):
        return render_template("upload.html", result=None, error="알 수 없는 provider입니다.", provider=provider)

    api_key = user_api_key or os.environ.get("OPENAI_API_KEY" if provider == "openai" else "GROQ_API_KEY")
    if not api_key:
        return render_template(
            "upload.html", result=None,
            error=f"{provider} API 키가 없습니다. 직접 입력하거나 서버에 환경변수를 설정하세요.",
            provider=provider,
        )

    tmp_fd, tmp_path = tempfile.mkstemp(suffix=ext)
    os.close(tmp_fd)
    try:
        file.save(tmp_path)
        try:
            if provider == "openai":
                text, segments = transcribe_openai(tmp_path, api_key)
            else:
                text, segments = transcribe_groq(tmp_path, api_key)
        except FileTooLargeError as e:
            return render_template("upload.html", result=None, error=str(e), provider=provider)
        except Exception as e:
            return render_template(
                "upload.html", result=None,
                error=f"변환 중 오류가 발생했습니다: {e}", provider=provider,
            )
    finally:
        os.remove(tmp_path)

    result_id = str(uuid.uuid4())
    result_dir = os.path.join(RESULTS_DIR, result_id)
    os.makedirs(result_dir, exist_ok=True)
    stem = os.path.splitext(os.path.basename(file.filename))[0] or "transcript"
    txt_name = f"{stem}.txt"
    srt_name = f"{stem}.srt"
    write_txt(text, os.path.join(result_dir, txt_name))
    write_srt(segments, os.path.join(result_dir, srt_name))

    display_segments = [
        {
            "start": _fmt_hhmmss(seg["start"]),
            "end": _fmt_hhmmss(seg["end"]),
            "text": seg["text"].strip(),
        }
        for seg in segments
    ]

    result = {
        "id": result_id,
        "segments": display_segments,
        "txt_name": txt_name,
        "srt_name": srt_name,
        "text": text.strip(),
    }
    return render_template("upload.html", result=result, error=None, provider=provider)


@app.route("/download/<uuid_str>/<filename>")
def download(uuid_str, filename):
    try:
        uuid.UUID(uuid_str)
    except ValueError:
        abort(404)
    result_dir = os.path.join(RESULTS_DIR, uuid_str)
    return send_from_directory(result_dir, filename, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
