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

// ---------------------------------------------------------------- burpee story
/** Side-view burpee athlete (facing right). Joints per pose in design units, floor y = 975.
 *  burpeeGuy(g, look, { a, b, u, expr, blink, t, sweat }) blends pose a -> b by u (0..1). look = same colour object as toon.js. */
const BP = {
  //        ankle      knee       hip        shoulder   elbow      wrist      head
  stand:  [[ 320, 958], [ 322, 840], [ 320, 722], [ 320, 552], [ 334, 650], [ 338, 742], [ 324, 458]],
  squat:  [[ 320, 958], [ 378, 872], [ 265, 890], [ 332, 738], [ 398, 770], [ 460, 752], [ 370, 652]],
  hands:  [[ 320, 958], [ 385, 880], [ 295, 858], [ 400, 770], [ 406, 868], [ 410, 962], [ 466, 702]],
  plank:  [[  42, 955], [ 132, 905], [ 222, 862], [ 400, 772], [ 402, 868], [ 406, 962], [ 486, 728]],
  push:   [[  42, 958], [ 132, 940], [ 222, 918], [ 400, 885], [ 352, 918], [ 406, 962], [ 486, 845]],
  jump:   [[ 320, 800], [ 320, 682], [ 320, 564], [ 320, 394], [ 378, 330], [ 430, 250], [ 324, 300]],
  flat:   [[  30, 958], [ 125, 958], [ 222, 950], [ 392, 940], [ 460, 958], [ 526, 960], [ 482, 900]],
};
export const BURPEE_POSES = Object.keys(BP);
/** where a rep cycle is: ph in 0..1 per rep. opts = { push, jump } add the push-up / jump. Returns { a, b, u } */
export const burpeeCycle = (ph, o = {}) => {
  const seq = ["stand", "squat", "hands", "plank"];
  if (o.push) seq.push("push", "plank");
  seq.push("hands", "squat");
  if (o.jump) seq.push("jump");
  seq.push("stand");
  const n = seq.length - 1, x = (((ph % 1) + 1) % 1) * n, i = Math.floor(x), f = x - i;
  const s = f * f * (3 - 2 * f);
  return { a: seq[i], b: seq[Math.min(n, i + 1)], u: s };
};
export const burpeeGuy = (g, look, o = {}) => {
  const A = BP[o.a ?? "stand"], B = BP[o.b ?? o.a ?? "stand"], u = o.u ?? 0;
  const J = A.map((p, i) => [p[0] + (B[i][0] - p[0]) * u, p[1] + (B[i][1] - p[1]) * u]);
  const [an, kn, hp, sh, el, wr, hd] = J;
  const pants = look.pants ?? "#2a2d33", jacket = look.jacket ?? "#2f6fd6", skin = look.skin ?? "#ffe2c2", boots = look.boots ?? "#f4f1ea";
  const far = (c) => mix(c, INK, 0.35);
  const foot = (p, col) => { const flatK = Math.min(1, Math.max(0, (p[0] - 120) / 150)); // standing feet flat, plank feet on toes
    g.save(); g.translate(p[0], p[1]); g.rotate(-1.1 * (1 - flatK)); ell(g, 22, 4, 36, 16, col, 6); g.restore(); };
  // far limbs (offset back a little)
  const off = (p, d = -14) => [p[0] + d, p[1] - 4];
  stick(g, [off(hp), off(kn), off(an)], 30, far(pants)); foot(off(an), far(boots));
  stick(g, [off(sh, -10), off(el, -10), off(wr, -10)], 22, far(jacket)); ell(g, wr[0] - 10, wr[1] - 4, 15, 15, far(skin), 5);
  // torso: thick capsule hip -> shoulder
  stick(g, [hp, sh], 74, jacket);
  stick(g, [[hp[0], hp[1]], [hp[0] + (sh[0] - hp[0]) * 0.12, hp[1] + (sh[1] - hp[1]) * 0.12]], 70, pants);
  // near leg + arm
  stick(g, [hp, kn, an], 32, pants); foot(an, boots);
  stick(g, [sh, el, wr], 24, jacket); ell(g, wr[0], wr[1], 17, 17, skin, 6);
  // head, tilted with the torso
  const tilt = Math.atan2(sh[0] - hp[0], hp[1] - sh[1]) * 0.45;
  g.save(); g.translate(hd[0], hd[1]); g.rotate(tilt);
  ell(g, 0, 0, 74, 84, skin, 8);
  if (look.hat === "cap") {
    g.beginPath(); g.ellipse(0, -18, 76, 70, 0, Math.PI, Math.PI * 2); g.closePath(); g.fillStyle = look.cap ?? "#e2453c"; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    rr(g, 20, -30, 80, 18, 8, shade(look.cap ?? "#e2453c", 0.8), 6);
  } else if (look.hat === "helmet") {
    g.beginPath(); g.ellipse(0, -20, 86, 74, 0, Math.PI, Math.PI * 2); g.closePath(); g.fillStyle = look.cap ?? "#6b7a4a"; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    rr(g, -92, -26, 184, 14, 7, shade(look.cap ?? "#6b7a4a", 0.8), 6);
  } else {
    g.beginPath(); g.ellipse(-6, -34, 74, 54, 0, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fillStyle = look.hair ?? "#2a1d18"; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  }
  // face (profile, looking right)
  const ex = o.expr ?? "smile", bl = o.blink ? 1 : 0;
  ell(g, 70, 10, 12, 14, skin, 6); // nose
  g.lineCap = "round"; g.strokeStyle = INK; g.lineWidth = 7;
  if (bl && ex !== "dazed" && ex !== "pained") { g.beginPath(); g.moveTo(26, -6); g.lineTo(46, -6); g.stroke(); }
  else if (ex === "shock") { ell(g, 38, -8, 14, 17, "#ffffff", 5); ell(g, 41, -6, 6, 7, INK, 0); }
  else if (ex === "pained") { g.beginPath(); g.moveTo(26, -16); g.lineTo(44, -6); g.lineTo(26, 2); g.stroke(); }
  else if (ex === "dazed") { g.beginPath(); for (let a = 0; a < 12; a += 0.4) { const r = a * 1.4; g.lineTo(36 + Math.cos(a + (o.t ?? 0) * 6) * r, -6 + Math.sin(a + (o.t ?? 0) * 6) * r); } g.stroke(); }
  else ell(g, 36, -6, 7, 10, INK, 0);
  // brow
  g.lineWidth = 7; g.beginPath();
  if (ex === "stern" || ex === "pained") { g.moveTo(20, -36); g.lineTo(50, -28); } else if (ex === "shock") { g.moveTo(22, -40); g.quadraticCurveTo(38, -50, 54, -40); } else { g.moveTo(22, -32); g.quadraticCurveTo(38, -38, 52, -32); }
  g.stroke();
  // mouth
  g.beginPath();
  if (ex === "shock") { ell(g, 42, 40, 12, 16, "#7a2030", 6); }
  else if (ex === "pained") { g.moveTo(28, 44); g.lineTo(38, 36); g.lineTo(48, 44); g.lineTo(58, 36); g.stroke(); }
  else if (ex === "dazed") { g.moveTo(28, 44); g.quadraticCurveTo(42, 34, 56, 44); g.stroke(); ell(g, 52, 54, 6, 10, "#ff9fb0", 4); }
  else if (ex === "stern") { g.moveTo(30, 40); g.lineTo(54, 40); g.stroke(); }
  else if (ex === "grin") { g.moveTo(22, 30); g.quadraticCurveTo(44, 62, 62, 28); g.closePath(); g.fillStyle = "#ffffff"; g.fill(); g.stroke(); }
  else { g.moveTo(26, 34); g.quadraticCurveTo(42, 52, 58, 32); g.stroke(); }
  g.restore();
  if (o.sweat) sweat(g, hd[0] - 10, hd[1] + 10, o.t ?? 0);
  return { head: hd, chest: [(hp[0] + sh[0] * 2) / 3, (hp[1] + sh[1] * 2) / 3], hand: wr };
};

/** wall whiteboard with marker lines (diegetic sign). lines = ["BURPEES", "x 100"] */
export const board2D = (g, lines, o = {}) => {
  rr(g, 40, 260, 520, 380, 14, "#f8f8f4", 10);
  rr(g, 40, 620, 520, 22, 6, "#c9ccd2", 6);
  g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach((L, i) => { const sz = i === 0 ? 92 : 150; g.font = `bold ${sz}px Arial Black, Arial, sans-serif`;
    g.fillStyle = i === 0 ? "#2f3d8a" : (o.col ?? "#e2453c"); g.fillText(L, 300, 350 + i * 160, 470); });
  if (o.strike) { g.lineWidth = 16; g.strokeStyle = "#2a2d33"; g.beginPath(); g.moveTo(140, 470); g.lineTo(460, 560); g.stroke(); }
};

/** clipboard with a ticked sheet; check = 0..1 tick progress */
export const clipboard2D = (g, x, y, s = 1, check = 0) => {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.12);
  rr(g, -60, -80, 120, 160, 10, "#b07a45", 6); rr(g, -48, -62, 96, 132, 4, "#ffffff", 4); rr(g, -24, -92, 48, 22, 6, "#9aa1aa", 5);
  g.lineWidth = 5; g.strokeStyle = "#9fb3d0"; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-34, -36 + i * 26); g.lineTo(30, -36 + i * 26); g.stroke(); }
  if (check > 0) { g.lineWidth = 12; g.strokeStyle = "#2a9a50"; g.beginPath(); const k = Math.min(1, check * 2);
    g.moveTo(-30, 10); g.lineTo(-30 + 22 * k, 10 + 24 * k); if (check > 0.5) { const k2 = (check - 0.5) * 2; g.lineTo(-8 + 50 * k2, 34 - 80 * k2); } g.stroke(); }
  g.restore();
};

