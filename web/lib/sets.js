// Reusable 3D sets built from primitives + painted textures. Every builder takes (E, parent, opts) and returns a Group.
import * as THREE from "three";

const G = (parent, x = 0, y = 0, z = 0, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };

export const ground = (E, parent, tex, size = 1200, rep = 0.25, col = "#ffffff") => {
  const t = tex.clone(); t.needsUpdate = true; t.repeat.set(size * rep, size * rep);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), E.toon(col, t));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; parent.add(m); return m;
};

/** rolling hills + snow-capped mountains far away (ring around the origin) */
export const backdrop = (E, parent, o = {}) => {
  const g = G(parent), r = E.prng(o.seed ?? 7);
  const hillCol = o.hill ?? "#8fb35a", mtCol = o.mountain ?? "#8e93b8";
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2, d = 140 + r() * 60, R = 30 + r() * 30;
    const m = E.add(g, new THREE.SphereGeometry(R, 20, 10), E.toon(hillCol), Math.cos(a) * d, -R * 0.62, Math.sin(a) * d);
    m.castShadow = false;
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r(), d = 300 + r() * 80, h = 70 + r() * 70;
    const m = E.add(g, new THREE.ConeGeometry(h * 0.9, h, 7), E.toon(mtCol), Math.cos(a) * d, h / 2 - 5, Math.sin(a) * d);
    m.castShadow = false;
    const cap = E.add(g, new THREE.ConeGeometry(h * 0.9 * 0.3, h * 0.3, 7), E.toon("#f4f6ff"), Math.cos(a) * d, h - h * 0.15 - 5 + 0.2, Math.sin(a) * d);
    cap.castShadow = false;
  }
  return g;
};

export const cypress = (E, parent, x, z, h = 6, seed = 1) => {
  const g = G(parent, x, 0, z);
  E.cyl(g, 0.15, 0.2, h * 0.2, E.toon("#6b4a2e"), 0, 0, 0, 8);
  const m = E.add(g, new THREE.SphereGeometry(1, 14, 10), E.toon("#3f6b3a"), 0, h * 0.55, 0);
  m.scale.set(h * 0.16, h * 0.42, h * 0.16);
  return g;
};
export const olive = (E, parent, x, z, s = 1, seed = 1) => {
  const g = G(parent, x, 0, z), r = E.prng(seed);
  E.cyl(g, 0.18 * s, 0.3 * s, 1.8 * s, E.toon("#7a5a3a", E.PAINT.wood()), 0, 0, 0, 8);
  for (let i = 0; i < 4; i++) {
    const m = E.add(g, new THREE.SphereGeometry(1, 12, 8), E.toon(i % 2 ? "#7d9a52" : "#6c8a48"), (r() - 0.5) * 1.6 * s, (2 + r() * 0.8) * s, (r() - 0.5) * 1.6 * s);
    m.scale.setScalar((0.9 + r() * 0.5) * s);
  }
  return g;
};

/** Greek temple: stepped base, columns, architrave, pediment */
export const temple = (E, parent, x, z, ry = 0, s = 1, o = {}) => {
  const g = G(parent, x, 0, z, ry), M = E.toon("#ffffff", E.PAINT.marble());
  const W = 14 * s, D = 9 * s, colH = 6.2 * s, n = o.cols ?? 6;
  for (let i = 0; i < 3; i++) E.tbox(g, W + (2 - i) * 1.2 * s, 0.35 * s, D + (2 - i) * 1.2 * s, M, 0, i * 0.35 * s, 0);
  const base = 1.05 * s;
  for (let side of [-1, 1]) for (let i = 0; i < n; i++) {
    const cx = -W / 2 + 0.9 * s + (i * (W - 1.8 * s)) / (n - 1);
    E.cyl(g, 0.42 * s, 0.5 * s, colH, M, cx, base, side * (D / 2 - 0.8 * s), 18);
    E.tbox(g, 1.2 * s, 0.25 * s, 1.2 * s, M, cx, base + colH, side * (D / 2 - 0.8 * s));
  }
  for (let i = 1; i < 3; i++) for (let side of [-1, 1]) {
    const cz = side * (D / 2 - 0.8 * s) * (1 - i / 3);
    E.cyl(g, 0.42 * s, 0.5 * s, colH, M, -W / 2 + 0.9 * s, base, cz, 18); E.cyl(g, 0.42 * s, 0.5 * s, colH, M, W / 2 - 0.9 * s, base, cz, 18);
  }
  const top = base + colH + 0.25 * s;
  E.tbox(g, W, 1.0 * s, D, M, 0, top, 0);
  E.tbox(g, W + 0.3 * s, 0.3 * s, D + 0.3 * s, E.toon("#d9cdb6"), 0, top + 1.0 * s, 0);
  // pediment (triangular prism)
  const sh = new THREE.Shape(); sh.moveTo(-W / 2 - 0.15 * s, 0); sh.lineTo(W / 2 + 0.15 * s, 0); sh.lineTo(0, 2.2 * s); sh.closePath();
  const pg = new THREE.ExtrudeGeometry(sh, { depth: D + 0.3 * s, bevelEnabled: false }); pg.translate(0, 0, -(D + 0.3 * s) / 2);
  E.add(g, pg, [E.toon("#efe6d6"), E.toon("#c4583a", E.PAINT.roof())], 0, top + 1.3 * s, 0);
  return g;
};

