#!/usr/bin/env python3
"""
Animate storyboard keyframes with optical-flow morphing + layered motion overlays.
Produces true frame-to-frame character motion (not Ken Burns).
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

STORYBOARD = Path("/workspace/assets/storyboard_reference.png")
OUT_DIR = Path("/workspace/output")
PANEL_DIR = OUT_DIR / "panels"
VIDEO_PATH = OUT_DIR / "boy_puppy_animated_10s.mp4"

COLS, ROWS = 5, 2
FPS = 24
SEGMENTS = COLS * ROWS
FRAMES_PER_SEGMENT = FPS  # 1 storyboard second each
OUT_W, OUT_H = 1280, 720


def split_panels() -> list[np.ndarray]:
    PANEL_DIR.mkdir(parents=True, exist_ok=True)
    img = np.array(Image.open(STORYBOARD).convert("RGB"))
    h, w = img.shape[:2]
    pw, ph = w // COLS, h // ROWS
    panels: list[np.ndarray] = []
    for row in range(ROWS):
        for col in range(COLS):
            crop = img[row * ph : (row + 1) * ph, col * pw : (col + 1) * pw]
            crop = crop_to_16_9(crop)
            crop = cv2.resize(crop, (OUT_W, OUT_H), interpolation=cv2.INTER_LANCZOS4)
            panels.append(crop)
    return panels


def crop_to_16_9(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    target = OUT_W / OUT_H
    cur = w / h
    if cur > target:
        new_w = int(h * target)
        x0 = (w - new_w) // 2
        return img[:, x0 : x0 + new_w]
    new_h = int(w / target)
    y0 = (h - new_h) // 2
    return img[y0 : y0 + new_h, :]


def to_gray_f32(img: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0


def compute_flow(src: np.ndarray, dst: np.ndarray) -> np.ndarray:
    g0 = to_gray_f32(src)
    g1 = to_gray_f32(dst)
    flow = cv2.calcOpticalFlowFarneback(
        g0, g1, None, 0.5, 5, 15, 3, 5, 1.2, 0
    )
    return flow


def warp_with_flow(img: np.ndarray, flow: np.ndarray, t: float) -> np.ndarray:
    h, w = img.shape[:2]
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    map_x = (grid_x + flow[..., 0] * t).astype(np.float32)
    map_y = (grid_y + flow[..., 1] * t).astype(np.float32)
    return cv2.remap(img, map_x, map_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def smoothstep(t: float) -> float:
    return t * t * (3 - 2 * t)


def morph_pair(
    a: np.ndarray, b: np.ndarray, t: float, flow_ab: np.ndarray, flow_ba: np.ndarray
) -> np.ndarray:
    """Bidirectional flow morph between two key poses (flows precomputed)."""
    t = smoothstep(float(np.clip(t, 0.0, 1.0)))
    wa = warp_with_flow(a, flow_ab, t)
    wb = warp_with_flow(b, flow_ba, 1.0 - t)
    return cv2.addWeighted(wa, 1.0 - t, wb, t, 0)


def add_ball_motion(frame: np.ndarray, seg: int, t: float) -> np.ndarray:
    """Overlay animated red ball for throw/chase segments."""
    if seg > 3:
        return frame
    out = frame.copy()
    # Normalized parabolic path across early beats
    u = (seg + t) / 4.0
    x = int((0.25 + 0.55 * u) * OUT_W)
    y = int((0.55 - 0.25 * u + 0.15 * np.sin(u * np.pi)) * OUT_H)
    cv2.circle(out, (x, y), int(OUT_W * 0.018), (220, 30, 30), -1, lineType=cv2.LINE_AA)
    cv2.circle(out, (x, y), int(OUT_W * 0.018), (255, 255, 255), 2, lineType=cv2.LINE_AA)
    return out


def add_butterfly(frame: np.ndarray, seg: int, t: float) -> np.ndarray:
    if seg < 4 or seg > 5:
        return frame
    out = frame.copy()
    u = t if seg == 4 else t
    x = int((0.55 + 0.08 * np.sin(u * 8)) * OUT_W)
    y = int((0.35 - 0.12 * u) * OUT_H)
    pts = np.array(
        [
            [x - 18, y],
            [x - 6, y - 8],
            [x + 6, y - 8],
            [x + 18, y],
            [x + 6, y + 8],
            [x - 6, y + 8],
        ],
        np.int32,
    )
    cv2.fillPoly(out, [pts], (30, 30, 30))
    cv2.fillPoly(out, [pts], (240, 120, 20))
    return out


def add_leaf_particles(frame: np.ndarray, seg: int, t: float) -> np.ndarray:
    if seg < 6 or seg > 7:
        return frame
    out = frame.copy()
    rng = np.random.default_rng(seg * 1000 + int(t * 100))
    for _ in range(12):
        x = int(rng.uniform(0.2, 0.85) * OUT_W)
        y = int((rng.uniform(0.45, 0.95) + (seg - 6 + t) * 0.05) * OUT_H) % OUT_H
        cv2.circle(out, (x, y), 4, (160, 90, 30), -1)
    return out


def subtle_idle_warp(frame: np.ndarray, seg: int, t: float) -> np.ndarray:
    """Breathing/sway on held poses to avoid static holds."""
    h, w = frame.shape[:2]
    amp = 2.0 + (seg % 3)
    dx = amp * np.sin(2 * np.pi * (t + seg * 0.17))
    dy = amp * 0.5 * np.cos(2 * np.pi * (t + seg * 0.11))
    m = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(frame, m, (w, h), borderMode=cv2.BORDER_REFLECT)


def render_video(panels: list[np.ndarray]) -> None:
    frames_dir = OUT_DIR / "anim_frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    idx = 0
    flows: list[tuple[np.ndarray, np.ndarray]] = []
    for seg in range(SEGMENTS - 1):
        a, b = panels[seg], panels[seg + 1]
        print(f"  optical flow {seg} -> {seg + 1}")
        flows.append((compute_flow(a, b), compute_flow(b, a)))

    for seg in range(SEGMENTS):
        a = panels[seg]
        b = panels[seg + 1] if seg < SEGMENTS - 1 else panels[seg]
        flow_pair = flows[seg] if seg < len(flows) else None
        for f in range(FRAMES_PER_SEGMENT):
            t = f / FRAMES_PER_SEGMENT
            if seg == SEGMENTS - 1:
                frame = subtle_idle_warp(a, seg, t)
            else:
                assert flow_pair is not None
                frame = morph_pair(a, b, t, flow_pair[0], flow_pair[1])
            frame = add_ball_motion(frame, seg, t)
            frame = add_butterfly(frame, seg, t)
            frame = add_leaf_particles(frame, seg, t)
            path = frames_dir / f"frame_{idx:04d}.png"
            cv2.imwrite(str(path), cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
            idx += 1

    cmd = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        str(frames_dir / "frame_%04d.png"),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        str(VIDEO_PATH),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def main() -> int:
    print("Splitting storyboard panels …")
    panels = split_panels()
    print("Rendering flow-morph animation (240 frames) …")
    render_video(panels)
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
