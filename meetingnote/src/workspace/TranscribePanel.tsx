import { useState } from 'react'
import { transcribeAudio } from '../lib/api'

interface Props {
  audioFile: File | null
  onTranscript: (text: string) => void
}

// [STT] audioFile → transcript (Groq Whisper large-v3).
export function TranscribePanel({ audioFile, onTranscript }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

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

  return (
    <>
      <button
        type="button"
        className="btn btn--primary"
        disabled={!audioFile || busy}
        onClick={run}
      >
        {busy ? '변환 중…' : '변환 실행'}
      </button>
      {!audioFile ? <p className="hint">먼저 오디오를 준비하세요</p> : null}
      {err ? <p className="err">{err}</p> : null}
    </>
  )
}
