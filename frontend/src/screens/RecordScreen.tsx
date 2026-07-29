import { AudioInput } from '../workspace/AudioInput'
import type { MeetingState } from '../workspace/types'

interface Props {
  meeting: MeetingState
  patch: (p: Partial<MeetingState>) => void
  onNext: () => void
}

// 화면 ① 녹음/업로드 → "정리 시작"으로 처리중 화면 이동.
export function RecordScreen({ meeting, patch, onNext }: Props) {
  const hasAudio = meeting.audioFile !== null

  return (
    <main className="app">
      <header className="masthead">
        <p className="eyebrow">Voice → Document</p>
        <h1>
          meeting_<em>note</em>
        </h1>
        <input
          className="title-field"
          placeholder="회의 제목을 입력하세요"
          value={meeting.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </header>

      <div className="card card--console">
        <AudioInput
          audioFile={meeting.audioFile}
          onAudio={(f) => patch({ audioFile: f })}
        />
      </div>

      <button
        type="button"
        className="btn btn--primary btn--wide"
        disabled={!hasAudio}
        onClick={onNext}
      >
        정리 시작 →
      </button>
      {!hasAudio ? (
        <p className="hint center">녹음하거나 오디오 파일을 올리면 시작할 수 있어요</p>
      ) : null}
    </main>
  )
}
