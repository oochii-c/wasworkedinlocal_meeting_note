import argparse
import os
import sys

from config import get_api_key
from providers import (
    DEFAULT_MODEL,
    FileTooLargeError,
    transcribe_groq,
    transcribe_local,
    transcribe_openai,
)
from writer import write_srt, write_txt

# Windows 콘솔 기본 코드페이지(cp949)는 파일명에 포함된 이모지 등 일부 유니코드
# 문자를 인코딩하지 못해 print()에서 크래시가 나므로 UTF-8로 강제 설정
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SUPPORTED_EXTENSIONS = {".webm", ".mp4", ".mp3"}


def collect_input_files(input_path: str) -> list[str]:
    if os.path.isdir(input_path):
        files = [
            os.path.join(input_path, name)
            for name in sorted(os.listdir(input_path))
            if os.path.splitext(name)[1].lower() in SUPPORTED_EXTENSIONS
        ]
        if not files:
            sys.exit(f"[오류] {input_path} 폴더에 webm/mp4/mp3 파일이 없습니다.")
        return files

    if not os.path.isfile(input_path):
        sys.exit(f"[오류] {input_path} 파일 또는 폴더를 찾을 수 없습니다.")
    ext = os.path.splitext(input_path)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        sys.exit(f"[오류] 지원하지 않는 확장자입니다: {ext} (webm/mp4/mp3만 지원)")
    return [input_path]


def transcribe_one(path: str, provider: str, model: str, api_key: str | None):
    if provider == "openai":
        return transcribe_openai(path, api_key, model)
    if provider == "groq":
        return transcribe_groq(path, api_key, model)
    return transcribe_local(path, model)


def main():
    parser = argparse.ArgumentParser(description="음성/영상 파일을 텍스트 transcript로 변환합니다.")
    parser.add_argument("input", help="변환할 파일 또는 파일들이 담긴 폴더")
    parser.add_argument(
        "--provider", choices=["openai", "groq", "local"], default="openai",
        help="사용할 STT 방식 (기본: openai)",
    )
    parser.add_argument("--model", default=None, help="provider별 기본 모델을 덮어씀")
    parser.add_argument(
        "--output-dir", default=None,
        help="결과 저장 폴더 (기본: 입력 위치의 transcripts/ 하위)",
    )
    args = parser.parse_args()

    files = collect_input_files(args.input)
    model = args.model or DEFAULT_MODEL[args.provider]

    api_key = None
    if args.provider in ("openai", "groq"):
        api_key = get_api_key(args.provider)

    base_dir = args.input if os.path.isdir(args.input) else os.path.dirname(os.path.abspath(args.input))
    output_dir = args.output_dir or os.path.join(base_dir, "transcripts")
    os.makedirs(output_dir, exist_ok=True)

    failed = []
    total = len(files)
    for i, path in enumerate(files, start=1):
        name = os.path.basename(path)
        print(f"[{i}/{total}] {name} 변환 중...")
        try:
            text, segments = transcribe_one(path, args.provider, model, api_key)
        except FileTooLargeError as e:
            print(f"  -> 건너뜀: {e}")
            failed.append(name)
            continue
        except Exception as e:
            print(f"  -> 실패: {e}")
            failed.append(name)
            continue

        stem = os.path.splitext(name)[0]
        write_txt(text, os.path.join(output_dir, f"{stem}.txt"))
        write_srt(segments, os.path.join(output_dir, f"{stem}.srt"))
        print(f"  -> 완료: {stem}.txt, {stem}.srt")

    print(f"\n총 {total}개 중 {total - len(failed)}개 성공, {len(failed)}개 실패.")
    if failed:
        print("실패 목록:", ", ".join(failed))


if __name__ == "__main__":
    main()
