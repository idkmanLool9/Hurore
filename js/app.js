/* Hurore Designer — main application script.
 *
 * Manages:
 *  - Rendering the blank Hurore template (delegated to hurore.js)
 *  - Placing, selecting, transforming and deleting symbols on the canvas
 *  - Property panel, layers list
 *  - Undo / redo via a snapshot history
 *  - Save / load to JSON, export to SVG and PNG
 *  - localStorage auto-save on every change
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const STORAGE_KEY = "hurore-designer-v1";

// ---------- STATE ----------
const state = {
  fabricColor: "#c1272d",
  borderColor: "#d4af37",
  fringeColor: "#d4af37",
  borderStyle: "brocade",
  defaultThread: "#d4af37",
  elements: [],   // each: {id, type:'symbol'|'text', symbolId?, text?, font?, x, y, size, rotation, color, flipH, flipV}
  selectedId: null,
};

const history = {
  past: [],
  future: [],
  max: 60,
};

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const canvas = $("canvas");
const defsGroup = $("canvas-defs");
const bgGroup = $("bg-group");
const huroreGroup = $("hurore-group");
const elementsGroup = $("elements-group");
const overlayGroup = $("overlay-group");

// ---------- ID GENERATOR ----------
function genId() {
  return "el_" + Math.random().toString(36).slice(2, 9);
}

// ---------- HISTORY ----------
function snapshot() {
  return JSON.stringify({
    fabricColor: state.fabricColor,
    borderColor: state.borderColor,
    fringeColor: state.fringeColor,
    borderStyle: state.borderStyle,
    defaultThread: state.defaultThread,
    elements: state.elements,
    selectedId: state.selectedId,
  });
}

function applySnapshot(snap) {
  const data = JSON.parse(snap);
  Object.assign(state, data);
}

function commit() {
  history.past.push(snapshot());
  if (history.past.length > history.max) history.past.shift();
  history.future.length = 0;
  persist();
}

function undo() {
  if (history.past.length < 2) return;
  const current = history.past.pop();
  history.future.push(current);
  applySnapshot(history.past[history.past.length - 1]);
  renderAll();
}

function redo() {
  if (!history.future.length) return;
  const next = history.future.pop();
  history.past.push(next);
  applySnapshot(next);
  renderAll();
}

// ---------- PERSISTENCE ----------
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, snapshot());
  } catch (e) {
    console.warn("localStorage failed", e);
  }
}

function restoreFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) applySnapshot(saved);
  } catch (e) { /* ignore */ }
}

// ---------- INITIAL RENDER ----------
function renderDefs() {
  defsGroup.innerHTML = buildHuroreDefs() + buildFabricDefs(state.fabricColor);
}

function renderBackdrop() {
  bgGroup.innerHTML = `<rect x="0" y="0" width="${HURORE_GEOMETRY.canvasW}" height="${HURORE_GEOMETRY.canvasH}" fill="transparent"/>`;
}

function renderHuroreTemplate() {
  huroreGroup.innerHTML = renderHurore({
    fabricColor: state.fabricColor,
    borderColor: state.borderColor,
    fringeColor: state.fringeColor,
    borderStyle: state.borderStyle,
  });
}

// ---------- ELEMENT RENDERING ----------
function getSymbolDef(id) {
  return SYMBOL_LIBRARY.find((s) => s.id === id);
}

function elementSvgInnerForSymbol(symbolId) {
  const sym = getSymbolDef(symbolId);
  return sym ? sym.svg : "";
}

