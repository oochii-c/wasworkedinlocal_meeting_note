import os


def _prompt(transcript: str) -> str:
    return f"""다음은 회의 녹취록입니다. 아래 형식으로 정리해주세요.

[요약]
(핵심 내용을 5줄 이내로)

[할 일]
(액션 아이템을 담당자와 함께 목록으로. 없으면 '없음')

회의록:
{transcript}"""


def _summarize_ollama(text: str) -> str:
    import ollama

    response = ollama.chat(
        model=os.environ.get("OLLAMA_MODEL", "qwen2.5:7b"),
        messages=[{"role": "user", "content": _prompt(text)}],
    )
    return response["message"]["content"]


def _summarize_hf(text: str) -> str:
    # HuggingFace 라우터 — OpenAI 호환 chat 엔드포인트
    from openai import OpenAI

    key = os.environ.get("HF_TOKEN")
    if not key:
        raise ValueError("HF_TOKEN이 없습니다. backend/.env에 넣으세요.")
    client = OpenAI(api_key=key, base_url="https://router.huggingface.co/v1")
    response = client.chat.completions.create(
        model=os.environ.get("HF_CHAT_MODEL", "meta-llama/Llama-3.3-70B-Instruct"),
        messages=[{"role": "user", "content": _prompt(text)}],
        temperature=0.3,
    )
    return response.choices[0].message.content


def _summarize_groq(text: str) -> str:
    # groq — OpenAI 호환 chat 엔드포인트
    from openai import OpenAI

    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise ValueError("GROQ_API_KEY가 없습니다. backend/.env에 넣으세요.")
    client = OpenAI(api_key=key, base_url="https://api.groq.com/openai/v1")
    response = client.chat.completions.create(
        model=os.environ.get("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile"),
        messages=[{"role": "user", "content": _prompt(text)}],
        temperature=0.3,
    )
    return response.choices[0].message.content


_SUMMARIZERS = {
    "ollama": _summarize_ollama,
    "hf": _summarize_hf,
    "groq": _summarize_groq,
}


def summarize(text: str) -> str:
    """텍스트 → 요약([요약]/[할 일] 형식). SUMMARY_PROVIDER로 제공자 선택.
    hf 토큰 소진/실패 시 groq로 자동 폴백."""
    provider = os.environ.get("SUMMARY_PROVIDER", "groq")
    run = _SUMMARIZERS.get(provider, _summarize_groq)
    try:
        return run(text)
    except Exception:
        # HF 크레딧 소진(402)·토큰 만료 등 → groq 키 있으면 자동 전환
        if provider == "hf" and os.environ.get("GROQ_API_KEY"):
            return _summarize_groq(text)
        raise
