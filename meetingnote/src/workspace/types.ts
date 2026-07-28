/** 회의록 앱 중앙 상태. 각 패널이 자기 조각만 채우고 위로 올린다. */
export interface MeetingState {
  title: string
  date: string
  audioFile: File | null // AudioInput가 채움
  transcript: string // TranscribePanel(STT)가 채움
  summary: string // SummaryPanel(요약)이 채움
}

export const emptyMeeting: MeetingState = {
  title: '',
  date: '',
  audioFile: null,
  transcript: '',
  summary: '',
}