function renderElements() {
  elementsGroup.innerHTML = "";
  for (const el of state.elements) {
    const node = document.createElementNS(SVG_NS, "g");
    node.setAttribute("class", "placed");
    node.setAttribute("data-id", el.id);
    node.setAttribute("transform", elementTransform(el));
    node.setAttribute("color", el.color);

    if (el.type === "symbol") {
      // Symbols are designed in a 100x100 box. Center on (0,0) by translating -50,-50.
      const inner = document.createElementNS(SVG_NS, "g");
      inner.setAttribute("transform", "translate(-50,-50)");
      inner.innerHTML = elementSvgInnerForSymbol(el.symbolId);
      node.appendChild(inner);
    } else if (el.type === "text") {
      const t = document.createElementNS(SVG_NS, "text");
      t.setAttribute("x", "0");
      t.setAttribute("y", "0");
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("dominant-baseline", "middle");
      t.setAttribute("font-family", el.font || "Cinzel, serif");
      t.setAttribute("font-size", "40");
      t.setAttribute("font-weight", "700");
      t.setAttribute("fill", el.color);
      t.textContent = el.text || "";
      node.appendChild(t);
    }

    node.addEventListener("pointerdown", onElementPointerDown);
    elementsGroup.appendChild(node);
  }
  renderSelectionOverlay();
}

function elementTransform(el) {
  const sx = (el.flipH ? -1 : 1) * (el.size / 100);
  const sy = (el.flipV ? -1 : 1) * (el.size / 100);
  return `translate(${el.x},${el.y}) rotate(${el.rotation}) scale(${sx},${sy})`;
}

// ---------- SELECTION OVERLAY ----------
function renderSelectionOverlay() {
  overlayGroup.innerHTML = "";
  if (!state.selectedId) return;
  const el = state.elements.find((e) => e.id === state.selectedId);
  if (!el) return;

  // Compute axis-aligned bounding box around the element. Since symbols are
  // 100x100 baseline, scaled by size/100, the half-size is el.size/2.
  const half = el.size / 2;
  const w = el.size;
  const h = el.size;

  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("transform", `translate(${el.x},${el.y}) rotate(${el.rotation})`);

  const rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttribute("class", "selection-rect");
  rect.setAttribute("x", -half);
  rect.setAttribute("y", -half);
  rect.setAttribute("width", w);
  rect.setAttribute("height", h);
  g.appendChild(rect);

  // resize handle bottom-right
  const handle = document.createElementNS(SVG_NS, "rect");
  handle.setAttribute("class", "handle");
  handle.setAttribute("x", half - 8);
  handle.setAttribute("y", half - 8);
  handle.setAttribute("width", 16);
  handle.setAttribute("height", 16);
  handle.addEventListener("pointerdown", onResizeHandleDown);
  g.appendChild(handle);

  // rotate handle (top center, with stem)
  const stem = document.createElementNS(SVG_NS, "line");
  stem.setAttribute("x1", 0);
  stem.setAttribute("y1", -half);
  stem.setAttribute("x2", 0);
  stem.setAttribute("y2", -half - 28);
  stem.setAttribute("stroke", "#4ea1ff");
  stem.setAttribute("stroke-width", "1");
  g.appendChild(stem);

  const rot = document.createElementNS(SVG_NS, "circle");
  rot.setAttribute("class", "handle rotate");
  rot.setAttribute("cx", 0);
  rot.setAttribute("cy", -half - 32);
  rot.setAttribute("r", 8);
  rot.addEventListener("pointerdown", onRotateHandleDown);
  g.appendChild(rot);

  overlayGroup.appendChild(g);
}

// ---------- POINTER COORDS ----------
function clientToSvg(clientX, clientY) {
  const pt = canvas.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = canvas.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  const inv = ctm.inverse();
  const r = pt.matrixTransform(inv);
  return { x: r.x, y: r.y };
}

// ---------- DRAG: MOVE ELEMENT ----------
let dragInfo = null;

function onElementPointerDown(e) {
  e.stopPropagation();
  const id = e.currentTarget.getAttribute("data-id");
  const el = state.elements.find((x) => x.id === id);
  if (!el) return;
  state.selectedId = id;
  const start = clientToSvg(e.clientX, e.clientY);
  dragInfo = {
    type: "move",
    offsetX: start.x - el.x,
    offsetY: start.y - el.y,
    el,
    moved: false,
    pointerId: e.pointerId,
  };
  e.target.setPointerCapture(e.pointerId);
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragUp, { once: true });
  renderElements();
  renderPropsPanel();
  renderLayers();
}

