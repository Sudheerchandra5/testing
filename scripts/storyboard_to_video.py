#!/usr/bin/env python3
"""Split a 5x2 storyboard into panels and render a 10s animated video via ffmpeg."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from PIL import Image

STORYBOARD = Path(
    "/home/ubuntu/.cursor/projects/workspace/assets/9fcf8207-831e-422a-88a4-71464e154963.png"
)
OUT_DIR = Path("/workspace/output")
FRAMES_DIR = OUT_DIR / "panels"
VIDEO_PATH = OUT_DIR / "boy_puppy_10s.mp4"

COLS, ROWS = 5, 2
FPS = 30
XFADE_SEC = 0.15
PANEL_COUNT = COLS * ROWS
# Each panel is 1 storyboard second; crossfades overlap, so extend clip length.
PANEL_SEC = (PANEL_COUNT + (PANEL_COUNT - 1) * XFADE_SEC) / PANEL_COUNT
OUT_W, OUT_H = 1920, 1080


def split_panels() -> list[Path]:
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.open(STORYBOARD).convert("RGB")
    w, h = img.size
    pw, ph = w // COLS, h // ROWS
    paths: list[Path] = []
    idx = 0
    for row in range(ROWS):
        for col in range(COLS):
            box = (col * pw, row * ph, (col + 1) * pw, (row + 1) * ph)
            panel = img.crop(box)
            # Slight upscale crop to 16:9 center for cinematic framing
            target_aspect = OUT_W / OUT_H
            pw2, ph2 = panel.size
            cur = pw2 / ph2
            if cur > target_aspect:
                new_w = int(ph2 * target_aspect)
                left = (pw2 - new_w) // 2
                panel = panel.crop((left, 0, left + new_w, ph2))
            else:
                new_h = int(pw2 / target_aspect)
                top = (ph2 - new_h) // 2
                panel = panel.crop((0, top, pw2, top + new_h))
            out = FRAMES_DIR / f"panel_{idx:02d}.png"
            panel.resize((OUT_W, OUT_H), Image.Resampling.LANCZOS).save(out, optimize=True)
            paths.append(out)
            idx += 1
    return paths


def render_panel_clip(panel: Path, clip_path: Path, zoom_dir: str) -> None:
    frames = int(PANEL_SEC * FPS)
    # Ken Burns: slow zoom while panning slightly
    z_expr = f"if(lte(zoom,1.0),1.0,max(1.001,zoom-0.0015))" if zoom_dir == "out" else "min(zoom+0.0012,1.08)"
    if zoom_dir == "out":
        vf = (
            f"scale={OUT_W*2}:{OUT_H*2},"
            f"zoompan=z='{z_expr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={frames}:s={OUT_W}x{OUT_H}:fps={FPS},"
            f"format=yuv420p"
        )
    else:
        vf = (
            f"scale={OUT_W*2}:{OUT_H*2},"
            f"zoompan=z='{z_expr}':x='iw/2-(iw/zoom/2)+on*0.3':y='ih/2-(ih/zoom/2)':"
            f"d={frames}:s={OUT_W}x{OUT_H}:fps={FPS},"
            f"format=yuv420p"
        )
    cmd = [
        "ffmpeg",
        "-y",
        "-loop",
        "1",
        "-i",
        str(panel),
        "-vf",
        vf,
        "-t",
        str(PANEL_SEC),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        str(clip_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def concat_with_xfade(clips: list[Path], out: Path) -> None:
    if len(clips) == 1:
        clips[0].rename(out)
        return

    # Chain xfade filters; offset accumulates per segment
    inputs: list[str] = []
    for c in clips:
        inputs.extend(["-i", str(c)])

    n = len(clips)
    segment = PANEL_SEC - XFADE_SEC  # time between fade starts
    filter_parts: list[str] = []
    prev = "[0:v]"
    for i in range(1, n):
        offset = i * segment
        out_label = f"[v{i}]" if i < n - 1 else "[vout]"
        filter_parts.append(
            f"{prev}[{i}:v]xfade=transition=fade:duration={XFADE_SEC}:offset={offset:.3f}{out_label}"
        )
        prev = out_label

    filter_complex = ";".join(filter_parts)
    cmd = [
        "ffmpeg",
        "-y",
        *inputs,
        "-filter_complex",
        filter_complex,
        "-map",
        "[vout]",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-r",
        str(FPS),
        str(out),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    panels = split_panels()
    clips_dir = OUT_DIR / "clips"
    clips_dir.mkdir(exist_ok=True)
    clips: list[Path] = []
    for i, panel in enumerate(panels):
        clip = clips_dir / f"clip_{i:02d}.mp4"
        zoom_dir = "in" if i % 2 == 0 else "out"
        print(f"Rendering clip {i + 1}/10 …")
        render_panel_clip(panel, clip, zoom_dir)
        clips.append(clip)
    print("Concatenating with crossfades …")
    concat_with_xfade(clips, VIDEO_PATH)
    # Verify duration
    probe = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(VIDEO_PATH),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    print(f"Done: {VIDEO_PATH} ({float(probe.stdout.strip()):.2f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
