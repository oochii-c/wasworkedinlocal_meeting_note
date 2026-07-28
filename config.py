import os
import sys

from dotenv import load_dotenv

load_dotenv()

_ENV_VAR = {
    "openai": "OPENAI_API_KEY",
    "groq": "GROQ_API_KEY",
}


def get_api_key(provider: str) -> str:
    env_var = _ENV_VAR[provider]
    key = os.environ.get(env_var)
    if not key:
        sys.exit(
            f"[오류] {env_var}가 설정되어 있지 않습니다. "
            f".env 파일에 {env_var}=... 형식으로 추가하세요."
        )
    return key
