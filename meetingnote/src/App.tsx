import { ActiveExporter } from './meeting'
import './App.css'

// 팀원 모듈이 채워줄 값. 지금은 샘플 데이터로 테스트.
const SAMPLE = {
  title: '주간 기획 회의',
  date: '2026-07-28 14:00',
  summary:
    '음성 인식 파이프라인 우선순위를 확정. 프론트는 PDF 출력 담당, 백엔드는 요약 API 연동. 다음 회의 전까지 통합 테스트 준비.',
  transcript:
    '오늘 회의에서는 음성에서 변환된 텍스트와 요약본을 문서로 출력하는 기능을 논의했습니다. ' +
    'PDF 형식으로 출력하되 한글이 깨지지 않도록 나눔고딕 폰트를 임베딩하기로 했습니다. ' +
    '데이터는 팀원 모듈에서 props 형태로 전달받아 처리합니다.',
}

function App() {
  return (
    <main style={{ maxWidth: 640, margin: '48px auto', padding: '0 16px' }}>
      <h1>회의록 PDF 출력</h1>
      <p>음성 변환 텍스트 + 요약본 → PDF 문서</p>
      <ActiveExporter {...SAMPLE} fileName={SAMPLE.title} />
    </main>
  )
}

export default App
