# STT 웹앱 (Homepage) 설계

## 배경

기존 CLI 도구(`stt.py`, `providers.py`, `writer.py`)를 그대로 웹에서도 쓸 수 있도록, 인터넷 어디서든 접속 가능한 웹페이지를 추가한다. 개인용 소규모 도구이므로 최소 기능으로 시작한다.

## 결정된 요구사항

- **배포**: Render (무료 티어로 시작)
- **접근 제한**: 비밀번호 1개 — 로그인해야 업로드 화면 진입 가능
- **지원 provider**: OpenAI, Groq만 (둘 다 화면에 선택지로 노출)
- **로컬 Whisper**: 웹에서 제외, 기존 CLI(`stt.py --provider local`)에만 남김 — torch/모델 가중치를 공개 서버에 올리면 배포 용량·시간이 커지고 Render 무료 티어 메모리로는 느리거나 동작하지 않을 수 있어서 제외
- **출력 형식**: CLI와 동일하게 `.txt` + `.srt`

## 아키텍처

```
stt-tool/
├── stt.py, providers.py, writer.py, config.py   # 기존 CLI (변경 없음)
└── webapp/
    ├── app.py                # Flask 앱
    ├── templates/
    │   ├── login.html         # 비밀번호 입력
    │   └── upload.html         # 업로드 폼 + 결과 미리보기/다운로드 링크
    ├── static/style.css        # 최소한의 스타일
    ├── requirements.txt        # flask, openai, python-dotenv (torch/whisper 불필요)
    ├── render.yaml              # Render 배포 설정
    └── .gitignore
```

`webapp/app.py`는 기존 `providers.py`의 `transcribe_openai`/`transcribe_groq`와 `writer.py`의 `write_txt`/`write_srt`를 그대로 import해서 재사용한다 (로직 중복 없음).

## 요청 흐름

1. `GET /` → 세션에 로그인 안 되어 있으면 `login.html`로 리다이렉트
2. `POST /login` → 폼의 비밀번호를 환경변수 `SITE_PASSWORD`와 비교, 맞으면 세션에 로그인 플래그 저장 후 `/`로 리다이렉트
3. `GET /` (로그인 상태) → `upload.html` 렌더링. 파일 선택 UI만 기본 노출되고, provider(OpenAI/Groq) 선택지는 기본 숨김 상태 — "고급 옵션" 토글 버튼을 눌러야 펼쳐짐. 숨긴 채로 바로 제출하면 기본값 OpenAI 사용
4. `POST /transcribe` → 업로드 파일을 임시 저장 → 크기 25MB 초과 시 에러 메시지 반환 → 선택된 provider로 변환 → 결과를 `webapp/results/<uuid>/` 폴더에 `.txt`/`.srt`로 저장 → 결과 페이지에 텍스트 미리보기 + 다운로드 링크 2개 표시
5. `GET /download/<uuid>/<filename>` → 로그인 상태 확인 후 `send_from_directory`로 파일 전송

## 보안 / 환경변수

- `SITE_PASSWORD`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `FLASK_SECRET_KEY`는 Render 대시보드 환경변수로 설정 — 코드/저장소에 포함하지 않음
- 로컬 개발 시엔 `webapp/.env`(gitignore 대상)로 동일 값 사용

## 에러 처리

- 비밀번호 틀림 → 로그인 페이지에 에러 메시지 표시, 재시도
- 지원 안 하는 확장자(webm/mp4/mp3 아님) → 업로드 즉시 거부
- 25MB 초과 → 업로드 즉시 거부 (분할 업로드 없음, CLI와 동일 정책)
- API 호출 실패(키 오류, 네트워크 등) → 결과 페이지에 에러 메시지, 재시도 유도

## 알려진 제한 (의도적으로 안 하는 것)

- `results/` 폴더 자동 정리 없음 — 개인용 소규모 도구라 우선순위 낮음, 필요해지면 나중에 추가
- 비밀번호는 1개, 다중 사용자 계정/권한 시스템 없음
- 동시 여러 명 사용 시 서버 리소스 경쟁 가능 (Render 무료 티어 특성상 감수)

## 배포 준비

- Render는 git 저장소 연동 배포이므로, `stt-tool`을 git 저장소로 초기화하고 GitHub에 올려야 함 (구현 단계에서 사용자와 함께 진행)
