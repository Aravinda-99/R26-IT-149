/**
 * PanelFit — lays a result / game-over panel out from its measured content
 * ============================================================================
 * Scenes build their end panels with hard-coded x/y values, so a longer line
 * or a bigger font collides with whatever sits below it. A scene calls
 * PanelFit.arm(this) as the first line of its completion / game-over path; once
 * the panel has finished building and animating, PanelFit:
 *   1. raises small fonts (never shrinks anything) and wraps long lines to the
 *      panel width,
 *   2. groups the panel's elements into rows by their original vertical extent,
 *   3. re-stacks the rows top to bottom with consistent spacing from the real
 *      measured heights, so buttons always sit below the last line, and
 *   4. redraws the panel background (and grows any button that is now too small
 *      for its label) to fit.
 * Scene code is not otherwise touched; logic, scoring and content are unchanged.
 *
 * Phaser Graphics objects have no measurable bounds, so while a scene is armed
 * their draw calls are recorded; that lets a panel rectangle be re-drawn at a
 * new size with the same colours and corner radius.
 */

import Phaser from "phaser";

const W = 1280, H = 720;
const MIN_FONT = 18;     // logical px: ≈16px on screen at the game page's ~0.9 canvas scale
const BODY_FONT = 20;    // explanatory lines: ≈18px on screen
const HEADING_FONT = 24; // at or above this size text is left alone
const PAD_X = 36, PAD_Y = 28, BOTTOM_SAFE = 12;
const GAP_MIN = 10, GAP_MAX = 30, BTN_GAP_MIN = 20;
const TICK_MS = 200, SETTLED_TICKS = 3, MAX_FITS = 4, MAX_RECORDED_OPS = 3000, IDLE_TICKS_BEFORE_DISARM = 8;

const DRAW_METHODS = ["fillStyle", "lineStyle", "fillGradientStyle", "fillRect", "strokeRect", "fillRoundedRect", "strokeRoundedRect",
  "fillCircle", "strokeCircle", "fillEllipse", "strokeEllipse", "lineBetween", "fillTriangle", "strokeTriangle", "fillPoints",
  "strokePoints", "beginPath", "closePath", "moveTo", "lineTo", "arc", "slice", "fillPath", "strokePath", "fillPointShape",
  "fillRectShape", "strokeRectShape", "fillCircleShape", "strokeCircleShape", "fillEllipseShape", "strokeEllipseShape",
  "fillTriangleShape", "strokeTriangleShape", "strokeLineShape", "save", "restore", "translateCanvas", "scaleCanvas", "rotateCanvas"];
const RECT_OPS = new Set(["fillRect", "strokeRect", "fillRoundedRect", "strokeRoundedRect"]);

let recorderInstalled = false;

/** While a scene is armed, remember the outermost draw calls made on each Graphics. */
function installRecorder() {
  if (recorderInstalled) return;
  recorderInstalled = true;
  const GP = Phaser.GameObjects.Graphics.prototype;
  for (const name of DRAW_METHODS) {
    const orig = GP[name];
    if (typeof orig !== "function") continue;
    GP[name] = function (...args) {
      const rec = this.scene && this.scene.__pfArmed && !this.__pfDepth;
      if (rec) {
        const ops = this.__ops || (this.__ops = []);
        if (ops.length >= MAX_RECORDED_OPS) ops.length = 0; // an incrementally-drawn effect, not a panel: don't grow forever
        ops.push({ n: name, a: args.slice() });
      }
      this.__pfDepth = (this.__pfDepth || 0) + 1;
      try { return orig.apply(this, args); } finally { this.__pfDepth--; }
    };
  }
  const clear = GP.clear;
  GP.clear = function () { this.__ops = []; return clear.call(this); };
}

/** Rectangles / shapes drawn into a Graphics, in its local coordinates. */
function opRects(g) {
  const out = [];
  let fa = 1;
  (g.__ops || []).forEach((op, idx) => {
    const a = op.a;
    if (op.n === "fillStyle") { fa = a[1] === undefined ? 1 : a[1]; return; }
    let r = null;
    if (RECT_OPS.has(op.n)) r = { x0: a[0], y0: a[1], x1: a[0] + a[2], y1: a[1] + a[3] };
    else if (op.n === "fillCircle" || op.n === "strokeCircle") r = { x0: a[0] - a[2], y0: a[1] - a[2], x1: a[0] + a[2], y1: a[1] + a[2] };
    else if (op.n === "fillEllipse" || op.n === "strokeEllipse") r = { x0: a[0] - a[2] / 2, y0: a[1] - a[3] / 2, x1: a[0] + a[2] / 2, y1: a[1] + a[3] / 2 };
    else if (op.n === "lineBetween") r = { x0: a[0], y0: a[1], x1: a[2], y1: a[3] };
    else if (op.n === "fillTriangle" || op.n === "strokeTriangle") r = { x0: Math.min(a[0], a[2], a[4]), y0: Math.min(a[1], a[3], a[5]), x1: Math.max(a[0], a[2], a[4]), y1: Math.max(a[1], a[3], a[5]) };
    if (!r) return;
    out.push({ idx, n: op.n, fill: op.n.startsWith("fill"), a: fa, x0: Math.min(r.x0, r.x1), y0: Math.min(r.y0, r.y1), x1: Math.max(r.x0, r.x1), y1: Math.max(r.y0, r.y1) });
  });
  return out;
}

