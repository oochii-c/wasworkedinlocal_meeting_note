import { Document, Page, Text, StyleSheet, Font } from '@react-pdf/renderer'
import NanumRegular from '../assets/fonts/NanumGothic-Regular.ttf'
import NanumBold from '../assets/fonts/NanumGothic-Bold.ttf'
import type { MeetingDocData } from './types'

Font.register({
  family: 'NanumGothic',
  fonts: [
    { src: NanumRegular, fontWeight: 'normal' },
    { src: NanumBold, fontWeight: 'bold' },
  ],
})

// 한글 자동 줄바꿈: @react-pdf는 공백 없는 긴 문자열을 못 쪼갬. 글자 사이 분할 허용.
Font.registerHyphenationCallback((word) => Array.from(word).flatMap((c) => [c, '']))

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NanumGothic',
    fontSize: 11,
    lineHeight: 1.5,
    paddingVertical: 48,
    paddingHorizontal: 44,
    color: '#1a1a1a',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 10, color: '#666', marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  body: { fontSize: 11, textAlign: 'justify' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
})

export function MeetingDocument({ title, date, transcript, summary }: MeetingDocData) {
  return (
    <Document title={title ?? '회의록'}>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>{title ?? '회의록'}</Text>
        {date ? <Text style={styles.meta}>{date}</Text> : null}

        <Text style={styles.sectionTitle}>요약</Text>
        <Text style={styles.body}>{summary || '요약 없음'}</Text>

        <Text style={styles.sectionTitle}>전체 내용</Text>
        <Text style={styles.body}>{transcript || '내용 없음'}</Text>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
