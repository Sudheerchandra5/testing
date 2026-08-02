# Create Studio — Paint & Animation

A browser creative studio with two workspaces:

1. **MS Paint** — classic freehand drawing with touch, mouse, and stylus
2. **2D / 3D Animation Creator** — add shapes, keyframe motion, and play back animations

## Run locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## MS Paint

- Brush, pencil, eraser, line, rectangle, circle, fill, clear
- Color palette + custom color
- Adjustable brush size, undo, save as PNG
- Touch-friendly pointer drawing (`touch-action: none`)

## 2D / 3D Animation Creator

- Toggle **2D** or **3D** mode (perspective projection in 3D)
- Add circle, rect, triangle, cube, sphere
- Drag objects on the stage (touch supported)
- Scrub the timeline, set **keyframes**, play / pause / stop
- Adjust X / Y / Z, size, rotation, color
- Export animation data as JSON

## Files

- `index.html` — menu + both workspaces
- `styles.css` — menu and app UI
- `app.js` — view navigation
- `paint.js` — paint workspace
- `animation.js` — animation workspace
