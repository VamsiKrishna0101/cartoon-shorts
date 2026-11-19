// 2D card drawings that are not people: animals, food, effects. Design canvas 600x1000, soles at y = 975.
// Same look as toon.js: flat fills, plum ink outline, one painted shadow tone.
import { INK, shade, mix } from "../toon.js";

const ell = (g, cx, cy, rx, ry, fill, lw = 7, rot = 0) => {
  g.beginPath(); g.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), rot, 0, Math.PI * 2);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); }
};
const stick = (g, pts, w, col) => {
  g.lineCap = "round"; g.lineJoin = "round";
  for (const [ww, c] of [[w + 7, INK], [w, col]]) {
    g.beginPath(); g.moveTo(...pts[0]); for (const q of pts.slice(1)) g.lineTo(...q);
    g.lineWidth = ww; g.strokeStyle = c; g.stroke();
  }
};
const rr = (g, x, y, w, h, r, fill, lw = 7) => {
  g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); }
};

/**
 * Cow / calf / bull, side view facing right (flip the card to face left).
 * o = { k: size 0.4 calf .. 1 bull, bull: horns+ring, phase: walk 0..1, expr: 'calm'|'happy'|'shock'|'chew'|'smug', blink: 0..1,
 *       body: base colour, spots: spot colour, dangle: legs hang (carried) }
 */
