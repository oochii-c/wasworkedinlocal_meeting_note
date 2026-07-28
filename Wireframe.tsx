// 회의록 자동화 시스템 — 화면 와이어프레임 (붙여넣기용)
// index.css 토큰(--ink, --paper, --surface, --line, --signal, --rec) 사용 전제

import type { CSSProperties } from "react";

const wrap: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 20,
  padding: 24,
  fontFamily: "var(--sans)",
  color: "var(--text)",
};

const frame: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  aspectRatio: "9 / 15",
  display: "flex",
  flexDirection: "column",
  padding: 16,
  gap: 12,
};

const label: CSSProperties = {
  fontFamily: "var(--display)",
  fontWeight: 700,
  fontSize: 14,
  margin: "0 0 4px",
};

const box: CSSProperties = {
  border: "1.5px dashed var(--line-strong)",
  borderRadius: 4,
  padding: "8px 10px",
  fontFamily: "var(--mono)",
  fontSize: 11,
  color: "var(--muted)",
};

const btnPrimary: CSSProperties = {
  background: "var(--ink)",
  color: "var(--surface)",
  borderRadius: 4,
  padding: 10,
  textAlign: "center",
  fontWeight: 700,
  fontSize: 12,
};

const btnGhost: CSSProperties = {
  border: "1.5px solid var(--line-strong)",
  borderRadius: 4,
  padding: 8,
  textAlign: "center",
  fontSize: 11.5,
  fontWeight: 600,
};

function RecordScreen() {
  return (
    <div style={frame}>
      <p style={label}>새 회의</p>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ ...btnPrimary, flex: 1 }}>
          <span style={{ color: "var(--rec)" }}>●</span> 녹음 시작
        </div>
        <div style={{ ...btnGhost, flex: 1 }}>⇧ 업로드</div>
      </div>
      <div style={box}>담당: 담당 A · [녹음 or 업로드]</div>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 22,
          textAlign: "center",
          marginTop: "auto",
        }}
      >
        14:32
      </div>
      <div style={{ ...btnGhost, color: "var(--rec)", borderColor: "var(--rec)" }}>
        ■ 종료 및 정리
      </div>
    </div>
  );
}

function ProcessingScreen() {
  const steps = [
    { label: "오디오 업로드 완료", done: true },
    { label: "STT 변환 중 (담당 B)", done: false, active: true },
    { label: "핵심 요약 생성 (담당 C)", done: false },
    { label: "회의록 화면 준비 (담당 D)", done: false },
  ];
  return (
    <div style={frame}>
      <p style={label}>정리하는 중…</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                border: `1.5px solid ${s.done || s.active ? "var(--signal)" : "var(--line-strong)"}`,
                background: s.done ? "var(--signal)" : "transparent",
                flexShrink: 0,
              }}
            />
            <span style={{ color: s.done || s.active ? "var(--text)" : "var(--muted)" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div style={box}>예상 소요: 약 5분</div>
      <div style={{ ...btnGhost, marginTop: "auto" }}>다른 작업 하기 (완료 시 알림)</div>
    </div>
  );
}

function DetailScreen() {
  return (
    <div style={frame}>
      <p style={label}>주간 회의 · 7/28(월)</p>
      <div style={{ display: "flex", gap: 4 }}>
        {["요약", "전체 텍스트", "액션 아이템"].map((t, i) => (
          <div
            key={t}
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "var(--mono)",
              fontSize: 10,
              padding: "6px 4px",
              border: `1px solid ${i === 0 ? "var(--signal)" : "var(--line-strong)"}`,
              color: i === 0 ? "var(--signal)" : "var(--muted)",
              fontWeight: i === 0 ? 700 : 400,
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[90, 80, 60, 70].map((w, i) => (
          <div
            key={i}
            style={{ height: 6, width: `${w}%`, background: "var(--line-strong)", opacity: 0.5, borderRadius: 2 }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {["API 명세 초안 - 담당 B", "디자인 리뷰 - 담당 C"].map((c) => (
          <span
            key={c}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9.5,
              padding: "4px 7px",
              background: "var(--signal-soft)",
              borderRadius: 100,
              color: "var(--text)",
            }}
          >
            ☐ {c}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <div style={{ ...btnGhost, flex: 1 }}>⇩ PDF</div>
        <div style={{ ...btnPrimary, flex: 1 }}>공유</div>
      </div>
    </div>
  );
}

export default function Wireframe() {
  return (
    <div style={wrap}>
      <div>
        <p style={{ ...label, fontSize: 13 }}>① 녹음</p>
        <RecordScreen />
      </div>
      <div>
        <p style={{ ...label, fontSize: 13 }}>② 처리중</p>
        <ProcessingScreen />
      </div>
      <div>
        <p style={{ ...label, fontSize: 13 }}>③ 회의록 상세</p>
        <DetailScreen />
      </div>
    </div>
  );
}