/** small whitewashed house with a terracotta roof */
export const house = (E, parent, x, z, ry = 0, w = 5, d = 4, h = 3.2, o = {}) => {
  const g = G(parent, x, 0, z, ry);
  const wall = E.toon("#ffffff", E.PAINT.plaster(o.wall ?? "#f3e6cc"));
  E.tbox(g, w, h, d, wall, 0, 0, 0);
  E.tbox(g, w + 0.1, 0.3, d + 0.1, E.toon("#c9b896"), 0, 0, 0);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.35, 0); sh.lineTo(w / 2 + 0.35, 0); sh.lineTo(0, 1.4); sh.closePath();
  const rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.7, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.7) / 2);
  E.add(g, rg, [E.toon("#e9d8b6"), E.toon("#ffffff", E.PAINT.roof(o.roof ?? "#c4583a"))], 0, h, 0);
  E.tbox(g, 1.0, 2.0, 0.12, E.toon("#6b4429", E.PAINT.wood()), 0, 0, d / 2 + 0.02);
  for (const s of [-1, 1]) E.tbox(g, 0.8, 0.8, 0.1, E.toon("#3d5f8a"), s * w * 0.3, 1.5, d / 2 + 0.02);
  return g;
};

/** stadium: sand track + curved stepped stone stands (an arc of stands behind the track) */
export const stadium = (E, parent, o = {}) => {
  const g = G(parent), R = o.radius ?? 22, M = E.toon("#ffffff", E.PAINT.stone());
  const arc = o.arc ?? Math.PI * 1.3, a0 = -Math.PI / 2 - arc / 2, steps = 6, segs = 26;
  for (let i = 0; i < segs; i++) {
    const a = a0 + (i + 0.5) * (arc / segs);
    for (let s = 0; s < steps; s++) {
      const r = R + s * 1.4, len = (2 * Math.PI * r * (arc / segs)) / (2 * Math.PI) * 1.02;
      const m = E.tbox(g, len, 0.8 + s * 0.8, 1.4, M, Math.cos(a) * r, 0, Math.sin(a) * r);
      m.rotation.y = -a + Math.PI / 2;
    }
  }
  return g;
};
/** seat positions on the stands for crowd cards: returns [{x,y,z}] */
export const stadiumSeats = (o = {}) => {
  const R = o.radius ?? 22, arc = o.arc ?? Math.PI * 1.3, a0 = -Math.PI / 2 - arc / 2, out = [];
  for (let s = 0; s < 6; s++) for (let i = 0; i < 40; i++) {
    const a = a0 + ((i + 0.5 + (s % 2) * 0.5) / 40) * arc, r = R + s * 1.4;
    out.push({ x: Math.cos(a) * r, y: 0.8 + s * 0.8, z: Math.sin(a) * r, row: s, i });
  }
  return out;
};

/** 3D dumbbell lying along x; s = size multiplier */
export const dumbbell = (E, parent, x, y, z, s = 1, col = "#2f3338") => {
  const g = G(parent, x, y, z);
  const bar = E.add(g, new THREE.CylinderGeometry(0.035 * s, 0.035 * s, 0.5 * s, 12), E.toon("#a9b0b8"), 0, 0, 0); bar.rotation.z = Math.PI / 2;
  for (const sd of [-1, 1]) { const p = E.add(g, new THREE.CylinderGeometry(0.11 * s, 0.11 * s, 0.12 * s, 8), E.toon(col), sd * 0.22 * s, 0, 0); p.rotation.z = Math.PI / 2; }
  return g;
};