function onDragMove(e) {
  if (!dragInfo) return;
  const p = clientToSvg(e.clientX, e.clientY);
  if (dragInfo.type === "move") {
    dragInfo.el.x = p.x - dragInfo.offsetX;
    dragInfo.el.y = p.y - dragInfo.offsetY;
    dragInfo.moved = true;
    updateElementTransform(dragInfo.el);
    renderSelectionOverlay();
  } else if (dragInfo.type === "resize") {
    const dx = p.x - dragInfo.startCenter.x;
    const dy = p.y - dragInfo.startCenter.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    let newSize = Math.max(20, Math.min(600, dist * 2 / Math.SQRT2));
    dragInfo.el.size = Math.round(newSize);
    updateElementTransform(dragInfo.el);
    renderSelectionOverlay();
    renderPropsPanel();
  } else if (dragInfo.type === "rotate") {
    const dx = p.x - dragInfo.el.x;
    const dy = p.y - dragInfo.el.y;
    let ang = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (ang > 180) ang -= 360;
    if (ang < -180) ang += 360;
    dragInfo.el.rotation = Math.round(ang);
    updateElementTransform(dragInfo.el);
    renderSelectionOverlay();
    renderPropsPanel();
  }
}

function onDragUp() {
  window.removeEventListener("pointermove", onDragMove);
  if (dragInfo && (dragInfo.type !== "move" || dragInfo.moved)) {
    commit();
  }
  dragInfo = null;
}

function updateElementTransform(el) {
  const node = elementsGroup.querySelector(`[data-id="${el.id}"]`);
  if (node) {
    node.setAttribute("transform", elementTransform(el));
    node.setAttribute("color", el.color);
  }
}

function onResizeHandleDown(e) {
  e.stopPropagation();
  const el = state.elements.find((x) => x.id === state.selectedId);
  if (!el) return;
  dragInfo = {
    type: "resize",
    el,
    startCenter: { x: el.x, y: el.y },
    pointerId: e.pointerId,
  };
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragUp, { once: true });
}

function onRotateHandleDown(e) {
  e.stopPropagation();
  const el = state.elements.find((x) => x.id === state.selectedId);
  if (!el) return;
  dragInfo = {
    type: "rotate",
    el,
    pointerId: e.pointerId,
  };
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragUp, { once: true });
}

// ---------- CANVAS-LEVEL CLICK (deselect) ----------
canvas.addEventListener("pointerdown", (e) => {
  if (e.target === canvas || e.target.closest("#bg-group") || e.target.closest("#hurore-group")) {
    if (state.selectedId) {
      state.selectedId = null;
      renderSelectionOverlay();
      renderPropsPanel();
      renderLayers();
    }
  }
});

// ---------- ADDING ELEMENTS ----------
function addSymbol(symbolId) {
  const p = defaultElementPosition();
  const el = {
    id: genId(),
    type: "symbol",
    symbolId,
    x: p.x,
    y: p.y,
    size: 140,
    rotation: 0,
    color: state.defaultThread,
    flipH: false,
    flipV: false,
  };
  state.elements.push(el);
  state.selectedId = el.id;
  commit();
  renderElements();
  renderPropsPanel();
  renderLayers();
  setStatus(`Toegevoegd: ${getSymbolDef(symbolId)?.name || symbolId}`);
}

function addText(text, font) {
  if (!text.trim()) return;
  const p = defaultElementPosition();
  const el = {
    id: genId(),
    type: "text",
    text: text.trim(),
    font: font || "Cinzel, serif",
    x: p.x,
    y: p.y,
    size: 120,
    rotation: 0,
    color: state.defaultThread,
    flipH: false,
    flipV: false,
  };
  state.elements.push(el);
  state.selectedId = el.id;
  commit();
  renderElements();
  renderPropsPanel();
  renderLayers();
  setStatus(`Tekst toegevoegd: "${text}"`);
}

function deleteSelected() {
  if (!state.selectedId) return;
  state.elements = state.elements.filter((e) => e.id !== state.selectedId);
  state.selectedId = null;
  commit();
  renderElements();
  renderPropsPanel();
  renderLayers();
}

