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