/** modern gym interior: rubber floor, back wall with mirror, dumbbell rack, bench, squat rack, windows */
export const gym = (E, parent, o = {}) => {
  const g = G(parent), W = o.w ?? 16, D = o.d ?? 12;
  const floor = ground(E, g, E.PAINT.rubber(), 40, 0.3); floor.position.y = 0.02;
  const wall = E.toon("#ffffff", E.PAINT.plaster("#e9e6df"));
  E.tbox(g, W, 6, 0.3, wall, 0, 0, -D / 2);
  for (const s of [-1, 1]) E.tbox(g, 0.3, 6, D, wall, s * W / 2, 0, 0);
  E.tbox(g, W - 2, 2.4, 0.06, E.toon("#bcd3e3", null, { emissive: "#29404f" }), 0, 0.9, -D / 2 + 0.2); // mirror
  E.tbox(g, W, 0.5, 0.35, E.toon(o.accent ?? "#e2453c"), 0, 4.2, -D / 2 + 0.05); // stripe
  // rack with dumbbells
  const rack = G(g, -3.5, 0, -D / 2 + 1.0);
  E.tbox(rack, 4.2, 0.08, 0.6, E.toon("#26292d"), 0, 0.45, 0); E.tbox(rack, 4.2, 0.08, 0.6, E.toon("#26292d"), 0, 0.9, 0);
  for (const sx of [-2, 2]) E.tbox(rack, 0.08, 0.95, 0.6, E.toon("#26292d"), sx, 0, 0);
  for (let i = 0; i < 6; i++) { dumbbell(E, rack, -1.7 + i * 0.68, 0.6, 0, 0.7 + i * 0.07); dumbbell(E, rack, -1.7 + i * 0.68, 1.05, 0, 0.6 + i * 0.06); }
  // bench
  const bench = G(g, 2.6, 0, -1.5, 0.3);
  E.tbox(bench, 0.5, 0.12, 1.6, E.toon("#1f2226"), 0, 0.5, 0); E.tbox(bench, 0.12, 0.5, 0.12, E.toon("#8d949c"), 0, 0, 0.6); E.tbox(bench, 0.12, 0.5, 0.12, E.toon("#8d949c"), 0, 0, -0.6);
  // squat rack
  const sq = G(g, 5, 0, -D / 2 + 1.6);
  for (const sx of [-0.9, 0.9]) for (const sz of [-0.5, 0.5]) E.tbox(sq, 0.1, 2.6, 0.1, E.toon("#26292d"), sx, 0, sz);
  const bar = E.add(sq, new THREE.CylinderGeometry(0.03, 0.03, 2.4, 10), E.toon("#a9b0b8"), 0, 1.5, -0.5); bar.rotation.z = Math.PI / 2;
  for (const sx of [-1.05, 1.05]) { const p = E.add(sq, new THREE.CylinderGeometry(0.3, 0.3, 0.08, 18), E.toon("#2f3338"), sx, 1.5, -0.5); p.rotation.z = Math.PI / 2; }
  // windows on the side wall (bright)
  for (let i = 0; i < 3; i++) E.tbox(g, 0.05, 1.6, 2.0, E.toon("#dff1ff", null, { emissive: "#9fc7e6" }), W / 2 - 0.2, 2.2, -4 + i * 3.2);
  return g;
};

/** flat painted cloud billboards high in the sky */
export const clouds = (E, n = 7, seed = 3) => {
  const r = E.prng(seed), out = [];
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = 180 + r() * 120; out.push({ x: Math.cos(a) * d, y: 40 + r() * 50, z: Math.sin(a) * d, s: 14 + r() * 10, seed: i }); }
  return out;
};

