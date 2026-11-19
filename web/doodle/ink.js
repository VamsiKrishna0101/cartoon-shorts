// Hand-drawn "doodle" ink primitives for flat 2D shorts. Lines boil (re-jitter) every BOIL frames like hand animation.
export const INK = "#1c1b1a", PAPER = "#fbf7ef", BG = "#a8ae98", FLOOR = "#9ba18a";
export const BOIL = 3;
export const STYLE = { sketch: true, hatch: true };
let frame = 0;
export const setFrame = (f) => { frame = f; };
export const boilSeed = () => Math.floor(frame / BOIL);
const hash = (a, b = 0, c = 0) => { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); };
/** deterministic jitter in [-1,1] for a shape id + point index, changes on each boil step */
export const jit = (id, i, k = 0) => hash(id + boilSeed() * 13.37, i, k) * 2 - 1;

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const prog = (f, a, b) => clamp01((f - a) / (b - a));
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const easeOut = (x) => { x = clamp01(x); return 1 - Math.pow(1 - x, 3); };
export const back = (x, s = 1.8) => { x = clamp01(x); const c = s + 1; return 1 + c * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
export const spring = (x) => { if (x <= 0) return 0; if (x >= 1.4) return 1; return 1 - Math.exp(-5 * x) * Math.cos(11 * x); };
export const mixHex = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t))).toString(16).padStart(2, "0")).join("");
};

/** smooth closed or open path through points (midpoint quadratic) */
const trace = (g, pts, closed) => {
  g.beginPath();
  if (closed) {
    const n = pts.length, m = (i) => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
    g.moveTo(...m(0));
    for (let i = 1; i <= n; i++) g.quadraticCurveTo(pts[i % n][0], pts[i % n][1], ...m(i));
    g.closePath();
  } else {
    g.moveTo(...pts[0]);
    for (let i = 1; i < pts.length - 1; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
    g.lineTo(...pts[pts.length - 1]);
  }
};

/** wobbly ellipse; rot in radians; fill may be null; lw = ink width (0 = none) */
export const blob = (g, id, cx, cy, rx, ry, fill = PAPER, lw = 7, rot = 0, wob = 0.025) => {
  const n = 22, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r = 1 + wob * jit(id, i);
    const x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  trace(g, pts, true);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (fill && STYLE.hatch && Math.min(rx, ry) > 22 && fill !== INK && !fill.startsWith("rgba")) { // shading hatch on the lower-right crescent
    g.save(); g.clip(); g.lineWidth = 2.2; g.strokeStyle = "rgba(28,27,26,.55)"; const R = Math.max(rx, ry);
    for (let k = 0.32; k < 1.4; k += 0.11) { const o = k * R, dx = Math.cos(Math.PI / 4), dy = Math.sin(Math.PI / 4);
      const bx = cx + dx * o + jit(id, 300 + k * 10) * 2, by = cy + dy * o; g.beginPath(); g.moveTo(bx - dy * R * 1.5, by + dx * R * 1.5); g.lineTo(bx + dy * R * 1.5, by - dx * R * 1.5); g.stroke(); }
    g.restore(); trace(g, pts, true); // hatch lines replaced the current path; restore the outline path
  }
  if (lw) {
    g.lineWidth = lw * (STYLE.sketch ? 0.8 : 1) * (1 + 0.12 * jit(id, 99)); g.strokeStyle = INK; g.lineJoin = "round"; g.stroke();
    if (STYLE.sketch) { // second rough pass, slightly off
      const q = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = 1 + (wob + 0.02) * jit(id + 0.5, i);
        const x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r; q.push([cx + x * Math.cos(rot) - y * Math.sin(rot) + 1.5, cy + x * Math.sin(rot) + y * Math.cos(rot) - 1]); }
      trace(g, q.slice(0, n - 2 - Math.floor(3 * (jit(id, 77) + 1))), false); g.lineWidth = lw * 0.4; g.stroke();
    }
  }
};

/** wobbly stroke through points (subdivided so long lines bend a little) */
export const line = (g, id, pts, lw = 7, col = INK, wob = 2.2) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), k = Math.max(1, Math.round(L / 40));
    for (let j = 0; j < k; j++) { const t = j / k; out.push([lerp(ax, bx, t) + wob * jit(id, i * 50 + j, 1), lerp(ay, by, t) + wob * jit(id, i * 50 + j, 2)]); }
  }
  out.push([pts[pts.length - 1][0] + wob * jit(id, 999, 1), pts[pts.length - 1][1] + wob * jit(id, 999, 2)]);
  trace(g, out, false);
  g.lineWidth = lw * (STYLE.sketch && col === INK ? 0.85 : 1); g.strokeStyle = col; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
  if (STYLE.sketch && col === INK && lw > 3.5 && out.length > 1) { trace(g, out.map((p, i) => [p[0] + 1.6 * jit(id + 0.3, i, 3) + 1, p[1] + 1.6 * jit(id + 0.3, i, 4)]), false); g.lineWidth = lw * 0.35; g.stroke(); }
};

/** filled wobbly polygon */
export const poly = (g, id, pts, fill = PAPER, lw = 7, wob = 2.5) => {
  const out = pts.map((p, i) => [p[0] + wob * jit(id, i, 1), p[1] + wob * jit(id, i, 2)]);
  g.beginPath(); g.moveTo(...out[0]); for (const p of out.slice(1)) g.lineTo(...p); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
};

/** capsule limb between two points with a bulge (thickness th), drawn as a rotated wobbly ellipse */
export const limb = (g, id, a, b, th, fill = PAPER, lw = 7) => {
  const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (th < 9) { line(g, id, [a, b], lw); return; }
  blob(g, id, cx, cy, L / 2 + th * 0.35, th, fill, lw, Math.atan2(b[1] - a[1], b[0] - a[0]), 0.03);
};

/** flat paper background with a slanted floor like a sketchbook page */
export const room = (g, id = 1, o = {}) => {
  g.fillStyle = o.bg ?? BG; g.fillRect(-200, -200, 1480, 2320);
  const y0 = o.floorL ?? 1520, y1 = o.floorR ?? 1390;
  g.fillStyle = o.floor ?? FLOOR; g.beginPath(); g.moveTo(-200, y0 + 14); g.lineTo(1280, y1 - 14); g.lineTo(1280, 2200); g.lineTo(-200, 2200); g.closePath(); g.fill();
  line(g, id, [[-200, y0 + 14], [1280, y1 - 14]], 5, "#55594c", 3);
  // a few paper specks so flat areas boil too
  g.fillStyle = "rgba(60,64,52,.18)";
  for (let i = 0; i < 26; i++) { const x = hash(i, 3) * 1080 + 3 * jit(id, i, 5), y = hash(i, 7) * 1920 + 3 * jit(id, i, 6); g.fillRect(x, y, 3, 3); }
};
export const floorY = (x, o = {}) => lerp(o.floorL ?? 1520, o.floorR ?? 1390, x / 1080);
