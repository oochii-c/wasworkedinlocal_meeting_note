import { useEffect, useRef, useState } from 'react'
import { summarize } from '../lib/api'

interface Props {
  transcript: string
  summary: string
  onSummary: (text: string) => void
  onActionItems: (items: string[]) => void
}

/** 로컬 LLM(CPU)은 transcript 길이에 대략 비례 — 러프한 예상 소요(분) */
function estimateMinutes(transcript: string): number {
  return Math.min(10, Math.max(1, Math.round(transcript.length / 1200)))
}

function mmss(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// [요약] STT 끝나면 자동으로 transcript → summary + 액션 아이템.
// 요약 중에는 예상 소요시간과 경과시간을 노출.
export function SummaryPanel({
  transcript,
  summary,
  onSummary,
  onActionItems,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [estimate, setEstimate] = useState(1)
  const started = useRef(false)

  const run = async () => {
    if (!transcript.trim()) return
    setEstimate(estimateMinutes(transcript))
    setElapsed(0)
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

  // STT 완료(transcript 채워짐) 시 1회 자동 요약. 이미 요약 있으면 건너뜀.
  useEffect(() => {
    if (started.current || busy) return
    if (!transcript.trim() || summary.trim()) return
    started.current = true
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript])

  // 요약 중 경과시간 카운트
  useEffect(() => {
    if (!busy) return
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [busy])

  return (
    <>
      {busy ? (
        <div className="summary-progress" role="status">
          <div className="typing">
            <span className="typing__dot" />
            <span className="typing__dot" />
            <span className="typing__dot" />
          </div>
          <p className="hint">
            요약 중… 약 {estimate}분 소요 예상 · 경과 {mmss(elapsed)}
          </p>
        </div>
      ) : (
        <button
          type="button"
          className="btn"
          disabled={!transcript.trim()}
          onClick={run}
        >
          {summary.trim() ? '요약 다시 생성' : '요약 생성'}
        </button>
      )}
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