/** old stone prison yard: flagstone floor, high walls on three sides, barred windows, iron door. Opens toward +z. */
export const prisonYard = (E, parent, o = {}) => {
  const g = G(parent, o.x ?? 0, 0, o.z ?? 0), W = o.w ?? 18, D = o.d ?? 14, H = o.h ?? 6;
  const floor = ground(E, g, E.PAINT.stone(), 60, 0.4, "#b9b2a6"); floor.position.y = 0.015;
  const wall = E.toon("#d8d0c2", E.PAINT.stone());
  E.tbox(g, W, H, 0.6, wall, 0, 0, -D / 2);
  for (const s of [-1, 1]) E.tbox(g, 0.6, H, D + 8, wall, s * W / 2, 0, 2);
  const iron = E.toon("#2c2a2e");
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { // barred windows on the back wall
    const x = s * (3.2 + k * 3.6);
    E.tbox(g, 1.2, 1.3, 0.1, E.toon("#1b1d2a"), x, 3.4, -D / 2 + 0.31);
    for (let i = 0; i < 4; i++) E.tbox(g, 0.07, 1.3, 0.08, iron, x - 0.45 + i * 0.3, 3.4, -D / 2 + 0.38);
  }
  E.tbox(g, 1.8, 2.6, 0.12, E.toon("#4a3a2c", E.PAINT.wood()), 0, 0, -D / 2 + 0.33); // door
  for (let i = 0; i < 3; i++) E.tbox(g, 1.9, 0.1, 0.06, iron, 0, 0.5 + i * 0.85, -D / 2 + 0.41);
  for (let i = 0; i < 5; i++) E.tbox(g, 2.6, 0.45, 0.6, E.toon("#8a8178", E.PAINT.stone()), -6 + i * 3, 0, -D / 2 + 1.4); // stone benches
  return g;
};

/**
 * 1818 penal treadwheel: a long wooden drum with step boards on the outside, turning on its axle (axis = x),
 * a handrail beam above, and stall partitions. Returns { g, drum, R, cy, stand(theta) -> [y, z] foot point on the steps }.
 * Rotate `drum.rotation.x` each frame; prisoners stand on the +z side near the top.
 */
export const treadwheel = (E, parent, o = {}) => {
  const g = G(parent, o.x ?? 0, 0, o.z ?? 0, o.ry ?? 0), L = o.len ?? 7, R = o.r ?? 1.5, cy = o.cy ?? 1.25, n = o.steps ?? 24;
  const wood = E.toon("#ffffff", E.PAINT.wood()), dark = E.toon("#5b3b22");
  const drum = new THREE.Group(); drum.position.set(0, cy, 0); g.add(drum);
  const core = E.add(drum, new THREE.CylinderGeometry(R * 0.93, R * 0.93, L, 24), E.toon("#7a5232", E.PAINT.wood())); core.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const rim = E.add(drum, new THREE.CylinderGeometry(R * 1.04, R * 1.04, 0.14, 28), dark, s * L / 2, 0, 0); rim.rotation.z = Math.PI / 2; }
  for (let i = 0; i < n; i++) { // step boards
    const a = (i / n) * Math.PI * 2, st = new THREE.Group(); st.rotation.x = a; drum.add(st);
    E.tbox(st, L - 0.1, 0.1, 0.32, wood, 0, R * 0.93, 0);
  }
  for (const s of [-1, 1]) { // A-frame supports + axle
    E.tbox(g, 0.3, cy + 0.25, 0.3, dark, s * (L / 2 + 0.35), 0, 0);
    E.tbox(g, 0.25, 0.2, 2.6, dark, s * (L / 2 + 0.35), 0, 0);
  }
  const ax = E.add(g, new THREE.CylinderGeometry(0.12, 0.12, L + 1.0, 12), E.toon("#3a3a40"), 0, cy, 0); ax.rotation.z = Math.PI / 2;
  // handrail the prisoners hold, partitions between stalls
  const railZ = R * 0.15, railY = cy + R + 1.0;
  E.tbox(g, L + 1, 0.12, 0.12, dark, 0, railY, railZ);
  for (const s of [-1, 1]) E.tbox(g, 0.14, railY + 0.1, 0.14, dark, s * (L / 2 + 0.5), 0, railZ);
  const stalls = o.stalls ?? 4;
  for (let i = 1; i < stalls; i++) E.tbox(g, 0.06, 1.3, 0.9, E.toon("#ffffff", E.PAINT.wood()), -L / 2 + (i * L) / stalls, railY - 1.3, railZ + 0.35);
  const stand = (theta) => [cy + R * Math.cos(theta) + 0.05, R * Math.sin(theta)];
  return { g, drum, R, cy, L, stand };
};

