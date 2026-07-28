interface Props {
  audioFile: File | null
  onAudio: (file: File) => void
}

// [STT 동료] 녹음 기능은 여기 확장. 지금은 파일 업로드만.
export function AudioInput({ audioFile, onAudio }: Props) {
  return (
    <section>
      <h2>1. 오디오 입력</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onAudio(f)
        }}
      />
      {audioFile ? <p>선택됨: {audioFile.name}</p> : null}
    </section>
  )
}
