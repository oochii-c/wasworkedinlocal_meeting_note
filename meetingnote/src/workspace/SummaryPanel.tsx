import { useState } from 'react'
import { summarize } from '../lib/api'

interface Props {
  transcript: string
  summary: string
  onSummary: (text: string) => void
  onActionItems: (items: string[]) => void
}

// [요약] transcript → summary + 액션 아이템 (Groq LLM).
export function SummaryPanel({
  transcript,
  summary,
  onSummary,
  onActionItems,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const run = async () => {
    if (!transcript.trim()) return
    setBusy(true)
    setErr('')
    try {
      const res = await summarize(transcript)
      onSummary(res.summary)
      onActionItems(res.actionItems)
    } catch (e) {
      setErr(e instanceof Error ? e.message : '요약 실패')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn"
        disabled={!transcript.trim() || busy}
        onClick={run}
      >
        {busy ? '요약 중…' : '요약 생성'}
      </button>
      {err ? <p className="err">{err}</p> : null}
      <textarea
        className="field"
        style={{ marginTop: 12 }}
        value={summary}
        onChange={(e) => onSummary(e.target.value)}
        rows={4}
        placeholder="요약본. 직접 입력할 수도 있어요."
      />
    </>
  )
}
