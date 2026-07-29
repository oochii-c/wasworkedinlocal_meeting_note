import type { TranscriptSegment } from '../lib/api'

/** 화면 흐름: 녹음 → 처리중 → 회의록 상세 */
export type View = 'record' | 'processing' | 'detail'

/** 회의록 앱 중앙 상태. 각 패널이 자기 조각만 채우고 위로 올린다. */
export interface MeetingState {
  title: string
  date: string
  audioFile: File | null // AudioInput가 채움
  transcript: string // TranscribePanel(STT)가 채움
  segments: TranscriptSegment[] // 타임스탬프 구간 (제공자에 따라 빈 배열)
  summary: string // SummaryPanel(요약)이 채움
  actionItems: string[] // 액션 아이템 ("내용 - 담당자")
}

export const emptyMeeting: MeetingState = {
  title: '',
  date: '',
  audioFile: null,
  transcript: '',
  segments: [],
  summary: '',
  actionItems: [],
}
