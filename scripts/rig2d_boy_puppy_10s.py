#!/usr/bin/env python3
"""Keyframed 2.5D character animation (moving limbs) rendered to 10s MP4."""

from __future__ import annotations

import math
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

import pygame

OUT = Path("/workspace/output/boy_puppy_rig2d_10s.mp4")
FRAMES_DIR = Path("/workspace/output/rig2d_frames")
W, H = 1280, 720
FPS = 24
DURATION = 10
NFRAMES = FPS * DURATION


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease(t: float) -> float:
    return t * t * (3 - 2 * t)


def sample(keys: list[tuple[float, float]], time_s: float) -> float:
    if time_s <= keys[0][0]:
        return keys[0][1]
    if time_s >= keys[-1][0]:
        return keys[-1][1]
    for i in range(len(keys) - 1):
        t0, v0 = keys[i]
        t1, v1 = keys[i + 1]
        if t0 <= time_s <= t1:
            u = ease((time_s - t0) / (t1 - t0))
            return lerp(v0, v1, u)
    return keys[-1][1]


@dataclass
class Rig:
    x: float
    y: float
    body_rot: float = 0.0
    arm_r: float = -0.4
    arm_l: float = 0.4
    leg_r: float = 0.2
    leg_l: float = -0.2
    head_tilt: float = 0.0


@dataclass
class Pup:
    x: float
    y: float
    body_y: float = 0.0
    leg_phase: float = 0.0
    jump: float = 0.0
    roll: float = 0.0


def draw_background(surf: pygame.Surface) -> None:
    for y in range(H):
        t = y / H
        c = (
            int(lerp(120, 180, t)),
            int(lerp(190, 230, t)),
            int(lerp(255, 255, t)),
        )
        pygame.draw.line(surf, c, (0, y), (W, y))
    pygame.draw.rect(surf, (55, 150, 55), (0, H * 0.62, W, H * 0.38))
    pygame.draw.rect(surf, (230, 190, 60), (W * 0.62, H * 0.28, W * 0.25, H * 0.22))
    pygame.draw.rect(surf, (240, 240, 240), (W * 0.62, H * 0.36, W * 0.25, H * 0.08))
    for i in range(8):
        pygame.draw.rect(surf, (120, 80, 45), (80 + i * 140, H * 0.45, 12, H * 0.25))


def draw_boy(surf: pygame.Surface, rig: Rig) -> None:
    cx, cy = int(rig.x), int(rig.y)
    skin = (235, 190, 155)
    shirt = (245, 245, 250)
    shorts = (40, 90, 200)
    hair = (45, 28, 18)

    def limb(x1, y1, length, angle, color, width=14):
        x2 = x1 + math.cos(angle) * length
        y2 = y1 + math.sin(angle) * length
        pygame.draw.line(surf, color, (x1, y1), (int(x2), int(y2)), width)
        return int(x2), int(y2)

    torso_len = 70
    torso_angle = math.pi / 2 + rig.body_rot
    hx, hy = cx, cy - 40
    sx, sy = limb(hx, hy, torso_len, torso_angle, shirt, 36)
    lx, ly = limb(sx, sy, 45, torso_angle + rig.leg_l, shorts, 16)
    limb(lx, ly, 40, torso_angle + rig.leg_l + 0.2, skin, 12)
    rx, ry = limb(sx, sy, 45, torso_angle + rig.leg_r, shorts, 16)
    limb(rx, ry, 40, torso_angle + rig.leg_r + 0.2, skin, 12)
    ax, ay = hx, hy - 10
    limb(ax, ay, 42, torso_angle + rig.arm_l, skin, 12)
    limb(ax, ay, 42, torso_angle + rig.arm_r, skin, 12)
    head_x, head_y = hx, hy - 35
    pygame.draw.circle(surf, skin, (head_x, head_y), 28)
    pygame.draw.ellipse(surf, hair, (head_x - 30, head_y - 38, 60, 35))


def draw_puppy(surf: pygame.Surface, pup: Pup) -> None:
    cx, cy = int(pup.x), int(pup.y - pup.jump * 80 + pup.body_y)
    white = (245, 245, 245)
    patch = (140, 70, 35)
    pygame.draw.ellipse(surf, white, (cx - 45, cy - 20, 90, 45))
    pygame.draw.circle(surf, patch, (cx + 25, cy - 18), 20)
    pygame.draw.circle(surf, white, (cx + 32, cy - 20), 6)
    for i, side in enumerate((-1, 1)):
        phase = pup.leg_phase + i * math.pi
        lx = cx + side * 18
        ly = cy + 18
        fx = lx + math.sin(phase) * 10
        fy = ly + math.cos(phase) * 8
        pygame.draw.line(surf, white, (lx, ly), (int(fx), int(fy)), 8)
    tail_x = cx - 40
    tail_y = cy - 5 + math.sin(pup.leg_phase * 2) * 8
    pygame.draw.line(surf, white, (cx - 35, cy), (int(tail_x), int(tail_y)), 8)
    if pup.roll > 0.1:
        # Simple roll: tilt body ellipse instead of rotating the whole frame.
        angle = int(pup.roll * 90)
        body = pygame.Surface((120, 70), pygame.SRCALPHA)
        pygame.draw.ellipse(body, white, (10, 10, 100, 50))
        pygame.draw.circle(body, patch, (75, 25), 18)
        body = pygame.transform.rotate(body, angle)
        surf.blit(body, (cx - 60, cy - 35))


