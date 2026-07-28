import type { ReactElement } from 'react'

export interface MeetingDocData {
  /** 회의 제목 */
  title?: string
  /** 회의 일시 (표시용 문자열) */
  date?: string
  /** 음성에서 변환된 전체 텍스트 */
  transcript: string
  /** 요약본 */
  summary: string
}

/** PDF 출력기가 받는 props (문서 데이터 + 파일명) */
export interface MeetingExporterProps extends MeetingDocData {
  /** 다운로드 파일명 (.pdf 자동 부여) */
  fileName?: string
}

/**
 * PDF 출력기 컴포넌트 계약.
 * 동료 PDF 모듈은 이 시그니처만 맞추면 그대로 꽂힘.
 */
export type MeetingExporter = (props: MeetingExporterProps) => ReactElement