/** stopwatch; t = seconds (hand spins) */
export const stopwatch2D = (g, x, y, s = 1, t = 0) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -12, -78, 24, 22, 5, "#c9ccd2", 5); ell(g, 0, 0, 62, 62, "#f2f2ee", 8); ell(g, 0, 0, 50, 50, null, 4);
  g.lineWidth = 7; g.strokeStyle = "#e2453c"; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(t * 6.28) * 42, -Math.cos(t * 6.28) * 42); g.stroke();
  ell(g, 0, 0, 7, 7, INK, 0);
  g.restore();
};

/** cartoon heart; beat = 0..1 pulse */
export const heart2D = (g, x, y, s = 1, beat = 0) => {
  const k = s * (1 + 0.18 * beat);
  g.save(); g.translate(x, y); g.scale(k, k);
  g.beginPath(); g.moveTo(0, 60); g.bezierCurveTo(-90, 0, -70, -70, 0, -30); g.bezierCurveTo(70, -70, 90, 0, 0, 60);
  g.fillStyle = "#ff4d6d"; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(-30, -22, 10, 16, -0.5, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** hot sauce bottle (no brand: a chili on the label); rot tilts it, pour = drops falling from the mouth */
export const hotSauce2D = (g, x, y, s = 1, rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.beginPath(); g.moveTo(-50, 120); g.lineTo(-50, -10); g.quadraticCurveTo(-50, -50, -18, -70); g.lineTo(-18, -120); g.lineTo(18, -120); g.lineTo(18, -70);
  g.quadraticCurveTo(50, -50, 50, -10); g.lineTo(50, 120); g.closePath(); g.fillStyle = "#d8261f"; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  rr(g, -22, -150, 44, 34, 6, "#2a9a50", 6);
  rr(g, -42, 0, 84, 80, 8, "#fff3d0", 6);
  g.save(); g.translate(0, 40); g.rotate(-0.5); g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(0, -22, 26, -4); g.quadraticCurveTo(4, 24, -26, 0);
  g.fillStyle = "#e2453c"; g.fill(); g.lineWidth = 4; g.stroke(); g.restore();
  g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.ellipse(-32, 60, 6, 40, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};
/** falling red drops from (x, y); n drops, t = seconds since pour */
export const sauceDrops = (g, x, y, t, n = 1, spread = 0) => {
  for (let i = 0; i < n; i++) { const tt = t - i * 0.07; if (tt < 0) continue; const py = y + 900 * tt * tt, px = x + Math.sin(i * 7.1) * spread;
    if (py > 990) continue; g.beginPath(); g.moveTo(px, py - 20); g.quadraticCurveTo(px + 13, py + 6, px, py + 12); g.quadraticCurveTo(px - 13, py + 6, px, py - 20);
    g.fillStyle = "#e0261f"; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
};
/** dinner plate with noodles (top-ish view); red = 0..1 sauce coverage */
export const plate2D = (g, x, y, s = 1, red = 0) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(g, 0, 0, 170, 56, "#f4f6fa", 8); ell(g, 0, -4, 120, 38, "#e6e9ef", 4);
  ell(g, 0, -16, 92, 34, mix("#f2cf6b", "#d8261f", red), 6);
  g.lineWidth = 4; g.strokeStyle = mix("#c9a040", "#8a1410", red);
  for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-50 + i * 25, -16, 18, 0.3, 2.6); g.stroke(); }
  if (red < 0.5) { ell(g, -20, -30, 13, 11, "#a0522d", 4); ell(g, 22, -24, 13, 11, "#a0522d", 4); }
  g.restore();
};
/** smoke puffs rising from (x, y), t seconds */
export const smoke = (g, x, y, t, n = 5) => {
  for (let i = 0; i < n; i++) { const k = (t * 0.8 + i / n) % 1, r = 22 + 40 * k;
    g.globalAlpha = Math.min(1, (1 - k) * 1.6); ell(g, x + Math.sin(i * 2.3 + k * 4) * 40, y - k * 380, r, r * 0.85, "#6d6a72", 5); }
  g.globalAlpha = 1;
};