/** modern treadmill, belt along x, console at +x. Returns { g, deck, setIncline(deg), footY(x) } (x relative to its centre) */
export const treadmill = (E, parent, x = 0, z = 0, o = {}) => {
  const g = G(parent, x, 0, z, o.ry ?? 0), Lb = o.len ?? 2.1;
  const deck = new THREE.Group(); deck.position.set(-Lb / 2, 0.12, 0); g.add(deck); // pivots at the rear roller
  E.tbox(deck, Lb, 0.16, 0.9, E.toon("#3a3e45"), Lb / 2, 0, 0);
  E.tbox(deck, Lb - 0.1, 0.03, 0.62, E.toon("#ffffff", E.PAINT.rubber()), Lb / 2, 0.16, 0);
  for (const s of [-1, 1]) E.tbox(deck, Lb, 0.06, 0.12, E.toon(o.accent ?? "#e2453c"), Lb / 2, 0.16, s * 0.4);
  const tower = new THREE.Group(); tower.position.set(Lb, 0, 0); deck.add(tower);
  for (const s of [-1, 1]) E.tbox(tower, 0.1, 1.25, 0.08, E.toon("#8d949c"), 0, 0.1, s * 0.38);
  E.tbox(tower, 0.32, 0.4, 0.86, E.toon("#26292d"), 0.04, 1.3, 0);
  E.tbox(tower, 0.03, 0.26, 0.6, E.toon("#7fd6ff", null, { emissive: "#2a7aa0" }), -0.13, 1.37, 0);
  for (const s of [-1, 1]) E.tbox(tower, 0.6, 0.05, 0.05, E.toon("#8d949c"), -0.3, 1.2, s * 0.42);
  let inc = 0;
  const setIncline = (deg) => { inc = THREE.MathUtils.degToRad(deg); deck.rotation.z = inc; };
  const footY = (lx) => 0.12 + 0.19 + Math.tan(inc) * (lx + Lb / 2);
  return { g, deck, setIncline, footY, Lb };
};

/** straight indoor staircase rising along +x: n steps of rise h, run d, width w. Returns { g, top(x) -> floor height at local x } */
export const staircase = (E, parent, x = 0, z = 0, o = {}) => {
  const g = G(parent, x, 0, z), n = o.n ?? 12, h = o.rise ?? 0.18, d = o.run ?? 0.3, w = o.w ?? 1.6;
  const tread = E.toon("#ffffff", E.PAINT.wood()), side = E.toon(o.wall ?? "#e7d8bf", E.PAINT.plaster(o.wall ?? "#e7d8bf"));
  for (let i = 0; i < n; i++) E.tbox(g, d, h * (i + 1), w, tread, i * d + d / 2, 0, 0, 0, 1);
  E.tbox(g, n * d + 4, 4.5, 0.3, side, n * d / 2, 0, -w / 2 - 0.15);
  const rail = E.add(g, new THREE.CylinderGeometry(0.035, 0.035, Math.hypot(n * d, n * h), 8), E.toon("#6b4429"), n * d / 2, n * h / 2 + 0.95, w / 2 - 0.1);
  rail.rotation.z = Math.PI / 2 - Math.atan2(n * h, n * d) + Math.PI;
  for (let i = 0; i < n; i += 3) E.tbox(g, 0.04, 0.95, 0.04, E.toon("#6b4429"), i * d + d / 2, h * (i + 1), w / 2 - 0.1);
  const top = (lx) => Math.max(0, Math.min(n, Math.floor(lx / d) + 1)) * h * (lx >= 0 ? 1 : 0);
  return { g, top, n, h, d };
};

/** a big lone mountain (cone + snow cap) for "as high as a mountain" */
export const bigMountain = (E, parent, x, z, h = 60, o = {}) => {
  const g = G(parent, x, 0, z);
  const m = E.add(g, new THREE.ConeGeometry(h * 0.75, h, 9), E.toon(o.col ?? "#8e93b8"), 0, h / 2 - 1, 0); m.castShadow = false;
  const cap = E.add(g, new THREE.ConeGeometry(h * 0.75 * 0.32, h * 0.32, 9), E.toon("#f4f6ff"), 0, h - h * 0.16 - 1 + 0.05, 0); cap.castShadow = false;
  return g;
};

