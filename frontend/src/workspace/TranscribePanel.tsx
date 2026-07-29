import { useEffect, useRef, useState } from 'react'
import { transcribeAudio, type TranscribeResult } from '../lib/api'

interface Props {
  audioFile: File | null
  transcript: string
  onTranscript: (result: TranscribeResult) => void
}

// [STT] processing 화면 진입 시 audioFile → transcript 자동 변환 (Groq Whisper).
// 실패하면 에러 + 다시 시도 버튼 노출.
export function TranscribePanel({ audioFile, transcript, onTranscript }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const started = useRef(false)

  const run = async () => {
    if (!audioFile) return
    setBusy(true)
    setErr('')
    try {
      onTranscript(await transcribeAudio(audioFile))
    } catch (e) {
      setErr(e instanceof Error ? e.message : '변환 실패')
    } finally {
      setBusy(false)
    }
  }

  // 진입 시 1회 자동 실행 (이미 변환됐거나 오디오 없으면 건너뜀)
  useEffect(() => {
    if (started.current) return
    if (!audioFile || transcript.trim()) return
    started.current = true
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (busy)
    return (
      <div className="typing" role="status" aria-label="변환 중">
        <span className="typing__dot" />
        <span className="typing__dot" />
        <span className="typing__dot" />
      </div>
    )
  if (err)
    return (
      <>
        <p className="err">{err}</p>
        <button type="button" className="btn" onClick={run}>
          다시 시도
        </button>
      </>
    )
  return null
}
