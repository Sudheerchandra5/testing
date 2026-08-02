window.PaintApp = (function () {
  "use strict";

  const PALETTE = [
    "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200",
    "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#ffffff", "#c3c3c3",
    "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea",
    "#7092be", "#c8bfe7",
  ];

  let initialized = false;
  let canvas, ctx, wrap, hint, paletteEl, customColorEl, colorPreview;
  let brushSizeEl, brushSizeLabel, btnUndo, btnDownload, btnClear;

  const state = {
    tool: "brush",
    color: "#000000",
    bgColor: "#ffffff",
    size: 8,
    drawing: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    snapshot: null,
    history: [],
    maxHistory: 40,
  };

  function resizeCanvas() {
    if (!wrap || wrap.offsetParent === null) return;
    const rect = wrap.getBoundingClientRect();
    const width = Math.floor(rect.width - 24);
    const height = Math.floor(rect.height - 24);
    if (width <= 0 || height <= 0) return;

    let image = null;
    if (canvas.width > 0 && canvas.height > 0) {
      image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    canvas.width = width;
    canvas.height = height;
    fillBackground(state.bgColor);
    if (image && image.width > 0 && image.height > 0) {
      ctx.drawImage(
        makeTempCanvas(image),
        0, 0, image.width, image.height,
        0, 0, width, height
      );
    }
  }

  function makeTempCanvas(imageData) {
    const c = document.createElement("canvas");
    c.width = imageData.width;
    c.height = imageData.height;
    c.getContext("2d").putImageData(imageData, 0, 0);
    return c;
  }

  function fillBackground(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function pushHistory() {
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      state.history.push(data);
      if (state.history.length > state.maxHistory) state.history.shift();
      btnUndo.disabled = state.history.length === 0;
    } catch {
      /* ignore */
    }
  }

  function undo() {
    if (state.history.length === 0) return;
    const data = state.history.pop();
    ctx.putImageData(data, 0, 0);
    btnUndo.disabled = state.history.length === 0;
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function strokeStyle() {
    return state.tool === "eraser" ? state.bgColor : state.color;
  }

  function lineWidthForTool() {
    if (state.tool === "pencil") return Math.max(1, Math.round(state.size / 4));
    return state.size;
  }

  function beginStroke(x, y) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeStyle();
    ctx.fillStyle = strokeStyle();
    ctx.lineWidth = lineWidthForTool();
    ctx.beginPath();
    ctx.moveTo(x, y);
    state.lastX = x;
    state.lastY = y;
  }

  function drawLineTo(x, y) {
    ctx.lineTo(x, y);
    ctx.stroke();
    state.lastX = x;
    state.lastY = y;
  }

  function isFreehandTool() {
    return state.tool === "brush" || state.tool === "pencil" || state.tool === "eraser";
  }

  function isShapeTool() {
    return state.tool === "line" || state.tool === "rect" || state.tool === "circle";
  }

  function drawShapePreview(x, y) {
    if (!state.snapshot) return;
    ctx.putImageData(state.snapshot, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.size;
    ctx.beginPath();
    const sx = state.startX;
    const sy = state.startY;
    if (state.tool === "line") {
      ctx.moveTo(sx, sy);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (state.tool === "rect") {
      ctx.strokeRect(sx, sy, x - sx, y - sy);
    } else if (state.tool === "circle") {
      const rx = (x - sx) / 2;
      const ry = (y - sy) / 2;
      ctx.ellipse(sx + rx, sy + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
    hint.classList.add("hidden");
    const { x, y } = getPos(e);
    state.drawing = true;
    state.startX = x;
    state.startY = y;

    if (state.tool === "fill") {
      pushHistory();
      state.bgColor = state.color;
      fillBackground(state.bgColor);
      state.drawing = false;
      return;
    }

    pushHistory();
    if (isFreehandTool()) beginStroke(x, y);
    else if (isShapeTool()) state.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  function onPointerMove(e) {
    if (!state.drawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    if (isFreehandTool()) drawLineTo(x, y);
    else if (isShapeTool()) drawShapePreview(x, y);
  }

  function onPointerUp(e) {
    if (!state.drawing) return;
    e.preventDefault();
    state.drawing = false;
    if (isShapeTool()) {
      drawShapePreview(getPos(e).x, getPos(e).y);
      state.snapshot = null;
    }
    try { canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  }

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll("#view-paint .tool[data-tool]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === tool);
    });
    canvas.style.cursor =
      tool === "eraser" ? "cell" : tool === "fill" ? "copy" : "crosshair";
  }

  function setColor(color) {
    state.color = color;
    colorPreview.style.background = color;
    customColorEl.value = color;
    document.querySelectorAll("#palette .swatch").forEach((sw) => {
      sw.classList.toggle("active", sw.dataset.color === color);
    });
  }

  function buildPalette() {
    if (paletteEl.childElementCount) return;
    PALETTE.forEach((color) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.dataset.color = color;
      btn.style.background = color;
      btn.title = color;
      btn.addEventListener("click", () => setColor(color));
      paletteEl.appendChild(btn);
    });
    setColor("#000000");
  }

  function init() {
    if (initialized) {
      resizeCanvas();
      return;
    }

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    wrap = document.getElementById("canvas-wrap");
    hint = document.getElementById("hint");
    paletteEl = document.getElementById("palette");
    customColorEl = document.getElementById("custom-color");
    colorPreview = document.getElementById("color-preview");
    brushSizeEl = document.getElementById("brush-size");
    brushSizeLabel = document.getElementById("brush-size-label");
    btnUndo = document.getElementById("btn-undo");
    btnDownload = document.getElementById("btn-download");
    btnClear = document.getElementById("btn-clear");

    document.querySelectorAll("#view-paint .tool[data-tool]").forEach((btn) => {
      btn.addEventListener("click", () => setTool(btn.dataset.tool));
    });

    brushSizeEl.addEventListener("input", () => {
      state.size = Number(brushSizeEl.value);
      brushSizeLabel.textContent = String(state.size);
    });

    customColorEl.addEventListener("input", () => setColor(customColorEl.value));
    btnUndo.addEventListener("click", undo);
    btnDownload.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = "paint-drawing.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
    btnClear.addEventListener("click", () => {
      pushHistory();
      fillBackground(state.bgColor);
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", (e) => {
      if (state.drawing) onPointerUp(e);
    });

    window.addEventListener("resize", resizeCanvas);
    buildPalette();
    resizeCanvas();
    fillBackground(state.bgColor);
    initialized = true;
  }

  return { init, resize: resizeCanvas };
})();