function duplicateSelected() {
  const el = state.elements.find((e) => e.id === state.selectedId);
  if (!el) return;
  const copy = { ...el, id: genId(), x: el.x + 30, y: el.y + 30 };
  state.elements.push(copy);
  state.selectedId = copy.id;
  commit();
  renderElements();
  renderPropsPanel();
  renderLayers();
}

function bringToFront() {
  const idx = state.elements.findIndex((e) => e.id === state.selectedId);
  if (idx < 0) return;
  const [el] = state.elements.splice(idx, 1);
  state.elements.push(el);
  commit();
  renderElements();
  renderLayers();
}

function sendToBack() {
  const idx = state.elements.findIndex((e) => e.id === state.selectedId);
  if (idx < 0) return;
  const [el] = state.elements.splice(idx, 1);
  state.elements.unshift(el);
  commit();
  renderElements();
  renderLayers();
}

// ---------- PANELS ----------
function buildSymbolLibrary() {
  const container = $("symbol-library");
  // Group by category
  const cats = {};
  for (const s of SYMBOL_LIBRARY) {
    (cats[s.category] = cats[s.category] || []).push(s);
  }
  let html = "";
  for (const cat of Object.keys(cats)) {
    html += `<div class="symbol-category" style="grid-column: 1 / -1;">${cat}</div>`;
    for (const s of cats[cat]) {
      html += `<div class="symbol-cell" data-symbol-id="${s.id}" title="${s.name}">
        <svg viewBox="0 0 100 100">${s.svg}</svg>
        <div class="symbol-label">${s.name}</div>
      </div>`;
    }
  }
  container.innerHTML = html;
  container.querySelectorAll(".symbol-cell").forEach((cell) => {
    cell.addEventListener("click", () => addSymbol(cell.dataset.symbolId));
  });
}

function renderPropsPanel() {
  const el = state.elements.find((e) => e.id === state.selectedId);
  if (!el) {
    $("props-panel").classList.add("hidden");
    $("props-empty").classList.remove("hidden");
    return;
  }
  $("props-panel").classList.remove("hidden");
  $("props-empty").classList.add("hidden");
  $("prop-color").value = rgbToHex(el.color);
  $("prop-size").value = el.size;
  $("prop-size-val").textContent = el.size;
  $("prop-rot").value = el.rotation;
  $("prop-rot-val").textContent = el.rotation + "°";
  if (el.type === "text") {
    $("text-props").classList.remove("hidden");
    $("prop-text").value = el.text || "";
  } else {
    $("text-props").classList.add("hidden");
  }
}

function rgbToHex(c) {
  if (!c) return "#000000";
  if (c.startsWith("#")) return c.length === 4
    ? "#" + c.slice(1).split("").map(h => h+h).join("")
    : c;
  const m = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return "#000000";
  return "#" + [m[1],m[2],m[3]].map(n=>Number(n).toString(16).padStart(2,"0")).join("");
}

