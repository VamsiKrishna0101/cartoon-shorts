// "Pumped" — wordless doodle loop (13 s). Stick guy deadlifts, muscles inflate, flexes for a crowd of fans,
// flexes so hard he poops all over their faces, deflates back to a stick, shrugs, and tries the lift again.
import { lifter, barbell, fan, sweat, burst, stink, heart, sparkle, poop, flies } from "../../doodle/cast.js";

const HX = 500, S = 1.0, BAR_S = 0.8, PLATE = 104 * BAR_S;
const FANS = [[770, 800], [895, 770], [830, 935], [945, 925], [760, 1080], [885, 1075], [960, 1225], [820, 1235]];
const BLAST = 282, LAUNCH = (i) => BLAST + i * 1.5, FLY = 8; // poop i leaves at LAUNCH(i), lands FLY frames later

export default {
  frames: 390,
  frame(D, g, f) {
    const t = f / 30, FY = D.floorY(HX);
    // ---------------- muscle, pose and face timeline
    const pumps = [105, 125, 145];
    let m = pumps.reduce((a, p) => a + 0.34 * D.spring((f - p) / 14), 0);
    if (f >= 180) m = D.lerp(1.02, 1.4, D.smooth(D.prog(f, 180, 280)));
    if (f >= 284) m = D.lerp(1.4, 0, D.easeOut(D.prog(f, 284, 302))) * (1 + 0.06 * Math.sin(f * 1.7) * (1 - D.prog(f, 284, 302)));
    let hip = 150, arms = "bar", barY = -PLATE / S, expr = "strain", red = 0, sx = 1, sy = 1, x = HX, look = 0;
    let barWorldY = FY - PLATE;
    if (f < 75) { red = 0.85 * D.smooth(D.prog(f, 12, 72)); x += 4 * D.jit(7, D.boilSeed()) * D.prog(f, 10, 30); }
    else if (f < 95) { const k = D.smooth(D.prog(f, 75, 92)); hip = D.lerp(150, 210, k); barY = D.lerp(-PLATE / S, -205, k); red = D.lerp(0.85, 0.35, k); expr = k > 0.85 ? "proud" : "strain"; barWorldY = FY + barY * S; }
    else if (f < 165) { hip = 210; barY = -205; red = 0.35 * (1 - D.prog(f, 95, 130)); expr = "proud"; barWorldY = FY + barY * S;
      if (pumps.find((p) => f >= p && f < p + 6)) { sy = 1.04; sx = 0.97; } }
    else if (f < 180) { hip = 210; arms = "down"; expr = f < 172 ? "shock" : "grin"; const k = D.prog(f, 165, 175); barWorldY = D.lerp(FY - 205 * S, FY - PLATE, k * k); }
    else if (f < 252) { hip = 210; const beat = Math.floor((f - 180) / 24); arms = beat % 2 ? "most" : "flex"; expr = beat % 2 ? "grin" : "proud";
      if ((f - 180) % 24 < 4) { sy = 1.03; sx = 0.98; } }
    else if (f < BLAST) { // the mega-crunch: shaking harder and harder
      hip = 205; arms = "most"; expr = "strain"; const k = D.prog(f, 252, BLAST); red = 0.95 * k;
      x += (3 + 9 * k) * D.jit(9, f); sy = 1 - 0.03 * k; sx = 1 + 0.03 * k; }
    else if (f < 302) { hip = 210; arms = f < 288 ? "most" : "down"; expr = f < 292 ? "shock" : "blank"; red = 0.95 * (1 - D.prog(f, BLAST, 296)); look = 1;
      const k = D.prog(f, 284, 302); sx = 1 + 0.08 * Math.sin(f * 1.3) * (1 - k); sy = 1 - 0.08 * Math.sin(f * 1.3) * (1 - k); }
    else if (f < 330) { hip = 210; arms = "down"; expr = f >= 316 && f < 320 ? "blink" : "blank"; look = 1; }
    else if (f < 352) { hip = 210; arms = "shrug"; expr = "shrug"; look = 1; }
    else if (f < 372) { hip = 210; arms = "down"; expr = f >= 362 && f < 366 ? "blink" : "blank"; look = 0; }
    else { const k = D.smooth(D.prog(f, 372, 386)); hip = D.lerp(210, 150, k); arms = k > 0.4 ? "bar" : "down"; expr = k > 0.8 ? "strain" : "blank"; }

    // ---------------- camera: creep, push on the flexing, back to the loop framing
    const zKeys = [[0, 1.33], [180, 1.36], [262, 1.38], [284, 1.34], [330, 1.3], [389, 1.33]];
    let z = 1.33; for (let i = 0; i < zKeys.length - 1; i++) { const [a, za] = zKeys[i], [b, zb] = zKeys[i + 1]; if (f >= a && f <= b) z = D.lerp(za, zb, D.smooth(D.prog(f, a, b))); }
    let cx = 545, cy = 1170;
    const shakes = [[175, 14], [BLAST, 18], [291, 10], [296, 8]];
    for (const [s0, a] of shakes) { const d = f - s0; if (d >= 0 && d < 8) { const k = a * (1 - d / 8) * (d % 2 ? -1 : 1); cx += k; cy += k * 0.6; } }
    g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(z, z); g.translate(-cx, -cy);

    D.room(g, 1);
    // ---------------- crowd of fans (behind the lifter)
    FANS.forEach(([fx, fy], i) => {
      const t0 = 118 + i * 6; if (f < t0) return;
      const pop = D.back(D.prog(f, t0, t0 + 9), 2.2);
      const hit = LAUNCH(i) + FLY, sp = f >= hit ? D.prog(f, hit, hit + 40) + 0.35 : 0;
      const fall = f > 340 + i * 2 ? Math.pow((f - 340 - i * 2) / 20, 2) * 1400 : 0;
      if (fall > 1200) return;
      let expr = "wow";
      if (f >= 215 && i % 3 !== 1) expr = "love";
      if (f >= 262) expr = "wow";
      if (f >= hit) expr = "shock";
      if (f >= 340 + i * 2) expr = "faint";
      const recoil = f >= hit && f < hit + 6 ? (1 - (f - hit) / 6) * 18 : 0;
      g.save(); g.translate(fx + recoil, fy + fall); g.scale(pop, pop);
      fan(g, 0, 0, { i, expr, splat: sp, look: -0.7 });
      g.restore();
      if (expr === "love" && (f + i * 5) % 40 < 20) heart(g, fx + 40, fy - 80 - ((f + i * 5) % 40) * 2, 0.7);
    });
    if (f >= 296 && f < 352) { flies(g, 700, 860, 690, t, 4); flies(g, 720, 900, 980, t + 1, 3); stink(g, 740, 900, 640 - (f - 296) * 0.4, 0.7, 1 - D.prog(f, 335, 352)); }

    // ---------------- barbell + lifter
    const barOnFloor = f < 75 || f >= 175;
    const drawBar = () => barbell(g, HX, barWorldY, { s: BAR_S });
    if (!barOnFloor && f >= 165) drawBar();
    lifter(g, { x, y: FY, s: S, m: Math.max(0, m), hip, arms, barY, expr, red, sx, sy, t, look });
    if (barOnFloor || f < 165) drawBar();
    // the blast: poops launch from behind him and land on every fan's face
    if (f >= BLAST && f < BLAST + 10) burst(g, 45, HX + 40, FY - 230, 110, (f - BLAST) / 10, "#c89a6a");
    FANS.forEach(([fx, fy], i) => {
      const a = LAUNCH(i), k = (f - a) / FLY; if (k < 0 || k >= 1) return;
      const sxp = HX + 60, syp = FY - 230, px = D.lerp(sxp, fx, k), py = D.lerp(syp, fy, k) - Math.sin(k * Math.PI) * 220;
      poop(g, 760 + i * 5, px, py, 0.8, k * 7 + i);
    });
    if (f >= 10 && f < 95) sweat(g, 20, HX - 10, FY - 520 * S + (210 - hip), t, 3);
    if (f >= 256 && f < BLAST) sweat(g, 21, HX - 10, FY - 640, t, 3);
    if (f >= 200 && f < 252) for (let k = 0; k < 3; k++) if ((f + k * 9) % 27 < 14) sparkle(g, 30 + k, HX + [-250, 230, -190][k], FY - [560, 600, 300][k], 0.8 + 0.3 * Math.sin(f * 0.5 + k));
  },
};
