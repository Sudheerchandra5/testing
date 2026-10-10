#!/usr/bin/env python3
"""
Generate a real image-to-video animation (moving characters) from the storyboard.

Requires one of:
  - REPLICATE_API_TOKEN  → Kling image-to-video (best quality)
  - HF_TOKEN             → Hugging Face ZeroGPU Wan Space (free tier, may queue)

Falls back to flow-morph between storyboard keyframes if no API credentials are set.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

STORYBOARD = Path("/workspace/assets/storyboard_reference.png")
START_PANEL = Path("/workspace/output/panel_00_start.png")
OUT = Path("/workspace/output/boy_puppy_real_10s.mp4")


def ensure_start_panel() -> Path:
    from PIL import Image

    if START_PANEL.exists():
        return START_PANEL
    img = Image.open(STORYBOARD).convert("RGB")
    w, h = img.size
    pw, ph = w // 5, h // 2
    panel = img.crop((0, 0, pw, ph))
    START_PANEL.parent.mkdir(parents=True, exist_ok=True)
    panel.save(START_PANEL)
    return START_PANEL


def via_replicate(image: Path) -> Path | None:
    token = os.environ.get("REPLICATE_API_TOKEN")
    if not token:
        return None
    import replicate

    prompt = (
        "Pixar-style 3D animation: boy throws red ball, puppy runs with bouncing legs and "
        "flopping ears, playful backyard, smooth natural character motion, cinematic."
    )
    print("Calling Replicate Kling image-to-video …")
    out = replicate.run(
        "kwaivgi/kling-v2.1:master",
        input={
            "prompt": prompt,
            "start_image": open(image, "rb"),
            "duration": 10,
            "aspect_ratio": "16:9",
        },
    )
    clip = Path("/workspace/output/i2v_replicate.mp4")
    clip.write_bytes(out.read())  # type: ignore[attr-defined]
    return clip


def via_hf_wan(image: Path) -> Path | None:
    from gradio_client import Client, handle_file

    token = os.environ.get("HF_TOKEN")
    print("Calling Hugging Face Wan2.2 Space …")
    client = Client("zerogpu-aoti/wan2-2-fp8da-aoti-faster", hf_token=token)
    video_path, _seed = client.predict(
        handle_file(str(image)),
        (
            "Pixar 3D boy throws red ball; puppy chases with running legs, butterfly, "
            "autumn leaves, hug — smooth character animation, sunny backyard."
        ),
        8,
        "static, frozen, blurry, low quality, watermark",
        5,
        3.5,
        3.5,
        42,
        False,
        api_name="/generate_video",
    )
    clip = Path("/workspace/output/i2v_wan.mp4")
    clip.write_bytes(Path(video_path).read_bytes())
    return clip


def via_flow_morph() -> Path:
    print("No API token — using flow-morph keyframe animation …")
    subprocess.run([sys.executable, "/workspace/scripts/flow_character_animation.py"], check=True)
    return Path("/workspace/output/boy_puppy_animated_10s.mp4")


def pad_or_trim(src: Path, seconds: float = 10.0) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-vf",
            f"fps=24,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2",
            "-t",
            str(seconds),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(OUT),
        ],
        check=True,
        capture_output=True,
    )


def main() -> int:
    if not STORYBOARD.exists():
        print(f"Missing storyboard: {STORYBOARD}", file=sys.stderr)
        return 1
    image = ensure_start_panel()
    clip = via_replicate(image) or via_hf_wan(image)
    if clip is None:
        clip = via_flow_morph()
    pad_or_trim(clip)
    print(f"Output: {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
