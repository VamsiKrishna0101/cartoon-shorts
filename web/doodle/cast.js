// Doodle cast + props: a stick-guy lifter whose muscles inflate (m), crowd heads, barbell, effects.
import { INK, PAPER, blob, line, poly, limb, jit, lerp, mixHex } from "./ink.js";

const P = (x, y) => [x, y];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const pol = (a, L) => [Math.cos(a) * L, Math.sin(a) * L];

/** face on a head centred at (hx,hy), radius r. expr: neutral|strain|proud|shock|blank|blink|shrug|wow|love|sick|faint|grin */
export const face = (g, id, hx, hy, r, expr, o = {}) => {
  const u = r / 70, lw = 6 * u, ex = 24 * u, ey = hy - 8 * u, look = (o.look ?? 0) * 5 * u;
  const eye = (x, R = 15, pupil = 6) => { blob(g, id + x, x, ey, R * u, R * u * 1.15, PAPER, lw * 0.8); blob(g, id + x + 7, x + look, ey + 2 * u, pupil * u, pupil * u, INK, 0); };
  const shut = (x, up = 1) => line(g, id + x, [[x - 13 * u, ey + up * 4 * u], [x, ey - up * 6 * u], [x + 13 * u, ey + up * 4 * u]], lw);
  const mouthY = hy + 32 * u;
  switch (expr) {
    case "strain":
      line(g, id + 1, [[hx - ex - 14 * u, ey - 8 * u], [hx - ex + 12 * u, ey], [hx - ex - 14 * u, ey + 8 * u]], lw);
      line(g, id + 2, [[hx + ex + 14 * u, ey - 8 * u], [hx + ex - 12 * u, ey], [hx + ex + 14 * u, ey + 8 * u]], lw);
      poly(g, id + 3, [[hx - 22 * u, mouthY - 10 * u], [hx + 22 * u, mouthY - 10 * u], [hx + 20 * u, mouthY + 10 * u], [hx - 20 * u, mouthY + 10 * u]], PAPER, lw * 0.8, 1);
      for (let i = -1; i <= 1; i++) line(g, id + 4 + i, [[hx + i * 10 * u, mouthY - 10 * u], [hx + i * 10 * u, mouthY + 10 * u]], lw * 0.5);
      line(g, id + 9, [[hx - 22 * u, mouthY], [hx + 22 * u, mouthY]], lw * 0.5);
      break;
    case "proud": case "grin":
      eye(hx - ex, 13, 5); eye(hx + ex, 13, 5);
      line(g, id + 5, [[hx - ex - 14 * u, ey - 6 * u], [hx - ex + 12 * u, ey - 9 * u]], lw); line(g, id + 6, [[hx + ex - 12 * u, ey - 9 * u], [hx + ex + 14 * u, ey - 6 * u]], lw);
      poly(g, id + 7, [[hx - 26 * u, mouthY - 6 * u], [hx + 26 * u, mouthY - 10 * u], [hx + 12 * u, mouthY + 14 * u], [hx - 14 * u, mouthY + 12 * u]], expr === "grin" ? "#ffffff" : "#c9564b", lw * 0.8, 1.5);
      break;
    case "shock": case "wow":
      eye(hx - ex, 19, 5); eye(hx + ex, 19, 5);
      blob(g, id + 8, hx, mouthY + 6 * u, 13 * u, 18 * u, "#3a1d1d", lw * 0.8);
      break;
    case "love":
      for (const s of [-1, 1]) { const x = hx + s * ex; g.save(); g.translate(x, ey); g.scale(u, u);
        g.beginPath(); g.moveTo(0, 12); g.bezierCurveTo(-26, -6, -12, -24, 0, -10); g.bezierCurveTo(12, -24, 26, -6, 0, 12); g.fillStyle = "#e5484d"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.restore(); }
      line(g, id + 9, [[hx - 20 * u, mouthY - 4 * u], [hx, mouthY + 8 * u], [hx + 20 * u, mouthY - 4 * u]], lw);
      break;
    case "sick":
      shut(hx - ex, -1); shut(hx + ex, -1);
      line(g, id + 10, [[hx - 22 * u, mouthY], [hx - 11 * u, mouthY - 6 * u], [hx, mouthY], [hx + 11 * u, mouthY - 6 * u], [hx + 22 * u, mouthY]], lw);
      break;
    case "faint":
      for (const s of [-1, 1]) { const x = hx + s * ex; line(g, id + s, [[x - 11 * u, ey - 11 * u], [x + 11 * u, ey + 11 * u]], lw); line(g, id + s + 3, [[x + 11 * u, ey - 11 * u], [x - 11 * u, ey + 11 * u]], lw); }
      blob(g, id + 11, hx + 6 * u, mouthY + 4 * u, 14 * u, 9 * u, "#3a1d1d", lw * 0.8); blob(g, id + 12, hx + 10 * u, mouthY + 14 * u, 8 * u, 10 * u, "#e98a8a", lw * 0.7);
      break;
    case "blink":
      shut(hx - ex, -1); shut(hx + ex, -1);
      line(g, id + 13, [[hx - 14 * u, mouthY], [hx + 14 * u, mouthY]], lw);
      break;
    case "blank": case "shrug": default:
      blob(g, id + 14, hx - ex, ey, 5 * u, 6 * u, INK, 0); blob(g, id + 15, hx + ex, ey, 5 * u, 6 * u, INK, 0);
      if (expr === "shrug") line(g, id + 16, [[hx - 16 * u, mouthY + 4 * u], [hx, mouthY - 2 * u], [hx + 16 * u, mouthY + 6 * u]], lw);
      else line(g, id + 16, [[hx - 14 * u, mouthY], [hx + 14 * u, mouthY]], lw);
  }
};

