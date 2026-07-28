interface Props {
  audioFile: File | null
  onTranscript: (text: string) => void
}

// [STT 동료] audioFile → transcript.
// TODO: Whisper(@huggingface/transformers) 연결 후 onTranscript(결과) 호출.
export function TranscribePanel({ audioFile, onTranscript }: Props) {
  return (
    <section>
      <h2>2. 텍스트 변환 (STT)</h2>
      <button
        type="button"
        disabled={!audioFile}
        onClick={() => {
          // TODO(STT): audioFile을 Whisper로 변환하고 결과를 아래로 전달
          onTranscript('') // placeholder — 구현 시 실제 변환 텍스트
        }}
      >
        변환 실행
      </button>
      {!audioFile ? <p>오디오 먼저 선택</p> : null}
    </section>
  )
}
