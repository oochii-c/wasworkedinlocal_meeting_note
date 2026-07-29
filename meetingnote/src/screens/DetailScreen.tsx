import { useState } from 'react'
import { ActiveExporter } from '../meeting'
import type { MeetingState } from '../workspace/types'
import { buildSrt, downloadText } from '../lib/srt'

/** 초 → "MM:SS" (화면 표시용, 시간 단위는 있을 때만) */
function clock(seconds: number): string {
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const p2 = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${p2(m)}:${p2(s)}` : `${m}:${p2(s)}`
}

interface Props {
  meeting: MeetingState
  patch: (p: Partial<MeetingState>) => void
  onNew: () => void
}

type Tab = 'summary' | 'transcript' | 'actions'

const TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: '요약' },
  { id: 'transcript', label: '전체 텍스트' },
  { id: 'actions', label: '액션 아이템' },
]

// 화면 ③ 완성된 회의록. 탭으로 열람 + PDF/공유.
export function DetailScreen({ meeting, patch, onNew }: Props) {
  const [tab, setTab] = useState<Tab>('summary')
  const [draft, setDraft] = useState('')

  const addAction = () => {
    const v = draft.trim()
    if (!v) return
    patch({ actionItems: [...meeting.actionItems, v] })
    setDraft('')
  }
  const removeAction = (i: number) =>
    patch({ actionItems: meeting.actionItems.filter((_, idx) => idx !== i) })

  return (
    <main className="app">
      <header className="masthead masthead--tight">
        <button className="backlink" onClick={onNew}>
          ← 새 회의
        </button>
        <h2 className="screen-title">{meeting.title || '회의록'}</h2>
        {meeting.date ? <p className="hint">{meeting.date}</p> : null}
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className="tab"
            data-active={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card tab-panel">
        {tab === 'summary' && (
          <p className="doc-text">{meeting.summary || '요약이 아직 없어요.'}</p>
        )}
        {tab === 'transcript' &&
          (meeting.segments.length > 0 ? (
            <ul className="seg-list">
              {meeting.segments.map((seg, i) => (
                <li key={i} className="seg-item">
                  <span className="seg-time">{clock(seg.start)}</span>
                  <span className="seg-text">{seg.text.trim()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="doc-text">{meeting.transcript || '변환 텍스트가 없어요.'}</p>
          ))}
        {tab === 'actions' && (
          <>
            <div className="chips">
              {meeting.actionItems.length === 0 ? (
                <p className="hint">아직 액션 아이템이 없어요. 아래에서 추가하세요.</p>
              ) : (
                meeting.actionItems.map((a, i) => (
                  <span key={i} className="chip">
                    ☐ {a}
                    <button
                      className="chip__x"
                      aria-label="삭제"
                      onClick={() => removeAction(i)}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="chip-add">
              <input
                className="field"
                placeholder="할 일 - 담당자"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAction()}
              />
              <button className="btn" onClick={addAction}>
                추가
              </button>
            </div>
          </>
        )}
      </div>

      <div className="detail-foot">
        <ActiveExporter
          title={meeting.title || '회의록'}
          date={meeting.date}
          transcript={meeting.transcript}
          summary={meeting.summary}
          fileName={meeting.title || '회의록'}
        />
        {meeting.segments.length > 0 ? (
          <button
            className="btn"
            onClick={() =>
              downloadText(
                `${meeting.title || '회의록'}.srt`,
                buildSrt(meeting.segments),
              )
            }
          >
            SRT 저장
          </button>
        ) : null}
        <button
          className="btn"
          disabled={!meeting.transcript.trim()}
          onClick={() =>
            downloadText(
              `${meeting.title || '회의록'}.txt`,
              meeting.transcript.trim() + '\n',
            )
          }
        >
          TXT 저장
        </button>
        <button
          className="btn btn--primary"
          onClick={() => {
            // TODO(공유): 링크 생성/공유 연동
          }}
        >
          공유
        </button>
      </div>
    </main>
  )
}
