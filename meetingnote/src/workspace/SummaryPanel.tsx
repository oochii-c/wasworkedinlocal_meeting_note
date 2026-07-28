interface Props {
  transcript: string
  summary: string
  onSummary: (text: string) => void
}

// [요약 동료] transcript → summary.
// TODO: 요약 API 연결 후 onSummary(결과) 호출. 그 전엔 수동 입력으로 테스트.
export function SummaryPanel({ transcript, summary, onSummary }: Props) {
  return (
    <section>
      <h2>4. 요약</h2>
      <button
        type="button"
        disabled={!transcript}
        onClick={() => {
          // TODO(요약): transcript를 요약 API로 보내고 결과를 전달
          onSummary('') // placeholder — 구현 시 실제 요약본
        }}
      >
        요약 생성
      </button>
      <textarea
        value={summary}
        onChange={(e) => onSummary(e.target.value)}
        rows={4}
        placeholder="요약본 (직접 입력도 가능)"
        style={{ width: '100%' }}
      />
    </section>
  )
}
