import type { MeetingExporter } from './types'
import { MeetingPdfExport } from './MeetingPdfExport'

export type { MeetingDocData, MeetingExporterProps, MeetingExporter } from './types'
export { MeetingPdfExport } from './MeetingPdfExport'

/**
 * 앱이 실제로 쓰는 PDF 출력기.
 * 동료 PDF 모듈 완성되면 오른쪽 바인딩만 교체:
 *   export const ActiveExporter: MeetingExporter = TheirPdfExport
 * MeetingExporter 타입이 시그니처를 강제하므로 잘못 꽂으면 컴파일 에러로 잡힘.
 */
export const ActiveExporter: MeetingExporter = MeetingPdfExport
