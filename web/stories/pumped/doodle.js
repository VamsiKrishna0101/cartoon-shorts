// "Pumped" — wordless doodle loop (13 s). Stick guy deadlifts, muscles inflate, flexes for a crowd,
// a bicep pops, he deflates with a giant fart, rockets around the gym, gasses the crowd, lands skinny, tries again.
import { lifter, barbell, fan, sweat, burst, stink, heart, sparkle, motion } from "../../doodle/cast.js";

const HX = 500, S = 1.0, BAR_S = 0.8, PLATE = 104 * BAR_S;
const FANS = [[770, 800], [895, 770], [830, 935], [945, 925], [760, 1080], [885, 1075], [960, 1225], [820, 1235]];
const PATH = [[500, 1150], [260, 880], [430, 640], [760, 680], [880, 960], [700, 1240], [330, 1130], [420, 1330], [500, 1420]];
const cat = (pts, u) => { // Catmull-Rom through PATH
  const n = pts.length - 1, x = Math.min(n - 1e-6, Math.max(0, u * n)), i = Math.floor(x), t = x - i;
  const p = (k) => pts[Math.max(0, Math.min(n, k))];
  const [a, b, c, d] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
  const f = (k) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t * t * t);
  return [f(0), f(1)];
};

export default {
  frames: 390,
  frame(D, g, f) {
    const t = f / 30, FY = D.floorY(HX);
    // ---------------- muscle, pose and face timeline
    const pumps = [105, 125, 145];
    let m = pumps.reduce((a, p) => a + 0.34 * D.spring((f - p) / 14), 0);
    if (f >= 180) m = D.lerp(1.02, 1.35, D.smooth(D.prog(f, 180, 262)));
    if (f >= 278) m = D.lerp(1.35, 0, D.easeOut(D.prog(f, 280, 326)));
    let hip = 150, arms = "bar", barY = -PLATE / S, expr = "strain", red = 0, popL = 0, sx = 1, sy = 1, rot = 0, x = HX, y = FY, flying = false, look = 0;
    let barWorldY = FY - PLATE; // bar centre, world
    if (f < 75) { red = 0.85 * D.smooth(D.prog(f, 12, 72)); x += 4 * D.jit(7, D.boilSeed()) * D.prog(f, 10, 30); }
    else if (f < 95) { const k = D.smooth(D.prog(f, 75, 92)); hip = D.lerp(150, 210, k); barY = D.lerp(-PLATE / S, -205, k); red = D.lerp(0.85, 0.35, k); expr = k > 0.85 ? "proud" : "strain"; barWorldY = FY + barY * S; }
    else if (f < 165) { hip = 210; barY = -205; red = 0.35 * (1 - D.prog(f, 95, 130)); expr = "proud"; barWorldY = FY + barY * S;
      const pk = pumps.find((p) => f >= p && f < p + 6); if (pk) { sy = 1.04; sx = 0.97; } }
    else if (f < 180) { hip = 210; arms = "down"; expr = f < 172 ? "shock" : "grin"; const k = D.prog(f, 165, 175); barWorldY = D.lerp(FY - 205 * S, FY - PLATE, k * k); }
    else if (f < 268) { hip = 210; const beat = Math.floor((f - 180) / 24); arms = beat % 2 ? "most" : "flex"; expr = beat % 2 ? "grin" : "proud";
      const into = (f - 180) % 24; if (into < 4) { sy = 1.03; sx = 0.98; } }
    else if (f < 280) { hip = 210; arms = "flex"; expr = "shock"; popL = D.prog(f, 268, 276); look = -1; }
    else if (f < 330) { // deflating flight
      flying = true; hip = 210; arms = "limp"; expr = "shock";
      const u = D.smooth(D.prog(f, 280, 329)); const p = cat(PATH, u), q = cat(PATH, Math.min(1, u + 0.02));
      rot = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2 + (f - 280) * 0.18;
      x = p[0]; y = p[1] + 300 * S;
    } else if (f < 346) { hip = 210; arms = "down"; expr = f >= 338 && f < 342 ? "blink" : "blank"; const k = D.prog(f, 330, 338); sy = D.lerp(0.82, 1, D.back(k)); sx = D.lerp(1.15, 1, D.back(k)); look = 1; }
    else if (f < 372) { hip = 210; arms = "shrug"; expr = "shrug"; look = 1; }
    else { const k = D.smooth(D.prog(f, 372, 386)); hip = D.lerp(210, 150, k); arms = k > 0.4 ? "bar" : "down"; barY = -PLATE / S; expr = k > 0.8 ? "strain" : "blank"; }
    if (f < 180 || f >= 330) barWorldY = f >= 165 || f < 75 ? barWorldY : barWorldY;

    // ---------------- camera: creep, push-in on the flexing, wide for the flight, back to the loop framing
    const zKeys = [[0, 1.33], [180, 1.36], [262, 1.38], [282, 1.25], [330, 1.25], [389, 1.33]];
    let z = 1.15; for (let i = 0; i < zKeys.length - 1; i++) { const [a, za] = zKeys[i], [b, zb] = zKeys[i + 1]; if (f >= a && f <= b) z = D.lerp(za, zb, D.smooth(D.prog(f, a, b))); }
    let cx = 545, cy = 1170;
    const shakes = [[175, 14], [268, 18], [282, 10], [300, 12], [330, 14]];
    for (const [s0, a] of shakes) { const d = f - s0; if (d >= 0 && d < 8) { const k = a * (1 - d / 8) * (d % 2 ? -1 : 1); cx += k; cy += k * 0.6; } }
    g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(z, z); g.translate(-cx, -cy);

    D.room(g, 1);
    // ---------------- crowd (behind the lifter)
    FANS.forEach(([fx, fy], i) => {
      const t0 = 118 + i * 6; if (f < t0) return;
      const pop = D.back(D.prog(f, t0, t0 + 9), 2.2);
      const wind = D.smooth(D.prog(f, 290 + (i % 3) * 3, 304 + (i % 3) * 3)) * (f < 346 ? 1 : 0.6);
      const fall = f > 346 + i * 2 ? Math.pow((f - 346 - i * 2) / 20, 2) * 1400 : 0;
      if (fall > 1200) return;
      let expr = "wow";
      if (f >= 215 && i % 3 !== 1) expr = "love";
      if (f >= 268) expr = "shock";
      if (f >= 292 + (i % 3) * 3) expr = "sick";
      if (f >= 346 + i * 2) expr = "faint";
      g.save(); g.translate(fx, fy + fall + 20 * Math.sin(t * 3 + i) * 0.15); g.scale(pop, pop);
      fan(g, 0, 0, { i, expr, wind, green: D.prog(f, 292, 310) * 0.85, look: f >= 280 && f < 330 ? 0 : -0.7 });
      g.restore();
      if (expr === "love" && (f + i * 5) % 40 < 20) heart(g, fx + 40, fy - 80 - ((f + i * 5) % 40) * 2, 0.7);
    });
    // stink clouds that linger over the crowd
    if (f >= 292 && f < 380) for (let k = 0; k < 3; k++) stink(g, 900 + k, 780 + k * 90, 660 + (k % 2) * 60 - (f - 292) * 0.6, 0.8, 1 - D.prog(f, 350, 380));

    // ---------------- barbell + lifter (bar in front of the legs when on the floor)
    const barOnFloor = f < 75 || f >= 175;
    const drawBar = () => barbell(g, HX, barWorldY, { s: BAR_S });
    if (!barOnFloor && f >= 165) drawBar();
    if (flying) { // gas trail
      for (let k = 1; k <= 6; k++) { const ft = f - k * 3; if (ft < 280) break; const u = D.smooth(D.prog(ft, 280, 329)), p = cat(PATH, u); stink(g, 950 + k, p[0], p[1] + 40, 0.8 - k * 0.08, 1 - k * 0.14); }
      const u = D.smooth(D.prog(f, 280, 329)), p = cat(PATH, u), q = cat(PATH, Math.max(0, u - 0.03));
      motion(g, 980, p[0], p[1], Math.atan2(q[1] - p[1], q[0] - p[0]), 4, 140);
    }
    lifter(g, { x, y, s: S, m, hip, arms, barY, expr, red, popL, sx, sy, rot, pivot: 300, noLegs: flying, t, look });
    if (barOnFloor || f < 165) drawBar();
    if (f >= 10 && f < 95) sweat(g, 20, HX - 10, FY - 520 * S + (210 - hip), t, 3);
    if (f >= 200 && f < 268) for (let k = 0; k < 3; k++) if ((f + k * 9) % 27 < 14) sparkle(g, 30 + k, HX + [-250, 230, -190][k], FY - [560, 600, 300][k], 0.8 + 0.3 * Math.sin(f * 0.5 + k));
    if (f >= 278 && f < 306) stink(g, 990, HX - 60 - (f - 278) * 4, FY - 330 - (f - 278) * 3, 1.5 + (f - 278) * 0.03, 1 - D.prog(f, 290, 306));
    if (f >= 268 && f < 282) burst(g, 40, HX - 300, FY - 440 * S, 150, (f - 268) / 14);
    if (f >= 330 && f < 340) burst(g, 41, HX, FY - 10, 120, (f - 330) / 10, "#e8e2cf");
  },
};
