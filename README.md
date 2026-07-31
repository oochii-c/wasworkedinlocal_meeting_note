# 디브리핑

음성/영상 → 텍스트 변환(STT) → 회의록 요약 웹앱.

## 구조

```
frontend/   Vite + React (SPA). 브라우저는 backend API만 호출 — 키 노출 없음
backend/    Flask JSON API. STT(/transcribe) + 요약(/summarize)
docs/       설계 스펙
```

제공자는 backend에서 선택. STT/요약 각각 클라우드(groq/hf/openai) 또는
완전 로컬(whisper/ollama)로 굴릴 수 있음 — `backend/.env`로 전환.

## 실행 (클라우드 API 모드, 기본)

가장 간단. groq 무료 키만 있으면 됨.

```bash
# 1) backend
cd backend
cp .env.example .env          # STT_PROVIDER=groq, SUMMARY_PROVIDER=groq
#   .env 에 GROQ_API_KEY 채우기
pip install -r requirements.txt
python app.py                 # http://127.0.0.1:5000

# 2) frontend (새 터미널)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Windows는 루트 `start.ps1` 로 backend+frontend 동시 실행 가능.

## 실행 (완전 로컬 모드, API 호출 0)

STT는 로컬 whisper, 요약은 로컬 Ollama Llama로 돌림. 인터넷·키 불필요,
데이터 안 나감. **CPU만 있으면 느림**(변환/요약에 수십 초~분).

사전 준비:

```bash
# ffmpeg 필요 (whisper용)
pip install openai-whisper          # torch 딸려옴 (용량 큼)

# Ollama 설치 후 모델 받기
#   Windows: winget install Ollama.Ollama
ollama pull llama3.2:3b             # 약 2GB
```

`backend/.env` 설정:

```
STT_PROVIDER=local
LOCAL_WHISPER_MODEL=base            # CPU면 base 권장 (large-v3는 매우 느림)
SUMMARY_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:3b            # 품질 원하면 llama3.1:8b (더 느림)
```

이후 실행은 위와 동일. Ollama 서버가 떠 있어야 함(설치 시 자동 기동).

## 배포

프론트(정적)와 backend(Python)를 분리 배포:

- **frontend** → Cloudflare Pages / Vercel (build: `npm run build`, 배포: `dist/`)
- **backend** → Render / Railway (Python Web Service, `gunicorn app:app`)
- frontend `VITE_API_BASE` 를 배포된 backend URL로 지정

배포 환경은 로컬 whisper/ollama를 못 쓰므로 `STT_PROVIDER`·`SUMMARY_PROVIDER`
를 `groq`(또는 `hf`)로 두고 키를 서버 환경변수로 설정.
