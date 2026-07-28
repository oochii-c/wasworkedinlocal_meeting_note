import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Upload, Play, Pause, Trash2, FileAudio } from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

function formatTime(sec) {
  if (!isFinite(sec)) return "00:00";
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ---- Live VU-style bars driven by an AnalyserNode ----
function LevelMeter({ analyser, active }) {
  const barsRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active || !analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const bars = barsRef.current?.children;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      if (bars) {
        const n = bars.length;
        for (let i = 0; i < n; i++) {
          const idx = Math.floor((i / n) * data.length * 0.6);
          const v = data[idx] / 255;
          bars[i].style.transform = `scaleY(${Math.max(0.06, v)})`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, analyser]);

  return (
    <div ref={barsRef} className="flex items-end gap-[3px] h-10 w-full">
      {Array.from({ length: 28 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm origin-bottom transition-none"
          style={{
            height: "100%",
            background: "linear-gradient(to top, #D64545, #E8A33D)",
            transform: "scaleY(0.06)",
          }}
        />
      ))}
    </div>
  );
}

export default function VoiceIntake() {
  const [clips, setClips] = useState([]);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);
  const startRef = useRef(0);
  const audioElRef = useRef(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close?.();
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setClips((prev) => [
          {
            id: uid(),
            name: `Take ${prev.filter((c) => c.source === "recording").length + 1}`,
            url,
            source: "recording",
            duration: elapsedRef.current,
            createdAt: Date.now(),
          },
          ...prev,
        ]);
        stopStream();
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      startRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - startRef.current) / 1000);
      }, 100);
    } catch (err) {
      setError("Microphone access was denied or unavailable.");
    }
  };

  const elapsedRef = useRef(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("audio/"));
    if (files.length === 0) {
      setError("Only audio files are accepted.");
      return;
    }
    setError("");
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const tempAudio = new Audio(url);
      tempAudio.addEventListener("loadedmetadata", () => {
        setClips((prev) => [
          {
            id: uid(),
            name: file.name,
            url,
            source: "upload",
            duration: tempAudio.duration,
            createdAt: Date.now(),
          },
          ...prev,
        ]);
      });
    });
  }, []);

  const togglePlay = (clip) => {
    const el = audioElRef.current;
    if (!el) return;
    if (playingId === clip.id) {
      el.pause();
      setPlayingId(null);
    } else {
      el.src = clip.url;
      el.play();
      setPlayingId(clip.id);
    }
  };

  const deleteClip = (id) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (playingId === id) {
      audioElRef.current?.pause();
      setPlayingId(null);
    }
  };

  return (
    <div
      className="min-h-full w-full flex items-center justify-center p-6"
      style={{
        background: "#14110F",
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#F2EDE4",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <audio
        ref={audioElRef}
        onEnded={() => setPlayingId(null)}
        className="hidden"
      />

      <div className="w-full max-w-xl">
        {/* Header / signature counter */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#F2EDE4" }}>
              Voice Intake
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8C8378" }}>
              Record straight from the mic, or drop in an audio file.
            </p>
          </div>
          <div
            className="text-3xl tabular-nums px-3 py-1 rounded-md border"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: recording ? "#E8A33D" : "#5A5347",
              borderColor: "#2A251F",
              background: "#1E1A16",
            }}
          >
            {formatTime(elapsed)}
          </div>
        </div>

        {/* Recorder console */}
        <div
          className="rounded-2xl p-5 mb-5 border"
          style={{ background: "#1E1A16", borderColor: "#2A251F" }}
        >
          <LevelMeter analyser={analyserRef.current} active={recording} />

          <div className="flex items-center justify-center mt-5">
            <button
              onClick={recording ? stopRecording : startRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-transform active:scale-95"
              style={{
                background: recording ? "#D64545" : "#E8A33D",
                color: "#14110F",
              }}
            >
              {recording ? (
                <>
                  <Square size={18} fill="#14110F" /> Stop recording
                </>
              ) : (
                <>
                  <Mic size={18} /> Start recording
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload dropzone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 mb-5 cursor-pointer transition-colors"
          style={{
            borderColor: dragOver ? "#E8A33D" : "#2A251F",
            background: dragOver ? "rgba(232,163,61,0.06)" : "transparent",
          }}
        >
          <Upload size={22} style={{ color: "#8C8378" }} />
          <span className="text-sm" style={{ color: "#8C8378" }}>
            Drop an audio file here, or click to browse
          </span>
          <input
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {error && (
          <p className="text-sm mb-4" style={{ color: "#D64545" }}>
            {error}
          </p>
        )}

        {/* Clip list */}
        <div className="space-y-2">
          {clips.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: "#5A5347" }}>
              No clips yet. Recordings and uploads will show up here.
            </p>
          )}
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2 border"
              style={{ background: "#1E1A16", borderColor: "#2A251F" }}
            >
              <button
                onClick={() => togglePlay(clip)}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "#2A251F", color: "#E8A33D" }}
              >
                {playingId === clip.id ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <FileAudio size={16} style={{ color: "#5A5347" }} className="shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{clip.name}</p>
                <p
                  className="text-xs"
                  style={{ color: "#5A5347", fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {clip.source === "recording" ? "recorded" : "uploaded"} · {formatTime(clip.duration)}
                </p>
              </div>

              <button
                onClick={() => deleteClip(clip.id)}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "#8C8378" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D64545")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8C8378")}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
