window.AnimationApp = (function () {
  "use strict";

  const TOTAL_FRAMES = 60;
  let initialized = false;
  let canvas, ctx, wrap, hint;
  let objectListEl, propsEmpty, propsFields;
  let propColor, propX, propY, propZ, propSize, propRot;
  let propXOut, propYOut, propZOut, propSizeOut, propRotOut;
  let frameSlider, frameLabel, fpsSlider, fpsLabel, keyframeTrack;
  let animAppEl;

  const state = {
    mode: "2d",
    objects: [],
    selectedId: null,
    frame: 0,
    fps: 12,
    playing: false,
    playTimer: null,
    dragging: null,
    nextId: 1,
  };

  function createObject(type) {
    const colors = ["#e85d4c", "#1f6f5b", "#d4a24c", "#4c8fe8", "#a349a4"];
    const obj = {
      id: state.nextId++,
      name: `${type} ${state.nextId - 1}`,
      type,
      color: colors[(state.nextId - 1) % colors.length],
      keyframes: {
        0: {
          x: (Math.random() - 0.5) * 120,
          y: (Math.random() - 0.5) * 80,
          z: 0,
          size: 60,
          rot: 0,
        },
      },
    };
    state.objects.push(obj);
    selectObject(obj.id);
    renderObjectList();
    render();
    updateKeyframeTrack();
  }

  function getSortedKeys(obj) {
    return Object.keys(obj.keyframes).map(Number).sort((a, b) => a - b);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function sampleProps(obj, frame) {
    const keys = getSortedKeys(obj);
    if (keys.length === 0) {
      return { x: 0, y: 0, z: 0, size: 60, rot: 0 };
    }
    if (frame <= keys[0]) return { ...obj.keyframes[keys[0]] };
    if (frame >= keys[keys.length - 1]) return { ...obj.keyframes[keys[keys.length - 1]] };

    let a = keys[0];
    let b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (frame >= keys[i] && frame <= keys[i + 1]) {
        a = keys[i];
        b = keys[i + 1];
        break;
      }
    }
    const t = (frame - a) / (b - a || 1);
    const ka = obj.keyframes[a];
    const kb = obj.keyframes[b];
    return {
      x: lerp(ka.x, kb.x, t),
      y: lerp(ka.y, kb.y, t),
      z: lerp(ka.z, kb.z, t),
      size: lerp(ka.size, kb.size, t),
      rot: lerp(ka.rot, kb.rot, t),
    };
  }

  function project(x, y, z, w, h) {
    if (state.mode === "2d") {
      return { x: w / 2 + x, y: h / 2 + y, scale: 1 };
    }
    const fov = 420;
    const depth = 320 + z;
    const s = fov / Math.max(80, depth);
    return {
      x: w / 2 + x * s,
      y: h / 2 + y * s,
      scale: s,
    };
  }

  function drawShape(obj, props, w, h) {
    const p = project(props.x, props.y, props.z, w, h);
    const size = props.size * p.scale;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((props.rot * Math.PI) / 180);
    ctx.fillStyle = obj.color;
    ctx.strokeStyle = obj.id === state.selectedId ? "#f2efe6" : "rgba(0,0,0,0.25)";
    ctx.lineWidth = obj.id === state.selectedId ? 2.5 : 1;

    switch (obj.type) {
      case "circle":
      case "sphere": {
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        if (obj.type === "sphere") {
          const g = ctx.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.05, 0, 0, size / 2);
          g.addColorStop(0, "rgba(255,255,255,0.45)");
          g.addColorStop(1, "rgba(0,0,0,0.25)");
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.stroke();
        break;
      }
      case "rect": {
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        break;
      }
      case "triangle": {
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "cube": {
        const d = size * 0.28;
        ctx.fillStyle = shade(obj.color, -20);
        ctx.beginPath();
        ctx.moveTo(size / 2, -size / 2);
        ctx.lineTo(size / 2 + d, -size / 2 - d);
        ctx.lineTo(size / 2 + d, size / 2 - d);
        ctx.lineTo(size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = shade(obj.color, 15);
        ctx.beginPath();
        ctx.moveTo(-size / 2, -size / 2);
        ctx.lineTo(-size / 2 + d, -size / 2 - d);
        ctx.lineTo(size / 2 + d, -size / 2 - d);
        ctx.lineTo(size / 2, -size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = obj.color;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        break;
      }
      default:
        break;
    }
    ctx.restore();
  }

  function shade(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amount;
    let g = ((n >> 8) & 0xff) + amount;
    let b = (n & 0xff) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  function render() {
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // floor grid for 3D feel
    ctx.strokeStyle = "rgba(242,239,230,0.06)";
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const ordered = [...state.objects].sort((a, b) => {
      const pa = sampleProps(a, state.frame);
      const pb = sampleProps(b, state.frame);
      return pa.z - pb.z;
    });

    ordered.forEach((obj) => {
      drawShape(obj, sampleProps(obj, state.frame), w, h);
    });
  }

  function resize() {
    if (!wrap || wrap.offsetParent === null) return;
    const rect = wrap.getBoundingClientRect();
    const width = Math.floor(rect.width - 24);
    const height = Math.floor(rect.height - 24);
    if (width <= 0 || height <= 0) return;
    canvas.width = width;
    canvas.height = height;
    render();
  }

  function selected() {
    return state.objects.find((o) => o.id === state.selectedId) || null;
  }

  function selectObject(id) {
    state.selectedId = id;
    renderObjectList();
    syncPropsUI();
    render();
  }

  function renderObjectList() {
    objectListEl.innerHTML = "";
    state.objects.forEach((obj) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "object-item" + (obj.id === state.selectedId ? " active" : "");
      btn.textContent = obj.name;
      btn.addEventListener("click", () => selectObject(obj.id));
      li.appendChild(btn);
      objectListEl.appendChild(li);
    });
  }

  function syncPropsUI() {
    const obj = selected();
    if (!obj) {
      propsEmpty.hidden = false;
      propsFields.hidden = true;
      return;
    }
    propsEmpty.hidden = true;
    propsFields.hidden = false;
    const p = sampleProps(obj, state.frame);
    propColor.value = obj.color;
    propX.value = Math.round(p.x);
    propY.value = Math.round(p.y);
    propZ.value = Math.round(p.z);
    propSize.value = Math.round(p.size);
    propRot.value = Math.round(p.rot);
    propXOut.textContent = propX.value;
    propYOut.textContent = propY.value;
    propZOut.textContent = propZ.value;
    propSizeOut.textContent = propSize.value;
    propRotOut.textContent = `${propRot.value}°`;
  }

  function writePropsToKeyframe() {
    const obj = selected();
    if (!obj) return;
    obj.color = propColor.value;
    obj.keyframes[state.frame] = {
      x: Number(propX.value),
      y: Number(propY.value),
      z: Number(propZ.value),
      size: Number(propSize.value),
      rot: Number(propRot.value),
    };
    updateKeyframeTrack();
    render();
  }

  function addKeyframe() {
    writePropsToKeyframe();
    hint.classList.add("hidden");
  }

  function updateKeyframeTrack() {
    keyframeTrack.innerHTML = "";
    const playhead = document.createElement("div");
    playhead.className = "key-playhead";
    playhead.style.left = `${(state.frame / TOTAL_FRAMES) * 100}%`;
    keyframeTrack.appendChild(playhead);

    const frames = new Set();
    state.objects.forEach((obj) => {
      Object.keys(obj.keyframes).forEach((f) => frames.add(Number(f)));
    });
    frames.forEach((f) => {
      const mark = document.createElement("div");
      mark.className = "key-mark";
      mark.style.left = `${(f / TOTAL_FRAMES) * 100}%`;
      keyframeTrack.appendChild(mark);
    });
  }

  function setFrame(frame) {
    state.frame = Math.max(0, Math.min(TOTAL_FRAMES, Math.round(frame)));
    frameSlider.value = String(state.frame);
    frameLabel.textContent = `${state.frame} / ${TOTAL_FRAMES}`;
    syncPropsUI();
    updateKeyframeTrack();
    render();
  }

  function play() {
    if (state.playing) {
      stopPlay(false);
      document.getElementById("btn-play").textContent = "▶ Play";
      return;
    }
    state.playing = true;
    document.getElementById("btn-play").textContent = "❚❚ Pause";
    const tick = () => {
      let next = state.frame + 1;
      if (next > TOTAL_FRAMES) next = 0;
      setFrame(next);
      state.playTimer = setTimeout(tick, 1000 / state.fps);
    };
    state.playTimer = setTimeout(tick, 1000 / state.fps);
  }

  function stopPlay(reset) {
    state.playing = false;
    if (state.playTimer) clearTimeout(state.playTimer);
    state.playTimer = null;
    document.getElementById("btn-play").textContent = "▶ Play";
    if (reset) setFrame(0);
  }

  function hitTest(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = (clientX - rect.left) * (canvas.width / rect.width);
    const my = (clientY - rect.top) * (canvas.height / rect.height);
    const w = canvas.width;
    const h = canvas.height;

    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i];
      const props = sampleProps(obj, state.frame);
      const p = project(props.x, props.y, props.z, w, h);
      const size = props.size * p.scale;
      const dx = mx - p.x;
      const dy = my - p.y;
      if (dx * dx + dy * dy <= (size / 2) * (size / 2) * 1.4) {
        return { obj, props, p };
      }
    }
    return null;
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
    hint.classList.add("hidden");
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) return;
    selectObject(hit.obj.id);
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    state.dragging = {
      id: hit.obj.id,
      offsetX: mx - hit.p.x,
      offsetY: my - hit.p.y,
    };
  }

  function onPointerMove(e) {
    if (!state.dragging) return;
    e.preventDefault();
    const obj = state.objects.find((o) => o.id === state.dragging.id);
    if (!obj) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width) - state.dragging.offsetX;
    const my = (e.clientY - rect.top) * (canvas.height / rect.height) - state.dragging.offsetY;
    const current = sampleProps(obj, state.frame);

    if (state.mode === "2d") {
      current.x = mx - canvas.width / 2;
      current.y = my - canvas.height / 2;
    } else {
      const depth = 320 + current.z;
      const s = 420 / Math.max(80, depth);
      current.x = (mx - canvas.width / 2) / s;
      current.y = (my - canvas.height / 2) / s;
    }

    obj.keyframes[state.frame] = { ...current };
    syncPropsUI();
    updateKeyframeTrack();
    render();
  }

  function onPointerUp(e) {
    state.dragging = null;
    try { canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  }

  function setMode(mode) {
    state.mode = mode;
    animAppEl.classList.toggle("mode-2d", mode === "2d");
    animAppEl.classList.toggle("mode-3d", mode === "3d");
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });
    render();
  }

  function exportAnim() {
    const data = {
      mode: state.mode,
      fps: state.fps,
      totalFrames: TOTAL_FRAMES,
      objects: state.objects,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "animation.json";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function bindProp(input, out, format) {
    input.addEventListener("input", () => {
      out.textContent = format ? format(input.value) : input.value;
      writePropsToKeyframe();
    });
  }

  function init() {
    if (initialized) {
      resize();
      return;
    }

    canvas = document.getElementById("stage");
    ctx = canvas.getContext("2d");
    wrap = document.getElementById("stage-wrap");
    hint = document.getElementById("anim-hint");
    objectListEl = document.getElementById("object-list");
    propsEmpty = document.getElementById("props-empty");
    propsFields = document.getElementById("props-fields");
    propColor = document.getElementById("prop-color");
    propX = document.getElementById("prop-x");
    propY = document.getElementById("prop-y");
    propZ = document.getElementById("prop-z");
    propSize = document.getElementById("prop-size");
    propRot = document.getElementById("prop-rot");
    propXOut = document.getElementById("prop-x-out");
    propYOut = document.getElementById("prop-y-out");
    propZOut = document.getElementById("prop-z-out");
    propSizeOut = document.getElementById("prop-size-out");
    propRotOut = document.getElementById("prop-rot-out");
    frameSlider = document.getElementById("frame-slider");
    frameLabel = document.getElementById("frame-label");
    fpsSlider = document.getElementById("fps-slider");
    fpsLabel = document.getElementById("fps-label");
    keyframeTrack = document.getElementById("keyframe-track");
    animAppEl = document.querySelector(".anim-app");

    document.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => createObject(btn.dataset.add));
    });

    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => setMode(btn.dataset.mode));
    });

    bindProp(propX, propXOut);
    bindProp(propY, propYOut);
    bindProp(propZ, propZOut);
    bindProp(propSize, propSizeOut);
    bindProp(propRot, propRotOut, (v) => `${v}°`);
    propColor.addEventListener("input", writePropsToKeyframe);

    document.getElementById("btn-delete-obj").addEventListener("click", () => {
      if (!state.selectedId) return;
      state.objects = state.objects.filter((o) => o.id !== state.selectedId);
      state.selectedId = state.objects[0] ? state.objects[0].id : null;
      renderObjectList();
      syncPropsUI();
      updateKeyframeTrack();
      render();
    });

    document.getElementById("btn-play").addEventListener("click", play);
    document.getElementById("btn-stop").addEventListener("click", () => stopPlay(true));
    document.getElementById("btn-keyframe").addEventListener("click", addKeyframe);
    document.getElementById("btn-export-anim").addEventListener("click", exportAnim);

    frameSlider.max = String(TOTAL_FRAMES);
    frameSlider.addEventListener("input", () => {
      stopPlay(false);
      setFrame(Number(frameSlider.value));
    });

    fpsSlider.addEventListener("input", () => {
      state.fps = Number(fpsSlider.value);
      fpsLabel.textContent = String(state.fps);
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    window.addEventListener("resize", resize);
    setMode("2d");
    setFrame(0);
    resize();
    initialized = true;
  }

  return { init, resize, stop: () => stopPlay(false) };
})();