export const cow = (g, o = {}) => {
  const k = o.k ?? 1, base = o.body ?? "#f4efe6", spot = o.spots ?? "#3b2f2c", bull = !!o.bull;
  const legL = 150 * k, bw = 430 * k, bh = 210 * k;
  const bodyY = 975 - legL - bh * 0.42, cx = 300 - 40 * k;
  const ph = (o.phase ?? 0) * Math.PI * 2;
  const legCol = shade(base, 0.86);
  // legs (far pair darker, drawn first)
  const hipX = [cx - bw * 0.33, cx + bw * 0.3];
  const legs = (far) => {
    for (let i = 0; i < 2; i++) {
      const x0 = hipX[i] + (far ? 18 * k : -10 * k), sw = Math.sin(ph + (i ? Math.PI : 0) + (far ? Math.PI : 0)) * 26 * k;
      const top = [x0, bodyY + bh * 0.25];
      const foot = o.dangle ? [x0 + 10 * k, top[1] + legL * 0.85] : [x0 + sw, 975 - 8 * k];
      const knee = [(top[0] + foot[0]) / 2 + (o.dangle ? -14 * k : 0), (top[1] + foot[1]) / 2];
      stick(g, [top, knee, foot], 26 * k, far ? shade(legCol, 0.8) : legCol);
      rr(g, foot[0] - 16 * k, foot[1] - 4 * k, 32 * k, 20 * k, 6 * k, "#4a3a36", 6);
    }
  };
  legs(true);
  // tail
  g.lineWidth = 9; g.strokeStyle = INK; g.beginPath();
  g.moveTo(cx - bw * 0.48, bodyY - bh * 0.15); g.quadraticCurveTo(cx - bw * 0.62, bodyY + bh * 0.1, cx - bw * 0.58, bodyY + bh * 0.45); g.stroke();
  ell(g, cx - bw * 0.58, bodyY + bh * 0.5, 12 * k + 5, 18 * k + 6, spot, 6);
  // body
  g.save(); g.beginPath(); g.ellipse(cx, bodyY, bw / 2, bh / 2, 0, 0, Math.PI * 2); g.fillStyle = base; g.fill(); g.clip();
  g.fillStyle = spot;
  for (const [sx, sy, r] of [[-0.25, -0.2, 0.22], [0.12, 0.1, 0.18], [0.3, -0.3, 0.12], [-0.05, 0.4, 0.12]]) {
    g.beginPath(); g.ellipse(cx + sx * bw, bodyY + sy * bh, r * bw * 0.55, r * bh * 0.95, 0.4, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = "rgba(60,40,80,.18)"; g.fillRect(cx - bw, bodyY + bh * 0.18, bw * 2, bh); // belly shade
  g.restore();
  ell(g, cx, bodyY, bw / 2, bh / 2, null, 8);
  if (!bull && k > 0.75) ell(g, cx - bw * 0.05, bodyY + bh * 0.5, 34 * k, 20 * k, "#f2a7b0", 6); // udder only on grown cows
  legs(false);
  // head
  const hx = cx + bw * 0.5 + 10 * k, hy = bodyY - bh * 0.3;
  if (bull) { // horns
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(hx - 10 * k + s * 26 * k, hy - 62 * k); g.quadraticCurveTo(hx + s * 80 * k, hy - 110 * k, hx + s * 64 * k, hy - 150 * k);
      g.quadraticCurveTo(hx + s * 50 * k, hy - 100 * k, hx + s * 6 * k, hy - 66 * k); g.closePath(); g.fillStyle = "#f6ecd2"; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
  }
  for (const s of [-1, 1]) ell(g, hx + s * 62 * k, hy - 40 * k, 34 * k, 16 * k, shade(base, 0.92), 6, s * -0.4); // ears
  ell(g, hx, hy, 70 * k, 82 * k, base, 8);
  ell(g, hx + 6 * k, hy + 56 * k, 62 * k, 40 * k, "#f6b8b8", 7); // snout
  ell(g, hx - 14 * k, hy + 54 * k, 7 * k + 2, 9 * k + 2, INK, 0); ell(g, hx + 26 * k, hy + 54 * k, 7 * k + 2, 9 * k + 2, INK, 0);
  if (bull) { g.lineWidth = 7; g.strokeStyle = "#e3b94a"; g.beginPath(); g.arc(hx + 6 * k, hy + 74 * k, 18 * k, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
  // eyes
  const blink = (o.blink ?? 0) > 0.5, ex = [hx - 26 * k, hx + 30 * k], ey = hy - 12 * k, expr = o.expr ?? "calm";
  for (const x of ex) {
    if (blink || expr === "happy") { g.lineWidth = 7; g.strokeStyle = INK; g.beginPath(); g.arc(x, ey + 4 * k, 12 * k, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (expr === "shock") { ell(g, x, ey, 17 * k + 3, 19 * k + 3, "#ffffff", 5); ell(g, x, ey, 6 * k + 2, 6 * k + 2, INK, 0); }
    else if (expr === "smug") { ell(g, x, ey, 10 * k + 2, 7 * k + 2, INK, 0); g.lineWidth = 6; g.beginPath(); g.moveTo(x - 16 * k, ey - 8 * k); g.lineTo(x + 16 * k, ey - 10 * k); g.stroke(); }
    else ell(g, x, ey, 9 * k + 3, 11 * k + 3, INK, 0);
  }
  if (expr === "chew" || expr === "happy") { g.lineWidth = 6; g.strokeStyle = INK; g.beginPath(); g.arc(hx + 6 * k, hy + 66 * k, 16 * k, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
  if (expr === "shock") ell(g, hx + 6 * k, hy + 74 * k, 12 * k, 14 * k, "#5a1e28", 5);
};

/** pile of clean cartoon bones on a plate (after the meal) */
export const bonePile = (g, n = 9) => {
  ell(g, 300, 930, 230, 42, "#e8e2d6", 8);
  ell(g, 300, 922, 190, 30, "#f6f2ea", 5);
  const bone = (x, y, a, L) => {
    g.save(); g.translate(x, y); g.rotate(a);
    rr(g, -L / 2, -11, L, 22, 8, "#fbf4e2", 6);
    for (const s of [-1, 1]) for (const t of [-1, 1]) ell(g, s * L / 2, t * 12, 16, 16, "#fbf4e2", 6);
    rr(g, -L / 2 + 4, -8, L - 8, 16, 6, "#fbf4e2", 0);
    g.restore();
  };
  const P = [[220, 900, 0.3, 150], [370, 905, -0.4, 170], [300, 880, 0.05, 190], [250, 860, -0.6, 130], [350, 850, 0.7, 140], [300, 830, -0.15, 160], [200, 870, 1.2, 110], [400, 880, -1.0, 120], [290, 805, 0.4, 120]];
  for (let i = 0; i < Math.min(n, P.length); i++) bone(...P[i]);
};

/** dumbbell drawn flat (for cards held by characters) */
export const dumbbell2D = (g, x, y, size = 1, col = "#3b3f46") => {
  rr(g, x - 60 * size, y - 7 * size, 120 * size, 14 * size, 5, "#9aa1aa", 5);
  for (const s of [-1, 1]) rr(g, x + s * 52 * size - 14 * size, y - 34 * size, 28 * size, 68 * size, 8, col, 6);
};

/** "moo" speech bubble (no words other than the sound) */
export const mooBubble = (g, t = 1) => {
  const s = Math.min(1, t);
  g.save(); g.translate(300, 500); g.scale(s, s);
  ell(g, 0, 0, 200, 120, "#ffffff", 9);
  g.beginPath(); g.moveTo(-60, 90); g.lineTo(-120, 190); g.lineTo(-10, 110); g.fillStyle = "#ffffff"; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
  ell(g, 0, 0, 196, 116, "#ffffff", 0);
  g.font = "bold 110px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = INK;
  g.fillText("MOO", 0, 8);
  g.restore();
};

/** sweat drops / effort lines around a head at (x,y) */
export const sweat = (g, x, y, t) => {
  for (let i = 0; i < 3; i++) {
    const a = -0.6 + i * 0.6, d = 120 + ((t * 60 + i * 30) % 50);
    const px = x + Math.sin(a) * d, py = y - Math.cos(a) * d * 0.7 + ((t * 60 + i * 30) % 50);
    g.beginPath(); g.moveTo(px, py - 22); g.quadraticCurveTo(px + 14, py + 4, px, py + 12); g.quadraticCurveTo(px - 14, py + 4, px, py - 22);
    g.fillStyle = "#9fd8ff"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  }
};

/** confetti burst (flat card, t = seconds since burst) */
export const confetti = (g, t, seed = 1) => {
  const cols = ["#ff5a5f", "#ffd23f", "#3bceac", "#5e60ce", "#ff9f1c", "#ffffff"];
  for (let i = 0; i < 70; i++) {
    const r1 = Math.sin(seed * 31 + i * 12.9898) * 43758.5453 % 1, r2 = Math.sin(seed * 17 + i * 78.233) * 12543.123 % 1;
    const a = Math.abs(r1) * Math.PI * 2, v = 250 + Math.abs(r2) * 300;
    const x = 300 + Math.cos(a) * v * t, y = 450 + Math.sin(a) * v * t * 0.8 + 380 * t * t;
    g.save(); g.translate(x, y); g.rotate(i + t * 8); g.fillStyle = cols[i % cols.length]; g.fillRect(-9, -5, 18, 10); g.restore();
  }
};

/** speed lines for whooshes (flat card) */
export const speedLines = (g, t) => {
  g.strokeStyle = "rgba(255,255,255,.85)"; g.lineCap = "round";
  for (let i = 0; i < 9; i++) { const y = 150 + i * 90, x = 80 + ((i * 97 + t * 900) % 400); g.lineWidth = 10 - (i % 3) * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 140, y); g.stroke(); }
};

/** iron ball and chain lying by a foot; (fx, fy) = ankle point on the card */
export const ballChain = (g, fx = 340, fy = 950, t = 0) => {
  const bx = fx + 120, by = 975 - 46 + Math.abs(Math.sin(t * 6)) * 0;
  for (let i = 0; i < 5; i++) { const k = i / 4, x = fx + (bx - fx) * k, y = fy + (by - 20 - fy) * k + Math.sin(k * Math.PI) * 18;
    ell(g, x, y, 13, 9, null, 6, i % 2 ? 0 : 1.2); }
  ell(g, bx, by, 46, 46, "#3a3a42", 8); ell(g, bx - 14, by - 16, 12, 9, "#6a6a78", 0);
};

/** paper grocery bag held at (x, y) = hand point; bread + greens poke out */
export const groceryBag = (g, x, y, s = 1, seed = 0) => {
  g.save(); g.translate(x, y + 70 * s); g.scale(s, s);
  rr(g, -22, -150, 30, 70, 12, "#e9c27a", 6); // baguette
  ell(g, 24, -88, 26, 30, "#6db35a", 6); ell(g, 10, -102, 18, 22, "#86c96c", 5);
  if (seed % 2) ell(g, -30, -84, 20, 20, "#ff7a3d", 6);
  rr(g, -58, -80, 116, 150, 10, "#d6a96e", 7);
  g.fillStyle = "rgba(80,40,10,.18)"; g.fillRect(-50, -70, 26, 132);
  g.restore();
};

/** cartoon flame (calorie burn), t animates the flicker, s = size */
export const flame = (g, x, y, s = 1, t = 0) => {
  const w = Math.sin(t * 17) * 8, h2 = Math.sin(t * 23 + 1) * 10;
  const blob = (sc, col) => { g.beginPath(); g.moveTo(x, y - (170 + h2) * s * sc); g.bezierCurveTo(x + (70 + w) * s * sc, y - 90 * s * sc, x + 80 * s * sc, y, x, y);
    g.bezierCurveTo(x - 80 * s * sc, y, x - (70 - w) * s * sc, y - 90 * s * sc, x, y - (170 + h2) * s * sc); g.fillStyle = col; g.fill(); g.lineWidth = sc === 1 ? 8 : 0; g.strokeStyle = INK; if (sc === 1) g.stroke(); };
  blob(1, "#ff7a2f"); blob(0.62, "#ffd23f"); blob(0.3, "#fff6c9");
};

/** wallet spilling gold coins; t = seconds since it opened */
export const wallet = (g, t = 0, x = 300, y = 520) => {
  for (let i = 0; i < 14; i++) { const r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1), r2 = Math.abs(Math.sin(i * 78.233) * 12543.12 % 1);
    const tt = Math.max(0, t - i * 0.05), px = x + (r1 - 0.5) * 380 * tt, py = y - 40 - 520 * tt + 900 * tt * tt;
    if (tt <= 0 || py > 990) continue;
    g.save(); g.translate(px, py); g.scale(Math.abs(Math.cos(tt * 9 + i)) * 0.8 + 0.2, 1);
    ell(g, 0, 0, 30, 30, "#ffc93c", 6); ell(g, 0, 0, 18, 18, null, 4); g.restore(); }
  g.save(); g.translate(x, y); g.rotate(-0.15);
  rr(g, -95, -55, 190, 110, 18, "#7a4a2e", 8); rr(g, -95, -55, 190, 40, 14, "#94603c", 6); ell(g, 70, -18, 10, 10, "#ffd23f", 5);
  g.restore();
};

/** wall clock face; hand angle from t (hours spin) */
export const clock = (g, t = 0) => {
  ell(g, 300, 500, 200, 200, "#fbf6ea", 12); ell(g, 300, 500, 14, 14, INK, 0);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.lineWidth = 9; g.strokeStyle = INK; g.beginPath(); g.moveTo(300 + Math.sin(a) * 160, 500 - Math.cos(a) * 160); g.lineTo(300 + Math.sin(a) * 182, 500 - Math.cos(a) * 182); g.stroke(); }
  const hand = (a, L, w) => { g.lineWidth = w; g.strokeStyle = INK; g.beginPath(); g.moveTo(300, 500); g.lineTo(300 + Math.sin(a) * L, 500 - Math.cos(a) * L); g.stroke(); };
  hand(t * 0.5, 100, 16); hand(t * 6, 150, 10);
};

/** church bell, flat; o = { x, y, s, rot, tape: mouth taped shut (a "dumb" bell), col } */
export const bell2D = (g, o = {}) => {
  const x = o.x ?? 300, y = o.y ?? 420, s = o.s ?? 1, col = o.col ?? "#e0b04a";
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  rr(g, -26, -230, 52, 50, 16, shade(col, 0.8), 7); // crown loop
  g.beginPath(); g.moveTo(-70, -190); g.bezierCurveTo(-90, -120, -95, -20, -170, 40); g.lineTo(170, 40);
  g.bezierCurveTo(95, -20, 90, -120, 70, -190); g.quadraticCurveTo(0, -215, -70, -190); g.closePath();
  g.fillStyle = col; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.ellipse(-35, -110, 14, 60, 0.15, 0, Math.PI * 2); g.fill();
  rr(g, -175, 32, 350, 26, 12, shade(col, 0.85), 7);
  if (o.tape) {
    for (const [a, c] of [[0.2, "#f2e6c8"], [-0.2, "#efe0bd"]]) { g.save(); g.translate(0, 45); g.rotate(a); rr(g, -150, -18, 300, 36, 4, c, 6); g.restore(); }
  } else ell(g, 0 + Math.sin((o.t ?? 0) * 9) * 30, 70, 28, 28, "#4a4650", 7); // clapper
  g.restore();
};

/** loud sound rings radiating from (x, y); t = 0..1 */
export const soundRings = (g, t, x = 300, y = 500) => {
  for (let i = 0; i < 3; i++) {
    const k = (t * 1.6 + i * 0.33) % 1, r = 60 + k * 230;
    g.globalAlpha = 1 - k; g.lineWidth = 16 * (1 - k) + 4; g.strokeStyle = "#ffffff";
    for (const side of [-1, 1]) { g.beginPath(); g.arc(x, y, r, side > 0 ? -0.7 : Math.PI - 0.7, side > 0 ? 0.7 : Math.PI + 0.7); g.stroke(); }
  }
  g.globalAlpha = 1;
};

/** swaddled sleeping baby, lying across (x, y), s = size; awake = eyes open */
export const baby = (g, x = 300, y = 600, s = 1, o = {}) => {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot ?? 0);
  rr(g, -150, -55, 230, 110, 55, o.blanket ?? "#9fd0ff", 8);
  g.lineWidth = 5; g.strokeStyle = shade(o.blanket ?? "#9fd0ff", 0.75); g.beginPath(); g.moveTo(-60, -50); g.quadraticCurveTo(-30, 0, -70, 50); g.stroke();
  ell(g, 110, -5, 72, 66, SK, 8);
  ell(g, 90, 22, 13, 8, "#ffb0a8", 0); ell(g, 140, 22, 13, 8, "#ffb0a8", 0);
  g.lineWidth = 6; g.strokeStyle = INK; g.lineCap = "round";
  if (o.awake) { ell(g, 92, -8, 7, 9, INK, 0); ell(g, 132, -8, 7, 9, INK, 0); }
  else for (const ex of [92, 132]) { g.beginPath(); g.arc(ex, -12, 11, 0.2, Math.PI - 0.2); g.stroke(); }
  g.beginPath(); g.arc(112, 30, 7, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(105, -68); g.quadraticCurveTo(125, -95, 112, -110); g.stroke(); // curl
  g.restore();
};
const SK = "#ffe2c2";

/** floating sleep Z's above (x, y); t seconds (comic symbol, no words) */
export const zzz = (g, t, x = 300, y = 400) => {
  g.font = "bold 70px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.lineWidth = 10; g.strokeStyle = INK; g.fillStyle = "#ffffff";
  for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1, px = x + k * 120 + Math.sin(k * 6) * 15, py = y - k * 260, sz = 0.6 + k * 0.7;
    g.save(); g.globalAlpha = Math.min(1, (1 - k) * 2.5); g.translate(px, py); g.scale(sz, sz); g.strokeText("Z", 0, 0); g.fillText("Z", 0, 0); g.restore(); }
  g.globalAlpha = 1;
};

/** impact burst lines + dust at floor point (x, y); t = 0..1 */
export const impact = (g, t, x = 300, y = 900) => {
  const k = Math.min(1, t);
  g.lineCap = "round"; g.strokeStyle = INK;
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI, r0 = 60 + k * 120, r1 = r0 + 90 * (1 - k) + 20;
    g.lineWidth = 12 * (1 - k) + 3; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.7); g.stroke(); }
  for (let i = 0; i < 6; i++) ell(g, x + (i - 2.5) * 70 * (0.6 + k), y - 20 - Math.sin(i) * 15 * k, 40 * (1 - k * 0.6), 28 * (1 - k * 0.6), "rgba(230,225,215,.9)", 5);
};
