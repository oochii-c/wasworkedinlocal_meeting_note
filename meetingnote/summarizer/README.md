# 회의록 자동 요약 프로그램

로컬 LLM(Ollama + qwen2.5:7b)을 이용해 회의록을 자동으로 요약합니다.
웹 화면(React)에서 쓰거나, 터미널에서 CLI로 바로 쓸 수 있습니다.

## 사전 준비 (처음 한 번만)

1. Ollama 설치: https://ollama.com 에서 다운로드 (또는 터미널에서 `winget install Ollama.Ollama`, 아무 폴더에서나 실행 가능)

2. qwen2.5:7b 모델 다운로드 (약 4.7GB, 아무 폴더에서나 실행 가능)

ollama pull qwen2.5:7b

3. Python 패키지 설치 — 반드시 이 폴더(`meetingnote/summarizer`)에서 실행

cd meetingnote/summarizer
pip install -r requirements.txt

4. React 패키지 설치 — 반드시 `meetingnote` 폴더(`summarizer`의 한 단계 위)에서 실행

cd meetingnote
npm install

## 실행 방법 (웹 화면)

`meetingnote` 폴더에서 (summarizer 아님, 한 단계 위):

cd meetingnote
npm run start:all

Flask 서버(포트 5000)와 Vite 개발 서버(포트 5173)가 각각 새 터미널 창으로 열립니다.
브라우저에서 http://localhost:5173 접속 후 회의록을 붙여넣고 요약하면 됩니다.
요약 결과 아래 "PDF 다운로드" 버튼으로 PDF 저장도 가능합니다.

## 실행 방법 (CLI, 웹 화면 없이)

`meetingnote/summarizer` 폴더에서:

cd meetingnote/summarizer
python summarize.py

1. 회의록 텍스트를 붙여넣고 Enter, 그 다음 Ctrl+Z 후 Enter
2. 결과는 화면에 출력되고, 같은 폴더에 `meeting_summary.pdf`로도 저장됩니다.
