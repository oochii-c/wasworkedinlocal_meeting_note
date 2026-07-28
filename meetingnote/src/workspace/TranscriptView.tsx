interface Props {
  transcript: string
  onChange: (text: string) => void
}

// [공용] 변환 결과 표시 + 수동 편집. STT 미구현 동안 직접 입력해 테스트 가능.
export function TranscriptView({ transcript, onChange }: Props) {
  return (
    <section>
      <h2>3. 변환 텍스트</h2>
      <textarea
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="변환된 텍스트가 여기 표시됩니다 (직접 입력도 가능)"
        style={{ width: '100%' }}
      />
    </section>
  )
}
