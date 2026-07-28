import { PDFDownloadLink } from '@react-pdf/renderer'
import { MeetingDocument } from './MeetingDocument'
import type { MeetingExporterProps } from './types'

export function MeetingPdfExport({ fileName = '회의록', ...data }: MeetingExporterProps) {
  return (
    <PDFDownloadLink
      className="btn btn--primary"
      style={{ textDecoration: 'none' }}
      document={<MeetingDocument {...data} />}
      fileName={`${fileName}.pdf`}
    >
      {({ loading, error }) =>
        error
          ? 'PDF 생성 실패'
          : loading
            ? 'PDF 생성 중…'
            : 'PDF 다운로드'
      }
    </PDFDownloadLink>
  )
}
