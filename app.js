(function () {
  "use strict";

  const PALETTE = [
    "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200",
    "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#ffffff", "#c3c3c3",
    "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea",
    "#7092be", "#c8bfe7",
  ];

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const wrap = document.getElementById("canvas-wrap");
  const hint = document.getElementById("hint");
  const paletteEl = document.getElementById("palette");
  const customColorEl = document.getElementById("custom-color");
  const colorPreview = document.getElementById("color-preview");
  const brushSizeEl = document.getElementById("brush-size");
  const brushSizeLabel = document.getElementById("brush-size-label");
  const btnUndo = document.getElementById("btn-undo");
  const btnDownload = document.getElementById("btn-download");
  const btnClear = document.getElementById("btn-clear");

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
    const rect = wrap.getBoundingClientRect();
    const width = Math.floor(rect.width - 24);
    const height = Math.floor(rect.height - 24);
    if (width <= 0 || height <= 0) return;

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;
    fillBackground(state.bgColor);
    if (image.width > 0 && image.height > 0) {
      ctx.drawImage(
        makeTempCanvas(image),
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        width,
        height
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
      if (state.history.length > state.maxHistory) {
        state.history.shift();
      }
      btnUndo.disabled = state.history.length === 0;
    } catch {
      /* canvas may be empty on first draw */
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function strokeStyle() {
    return state.tool === "eraser" ? state.bgColor : state.color;
  }

  function lineWidthForTool() {
    if (state.tool === "pencil") return Math.max(1, Math.round(state.size / 4));
    if (state.tool === "eraser") return state.size;
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
    ctx.fillStyle = state.color;
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
      const cx = sx + rx;
      const cy = sy + ry;
      ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
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

    if (isFreehandTool()) {
      beginStroke(x, y);
    } else if (isShapeTool()) {
      state.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  function onPointerMove(e) {
    if (!state.drawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);

    if (isFreehandTool()) {
      drawLineTo(x, y);
    } else if (isShapeTool()) {
      drawShapePreview(x, y);
    }
  }

  function onPointerUp(e) {
    if (!state.drawing) return;
    e.preventDefault();
    state.drawing = false;

    if (isShapeTool()) {
      const { x, y } = getPos(e);
      drawShapePreview(x, y);
      state.snapshot = null;
    }

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll(".tool[data-tool]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === tool);
    });
    canvas.style.cursor =
      tool === "eraser" ? "cell" : tool === "fill" ? "copy" : "crosshair";
  }

  function setColor(color) {
    state.color = color;
    colorPreview.style.background = color;
    customColorEl.value = color;
    document.querySelectorAll(".swatch").forEach((sw) => {
      sw.classList.toggle("active", sw.dataset.color === color);
    });
  }

  function buildPalette() {
    PALETTE.forEach((color) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.dataset.color = color;
      btn.style.background = color;
      btn.title = color;
      btn.setAttribute("role", "option");
      btn.addEventListener("click", () => setColor(color));
      paletteEl.appendChild(btn);
    });
    setColor("#000000");
  }

  function downloadImage() {
    const link = document.createElement("a");
    link.download = "paint-drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function clearCanvas() {
    pushHistory();
    fillBackground(state.bgColor);
  }

  document.querySelectorAll(".tool[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => setTool(btn.dataset.tool));
  });

  brushSizeEl.addEventListener("input", () => {
    state.size = Number(brushSizeEl.value);
    brushSizeLabel.textContent = String(state.size);
  });

  customColorEl.addEventListener("input", () => setColor(customColorEl.value));
  btnUndo.addEventListener("click", undo);
  btnDownload.addEventListener("click", downloadImage);
  btnClear.addEventListener("click", clearCanvas);

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
})();
