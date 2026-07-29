// 백엔드(Flask) 호출. STT/요약 제공자는 서버에서 결정, 키도 서버측.
// 브라우저는 우리 백엔드만 부름 = 키 노출 없음.

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:5000'

async function readError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null)
  return data?.error ?? `요청 실패 (${res.status})`
}

/** transcript 한 구간 (초 단위 시작/끝 + 텍스트) */
export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export interface TranscribeResult {
  text: string
  segments: TranscriptSegment[]
}

/** 오디오 파일 → 텍스트 + 타임스탬프 segments (제공자에 따라 segments 비어있을 수 있음) */
export async function transcribeAudio(file: File): Promise<TranscribeResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/transcribe`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  return {
    text: (data.text ?? '').trim(),
    segments: Array.isArray(data.segments) ? data.segments : [],
  }
}

export interface SummaryResult {
  summary: string
  actionItems: string[]
}

/** 텍스트 → 요약 + 액션 아이템 */
export async function summarize(transcript: string): Promise<SummaryResult> {
  const res = await fetch(`${BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: transcript }),
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  return parseSummary(data.result ?? '')
}

/** LLM 출력([요약]/[할 일])을 summary + actionItems로 분리 */
export function parseSummary(text: string): SummaryResult {
  const todoIdx = text.search(/\[?\s*할\s*일\s*\]?/)
  const summaryPart = todoIdx >= 0 ? text.slice(0, todoIdx) : text
  const todoPart = todoIdx >= 0 ? text.slice(todoIdx) : ''

  const summary = summaryPart.replace(/\[?\s*요약\s*\]?/, '').trim()
  const actionItems = todoPart
    .replace(/\[?\s*할\s*일\s*\]?/, '')
    .split('\n')
    .map((l) => l.replace(/^[\s\-*•·]+/, '').trim())
    .filter((l) => l && l !== '없음')

  return { summary, actionItems }
}