/** bell shape (lathe) used by bellTower; returns the mesh, mouth down, origin at the crown */
const bellMesh = (E, parent, s = 1, col = "#d9a93a") => {
  const pts = [[0, 0], [0.18, -0.02], [0.24, -0.15], [0.27, -0.45], [0.36, -0.68], [0.45, -0.78], [0.44, -0.82], [0, -0.8]].map(([x, y]) => new THREE.Vector2(x * s, y * s));
  return E.add(parent, new THREE.LatheGeometry(pts, 28), E.toon(col, null, { side: THREE.DoubleSide }), 0, 0, 0);
};

/** stone church bell tower with an open belfry facing +z and a big swinging bell; a rope hangs down the front.
 *  Returns { g, swing(angle), ropeTop, bellPos } */
export const bellTower = (E, parent, x = 0, z = 0, o = {}) => {
  const g = G(parent, x, 0, z), W = o.w ?? 3.2, H = o.h ?? 9;
  const stone = E.toon("#ffffff", E.PAINT.stone());
  E.tbox(g, W, H - 2.6, W, stone, 0, 0, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.tbox(g, 0.5, 2.6, 0.5, stone, sx * (W / 2 - 0.25), H - 2.6, sz * (W / 2 - 0.25));
  E.tbox(g, W + 0.3, 0.4, W + 0.3, stone, 0, H, 0);
  const sh = new THREE.ConeGeometry(W * 0.78, 2.6, 4); sh.rotateY(Math.PI / 4);
  E.add(g, sh, E.toon(o.roof ?? "#5a6378"), 0, H + 0.4 + 1.3, 0);
  E.tbox(g, 0.9, 1.6, 0.1, E.toon("#6b4429", E.PAINT.wood()), 0, 0, W / 2 + 0.02); // door
  E.tbox(g, W - 0.4, 0.14, 0.14, E.toon("#6b4429"), 0, H - 0.5, 0); // headstock beam
  const piv = new THREE.Group(); piv.position.set(0, H - 0.45, 0); g.add(piv);
  bellMesh(E, piv, 2.0);
  const clap = E.add(piv, new THREE.SphereGeometry(0.16, 12, 8), E.toon("#3a3a42"), 0, -1.45, 0);
  const rope = E.add(g, new THREE.CylinderGeometry(0.035, 0.035, 1, 8), E.toon("#c9a46a"), 0, 0, W / 2 + 0.35);
  const ropeTop = H - 2.7;
  const setRope = (bottom) => { rope.scale.y = ropeTop - bottom; rope.position.y = (ropeTop + bottom) / 2; };
  setRope(1.0);
  const swing = (a) => { piv.rotation.x = a; clap.position.z = -Math.sin(a * 0.6) * 0.25; };
  return { g, swing, setRope, bellPos: [x, H - 1.2, z] };
};

/** plain interior room: wooden floor, back wall (-z) and a left wall, a window and a picture frame. Opens toward +z. */
export const room = (E, parent, o = {}) => {
  const g = G(parent, o.x ?? 0, 0, o.z ?? 0), W = o.w ?? 10, D = o.d ?? 8, H = o.h ?? 4.2;
  const fl = ground(E, g, E.PAINT.wood(), 30, 0.5); fl.position.y = 0.02;
  const wall = E.toon("#ffffff", E.PAINT.plaster(o.wall ?? "#efe1c6"));
  E.tbox(g, W, H, 0.3, wall, 0, 0, -D / 2);
  E.tbox(g, 0.3, H, D, wall, -W / 2, 0, 0);
  E.tbox(g, W, 0.25, 0.34, E.toon(o.trim ?? "#8a5a3a"), 0, 0, -D / 2 + 0.02);
  E.tbox(g, 1.6, 1.6, 0.08, E.toon(o.glass ?? "#bfe0ff", null, { emissive: o.glow ?? "#5a7fa8" }), W * 0.28, 1.6, -D / 2 + 0.16);
  E.tbox(g, 1.8, 0.12, 0.16, E.toon("#8a5a3a"), W * 0.28, 1.5, -D / 2 + 0.2);
  E.tbox(g, 1.0, 0.8, 0.06, E.toon(o.art ?? "#c98a5a"), -W * 0.28, 2.2, -D / 2 + 0.16);
  return g;
};

/** wooden baby crib (cot) with bars; open top. Returns { g, mattressY } */
export const crib = (E, parent, x = 0, z = 0, o = {}) => {
  const g = G(parent, x, 0, z, o.ry ?? 0), L = 1.2, Wd = 0.7, wood = E.toon(o.col ?? "#f1d9b0", E.PAINT.wood());
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.tbox(g, 0.07, 1.0, 0.07, wood, sx * L / 2, 0, sz * Wd / 2);
  E.tbox(g, L, 0.1, Wd, E.toon("#ffffff"), 0, 0.35, 0);
  for (const sz of [-1, 1]) { E.tbox(g, L, 0.05, 0.05, wood, 0, 0.95, sz * Wd / 2); for (let i = 1; i < 8; i++) E.tbox(g, 0.03, 0.55, 0.03, wood, -L / 2 + i * L / 8, 0.4, sz * Wd / 2); }
  return { g, mattressY: 0.45 };
};

/** Addison's "dumb bell": a wooden gallows-frame with a bell wheel on top, a rope down one side to the hands, and a lead
 *  weight on the other. No bell. set(k): k = 0 rope up (weight down) .. 1 rope pulled (weight up). Returns { g, set, handY } */
export const dumbBellRig = (E, parent, x = 0, z = 0, o = {}) => {
  const g = G(parent, x, 0, z, o.ry ?? 0), H = o.h ?? 3.3, wood = E.toon("#ffffff", E.PAINT.wood());
  for (const sx of [-0.95, 0.95]) E.tbox(g, 0.16, H, 0.16, wood, sx, 0, 0);
  E.tbox(g, 2.1, 0.18, 0.2, wood, 0, H, 0);
  for (const sx of [-0.95, 0.95]) E.tbox(g, 0.6, 0.12, 0.6, wood, sx, 0, 0); // feet
  const wh = new THREE.Group(); wh.position.set(0, H - 0.45, 0.22); g.add(wh);
  const rim = E.add(wh, new THREE.TorusGeometry(0.42, 0.05, 8, 28), E.toon("#8a5a3a"), 0, 0, 0);
  for (let i = 0; i < 4; i++) E.add(wh, new THREE.BoxGeometry(0.05, 0.84, 0.05), E.toon("#8a5a3a"), 0, 0, 0).rotation.z = (i * Math.PI) / 4;
  E.add(wh, new THREE.CylinderGeometry(0.07, 0.07, 0.3, 10), E.toon("#3a3a42"), 0, 0, -0.1).rotation.x = Math.PI / 2;
  const ropeMat = E.toon("#c9a46a");
  const ropeL = E.add(g, new THREE.CylinderGeometry(0.028, 0.028, 1, 8), ropeMat, 0.42, 0, 0.22);
  const ropeR = E.add(g, new THREE.CylinderGeometry(0.028, 0.028, 1, 8), ropeMat, -0.42, 0, 0.22);
  const lead = E.add(g, new THREE.CylinderGeometry(0.2, 0.22, 0.42, 14), E.toon("#6f7480"), -0.42, 0, 0.22);
  const top = H - 0.45;
  const set = (k) => {
    const hand = 1.75 - k * 0.75, wt = 0.35 + k * 0.75;
    ropeL.scale.y = top - hand; ropeL.position.y = (top + hand) / 2;
    ropeR.scale.y = top - (wt + 0.21); ropeR.position.y = (top + wt + 0.21) / 2;
    lead.position.y = wt; wh.rotation.z = -k * 1.8;
    return hand;
  };
  set(0);
  return { g, set };
};

/** 1930s city block: a row of tall brick buildings with lit windows along -z, sidewalk, street lamps. Street runs along x. */
export const cityStreet = (E, parent, o = {}) => {
  const g = G(parent, o.x ?? 0, 0, o.z ?? 0), r = E.prng(o.seed ?? 11);
  const road = ground(E, g, E.PAINT.stone(), 80, 0.5, "#6f6a66"); road.position.y = 0.01;
  E.tbox(g, 80, 0.18, 3.2, E.toon("#c9c2b6"), 0, 0, -6.4); // sidewalk
  const bricks = ["#a8553a", "#8a6a52", "#b88a5a", "#7a4a3a", "#9a9488"];
  let x = -34;
  while (x < 34) {
    const w = 4 + r() * 3, h = 9 + r() * 16, col = bricks[Math.floor(r() * bricks.length)];
    const win = E.ctex("cityWin" + col, 256, 256, (c) => {
      c.fillStyle = col; c.fillRect(0, 0, 256, 256);
      c.fillStyle = "rgba(0,0,0,.18)"; for (let y = 0; y < 256; y += 16) c.fillRect(0, y, 256, 2);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = "#2a2730"; c.fillRect(30 + i * 128, 40 + j * 128, 68, 84); c.fillStyle = (i + j) % 2 ? "#ffe39a" : "#9fc0e0"; c.fillRect(36 + i * 128, 46 + j * 128, 56, 72); }
    });
    E.tbox(g, w, h, 6, E.toon("#ffffff", win), x + w / 2, 0, -11, 0, 2.4);
    E.tbox(g, w + 0.3, 0.5, 6.3, E.toon(shadeHex(col)), x + w / 2, h, -11);
    x += w + 0.15;
  }
  for (let i = -3; i <= 3; i++) { // lamps
    const lx = i * 7 + 2, lamp = G(g, lx, 0, -5.2);
    E.cyl(lamp, 0.07, 0.1, 3.6, E.toon("#2c2a2e"), 0, 0, 0, 10);
    E.add(lamp, new THREE.SphereGeometry(0.25, 12, 8), E.toon("#fff4c0", null, { emissive: "#c9a040" }), 0, 3.8, 0);
  }
  return g;
};
const shadeHex = (hex) => { const c = new THREE.Color(hex); c.multiplyScalar(0.7); return "#" + c.getHexString(); };