def draw_ball(surf: pygame.Surface, t: float) -> None:
    if t > 4.5:
        return
    u = min(t / 2.2, 1.0)
    x = lerp(W * 0.28, W * 0.72, u)
    y = lerp(H * 0.55, H * 0.72, u) - 120 * math.sin(u * math.pi)
    pygame.draw.circle(surf, (220, 35, 35), (int(x), int(y)), 16)


def draw_butterfly(surf: pygame.Surface, t: float) -> None:
    if t < 4.0 or t > 6.2:
        return
    u = (t - 4.0) / 2.2
    x = W * 0.58 + math.sin(u * 20) * 25
    y = H * 0.42 - u * 60
    col = (255, 140, 20)
    pygame.draw.polygon(
        surf,
        col,
        [(x - 20, y), (x - 5, y - 10), (x + 5, y - 10), (x + 20, y), (x + 5, y + 10), (x - 5, y + 10)],
    )


def draw_leaves(surf: pygame.Surface, t: float) -> None:
    if t < 6.0 or t > 8.5:
        return
    rng_seed = int(t * 10)
    for i in range(20):
        x = (i * 97 + rng_seed * 13) % W
        y = H * 0.68 + ((i * 53 + rng_seed * 29) % 120)
        pygame.draw.circle(surf, (170, 95, 35), (x, y), 5)


def pose_boy(t: float) -> Rig:
    x = sample([(0, W * 0.25), (2, W * 0.27), (7, W * 0.42), (10, W * 0.4)], t)
    y = H * 0.58
    arm_r = sample([(0, -0.5), (0.8, 1.3), (1.6, 0.2), (7, 0.8), (8.5, 0.5), (10, 1.0)], t)
    arm_l = sample([(0, 0.4), (7, -0.5), (8.5, 0.8), (10, -0.2)], t)
    leg_l = math.sin(t * 8) * 0.15 if 6 <= t <= 8 else 0
    leg_r = -leg_l
    return Rig(x=x, y=y, arm_r=arm_r, arm_l=arm_l, leg_l=leg_l, leg_r=leg_r)


def pose_pup(t: float) -> Pup:
    x = sample([(0, W * 0.35), (1, W * 0.42), (2.5, W * 0.58), (4, W * 0.66), (5, W * 0.62), (6, W * 0.48), (8, W * 0.52), (10, W * 0.58)], t)
    y = H * 0.66
    run = 1.0 if 1.0 < t < 4.5 else 0.3
    phase = t * 18 * run
    jump = sample([(0, 0), (5.0, 0), (5.3, 1), (5.8, 0), (10, 0)], t)
    roll = sample([(0, 0), (6.0, 0), (6.5, 1), (8.0, 0.2), (10, 0)], t)
    body_y = math.sin(t * 12) * 4 if 1 < t < 4.5 else 0
    return Pup(x=x, y=y, body_y=body_y, leg_phase=phase, jump=jump, roll=roll)


def render() -> None:
    import os

    os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
    os.environ.setdefault("SDL_AUDIODRIVER", "dummy")
    pygame.init()
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    surf = pygame.Surface((W, H))
    for i in range(NFRAMES):
        t = i / FPS
        surf.fill((0, 0, 0))
        draw_background(surf)
        draw_leaves(surf, t)
        draw_ball(surf, t)
        boy = pose_boy(t)
        pup = pose_pup(t)
        draw_puppy(surf, pup)
        draw_boy(surf, boy)
        draw_butterfly(surf, t)
        if 8.2 <= t <= 9.2:
            pygame.draw.circle(surf, (255, 80, 120), (int(boy.x + 40), int(boy.y - 90)), 12)
        pygame.image.save(surf, FRAMES_DIR / f"frame_{i:04d}.png")
    pygame.quit()
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            str(FRAMES_DIR / "frame_%04d.png"),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-crf",
            "18",
            str(OUT),
        ],
        check=True,
        capture_output=True,
    )


def main() -> int:
    print(f"Rendering rig2d animation to {OUT} …")
    render()
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