/**
 * The lifter. Feet baseline at (x, y). o = { m: muscle 0..1.6, hip: hip height (210 stand .. 140 crouch),
 *   arms: 'bar'|'flex'|'most'|'shock'|'shrug'|'limp'|'down', barY: hand height (local, negative up), expr, red 0..1,
 *   s: scale, rot: radians, popL: left bicep popped (0..1 burst), noLegs: true while flying }
 */
export const lifter = (g, o) => {
  const m = o.m ?? 0, s = o.s ?? 1, id = 100;
  g.save(); g.translate(o.x, o.y); if (o.rot) { const pv = (o.pivot ?? 0) * s; g.translate(0, -pv); g.rotate(o.rot); g.translate(0, pv); } g.scale(s * (o.sx ?? 1), s * (o.sy ?? 1));
  const hipY = -(o.hip ?? 210), lw = 7;
  // legs: skinny forever (that's the joke)
  if (!o.noLegs) {
    const bend = (210 + hipY) / 70; // 0 standing .. -1 crouched
    for (const sd of [-1, 1]) {
      const hip = P(sd * 14, hipY), foot = P(sd * 40, -18), knee = P(sd * (26 - 60 * bend), (hipY - 18) / 2);
      line(g, id + sd, [hip, knee, foot], lw);
      blob(g, id + 10 + sd, sd * 52, -16, 40, 19, PAPER, lw);
    }
  } else {
    for (const sd of [-1, 1]) line(g, id + 20 + sd, [P(sd * 14, hipY), P(sd * 30, hipY + 70), P(sd * 34, hipY + 120)], lw);
  }
  // torso
  const rx = 26 + 118 * m, ry = 78 + 34 * m, cy = hipY - ry + 12;
  const top = cy - ry, red = o.red ?? 0, skin = mixHex(PAPER, "#ff9a8a", red), bodyCol = mixHex(PAPER, "#ffd9cf", red * 0.6);
  // shoulders / arms behind torso when flexing
  const S = (sd) => P(sd * (rx * 0.82 + 4), top + 26 + 10 * m);
  const L1 = 92 + 34 * m, L2 = 88 + 26 * m, armTh = 6 + 52 * m, foreTh = 5 + 34 * m, fist = 12 + 20 * m;
  const armPts = (sd) => {
    const sh = S(sd);
    switch (o.arms) {
      case "bar": { const h = P(sd * (112 + 20 * m), o.barY ?? -100); const e = P((sh[0] + h[0]) / 2 + sd * 22, (sh[1] + h[1]) / 2); return [sh, e, h]; }
      case "flex": { const e = add(sh, P(sd * L1 * 0.98, 4)); return [sh, e, add(e, P(sd * 6, -L2))]; }
      case "most": { const e = add(sh, P(sd * L1 * 0.7, L1 * 0.62)); return [sh, e, P(sd * (14 + 18 * m), top + ry * 0.95)]; }
      case "shock": { const e = add(sh, P(sd * L1 * 0.9, 30)); return [sh, e, add(e, P(sd * L2 * 0.6, -L2 * 0.7))]; }
      case "shrug": { const e = add(sh, P(sd * 40, L1 * 0.85)); return [sh, e, add(e, P(sd * L2 * 0.8, -L2 * 0.45))]; }
      case "limp": { const a = Math.PI / 2 - sd * 0.9 + 0.25 * Math.sin((o.t ?? 0) * 9 + sd); const e = add(sh, pol(a, L1)); return [sh, e, add(e, pol(a - sd * 0.4, L2))]; }
      default: { const e = add(sh, P(sd * 18, L1)); return [sh, e, add(e, P(sd * 8, L2))]; }
    }
  };
  const drawArm = (sd) => {
    const [sh, e, h] = armPts(sd), pop = sd < 0 ? (o.popL ?? 0) : 0;
    const bTh = pop > 0 ? armTh * Math.max(0.18, 1 - pop * 1.6) : armTh;
    blob(g, id + 30 + sd, sh[0], sh[1], 22 + 44 * m, 20 + 38 * m, bodyCol, lw); // deltoid
    limb(g, id + 40 + sd, sh, e, bTh, bodyCol, lw);
    if (pop > 0 && pop < 1) { // rubber shreds where the bicep was
      for (let i = 0; i < 5; i++) { const a = i * 1.3 + sd; line(g, id + 300 + i, [e, add(e, pol(a, 28 + 30 * pop))], 5); }
    }
    limb(g, id + 50 + sd, e, h, foreTh, bodyCol, lw);
    blob(g, id + 60 + sd, h[0], h[1], fist, fist * 0.9, bodyCol, lw);
    if (m > 0.6 && o.arms === "flex" && pop === 0) line(g, id + 70 + sd, [add(e, P(-sd * 22 * m, -armTh * 0.6)), add(e, P(-sd * 5, -armTh * 0.2)), add(e, P(-sd * 30 * m, armTh * 0.1))], 4, "#6b6156"); // vein
  };
  const armsFront = o.arms === "bar" || o.arms === "most" || o.arms === "down";
  if (!armsFront) { drawArm(-1); drawArm(1); }
  blob(g, id + 80, 0, cy, rx, ry, bodyCol, lw);
  if (m > 0.15) {
    for (const sd of [-1, 1]) blob(g, id + 81 + sd, sd * rx * 0.43, top + ry * 0.5, rx * 0.42, ry * 0.3, bodyCol, lw * 0.8);
    for (let r = 0; r < 3; r++) for (const sd of [-1, 1]) blob(g, id + 90 + r * 3 + sd, sd * rx * 0.17, top + ry * (1.02 + r * 0.3), rx * 0.14, ry * 0.12, bodyCol, lw * 0.6);
    line(g, id + 97, [P(0, top + ry * 0.2), P(0, top + ry * 1.75)], 4, "#6b6156");
  } else {
    line(g, id + 98, [P(-8, top + 50), P(-2, top + 56)], 3, "#6b6156");
  }
  if (armsFront) { drawArm(-1); drawArm(1); }
  // head (stays tiny)
  const hy = top - 58 + 18 * m, hr = 66;
  line(g, id + 99, [P(0, top + 6), P(0, hy + hr - 6)], 9);
  blob(g, id + 200, -hr + 2, hy + 6, 12, 16, skin, 6); // ear
  blob(g, id + 201, 0, hy, hr, hr * 1.04, skin, lw);
  for (let i = 0; i < 4; i++) line(g, id + 210 + i, [P(-24 + i * 14, hy - hr + 6), P(-30 + i * 16, hy - hr - 18 - (i % 2) * 8)], 6); // hair tufts
  face(g, id + 220, 8, hy, hr, o.expr ?? "neutral", { look: o.look });
  if ((o.red ?? 0) > 0.35) for (let i = 0; i < 3; i++) line(g, id + 240 + i, [P(-hr - 22, hy - 30 + i * 18), P(-hr - 44, hy - 36 + i * 20)], 4); // strain marks
  g.restore();
  return { top: o.y - (210 - (o.hip ?? 210)) * s };
};