/** army training ground: grass, canvas tents in a row, crates, a plain pennant pole. Opens toward +z. */
export const armyCamp = (E, parent, o = {}) => {
  const g = G(parent, o.x ?? 0, 0, o.z ?? 0);
  const gr = ground(E, g, E.PAINT.grass(), 80, 0.4, "#c8d8a0"); gr.position.y = 0.012;
  const canvas = E.toon("#a89a6a");
  for (let i = -2; i <= 2; i++) {
    const sh = new THREE.Shape(); sh.moveTo(-1.6, 0); sh.lineTo(1.6, 0); sh.lineTo(0, 2.2); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false }); geo.translate(0, 0, -1.5);
    E.add(g, geo, canvas, i * 4.4, 0, -9);
    E.tbox(g, 0.9, 1.4, 0.05, E.toon("#4a4232"), i * 4.4, 0, -7.48);
  }
  for (const [x, z] of [[-6, -5], [-5.2, -5.4], [6.5, -5]]) E.tbox(g, 0.8, 0.8, 0.8, E.toon("#ffffff", E.PAINT.wood()), x, 0, z);
  E.cyl(g, 0.06, 0.08, 7, E.toon("#8d949c"), 8, 0, -7, 10);
  const pen = new THREE.Shape(); pen.moveTo(0, 0); pen.lineTo(1.6, -0.4); pen.lineTo(0, -0.8); pen.closePath();
  E.add(g, new THREE.ShapeGeometry(pen), E.toon("#e0b04a", null, { side: THREE.DoubleSide }), 8.06, 6.9, -7);
  return g;
};

