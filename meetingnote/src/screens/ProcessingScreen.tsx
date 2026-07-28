import { TranscribePanel } from '../workspace/TranscribePanel'
import { TranscriptView } from '../workspace/TranscriptView'
import { SummaryPanel } from '../workspace/SummaryPanel'
import type { MeetingState } from '../workspace/types'

interface Props {
  meeting: MeetingState
  patch: (p: Partial<MeetingState>) => void
  onDone: () => void
  onBack: () => void
}

// 화면 ② 처리 파이프라인 상태 + (백엔드 없으므로) 수동 변환/요약.
export function ProcessingScreen({ meeting, patch, onDone, onBack }: Props) {
  const hasText = meeting.transcript.trim().length > 0
  const hasSummary = meeting.summary.trim().length > 0

  // 담당자 붙은 처리 단계 (와이어프레임 기준)
  const steps = [
    { label: '오디오 준비 완료', owner: '', state: meeting.audioFile ? 'done' : 'active' },
    { label: '텍스트 변환 (STT)', owner: '', state: hasText ? 'done' : 'active' },
    { label: '핵심 요약', owner: '', state: hasSummary ? 'done' : hasText ? 'active' : 'idle' },
    { label: '회의록 준비', owner: '', state: hasText ? 'active' : 'idle' },
  ] as const

  return (
    <main className="app">
      <header className="masthead masthead--tight">
        <button className="backlink" onClick={onBack}>
          ← 녹음으로
        </button>
        <h2 className="screen-title">정리하는 중…</h2>
      </header>

      <ul className="proc-list">
        {steps.map((s) => (
          <li key={s.label} className="proc-item" data-state={s.state}>
            <span className="proc-dot" />
            <span className="proc-label">{s.label}</span>
            <span className="proc-owner">{s.owner}</span>
          </li>
        ))}
      </ul>

      <div className="proc-work">
        <p className="worklabel">변환</p>
        <TranscribePanel
          audioFile={meeting.audioFile}
          onTranscript={(t) => patch({ transcript: t })}
        />
        <TranscriptView
          transcript={meeting.transcript}
          onChange={(t) => patch({ transcript: t })}
        />

        <p className="worklabel">요약</p>
        <SummaryPanel
          transcript={meeting.transcript}
          summary={meeting.summary}
          onSummary={(s) => patch({ summary: s })}
          onActionItems={(items) => patch({ actionItems: items })}
        />
      </div>

      <button
        type="button"
        className="btn btn--primary btn--wide"
        disabled={!hasText}
        onClick={onDone}
      >
        회의록 보기 →
      </button>
    </main>
  )
}
