# Boy & puppy — 10s animation

Storyboard reference: `assets/storyboard_reference.png`

## What you want vs. what each script does

| Goal | Script |
|------|--------|
| **Real motion** (rigged/keyframed 3D, limbs move) | `scripts/render_3d_animation.sh` → `output/boy_puppy_3d_10s.mp4` |
| **Pixar-like motion from the reference image** (AI video) | `scripts/i2v_real_animation.py` — needs `REPLICATE_API_TOKEN` or `HF_TOKEN` |
| Flow morph between storyboard stills (not full character rigs) | `scripts/flow_character_animation.py` |
| Ken Burns on panels (slideshow — **not** real animation) | `scripts/storyboard_to_video.py` |

## Real 3D animation (recommended without API keys)

One-time setup (downloads Blender + EGL shim):

```bash
curl -fsSL -o /tmp/blender.tar.xz \
  https://download.blender.org/release/Blender4.2/blender-4.2.3-linux-x64.tar.xz
tar -xf /tmp/blender.tar.xz -C .
curl -fsSLO http://mirrors.kernel.org/ubuntu/pool/main/libg/libglvnd/libegl1_1.7.0-1build1_amd64.deb
mkdir -p mesa-libs && dpkg-deb -x libegl1_1.7.0-1build1_amd64.deb mesa-libs
chmod +x scripts/render_3d_animation.sh
./scripts/render_3d_animation.sh
```

Output: **10.00s**, 1280×720, keyframed throw → chase → jump → leaves → hug.

## Pixar-style from your reference image (API)

```bash
export REPLICATE_API_TOKEN=...   # Kling image-to-video
# or: export HF_TOKEN=...        # Hugging Face ZeroGPU Wan Space
pip install -r requirements.txt
python3 scripts/i2v_real_animation.py
```

Without a token, the script falls back to flow-morph between storyboard panels.

## Python deps

```bash
pip install -r requirements.txt
```

Also requires **ffmpeg** on `PATH`.