const isVisible = (o) => { for (let p = o; p; p = p.parentContainer) { if (p.visible === false || p.alpha < 0.05 || p.active === false) return false; } return true; };
const rect = (x, y, w, h) => ({ x, y, w, h });

function toWorld(g, r) {
  const m = g.getWorldTransformMatrix();
  const xs = [], ys = [];
  for (const [x, y] of [[r.x0, r.y0], [r.x1, r.y0], [r.x0, r.y1], [r.x1, r.y1]]) { xs.push(m.a * x + m.c * y + m.tx); ys.push(m.b * x + m.d * y + m.ty); }
  return rect(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

function unionOf(list) {
  const bs = list.filter(Boolean);
  if (!bs.length) return null;
  const x0 = Math.min(...bs.map((b) => b.x)), y0 = Math.min(...bs.map((b) => b.y));
  const x1 = Math.max(...bs.map((b) => b.x + b.w)), y1 = Math.max(...bs.map((b) => b.y + b.h));
  return rect(x0, y0, x1 - x0, y1 - y0);
}

function boundsOf(o) {
  if (o.type === "Graphics") return unionOf(opRects(o).map((r) => toWorld(o, r)));
  if (o.type === "Container") return unionOf(o.list.filter(isVisible).map(boundsOf));
  if (o.type === "Text" && (Math.abs(o.scaleX) < 0.05 || Math.abs(o.scaleY) < 0.05)) {
    // pops in from scale 0: lay it out at its natural size
    const m = o.getWorldTransformMatrix();
    return rect(m.tx - o.originX * o.width, m.ty - o.originY * o.height, o.width, o.height);
  }
  if (typeof o.getBounds === "function") { const b = o.getBounds(); return rect(b.x, b.y, b.width, b.height); }
  return null;
}

/** Font size in px. `font: "12px Courier New"` shorthand leaves style.fontSize as "Courier", so fall back to the font string. */
function textPx(t) {
  const fs = parseFloat(t.style.fontSize);
  if (fs) return fs;
  const m = /(\d+(?:\.\d+)?)px/.exec(t.style._font || "");
  return m ? parseFloat(m[1]) : 0;
}

/** Change a Text's size in px; returns a function that puts the old size back. */
function setTextPx(t, px) {
  if (parseFloat(t.style.fontSize)) {
    const old = t.style.fontSize;
    t.setFontSize(px + "px");
    return () => { if (t.active) t.setFontSize(old); };
  }
  const oldFont = t.style._font;
  t.setFont(oldFont.replace(/\d+(?:\.\d+)?px/, px + "px"));
  return () => { if (t.active) t.setFont(oldFont); };
}

function deepTexts(o, out = []) {
  if (o.type === "Text") out.push(o);
  else if (o.type === "Container") o.list.forEach((c) => deepTexts(c, out));
  return out;
}

const isFullScreen = (b) => b.w >= 1200 && b.h >= 680;

function findOverlay(scene) {
  let best = null;
  for (const o of scene.children.list) {
    if (!isVisible(o)) continue;
    const full = (o.type === "Rectangle" && o.displayWidth >= 1200 && o.displayHeight >= 680)
      || (o.type === "Graphics" && opRects(o).some((r) => r.fill && isFullScreen(toWorld(o, r))));
    if (full && (!best || o.depth >= best.depth)) best = o;
  }
  return best;
}

/** A finite slide / pop animation blocks layout until it ends; an endless idle bob on x / y pins the object where it is. */
function tweenState(scene, o) {
  let blocking = false, animated = false;
  for (const t of scene.tweens.getTweensOf(o)) {
    const keys = t.data.filter((d) => d.key === "x" || d.key === "y" || d.key === "scale" || d.key === "scaleX" || d.key === "scaleY");
    if (!keys.length) continue;
    const infinite = t.isInfinite || t.loop === -1 || t.data.some((d) => d.repeat === -1);
    if (!infinite) blocking = true;
    else if (keys.some((d) => d.key === "x" || d.key === "y")) animated = true;
  }
  return { blocking, animated };
}
const hasPositionTween = (scene, o) => tweenState(scene, o).blocking;

function collectLayer(scene, overlay) {
  const out = [];
  for (const o of scene.children.list) {
    if (o === overlay || !isVisible(o) || o.depth < overlay.depth) continue;
    if (o.type === "ParticleEmitter" || o.type === "DOMElement") continue;
    if (o.type === "Zone" && !(o.input && o.input.enabled)) continue;
    out.push(o);
  }
  return out;
}

/** A single large Container that holds the whole panel (background + texts) is
 * unpacked so its children can be laid out; only unscaled containers qualify. */
function flatten(layer) {
  const out = [];
  for (const o of layer) {
    const b = o.type === "Container" ? boundsOf(o) : null;
    const panelLike = o.type === "Container" && (o.list.some((c) => c.type === "Graphics" || c.type === "Rectangle") || o.list.length >= 5);
    // a smaller container that is just a framed group of lines (frame + two or more texts) is unpacked as well
    const framedGroup = o.type === "Container" && o.list.filter((c) => c.type === "Text").length >= 2
      && o.list.some((c) => c.type === "Graphics" && opRects(c).some((r) => RECT_OPS.has(r.n) && r.x1 - r.x0 >= 150 && r.y1 - r.y0 >= 36));
    const plain = o.scaleX === 1 && o.scaleY === 1 && o.angle === 0 && !(o.input && o.input.enabled);
    if (b && plain && ((panelLike && b.w >= 250 && b.h >= 200) || (framedGroup && b.w >= 250))) out.push(...o.list.filter(isVisible));
    else out.push(o);
  }
  return out;
}

function signature(layer) {
  // content only (what is on the panel and its text), not positions: idle animations keep moving things, and
  // finite slide / pop animations are handled by tweenState()
  const one = (o) => {
    if (o.type === "Text") return "T:" + o.text + ":" + textPx(o);
    if (o.type === "Container") return "C[" + o.list.filter(isVisible).map(one).join(",") + "]";
    return o.type;
  };
  return layer.map(one).join("|");
}

function restore(st) {
  for (const f of st.saved) f();
  st.saved = [];
}

function explanatory(t) {
  return t.text.length >= 38 || /learned|badge|unlocked|tip|hint/i.test(t.text);
}

/** Re-issue a Graphics' recorded draw calls (optionally with edited arguments). */
function replay(g, ops) {
  g.clear();
  for (const op of ops) Phaser.GameObjects.Graphics.prototype[op.n].apply(g, op.a);
}

/** Redraw every rect (fill / stroke twins) in Graphics `g` that matches world rect `ref` so it covers world rect `target`
 * instead, keeping each twin's inset from the edge. The previous draw calls are restored by the pushed closure. */
function resizeRectOps(g, ref, target, st) {
  const m = g.getWorldTransformMatrix(), sx = Math.abs(m.a) || 1, sy = Math.abs(m.d) || 1;
  const oldOps = g.__ops.map((op) => ({ n: op.n, a: op.a.slice() }));
  const newOps = oldOps.map((op) => {
    if (!RECT_OPS.has(op.n)) return op;
    const lx = op.a[0], ly = op.a[1], lw = op.a[2], lh = op.a[3];
    const wb = toWorld(g, { x0: lx, y0: ly, x1: lx + lw, y1: ly + lh });
    if (!(Math.abs(wb.x - ref.x) <= 8 && Math.abs(wb.y - ref.y) <= 8 && Math.abs(wb.w - ref.w) <= 12 && Math.abs(wb.h - ref.h) <= 12)) return op;
    const insetL = wb.x - ref.x, insetT = wb.y - ref.y, insetR = ref.x + ref.w - (wb.x + wb.w), insetB = ref.y + ref.h - (wb.y + wb.h);
    const nx = target.x + insetL, ny = target.y + insetT, nw = target.w - insetL - insetR, nh = target.h - insetT - insetB;
    const a = op.a.slice();
    a[0] = lx + (nx - wb.x) / sx; a[1] = ly + (ny - wb.y) / sy; a[2] = nw / sx; a[3] = nh / sy;
    return { n: op.n, a };
  });
  replay(g, newOps);
  st.saved.push(() => { if (g.active) replay(g, oldOps); });
}

function fit(scene, st) {
  const overlay = findOverlay(scene);
  if (!overlay) return false;
  // the persistent HUD bar (UIScene, Levels 1-21) sits above the panel layer; other scenes' HUDs are covered by the dim overlay
  // lay out inside the part of the world the camera actually shows (some scenes zoom / scroll their camera)
  const cam = scene.cameras.main, wv = cam.worldView;
  const VIEW_TOP = wv.y, VIEW_BOTTOM = wv.y + wv.height, VIEW_LEFT = wv.x, VIEW_RIGHT = wv.x + wv.width;
  const TOP_SAFE = (scene.scene.manager.isActive("UIScene") ? 64 : 16) / (cam.zoom || 1);
  const BOTTOM_SAFE_V = BOTTOM_SAFE / (cam.zoom || 1);
  const AVAIL_H = VIEW_BOTTOM - VIEW_TOP - TOP_SAFE - BOTTOM_SAFE_V;
  restore(st);
  const layer = flatten(collectLayer(scene, overlay));

  // ── 1. measure the original layout ──
  let items = layer.map((o) => ({ o, b0: boundsOf(o) })).filter((i) => i.b0 && (i.b0.w > 0 || i.b0.h > 0));
  items = items.filter((i) => !(isFullScreen(i.b0) && i.o.type !== "Graphics"));
  const area = (b) => b.w * b.h;

  // panel background = the biggest filled rectangle: a Rectangle shape, or a rect drawn into some Graphics
  // (possibly the very Graphics that also draws the dim overlay)
  const cands = [];
  for (const o of [overlay, ...layer]) {
    if (o.type === "Graphics") {
      for (const r of opRects(o)) {
        if (!RECT_OPS.has(r.n)) continue;
        const wb = toWorld(o, r);
        if (wb.w >= 250 && wb.h >= 140 && !isFullScreen(wb)) cands.push({ o, r, b: wb });
      }
    } else if (o.type === "Rectangle" && o !== overlay) {
      const b = boundsOf(o);
      if (b && b.w >= 250 && b.h >= 140 && !isFullScreen(b)) cands.push({ o, r: null, b });
    }
  }
  cands.sort((a, b) => area(b.b) - area(a.b));
  const bgMain = cands[0] || null;
  const bgParts = bgMain ? cands.filter((c) => Math.abs(c.b.x - bgMain.b.x) <= 8 && Math.abs(c.b.y - bgMain.b.y) <= 8 && Math.abs(c.b.w - bgMain.b.w) <= 12 && Math.abs(c.b.h - bgMain.b.h) <= 12) : [];
  const bgObjs = new Set(bgParts.map((c) => c.o));
  let content = items.filter((i) => !bgObjs.has(i.o));
  const bgRect = bgMain ? bgMain.b : null;

  // ignore tiny decorations (sparkles, stars) and anything that lies outside the panel itself
  const interactive = (i) => !!(i.o.input && i.o.input.enabled);
  content = content.filter((i) => i.o.type === "Text" || interactive(i) || Math.max(i.b0.w, i.b0.h) >= 12);
  if (bgRect) {
    const m = 24;
    content = content.filter((i) => i.b0.x + i.b0.w > bgRect.x - m && i.b0.x < bgRect.x + bgRect.w + m && i.b0.y + i.b0.h > bgRect.y - m && i.b0.y < bgRect.y + bgRect.h + m);
  } else {
    content = content.filter((i) => i.o.type === "Text" || interactive(i) || (i.b0.x >= 0 && i.b0.x + i.b0.w <= W));
  }
  // a drawn frame around two or more text lines (e.g. a "WING COMPLETE" ribbon): its lines are laid out as normal rows
  // and the frame is redrawn around them afterwards
  const boxes = [];
  for (const i of content) {
    if (i.o.type !== "Graphics" || !i.o.__ops) continue;
    const rs = opRects(i.o).filter((r) => RECT_OPS.has(r.n)).map((r) => toWorld(i.o, r)).filter((wb) => wb.w >= 150 && wb.h >= 36 && !isFullScreen(wb)).sort((p, q) => q.w * q.h - p.w * p.h);
    if (!rs.length) continue;
    const main = rs[0];
    const members = content.filter((j) => j !== i && j.o.type === "Text" && j.b0.x + j.b0.w / 2 >= main.x && j.b0.x + j.b0.w / 2 <= main.x + main.w && j.b0.y + j.b0.h / 2 >= main.y && j.b0.y + j.b0.h / 2 <= main.y + main.h);
    if (members.length >= 2) boxes.push({ i, main, members });
  }
  content = content.filter((j) => !boxes.some((bx) => bx.i === j));
  const fontItems = content.slice(); // every object of the panel gets its small fonts raised, even tall containers
  content = content.filter((i) => !tweenState(scene, i.o).animated); // endlessly bobbing decorations stay where they are
  const refH = bgRect ? bgRect.h : H * 0.7;
  content = content.filter((i) => i.b0.h <= refH * 0.8 || i.o.type === "Text");

  const targetW = bgRect ? Math.min(1100, wv.width - 40, Math.max(bgRect.w, 640)) : Math.min(1000, wv.width - 40);
  const innerW = targetW - 2 * PAD_X;

  // ── 2. buttons: which text labels a button-like object ──
  const buttons = content.filter((i) => interactive(i) && i.o.type !== "Text");
  const labelOf = new Map();
  for (const bt of buttons) {
    if (bt.o.type === "Container") continue;
    const lab = content.find((t) => t.o.type === "Text" && t.b0.x >= bt.b0.x - 3 && t.b0.y >= bt.b0.y - 3 && t.b0.x + t.b0.w <= bt.b0.x + bt.b0.w + 3 && t.b0.y + t.b0.h <= bt.b0.y + bt.b0.h + 3);
    if (lab) labelOf.set(bt, lab);
  }

  // ── 3. fonts: raise (never shrink) and wrap ──
  const allTexts = [];
  fontItems.forEach((i) => deepTexts(i.o, allTexts));
  for (const t of allTexts) {
    const px = textPx(t);
    if (!px) continue;
    const m = t.getWorldTransformMatrix();
    let s = Math.abs(m.scaleX);
    if (!(s > 0.5 && s < 3)) s = 1; // a text that is mid pop-in (scale ~0) will end up at its natural size
    const base = px * s;
    if (base < HEADING_FONT) {
      let target = Math.max(MIN_FONT, Math.round(base * 1.15));
      if (explanatory(t)) target = Math.max(BODY_FONT, target);
      if (target > base) {
        st.saved.push(setTextPx(t, Math.round((target / s) * 10) / 10));
      }
    }
    const b = boundsOf(t);
    if (b.w > innerW) {
      const oldWrap = t.style.wordWrapWidth, oldAlign = t.style.align;
      t.setWordWrapWidth(innerW / s, true);
      if (t.originX === 0.5) t.setAlign("center");
      st.saved.push(() => { if (t.active) { t.setWordWrapWidth(oldWrap || null, !!t.style.wordWrapUseAdvanced); t.setAlign(oldAlign); } });
    }
  }

  // ── 4. buttons grow to fit their (larger) labels ──
  for (const [bt, lab] of labelOf) {
    const o = bt.o, lb = lab.o.getBounds();
    const needW = lb.width + 28, needH = lb.height + 16;
    if (typeof o.setSize === "function" && (o.displayWidth < needW || o.displayHeight < needH)) {
      const ow = o.width, oh = o.height, ox = o.x, oy = o.y;
      const bb = boundsOf(o), cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
      o.setSize(Math.max(ow, needW), Math.max(oh, needH));
      if (o.type === "Zone") o.setPosition(cx - o.width / 2 + o.originX * o.width, cy - o.height / 2 + o.originY * o.height);
      if (o.input && o.input.hitArea && o.input.hitArea.setSize) o.input.hitArea.setSize(o.width, o.height);
      st.saved.push(() => { if (o.active) { o.setSize(ow, oh); o.setPosition(ox, oy); if (o.input && o.input.hitArea && o.input.hitArea.setSize) o.input.hitArea.setSize(ow, oh); } });
    }
  }
  // Graphics pill drawn behind a Text label (often with a Zone on top as the hit area): redraw the pill larger
  // when the raised label no longer fits, and grow the matching Zone with it
  for (const tx of content.filter((i) => i.o.type === "Text")) {
    const pill = content.filter((i) => i.o.type === "Graphics" && i.o.__ops && i.b0.w < 520 && i.b0.h < 140
      && i.b0.x <= tx.b0.x + 3 && i.b0.y <= tx.b0.y + 3 && i.b0.x + i.b0.w >= tx.b0.x + tx.b0.w - 3 && i.b0.y + i.b0.h >= tx.b0.y + tx.b0.h - 3)
      .sort((a, b) => a.b0.w * a.b0.h - b.b0.w * b.b0.h)[0];
    if (!pill) continue;
    const lb = boundsOf(tx.o);
    const nw = Math.max(pill.b0.w, lb.w + 32), nh = Math.max(pill.b0.h, lb.h + 14);
    if (nw === pill.b0.w && nh === pill.b0.h) continue;
    const g = pill.o, m = g.getWorldTransformMatrix(), sx = Math.abs(m.a) || 1, sy = Math.abs(m.d) || 1;
    const oldOps = g.__ops.map((op) => ({ n: op.n, a: op.a.slice() }));
    const cxw = pill.b0.x + pill.b0.w / 2, cyw = pill.b0.y + pill.b0.h / 2;
    const newOps = oldOps.map((op) => {
      if (!RECT_OPS.has(op.n)) return op;
      const wb = toWorld(g, { x0: op.a[0], y0: op.a[1], x1: op.a[0] + op.a[2], y1: op.a[1] + op.a[3] });
      if (Math.abs(wb.x - pill.b0.x) > 3 || Math.abs(wb.y - pill.b0.y) > 3 || Math.abs(wb.w - pill.b0.w) > 4 || Math.abs(wb.h - pill.b0.h) > 4) return op;
      const a = op.a.slice();
      a[0] = op.a[0] + ((cxw - nw / 2) - wb.x) / sx; a[1] = op.a[1] + ((cyw - nh / 2) - wb.y) / sy; a[2] = nw / sx; a[3] = nh / sy;
      return { n: op.n, a };
    });
    replay(g, newOps);
    st.saved.push(() => { if (g.active) replay(g, oldOps); });
    for (const z of content.filter((i) => i.o.type === "Zone" && Math.abs(i.b0.x - pill.b0.x) <= 4 && Math.abs(i.b0.y - pill.b0.y) <= 4 && Math.abs(i.b0.w - pill.b0.w) <= 6 && Math.abs(i.b0.h - pill.b0.h) <= 6)) {
      const zo = z.o, zw = zo.width, zh = zo.height, zx = zo.x, zy = zo.y;
      zo.setSize(nw, nh);
      zo.setPosition(cxw - nw / 2 + zo.originX * nw, cyw - nh / 2 + zo.originY * nh);
      st.saved.push(() => { if (zo.active) { zo.setSize(zw, zh); zo.setPosition(zx, zy); } });
    }
  }
  // container-style buttons (Graphics pill + Text label): redraw the pill larger if the label no longer fits
  for (const bt of buttons) {
    const o = bt.o;
    if (o.type !== "Container") continue;
    const gfx = o.list.find((c) => c.type === "Graphics" && c.__ops && c.__ops.length), lab = o.list.find((c) => c.type === "Text");
    if (!gfx || !lab) continue;
    const pill = opRects(gfx).filter((r) => RECT_OPS.has(r.n)).sort((a, b) => (b.x1 - b.x0) * (b.y1 - b.y0) - (a.x1 - a.x0) * (a.y1 - a.y0))[0];
    if (!pill) continue;
    const lb = lab.getBounds(), pw = pill.x1 - pill.x0, ph = pill.y1 - pill.y0;
    const kx = Math.max(1, (lb.width + 32) / pw), ky = Math.max(1, (lb.height + 16) / ph);
    if (kx === 1 && ky === 1) continue;
    const nw = pw * kx, nh = ph * ky, cx = (pill.x0 + pill.x1) / 2, cy = (pill.y0 + pill.y1) / 2;
    const oldOps = gfx.__ops.map((op) => ({ n: op.n, a: op.a.slice() }));
    const newOps = oldOps.map((op) => {
      if (!RECT_OPS.has(op.n) || Math.abs(op.a[0] - pill.x0) > 0.5 || Math.abs(op.a[1] - pill.y0) > 0.5 || Math.abs(op.a[2] - pw) > 0.5) return op;
      const a = op.a.slice(); a[0] = cx - nw / 2; a[1] = cy - nh / 2; a[2] = nw; a[3] = nh;
      if (typeof a[4] === "number") a[4] = Math.min(a[4] * Math.max(kx, 1), nh / 2);
      return { n: op.n, a };
    });
    replay(gfx, newOps);
    const ha = o.input && o.input.hitArea && o.input.hitArea.setTo ? o.input.hitArea : null;
    const had = ha ? { x: ha.x, y: ha.y, w: ha.width, h: ha.height } : null;
    if (ha) ha.setTo(ha.x + ha.width / 2 - (ha.width * kx) / 2, ha.y + ha.height / 2 - (ha.height * ky) / 2, ha.width * kx, ha.height * ky);
    st.saved.push(() => { if (gfx.active) replay(gfx, oldOps); if (ha && had) ha.setTo(had.x, had.y, had.w, had.h); });
  }

  // ── 5. rows from the ORIGINAL geometry, sized from the NEW geometry ──
  const centerY = (i) => i.b0.y + i.b0.h / 2;
  const sorted = content.slice().sort((a, b) => centerY(a) - centerY(b));
  const contains = (o, i) => o.x <= i.x + 3 && o.y <= i.y + 3 && o.x + o.w >= i.x + i.w - 3 && o.y + o.h >= i.y + i.h - 3;
  const sideBySideOrLayered = (a, b) => {
    const hx = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    return hx <= 2 || contains(a, b) || contains(b, a); // disjoint columns, or a label sitting inside its button/bar
  };
  const rows = [];
  for (const it of sorted) {
    const row = rows[rows.length - 1];
    // same row = substantially the same vertical band AND not a partial collision with a member; a line that
    // only grazes or collides with the previous one starts a new row so it gets proper spacing
    const overlap = row ? Math.min(row.bottom0, it.b0.y + it.b0.h) - Math.max(row.top0, it.b0.y) : 0;
    if (row && overlap >= 0.4 * Math.min(it.b0.h, row.bottom0 - row.top0) && row.items.every((m) => sideBySideOrLayered(m.b0, it.b0))) {
      row.items.push(it); row.bottom0 = Math.max(row.bottom0, it.b0.y + it.b0.h); row.top0 = Math.min(row.top0, it.b0.y);
    } else rows.push({ items: [it], top0: it.b0.y, bottom0: it.b0.y + it.b0.h });
  }
  if (!rows.length) return true;
  const labelSet = new Set(labelOf.values());
  rows.forEach((r) => {
    r.c0 = (r.top0 + r.bottom0) / 2;
    r.items.forEach((it) => { it.b1 = boundsOf(it.o) || it.b0; it.c0 = it.b0.y + it.b0.h / 2; });
    // lines stacked inside one row (e.g. inside a decorative box) keep their proportions when their fonts grew
    r.k = Math.max(1, ...r.items.map((it) => (it.b0.h > 0 ? it.b1.h / it.b0.h : 1)));
    r.items.forEach((it) => { it.off = (it.c0 - r.c0) * r.k; });
    r.h1 = Math.max(r.bottom0 - r.top0, ...r.items.map((it) => it.b1.h + 2 * Math.abs(it.off)));
    r.hasButton = r.items.some((it) => buttons.includes(it) || labelOf.has(it) || labelSet.has(it));
  });
  rows.forEach((r, i) => {
    const orig = i === 0 ? 0 : r.top0 - rows[i - 1].bottom0;
    r.gap = i === 0 ? 0 : Math.min(GAP_MAX, Math.max(r.hasButton ? BTN_GAP_MIN : GAP_MIN, orig));
  });

  let padY = PAD_Y;
  const total = () => rows.reduce((a, r) => a + r.h1 + r.gap, 0);
  if (total() + 2 * padY > AVAIL_H) rows.forEach((r, i) => { if (i) r.gap = Math.max(r.hasButton ? 16 : 8, Math.round(r.gap * 0.5)); });
  if (total() + 2 * padY > AVAIL_H) padY = 16;
  const contentH = total();

  // ── 6. place ──
  const origTop = bgRect ? bgRect.y : rows[0].top0;
  const origBottom = bgRect ? bgRect.y + bgRect.h : rows[rows.length - 1].bottom0;
  const panelH = contentH + 2 * padY;
  let panelTop = Math.round((origTop + origBottom) / 2 - panelH / 2);
  panelTop = Math.max(VIEW_TOP + TOP_SAFE, Math.min(VIEW_BOTTOM - BOTTOM_SAFE_V - panelH, panelTop));
  let y = panelTop + padY;
  for (const r of rows) {
    y += r.gap;
    const rowC = y + r.h1 / 2;
    for (const it of r.items) {
      const cur = boundsOf(it.o) || it.b1;
      const want = rowC + it.off;
      const dy = want - (cur.y + cur.h / 2);
      const oy = it.o.y;
      it.o.y = oy + dy;
      st.saved.push(() => { if (it.o.active) it.o.y = oy; });
    }
    y += r.h1;
  }

  // ── 6a. side-by-side texts that outgrew their columns are spread apart (about their original centre) ──
  for (const r of rows) {
    const texts = r.items.filter((i) => i.o.type === "Text" && !labelSet.has(i) && !r.items.some((j) => j !== i && interactive(j) && j.o.type !== "Text" && contains(j.b0, i.b0)));
    if (texts.length < 2) continue;
    const cur = texts.map((i) => ({ i, b: boundsOf(i.o) })).sort((a, b) => a.b.x - b.b.x);
    if (!cur.some((c, k) => k > 0 && c.b.x < cur[k - 1].b.x + cur[k - 1].b.w + 10)) continue;
    const gap = 14, total = cur.reduce((s, c) => s + c.b.w, 0) + gap * (cur.length - 1);
    const origL = Math.min(...texts.map((i) => i.b0.x)), origR = Math.max(...texts.map((i) => i.b0.x + i.b0.w));
    let x = Math.max(VIEW_LEFT + 20, Math.min(VIEW_RIGHT - 20 - total, (origL + origR) / 2 - total / 2));
    for (const c of cur) {
      const dx = x + c.b.w / 2 - (c.b.x + c.b.w / 2), ox = c.i.o.x;
      c.i.o.x = ox + dx;
      st.saved.push(() => { if (c.i.o.active) c.i.o.x = ox; });
      x += c.b.w + gap;
    }
  }

  // ── 6a'. the same for lines of text inside a grouped container (e.g. a row of icon glyphs in a medallion) ──
  for (const i of content) {
    if (i.o.type !== "Container" || (i.o.input && i.o.input.enabled)) continue;
    const kids = i.o.list.filter((c) => c.type === "Text" && isVisible(c) && Math.abs(c.scaleX) >= 0.05).map((c) => ({ c, b: boundsOf(c) }));
    const bands = [];
    for (const k of kids.sort((p, q) => (p.b.y + p.b.h / 2) - (q.b.y + q.b.h / 2))) {
      const band = bands[bands.length - 1];
      if (band && Math.abs(band[0].b.y + band[0].b.h / 2 - (k.b.y + k.b.h / 2)) <= 6) band.push(k); else bands.push([k]);
    }
    for (const band of bands) {
      if (band.length < 2) continue;
      const cur = band.slice().sort((p, q) => p.b.x - q.b.x);
      if (!cur.some((k, n) => n > 0 && k.b.x < cur[n - 1].b.x + cur[n - 1].b.w + 4)) continue;
      const gap = 6, total = cur.reduce((s, k) => s + k.b.w, 0) + gap * (cur.length - 1);
      const mid = (cur[0].b.x + cur[cur.length - 1].b.x + cur[cur.length - 1].b.w) / 2;
      let x = mid - total / 2;
      for (const k of cur) {
        const dx = x + k.b.w / 2 - (k.b.x + k.b.w / 2), ox = k.c.x;
        k.c.x = ox + dx;
        st.saved.push(() => { if (k.c.active) k.c.x = ox; });
        x += k.b.w + gap;
      }
    }
  }

  // ── 6b. buttons that were laid side by side and grew into each other are pushed apart ──
  const btnGroups = content.filter((i) => interactive(i) && i.o.type !== "Text").map((bt) => {
    const b = boundsOf(bt.o) || bt.b1;
    const inside = (c) => c.x + c.w / 2 >= b.x - 2 && c.x + c.w / 2 <= b.x + b.w + 2 && c.y + c.h / 2 >= b.y - 2 && c.y + c.h / 2 <= b.y + b.h + 2;
    const members = new Set([bt.o]);
    for (const i of content) { const c = boundsOf(i.o); if (i !== bt && c && inside(c) && i.o.type !== "Container") members.add(i.o); }
    return { b, members };
  }).sort((a, b) => a.b.x - b.b.x);
  for (let k = 1; k < btnGroups.length; k++) {
    const prev = btnGroups[k - 1], cur = btnGroups[k];
    const sameRow = Math.min(prev.b.y + prev.b.h, cur.b.y + cur.b.h) - Math.max(prev.b.y, cur.b.y) > 4;
    const need = prev.b.x + prev.b.w + 16 - cur.b.x;
    if (!sameRow || need <= 0) continue;
    const half = need / 2;
    for (const g of btnGroups.slice(0, k)) for (const o of g.members) { const ox = o.x; o.x = ox - half; st.saved.push(() => { if (o.active) o.x = ox; }); g.b = rect(g.b.x - half, g.b.y, g.b.w, g.b.h); }
    for (const g of btnGroups.slice(k)) for (const o of g.members) { const ox = o.x; o.x = ox + half; st.saved.push(() => { if (o.active) o.x = ox; }); g.b = rect(g.b.x + half, g.b.y, g.b.w, g.b.h); }
  }

  // ── 6c. frames around grouped lines are redrawn to wrap the lines' new positions ──
  for (const bx of boxes) {
    const ub = unionOf(bx.members.map((mm) => boundsOf(mm.o)));
    if (!ub) continue;
    const padX = 16, padY = 9;
    const nw = Math.max(bx.main.w, ub.w + 2 * padX), cxm = ub.x + ub.w / 2;
    resizeRectOps(bx.i.o, bx.main, rect(cxm - nw / 2, ub.y - padY, nw, ub.h + 2 * padY), st);
  }

  // ── 7. redraw the panel background to fit ──
  if (bgRect) {
    const maxW = Math.max(bgRect.w, ...content.map((i) => (boundsOf(i.o) || i.b0).w + 2 * PAD_X));
    const newW = Math.min(1180, wv.width - 20, Math.max(bgRect.w, Math.min(targetW, maxW)));
    const cx = bgRect.x + bgRect.w / 2, ccy = bgRect.y + bgRect.h / 2;
    const tcy = panelTop + panelH / 2;
    const done = new Set();
    for (const c of bgParts) {
      const o = c.o;
      if (o.type === "Graphics") {
        if (done.has(o)) continue;
        done.add(o);
        resizeRectOps(o, bgRect, rect(cx - newW / 2, panelTop, newW, panelH), st);
      } else if (typeof o.setSize === "function") {
        const ow = o.width, oh = o.height, ox = o.x, oy = o.y;
        o.setSize(newW, panelH);
        o.setPosition(ox + (cx - (bgRect.x + bgRect.w / 2)), oy + (tcy - ccy));
        st.saved.push(() => { if (o.active) { o.setSize(ow, oh); o.setPosition(ox, oy); } });
      }
    }
  }
  return true;
}

export const PanelFit = {
  /**
   * Arm the helper for a scene's end panel. Call at the start of the scene's
   * level-complete / game-over path. Safe to call more than once.
   */
  arm(scene) {
    if (scene.__pf) return; // already armed for this run of the scene
    installRecorder();
    scene.__pfArmed = true;
    const st = { saved: [], sig: "", stable: 0, fitted: "", fits: 0, timer: null, overlay: null, idle: 0 };
    scene.__pf = st;
    st.timer = scene.time.addEvent({
      delay: TICK_MS, loop: true,
      callback: () => {
        if (!scene.sys || !scene.sys.isActive()) return;
        const overlay = findOverlay(scene);
        if (!overlay) {
          // the panel (e.g. an intro / instruction card) has been dismissed: stop recording draw calls until re-armed
          if (st.fits > 0 && ++st.idle >= IDLE_TICKS_BEFORE_DISARM) { scene.__pfArmed = false; scene.__pf = null; st.timer.remove(false); }
          return;
        }
        st.idle = 0;
        if (overlay !== st.overlay) { st.overlay = overlay; st.fits = 0; st.fitted = ""; st.sig = ""; st.stable = 0; st.saved = []; } // a new panel
        const layer = collectLayer(scene, overlay);
        if (layer.some((o) => hasPositionTween(scene, o))) { st.stable = 0; return; }
        const sig = signature(layer);
        st.stable = sig === st.sig ? st.stable + 1 : 0;
        st.sig = sig;
        if (st.stable >= SETTLED_TICKS && sig !== st.fitted && st.fits < MAX_FITS) {
          st.fits++;
          try { fit(scene, st); } catch (e) { console.warn("PanelFit: layout skipped:", e); }
          st.fitted = signature(collectLayer(scene, overlay));
        }
      },
    });
    scene.events.once("shutdown", () => { scene.__pfArmed = false; scene.__pf = null; if (st.timer) st.timer.remove(false); });
  },
};
