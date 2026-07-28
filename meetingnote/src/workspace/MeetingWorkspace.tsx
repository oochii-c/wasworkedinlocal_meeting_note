import { useState } from 'react'
import { AudioInput } from './AudioInput'
import { TranscribePanel } from './TranscribePanel'
import { TranscriptView } from './TranscriptView'
import { SummaryPanel } from './SummaryPanel'
import { ExportBar } from './ExportBar'
import { emptyMeeting, type MeetingState } from './types'

// 중앙 상태 오케스트레이터. 각 패널은 자기 조각만 채우고 위로 올린다.
export function MeetingWorkspace() {
  const [meeting, setMeeting] = useState<MeetingState>(emptyMeeting)
  const patch = (p: Partial<MeetingState>) => setMeeting((m) => ({ ...m, ...p }))

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: '0 16px', display: 'grid', gap: 20 }}>
      <header>
        <h1>회의록</h1>
        <input
          placeholder="회의 제목"
          value={meeting.title}
          onChange={(e) => patch({ title: e.target.value })}
          style={{ width: '100%' }}
        />
      </header>

      <AudioInput audioFile={meeting.audioFile} onAudio={(f) => patch({ audioFile: f })} />
      <TranscribePanel audioFile={meeting.audioFile} onTranscript={(t) => patch({ transcript: t })} />
      <TranscriptView transcript={meeting.transcript} onChange={(t) => patch({ transcript: t })} />
      <SummaryPanel
        transcript={meeting.transcript}
        summary={meeting.summary}
        onSummary={(s) => patch({ summary: s })}
      />
      <ExportBar meeting={meeting} />
    </div>
  )
}
