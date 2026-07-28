import { ActiveExporter } from '../meeting'
import type { MeetingState } from './types'

interface Props {
  meeting: MeetingState
}

// [완료] 현재 상태를 PDF 출력기로 넘김. 출력기 교체는 meeting/index.ts에서.
export function ExportBar({ meeting }: Props) {
  const ready = meeting.transcript.trim().length > 0
  return (
    <section>
      <h2>5. 문서 출력</h2>
      {ready ? (
        <ActiveExporter
          title={meeting.title || '회의록'}
          date={meeting.date}
          transcript={meeting.transcript}
          summary={meeting.summary}
          fileName={meeting.title || '회의록'}
        />
      ) : (
        <p>변환 텍스트가 있어야 출력 가능</p>
      )}
    </section>
  )
}
