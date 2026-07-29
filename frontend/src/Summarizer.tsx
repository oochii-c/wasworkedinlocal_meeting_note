import { useState } from "react";

function Summarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch("http://localhost:5000/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "meeting_summary.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
    setDownloading(false);
  };

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setSummary("에러가 발생했습니다.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>회의록 요약</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="회의록을 여기에 붙여넣으세요"
        rows={10}
        style={{ width: "100%" }}
      />
      <br />
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? "요약 중..." : "요약하기"}
      </button>
      {summary && (
        <div>
          <h3>요약 결과</h3>
          <p>{summary}</p>
          <button onClick={handleDownloadPdf} disabled={downloading}>
            {downloading ? "PDF 생성 중..." : "PDF 다운로드"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Summarizer;