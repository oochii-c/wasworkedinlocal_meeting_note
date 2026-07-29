import { useState, useRef } from 'react'
function formatTime(totalSec: number): string {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    const pad = (n:number) => n.toString().padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
}

interface Props {
    // 녹음 완료 시 오디오 File을 위로 전달 (백엔드 없음, 메모리 객체로 넘김)
    onAudio?: (file: File) => void
}

export default function Recorder({ onAudio }: Props) {
    const [recording, setRecording] = useState<boolean>(false)     // 지금 녹음 중인지
    const [audioUrl, setAudioUrl] = useState<string | null>(null)   // 녹음 파일 rul
    const [error, setError] = useState<string>('')                  // 마이크 권한 거부 시 에러문구

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)     // 녹음기 객체
    const chunksRef = useRef<Blob[]>([])                            // 녹음 중 쌓이는 오디오 조각 모음
    const mimeTypeRef = useRef<string>('')                          // 포맷 이름(webm, mp4)

    const wakeLockRef = useRef<WakeLockSentinel | null>(null)       // 화면 꺼짐 방지 객체

    const [elapsed, setElapsed] = useState<number>(0)               // 경과 시간(초)
    const timerRef = useRef<number | null>(null)                    // setInterval(타이머) id 보관

    // 녹음 시작 함수
    const startRecording = async () => {
        setError('')        // 에러문구 리셋
        setAudioUrl(null)   // 녹음파일 리셋
        try {
            // 마이크 권한 요청
            const stream = await navigator.mediaDevices.getUserMedia({audio: true})
            // 포맷 분기
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/mp4'
            // 포멧 저장
            mimeTypeRef.current = mimeType
            // 녹음기 객체 생성
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 48000,  // 말소리용 저용량
                // - 48000 — 음질 좋음, 1시간 ≈ 21MB (25MB 안쪽)
                // - 32000 — 더 안전, 1시간 ≈ 14MB, 음질 살짝↓ (말소리는 여전히 또렷)
            })
            // 녹음기 객체 저장
            mediaRecorderRef.current = mediaRecorder
            // 오디오 조각 배열 초기화 
            chunksRef.current = []
            // 오디오 조각 수집
            mediaRecorder.ondataavailable = (e) => {
                if(e.data.size > 0) chunksRef.current.push(e.data)
            }
            // 녹음 완료 시 호출
            mediaRecorder.onstop = () => {
                // 녹음 파일 만듦
                const blob = new Blob(chunksRef.current, {type: mimeTypeRef.current})
                // 파일을 url로 변환
                const url = URL.createObjectURL(blob)
                setAudioUrl(url)                            // url 저장
                // 오디오를 위로 전달 (STT로 흐름)
                const ext = mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm'
                onAudio?.(new File([blob], `recording.${ext}`, { type: mimeTypeRef.current }))
                stream.getTracks().forEach((t) => t.stop()) // 마이크 사용 해제
            }

            mediaRecorder.start()   // 녹음 시작
            setRecording(true)

            // 타이머 시작
            setElapsed(0)   // 0초 부터
            timerRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1)  // 1초마다 +1
            }, 1000)

            // 화면 꺼짐 방지
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen')
            } catch{
                // Wake Lock 미지원 브라우저면 그냥 넘어감 (녹음은 계속)
            }
        } catch {
            setError('마이크 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.')
        }
    }

    // 녹음 정지 함수
    const stopRecording = () => {
        mediaRecorderRef.current?.stop()    // onstop 실행
        setRecording(false)                 // 녹음 끝 (녹음 버튼 상태 변경)

        // 화면 꺼진 방지 해제
        wakeLockRef.current?.release()
        wakeLockRef.current = null

        // 타이머 정지
        if(timerRef.current !== null) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }
    
    // 다운로드 함수(테스트용)
    const handleDownload = () => {
        // 녹음 파일 없으면 함수 종료
        if (!audioUrl) return

        // 저장 포맷 저장
        const ext = mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm'
        // 링크 태그 만들어서 자동으로 클릭하여 녹음파일 다운로드 (브라우저 보안 이슈)
        const a = document.createElement('a')
        a.href = audioUrl
        a.download = `recording.${ext}`
        a.click()
    }

    return (
        <div>
            <p className="console__timer">{formatTime(elapsed)}</p>

            <div className="console__row">
                {!recording ? (
                    <button className="btn btn--rec" onClick={startRecording}>
                        녹음 시작
                    </button>
                ) : (
                    <button className="btn btn--rec" onClick={stopRecording}>
                        <span className="rec-dot" /> 정지
                    </button>
                )}
            </div>

            {/* 에러 시 */}
            {error && <p className="console__error">{error}</p>}

            <p className="console__note">
                녹음 중에는 화면을 끄거나 다른 앱으로 전환하지 마세요.
            </p>

            {/* 테스트용 재생기, 다운로드 버튼 */}
            {audioUrl && (
                <div className="console__player">
                    <audio src={audioUrl} controls />
                    <button className="btn btn--ghost-on-ink" onClick={handleDownload}>
                        녹음 파일 저장
                    </button>
                </div>
            )}
        </div>
    )
}