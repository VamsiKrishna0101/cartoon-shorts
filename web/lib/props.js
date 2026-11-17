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
