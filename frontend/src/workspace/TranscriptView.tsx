interface Props {
  transcript: string
  onChange: (text: string) => void
}

// [공용] 변환 결과 표시 + 수동 편집. STT 미구현 동안 직접 입력해 테스트 가능.
export function TranscriptView({ transcript, onChange }: Props) {
  return (
    <textarea
      className="field"
      value={transcript}
      onChange={(e) => onChange(e.target.value)}
      rows={8}
      placeholder="변환된 텍스트가 여기 표시됩니다. 직접 입력해 편집할 수도 있어요."
    />
  )
}