/** barbell centred at (x, y) = bar centre, plates per side; size 1 = giant plates */
export const barbell = (g, x, y, o = {}) => {
  const s = o.s ?? 1, half = 330 * s, id = 400;
  line(g, id, [[x - half - 40 * s, y], [x + half + 40 * s, y]], 14 * s, INK, 1.2);
  line(g, id + 1, [[x - half - 40 * s, y], [x + half + 40 * s, y]], 7 * s, "#b9bdb4", 1.2);
  for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) {
    const px = x + sd * (half - 70 * s + k * 52 * s), R = (k ? 88 : 104) * s;
    blob(g, id + 10 + sd * 3 + k, px, y, 30 * s, R, "#2d2d2f", 7, 0, 0.02);
    blob(g, id + 20 + sd * 3 + k, px - sd * 6 * s, y - 6 * s, 12 * s, R * 0.75, "#4a4a4f", 0, 0, 0.03);
  }
};

const CROWD_LOOK = [
  { hair: "cap", col: "#e2453c" }, { hair: "band", col: "#3c7be2" }, { hair: "curly" }, { hair: "bald" },
  { hair: "spike" }, { hair: "band", col: "#f2b134" }, { hair: "flat" }, { hair: "cap", col: "#42a35b" },
];
/** one crowd member: head on a skinny neck/shoulders. o = { expr, wind 0..1 (blown back to the right), green 0..1, i } */
export const fan = (g, x, y, o = {}) => {
  const i = o.i ?? 0, L = CROWD_LOOK[i % CROWD_LOOK.length], id = 600 + i * 40, r = o.r ?? 58, w = o.wind ?? 0;
  const fill = mixHex(PAPER, "#b9d77a", o.green ?? 0);
  g.save(); g.translate(x, y); g.transform(1, 0, -0.35 * w, 1, 0, 0); g.scale(1 - 0.12 * w, 1);
  line(g, id, [[0, r * 0.9], [-4, r * 2.2]], 7); // neck
  blob(g, id + 1, 0, r * 2.6, r * 0.9, r * 0.55, fill, 7); // shoulders
  blob(g, id + 2, 0, 0, r, r * 1.05, fill, 7);
  const hw = w * 30; // hair streams right in the wind
  if (L.hair === "cap") { poly(g, id + 3, [[-r * 0.95, -r * 0.25], [-r * 0.7, -r * 0.95], [r * 0.6, -r * 0.95], [r * 0.95, -r * 0.25]], L.col, 6); line(g, id + 4, [[r * 0.9, -r * 0.25], [r * 1.5 + hw, -r * 0.18]], 10, INK); }
  if (L.hair === "band") { poly(g, id + 3, [[-r, -r * 0.45], [r, -r * 0.45], [r * 0.98, -r * 0.25], [-r * 0.98, -r * 0.25]], L.col, 5); }
  if (L.hair === "curly") for (let k = 0; k < 6; k++) blob(g, id + 5 + k, -r * 0.7 + k * r * 0.28 + hw * 0.5, -r * 0.92, r * 0.2, r * 0.2, "#4a3426", 5);
  if (L.hair === "spike" || L.hair === "band") for (let k = 0; k < 5; k++) line(g, id + 12 + k, [[-r * 0.5 + k * r * 0.25, -r * 0.95], [-r * 0.55 + k * r * 0.28 + hw, -r * 1.35]], 6);
  if (L.hair === "flat") poly(g, id + 3, [[-r * 0.95, -r * 0.4], [-r * 0.6, -r * 1.02], [r * 0.7 + hw, -r * 1.0], [r * 0.95 + hw, -r * 0.45]], "#2e2a26", 5);
  face(g, id + 20, 0, 0, r * 0.95, o.expr ?? "wow", { look: o.look ?? -0.6 });
  g.restore();
};

