import os

MAX_API_FILE_BYTES = 25 * 1024 * 1024

DEFAULT_MODEL = {
    "openai": "whisper-1",
    "groq": "whisper-large-v3",
    "local": "base",
}


class FileTooLargeError(Exception):
    pass


def _check_size(path: str) -> None:
    size = os.path.getsize(path)
    if size > MAX_API_FILE_BYTES:
        raise FileTooLargeError(
            f"{path} 파일이 {size / 1024 / 1024:.1f}MB로 API 업로드 한도(25MB)를 초과합니다."
        )


def _transcribe_openai_compatible(path: str, api_key: str, model: str, base_url: str | None):
    from openai import OpenAI

    _check_size(path)
    client = OpenAI(api_key=api_key, base_url=base_url) if base_url else OpenAI(api_key=api_key)
    with open(path, "rb") as f:
        result = client.audio.transcriptions.create(
            model=model,
            file=f,
            response_format="verbose_json",
        )
    segments = [
        {"start": seg.start, "end": seg.end, "text": seg.text}
        for seg in (result.segments or [])
    ]
    return result.text, segments


def transcribe_openai(path: str, api_key: str, model: str = DEFAULT_MODEL["openai"]):
    return _transcribe_openai_compatible(path, api_key, model, base_url=None)


def transcribe_groq(path: str, api_key: str, model: str = DEFAULT_MODEL["groq"]):
    return _transcribe_openai_compatible(
        path, api_key, model, base_url="https://api.groq.com/openai/v1"
    )


def transcribe_local(path: str, model_size: str = DEFAULT_MODEL["local"]):
    # Anaconda's numpy/mkl and pip-installed torch both bundle libiomp5md.dll,
    # which aborts on import (OMP Error #15) unless this is set.
    os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
    import whisper

    model = whisper.load_model(model_size)
    result = model.transcribe(path)
    segments = [
        {"start": seg["start"], "end": seg["end"], "text": seg["text"]}
        for seg in result["segments"]
    ]
    return result["text"], segments
