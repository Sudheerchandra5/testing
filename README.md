# Storyboard animation

Renders a **10-second** MP4 from the boy-and-puppy storyboard reference (5×2 panel grid).

## Requirements

- Python 3
- [ffmpeg](https://ffmpeg.org/) on `PATH`
- `pip install -r requirements.txt`

## Generate the video

```bash
python3 scripts/storyboard_to_video.py
```

Output: `output/boy_puppy_10s.mp4` (1920×1080, 30 fps, ~10 s).

Each storyboard panel gets a subtle Ken Burns move; panels are joined with short crossfades. Panel timing is adjusted so the final length stays at 10 seconds despite overlaps.
