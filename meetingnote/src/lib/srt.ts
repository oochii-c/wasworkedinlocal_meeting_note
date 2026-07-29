// backend writer.py의 SRT 로직을 클라이언트로 포팅.
// segments(초 단위)를 SRT 자막 문자열로 만들고 파일로 내려받는다.
import type { TranscriptSegment } from './api'

/** 초 → "HH:MM:SS,mmm" (SRT 타임코드) */
export function srtTimestamp(seconds: number): string {
  let ms = Math.round(seconds * 1000)
  const h = Math.floor(ms / 3_600_000)
  ms -= h * 3_600_000
  const m = Math.floor(ms / 60_000)
  ms -= m * 60_000
  const s = Math.floor(ms / 1000)
  ms -= s * 1000
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${p2(h)}:${p2(m)}:${p2(s)},${String(ms).padStart(3, '0')}`
}

/** segments → SRT 본문 */
export function buildSrt(segments: TranscriptSegment[]): string {
  return (
    segments
      .map((seg, i) => {
        const start = srtTimestamp(seg.start)
        const end = srtTimestamp(seg.end)
        return `${i + 1}\n${start} --> ${end}\n${seg.text.trim()}\n`
      })
      .join('\n') + '\n'
  )
}

/** 텍스트를 파일로 내려받기 */
export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
