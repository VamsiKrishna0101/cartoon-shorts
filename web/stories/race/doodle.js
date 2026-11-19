// "Treadmill Race" — wordless doodle loop (13 s). Stick guy races a smug buff guy, mashes the speed button,
// legs become a wheel, gets launched into the wall and slides down. Buff guy laughs, slaps his own button, gets launched too.
import { runner, treadmill2D, leftWall, lifter, burst, sweat, stink } from "../../doodle/cast.js";

const ROOM = { floorL: 1150, floorR: 1080 };
const HX = 370, HY = 1480, HS = 0.95;   // hero treadmill (front row)
const BX = 640, BY = 1135, BS = 0.8;    // buff treadmill (back row)
const WALLX = 120, LAUNCH_H = 200, SPLAT = 207, SLAP = 300, LAUNCH_B = 312, CRASH = 320;
let vH = [], vB = [], phH = [], phB = [], beltH = [], beltB = [];

export default {
  frames: 390,
  build(D) {
    const sm = D.smooth;
    for (let f = 0; f < 390; f++) {
      let h = 1.3; if (f >= 66) h = 1.7; if (f >= 80) h = 2.2; if (f >= 94) h = 2.8;
      if (f >= 120) h = D.lerp(3.2, 14, Math.pow(D.prog(f, 120, 196), 1.6));
      if (f >= LAUNCH_H) h = D.lerp(14, 1.3, sm(D.prog(f, 215, 300)));
      let b = 1.6; if (f >= 112) b = 2.4; if (f >= SLAP) b = D.lerp(2.4, 16, D.prog(f, SLAP, SLAP + 8)); if (f >= LAUNCH_B) b = D.lerp(16, 1.6, sm(D.prog(f, 330, 380)));
      vH.push(h); vB.push(b);
      phH.push((phH[f - 1] ?? 0) + h / 30); phB.push((phB[f - 1] ?? 0.4) + b / 30);
      beltH.push((beltH[f - 1] ?? 0) + h * 4.2); beltB.push((beltB[f - 1] ?? 0) + b * 4.2);
    }
  },
  frame(D, g, f) {
    const t = f / 30;
    const zK = [[0, 1.3], [196, 1.36], [230, 1.3], [389, 1.3]];
    let z = 1.3; for (let i = 0; i < zK.length - 1; i++) { const [a, za] = zK[i], [b, zb] = zK[i + 1]; if (f >= a && f <= b) z = D.lerp(za, zb, D.smooth(D.prog(f, a, b))); }
    let cx = 505 - 25 * D.smooth(D.prog(f, 120, 196)) * (1 - D.prog(f, 230, 300)), cy = 1130;
    for (const [s0, a] of [[SPLAT, 20], [LAUNCH_B, 8], [CRASH, 22], [265, 8]]) { const d = f - s0; if (d >= 0 && d < 8) { const k = a * (1 - d / 8) * (d % 2 ? -1 : 1); cx += k; cy += k * 0.6; } }
    g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(z, z); g.translate(-cx, -cy);
    D.room(g, 2, ROOM);
    leftWall(g, 3, WALLX, 280, 2000);

    const kmh = (v) => (v > 11 ? "MAX" : (v * 2.3).toFixed(1));
    // ---------------- back row: the buff guy
    const bPress = (f >= 112 && f < 118) || (f >= SLAP && f < SLAP + 6);
    treadmill2D(g, 50, BX, BY, { s: BS, belt: beltB[f], text: kmh(vB[f]), press: bPress, smoke: f >= SLAP && f < 340, t, screen: vB[f] > 11 ? "#ff8a80" : "#9fe3b5" });
    {
      let bx = BX - 30, by = BY - 50 * BS, expr = "smug", look = 0, wheel = D.prog(vB[f], 5.5, 7.5), walk = false, ph = phB[f], sy = 1;
      if (f < 104) expr = "calm";
      if (f >= 104 && f < 130) { expr = "smug"; look = 0; }
      if (f >= 150 && f < LAUNCH_H) expr = "shock";
      if (f >= LAUNCH_H && f < SLAP) { expr = "laugh"; sy = 1 + 0.04 * Math.sin(f * 1.4); }
      if (f >= SLAP) expr = "shock";
      if (f >= LAUNCH_B && f < 345) { bx = BX - 30 + Math.pow(D.prog(f, LAUNCH_B, CRASH), 1.5) * 800; }
      if (f >= 345) { const k = D.prog(f, 345, 382); walk = k < 1; bx = D.lerp(1180, BX - 30, D.smooth(k)); by = k < 0.85 ? BY : BY - 50 * BS; expr = k < 1 ? "dizzy" : "calm"; ph = walk ? t * 1.6 : phB[f]; g.save(); g.translate(2 * bx, 0); g.scale(-1, 1); }
      if (f < LAUNCH_B || f >= 345) runner(g, { id: 1, x: f >= 345 ? bx : bx, y: by, s: BS * 0.95, m: 1.0, phase: ph, wheel: f >= 345 ? 0 : wheel, expr, look, walk, sy, lean: wheel > 0.5 ? 0.3 : 0.14 });
      if (f >= 345) g.restore();
      if (f >= LAUNCH_B && f < CRASH) runner(g, { id: 1, x: bx, y: by - 40, s: BS * 0.95, m: 1.0, phase: phB[f], wheel: 1, expr: "shock", lean: -0.3 });
      if (f >= 345 && f < 380) for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; g.save(); g.translate(bx + Math.cos(a) * 60, BY - 470 + Math.sin(a) * 18); g.fillStyle = "#ffe066"; g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 22, aa = k * Math.PI / 5; g.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); } g.closePath(); g.fill(); g.lineWidth = 4; g.strokeStyle = "#1c1b1a"; g.stroke(); g.restore(); }
    }
    if (f >= CRASH && f < CRASH + 12) burst(g, 60, 900, 960, 170, (f - CRASH) / 12);

    // ---------------- front row: our stick guy
    const hPress = [66, 80, 94].some((p) => f >= p && f < p + 5) || (f >= 120 && f < 196 && f % 5 < 2);
    treadmill2D(g, 70, HX, HY, { s: HS, belt: beltH[f], text: kmh(vH[f]), press: hPress, smoke: vH[f] > 8 && f < 300, t, screen: vH[f] > 11 ? "#ff8a80" : "#9fe3b5" });
    const wheelH = D.prog(vH[f], 5.5, 7.5);
    if (f < LAUNCH_H) {
      const expr = f < 60 ? "calm" : f < 120 ? "strain" : "strain";
      runner(g, { id: 0, x: HX - 30, y: HY - 50 * HS, s: HS, phase: phH[f], wheel: wheelH, expr, lean: 0.12 + 0.25 * wheelH, hairBack: wheelH });
      if (f >= 120) sweat(g, 22, HX - 10, HY - 470, t, 3);
    } else if (f < SPLAT) { // launched backwards into the wall
      const k = D.prog(f, LAUNCH_H, SPLAT); const x = D.lerp(HX - 30, WALLX + 70, k * k);
      runner(g, { id: 0, x, y: HY - 50 * HS - 120 * Math.sin(k * Math.PI), s: HS, phase: phH[f], wheel: 1, expr: "shock", lean: -0.4 });
    } else if (f < 290) { // pancake on the wall, slides down, crumples
      const k = D.prog(f, 215, 262), y = D.lerp(HY - 240, HY, D.easeOut(k) * k), crumple = D.prog(f, 262, 270);
      lifter(g, { x: WALLX + 40, y, s: 1.0, m: 0, hip: 210, arms: "shock", expr: "faint", sx: 0.42 + 0.5 * crumple, sy: D.lerp(1.15, 0.45, crumple) });
    } else if (f < 335) { // pops back up, dizzy, then smug when the buff guy gets launched
      const k = D.back(D.prog(f, 290, 300), 2), expr = f < CRASH ? (f % 20 < 10 ? "blink" : "blank") : "grin";
      lifter(g, { x: WALLX + 80, y: HY, s: 0.95, m: 0, hip: 210, arms: f >= CRASH + 4 ? "shrug" : "down", expr, sx: D.lerp(0.9, 1, k), sy: D.lerp(0.45, 1, k), look: 1 });
    } else { // walks back to the treadmill and starts jogging again
      const k = D.prog(f, 335, 372), x = D.lerp(WALLX + 80, HX - 30, D.smooth(k)), on = f >= 372;
      runner(g, { id: 0, x, y: on ? HY - 50 * HS : HY - 50 * HS * D.prog(f, 364, 372), s: HS, phase: on ? phH[f] : t * 1.4, walk: !on, expr: "calm", lean: 0.12 });
    }
  },
};