function renderLayers() {
  const list = $("layers-list");
  if (!state.elements.length) {
    list.innerHTML = `<li style="border:none; background:transparent; color:var(--text-dim); padding-left:0; cursor:default;">Nog geen elementen</li>`;
    return;
  }
  // Reverse so top layers appear first
  list.innerHTML = state.elements.slice().reverse().map((el) => {
    const name = el.type === "text"
      ? `T: ${el.text}`
      : getSymbolDef(el.symbolId)?.name || el.symbolId;
    const iconSvg = el.type === "symbol"
      ? `<svg viewBox="0 0 100 100">${getSymbolDef(el.symbolId)?.svg || ""}</svg>`
      : `<svg viewBox="0 0 100 100"><text x="50" y="68" text-anchor="middle" font-size="60" font-weight="bold" fill="currentColor">T</text></svg>`;
    return `<li data-id="${el.id}" class="${el.id === state.selectedId ? "selected" : ""}">
      <span class="lyr-icon" style="color:${el.color}">${iconSvg}</span>
      <span class="lyr-name">${escapeHtml(name)}</span>
      <button class="lyr-del" title="Verwijder">×</button>
    </li>`;
  }).join("");
  list.querySelectorAll("li[data-id]").forEach((li) => {
    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("lyr-del")) return;
      state.selectedId = li.dataset.id;
      renderElements();
      renderPropsPanel();
      renderLayers();
    });
    li.querySelector(".lyr-del")?.addEventListener("click", (e) => {
      e.stopPropagation();
      state.elements = state.elements.filter((el) => el.id !== li.dataset.id);
      if (state.selectedId === li.dataset.id) state.selectedId = null;
      commit();
      renderElements();
      renderPropsPanel();
      renderLayers();
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

// ---------- COLOR / SETTINGS BINDINGS ----------
function setupBindings() {
  $("fabric-color").addEventListener("input", (e) => {
    state.fabricColor = e.target.value;
    renderDefs();
    renderHuroreTemplate();
  });
  $("fabric-color").addEventListener("change", commit);

  $("border-color").addEventListener("input", (e) => {
    state.borderColor = e.target.value;
    renderHuroreTemplate();
  });
  $("border-color").addEventListener("change", commit);

  $("fringe-color").addEventListener("input", (e) => {
    state.fringeColor = e.target.value;
    renderHuroreTemplate();
  });
  $("fringe-color").addEventListener("change", commit);

  $("border-style").addEventListener("change", (e) => {
    state.borderStyle = e.target.value;
    renderHuroreTemplate();
    commit();
  });

  $("default-thread").addEventListener("change", (e) => {
    state.defaultThread = e.target.value;
    commit();
  });

  // Presets
  document.querySelectorAll(".preset").forEach((b) => {
    b.addEventListener("click", () => {
      state.fabricColor = b.dataset.fabric;
      state.borderColor = b.dataset.border;
      state.fringeColor = b.dataset.border;
      state.defaultThread = b.dataset.thread;
      $("fabric-color").value = state.fabricColor;
      $("border-color").value = state.borderColor;
      $("fringe-color").value = state.fringeColor;
      $("default-thread").value = state.defaultThread;
      renderDefs();
      renderHuroreTemplate();
      commit();
    });
  });

  // Text
  $("btn-add-text").addEventListener("click", () => {
    const text = $("text-input").value;
    const font = $("text-font").value;
    addText(text, font);
    $("text-input").value = "";
  });
  $("text-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("btn-add-text").click();
  });

  // Props
  $("prop-color").addEventListener("input", (e) => {
    const el = state.elements.find((x) => x.id === state.selectedId);
    if (!el) return;
    el.color = e.target.value;
    updateElementTransform(el);
    renderLayers();
  });
  $("prop-color").addEventListener("change", commit);

  $("prop-size").addEventListener("input", (e) => {
    const el = state.elements.find((x) => x.id === state.selectedId);
    if (!el) return;
    el.size = Number(e.target.value);
    $("prop-size-val").textContent = el.size;
    updateElementTransform(el);
    renderSelectionOverlay();
  });
  $("prop-size").addEventListener("change", commit);

  $("prop-rot").addEventListener("input", (e) => {
    const el = state.elements.find((x) => x.id === state.selectedId);
    if (!el) return;
    el.rotation = Number(e.target.value);
    $("prop-rot-val").textContent = el.rotation + "°";
    updateElementTransform(el);
    renderSelectionOverlay();
  });
  $("prop-rot").addEventListener("change", commit);

  $("prop-flip-h").addEventListener("click", () => {
    const el = state.elements.find((x) => x.id === state.selectedId);
    if (!el) return;
    el.flipH = !el.flipH;
    updateElementTransform(el);
    commit();
  });
  $("prop-flip-v").addEventListener("click", () => {
    const el = state.elements.find((x) => x.id === state.selectedId);
    if (!el) return;
    el.flipV = !el.flipV;
    updateElementTransform(el);
    commit();
  });

  $("prop-text").addEventListener("input", (e) => {
    const el = state.elements.find((x) => x.id === state.selectedId);
    if (!el || el.type !== "text") return;
    el.text = e.target.value;
    renderElements();
    renderLayers();
  });
  $("prop-text").addEventListener("change", commit);

  $("prop-duplicate").addEventListener("click", duplicateSelected);
  $("prop-front").addEventListener("click", bringToFront);
  $("prop-back").addEventListener("click", sendToBack);
  $("prop-delete").addEventListener("click", deleteSelected);

  // Top bar
  $("btn-new").addEventListener("click", () => {
    if (state.elements.length && !confirm("Nieuw ontwerp starten? Het huidige werk wordt vervangen.")) return;
    state.elements = [];
    state.selectedId = null;
    commit();
    renderAll();
  });
  $("btn-undo").addEventListener("click", undo);
  $("btn-redo").addEventListener("click", redo);

  $("btn-save").addEventListener("click", () => {
    const blob = new Blob([snapshot()], { type: "application/json" });
    downloadBlob(blob, "hurore-ontwerp.json");
  });
  $("file-load").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        applySnapshot(reader.result);
        // Sync UI controls
        $("fabric-color").value = state.fabricColor;
        $("border-color").value = state.borderColor;
        $("fringe-color").value = state.fringeColor;
        $("default-thread").value = state.defaultThread;
        $("border-style").value = state.borderStyle;
        commit();
        renderAll();
        setStatus("Ontwerp geladen");
      } catch (err) {
        alert("Kon bestand niet laden: " + err.message);
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  });

  $("btn-export-svg").addEventListener("click", exportSvg);
  $("btn-export-png").addEventListener("click", exportPng);

  // Zoom
  let zoom = 1;
  const applyZoom = () => {
    canvas.style.transform = `scale(${zoom})`;
    canvas.style.transformOrigin = "center center";
    $("zoom-label").textContent = Math.round(zoom * 100) + "%";
  };
  $("zoom-in").addEventListener("click", () => { zoom = Math.min(3, zoom + 0.1); applyZoom(); });
  $("zoom-out").addEventListener("click", () => { zoom = Math.max(0.3, zoom - 0.1); applyZoom(); });
  $("zoom-fit").addEventListener("click", () => { zoom = 1; applyZoom(); });

  // Keyboard
  window.addEventListener("keydown", (e) => {
    // Don't capture when typing in inputs
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault(); redo();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selectedId) { e.preventDefault(); deleteSelected(); }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault(); duplicateSelected();
    }
  });
}

