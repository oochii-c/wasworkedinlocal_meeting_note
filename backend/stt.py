import os

MAX_BYTES = 25 * 1024 * 1024  # Groq/OpenAI 업로드 한도


def _openai_compatible(
    path: str, api_key: str, model: str, base_url: str | None
) -> tuple[str, list[dict]]:
    from openai import OpenAI

    size = os.path.getsize(path)
    if size > MAX_BYTES:
        raise ValueError(f"파일이 {size / 1024 / 1024:.1f}MB로 25MB 한도를 넘습니다.")

    client = (
        OpenAI(api_key=api_key, base_url=base_url)
        if base_url
        else OpenAI(api_key=api_key)
    )
    with open(path, "rb") as f:
        result = client.audio.transcriptions.create(
            model=model, file=f, language="ko", response_format="verbose_json"
        )
    segments = [
        {"start": seg.start, "end": seg.end, "text": seg.text}
        for seg in (result.segments or [])
    ]
    return result.text, segments


_MIME_BY_EXT = {
    ".webm": "audio/webm",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".mp4": "audio/mp4",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
}


def _transcribe_groq(path: str) -> tuple[str, list[dict]]:
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise ValueError("GROQ_API_KEY가 없습니다. backend/.env에 넣으세요.")
    model = os.environ.get("GROQ_STT_MODEL", "whisper-large-v3")
    return _openai_compatible(path, key, model, "https://api.groq.com/openai/v1")


def _transcribe_hf(path: str, content_type: str | None) -> tuple[str, list[dict]]:
    import requests

    key = os.environ.get("HF_TOKEN")
    if not key:
        raise ValueError("HF_TOKEN이 없습니다. backend/.env에 넣으세요.")
    # turbo = large-v3보다 훨씬 빠름 (무료 티어 콜드스타트/큐에 유리)
    model = os.environ.get("HF_STT_MODEL", "openai/whisper-large-v3-turbo")
    # HF는 Content-Type로 오디오 포맷을 판별 — 없으면 400.
    mime = content_type or _MIME_BY_EXT.get(
        os.path.splitext(path)[1].lower(), "audio/webm"
    )
    with open(path, "rb") as f:
        audio = f.read()

    url = f"https://router.huggingface.co/hf-inference/models/{model}"
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": mime,
        "x-wait-for-model": "true",  # 콜드스타트면 에러 대신 로딩 대기
    }
    last_err = None
    for _ in range(2):  # 첫 호출 콜드스타트 대비 재시도
        try:
            res = requests.post(url, headers=headers, data=audio, timeout=300)
            if res.status_code != 200:
                raise ValueError(f"HF STT 실패 ({res.status_code}): {res.text}")
            out = res.json()
            text = out.get("text", "") if isinstance(out, dict) else str(out)
            return text, []  # HF inference API는 segment 타임스탬프 미제공
        except requests.exceptions.ReadTimeout as e:
            last_err = e
    raise ValueError(
        f"HF STT 타임아웃 (모델 로딩 지연). 잠시 후 다시 시도하세요. {last_err}"
    )


def transcribe(path: str, content_type: str | None = None) -> tuple[str, list[dict]]:
    """오디오 파일 → (텍스트, segments). segments = [{start, end, text}].
    STT_PROVIDER 환경변수로 제공자 선택. hf는 타임스탬프 미지원 → segments=[].
    hf 토큰 소진/실패 시 groq로 자동 폴백(폴백 시 타임스탬프도 확보)."""
    provider = os.environ.get("STT_PROVIDER", "groq")

    if provider == "groq":
        return _transcribe_groq(path)

    if provider == "openai":
        key = os.environ.get("OPENAI_API_KEY")
        if not key:
            raise ValueError("OPENAI_API_KEY가 없습니다. backend/.env에 넣으세요.")
        return _openai_compatible(path, key, "whisper-1", None)

    if provider == "hf":
        try:
            return _transcribe_hf(path, content_type)
        except Exception:
            # HF 크레딧 소진(402)·토큰 만료·타임아웃 등 → groq 키 있으면 자동 전환
            if os.environ.get("GROQ_API_KEY"):
                return _transcribe_groq(path)
            raise

    # local — openai-whisper 설치 필요
    os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
    import whisper

    model = whisper.load_model(os.environ.get("LOCAL_WHISPER_MODEL", "base"))
    result = model.transcribe(path)
    segments = [
        {"start": seg["start"], "end": seg["end"], "text": seg["text"]}
        for seg in result["segments"]
    ]
    return result["text"], segments
