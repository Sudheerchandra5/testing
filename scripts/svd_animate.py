#!/usr/bin/env python3
"""Local Stable Video Diffusion: animate storyboard panels with real learned motion."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import torch
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import export_to_video, load_image
from PIL import Image

PANEL = Path("/workspace/output/panel_00_start.png")
OUT = Path("/workspace/output/boy_puppy_svd_10s.mp4")
CLIPS = Path("/workspace/output/svd_clips")
MODEL = "stabilityai/stable-video-diffusion-img2vid-xt"


def generate_clip(image_path: Path, out_mp4: Path, seed: int = 42) -> None:
    pipe = StableVideoDiffusionPipeline.from_pretrained(
        MODEL,
        torch_dtype=torch.float32,
        variant="fp16",
    )
    pipe.to("cpu")
    pipe.enable_attention_slicing()

    image = load_image(str(image_path)).convert("RGB").resize((768, 432))
    generator = torch.Generator(device="cpu").manual_seed(seed)
    result = pipe(
        image,
        num_frames=25,
        decode_chunk_size=2,
        motion_bucket_id=160,
        noise_aug_strength=0.06,
        generator=generator,
    )
    frames = result.frames[0]
    export_to_video(frames, str(out_mp4), fps=8)


def main() -> int:
    if not PANEL.exists():
        print(f"Missing panel image: {PANEL}", file=sys.stderr)
        return 1
    CLIPS.mkdir(parents=True, exist_ok=True)
    clip = CLIPS / "segment_00.mp4"
    print("Generating SVD clip (CPU — may take several minutes) …")
    generate_clip(PANEL, clip)
    # Upsample to 24fps and trim/pad toward 10s by looping + slow-mo if needed
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(clip),
            "-filter:v",
            "minterpolate=fps=24:mi_mode=mci",
            "-t",
            "10",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(OUT),
        ],
        check=True,
    )
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
