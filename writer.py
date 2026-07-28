def _srt_timestamp(seconds: float) -> str:
    ms_total = round(seconds * 1000)
    hours, ms_total = divmod(ms_total, 3_600_000)
    minutes, ms_total = divmod(ms_total, 60_000)
    secs, ms = divmod(ms_total, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"


def write_txt(text: str, out_path: str) -> None:
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text.strip() + "\n")


def write_srt(segments: list[dict], out_path: str) -> None:
    lines = []
    for i, seg in enumerate(segments, start=1):
        start = _srt_timestamp(seg["start"])
        end = _srt_timestamp(seg["end"])
        text = seg["text"].strip()
        lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