// ---------- EXPORT ----------
function buildExportSvg() {
  // Clone the canvas without overlay (selection handles).
  const clone = canvas.cloneNode(true);
  const overlay = clone.querySelector("#overlay-group");
  if (overlay) overlay.remove();
  // Strip cursor/data attributes from placed elements
  clone.querySelectorAll(".placed").forEach((p) => p.removeAttribute("class"));
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  return new XMLSerializer().serializeToString(clone);
}

function exportSvg() {
  const svgStr = buildExportSvg();
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  downloadBlob(blob, "hurore-ontwerp.svg");
  setStatus("SVG geëxporteerd");
}

function exportPng() {
  const svgStr = buildExportSvg();
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const scale = 2;
    const c = document.createElement("canvas");
    c.width = HURORE_GEOMETRY.canvasW * scale;
    c.height = HURORE_GEOMETRY.canvasH * scale;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0e0e10";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    c.toBlob((blob) => {
      downloadBlob(blob, "hurore-ontwerp.png");
      setStatus("PNG geëxporteerd");
    }, "image/png");
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert("PNG export mislukt. Probeer SVG export.");
  };
  img.src = url;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- STATUS ----------
let statusTimer;
function setStatus(msg) {
  $("status").textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { $("status").textContent = "Klaar"; }, 2500);
}

// ---------- MASTER RENDER ----------
function renderAll() {
  renderDefs();
  renderBackdrop();
  renderHuroreTemplate();
  renderElements();
  renderPropsPanel();
  renderLayers();
  // Sync UI controls
  $("fabric-color").value = state.fabricColor;
  $("border-color").value = state.borderColor;
  $("fringe-color").value = state.fringeColor;
  $("default-thread").value = state.defaultThread;
  $("border-style").value = state.borderStyle;
}

// ---------- BOOT ----------
function boot() {
  buildSymbolLibrary();
  setupBindings();
  restoreFromStorage();
  history.past.push(snapshot());
  renderAll();
}

document.addEventListener("DOMContentLoaded", boot);