// ---------------------------------------------------------------- effects
export const sweat = (g, id, x, y, t, n = 3) => {
  for (let i = 0; i < n; i++) {
    const a = -0.9 + i * 0.9, d = 90 + ((t * 70 + i * 25) % 45), px = x + Math.sin(a) * d, py = y - Math.cos(a) * d * 0.6 + ((t * 70 + i * 25) % 45);
    g.beginPath(); g.moveTo(px, py - 20); g.quadraticCurveTo(px + 13, py + 4, px, py + 11); g.quadraticCurveTo(px - 13, py + 4, px, py - 20);
    g.fillStyle = "#9fd8ff"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  }
};
export const burst = (g, id, x, y, R, t, fill = "#ffffff") => {
  const n = 14, pts = [], k = 0.4 + 0.6 * Math.min(1, t * 3);
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = (i % 2 ? 0.45 : 1) * R * k * (1 + 0.15 * jit(id, i)); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  poly(g, id, pts, fill, 7, 0);
};
export const stink = (g, id, x, y, s, alpha = 1) => {
  g.save(); g.globalAlpha = alpha;
  for (let i = 0; i < 4; i++) blob(g, id + i, x + (i - 1.5) * 34 * s, y + (i % 2) * 18 * s, 36 * s, 28 * s, "#9cc35b", 5, 0, 0.08);
  for (let i = 0; i < 3; i++) line(g, id + 10 + i, [[x - 30 * s + i * 30 * s, y - 40 * s], [x - 20 * s + i * 30 * s, y - 70 * s], [x - 32 * s + i * 30 * s, y - 100 * s]], 5, "#5d7d2a");
  g.restore();
};
export const heart = (g, x, y, s) => {
  g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, 16); g.bezierCurveTo(-34, -8, -16, -32, 0, -14); g.bezierCurveTo(16, -32, 34, -8, 0, 16);
  g.fillStyle = "#e5484d"; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.restore();
};
export const sparkle = (g, id, x, y, s) => poly(g, id, [[x, y - 34 * s], [x + 9 * s, y - 9 * s], [x + 34 * s, y], [x + 9 * s, y + 9 * s], [x, y + 34 * s], [x - 9 * s, y + 9 * s], [x - 34 * s, y], [x - 9 * s, y - 9 * s]], "#ffe066", 5, 1);
export const motion = (g, id, x, y, ang, n = 4, L = 120) => {
  for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 34; const px = x + Math.cos(ang + Math.PI / 2) * o, py = y + Math.sin(ang + Math.PI / 2) * o;
    line(g, id + i, [[px, py], [px + Math.cos(ang) * L * (0.7 + 0.3 * ((i * 7) % 3) / 2), py + Math.sin(ang) * L * (0.7 + 0.3 * ((i * 7) % 3) / 2)]], 6); }
};