/** dining table with a cloth; returns { g, topY } */
export const table = (E, parent, x = 0, z = 0, o = {}) => {
  const g = G(parent, x, 0, z, o.ry ?? 0), W = o.w ?? 1.8, D = o.d ?? 1.0, H = 0.78, wood = E.toon("#ffffff", E.PAINT.wood());
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.tbox(g, 0.08, H, 0.08, wood, sx * (W / 2 - 0.1), 0, sz * (D / 2 - 0.1));
  E.tbox(g, W, 0.06, D, wood, 0, H, 0);
  E.tbox(g, W + 0.04, 0.02, D + 0.04, E.toon(o.cloth ?? "#f4f1ea"), 0, H + 0.06, 0);
  return { g, topY: H + 0.08 };
};

/** lab desk with a few flasks (1930s physiology lab) */
export const labDesk = (E, parent, x = 0, z = 0) => {
  const t = table(E, parent, x, z, { w: 2.2, d: 0.9, cloth: "#e8ecef" });
  const glass = E.toon("#bfe8e0", null, { emissive: "#2a5a50" });
  for (const [dx, h, c] of [[-0.7, 0.35, "#7fd6c2"], [-0.45, 0.25, "#ff9f6b"], [0.6, 0.3, "#b7a6ff"]]) {
    E.cyl(t.g, 0.03, 0.09, h, glass, dx, t.topY, 0, 12);
    E.cyl(t.g, 0.085, 0.085, h * 0.4, E.toon(c), dx, t.topY, 0, 12);
  }
  return t;
};
