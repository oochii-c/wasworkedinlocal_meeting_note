import Recorder from '../Recorder'

interface Props {
  audioFile: File | null
  onAudio: (file: File) => void
}

// [STT 동료] 녹음(Recorder) + 파일 업로드. 둘 다 onAudio로 오디오 올림.
export function AudioInput({ audioFile, onAudio }: Props) {
  return (
    <>
      <Recorder onAudio={onAudio} />
      <p className="hint">또는 오디오 파일 업로드</p>
      <input
        className="file-input"
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onAudio(f)
        }}
      />
      {audioFile ? <p className="hint">현재 오디오: {audioFile.name}</p> : null}
    </>
  )
}
