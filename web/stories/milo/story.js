// "The First Gym Bro" — Milo of Croton and the calf. Timed to phrases.json (phrase start/end seconds from the voiceover).
import * as THREE from "three";
import { bodyFront, INK } from "../../toon.js";
import { cow, bonePile, dumbbell2D, mooBubble, sweat, confetti, speedLines } from "../../lib/props.js";
import * as S from "../../lib/sets.js";
import { fxCloud, fxStars, fxBurst } from "../../toon.js";

const MILO = { jacket: "#c94f3a", pants: "#d9a27a", boots: "#7a4a2a", hat: "hair", hair: "#2e2018", skin: "#e9b98e", moustache: "#2e2018", build: "stout", buttons: "#c94f3a" };
const BRO = { jacket: "#4a5260", pants: "#2a2d33", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", skin: "#f1c9a5", buttons: "#4a5260" };
const TUNICS = ["#e8dcc0", "#6f8fc4", "#d9b44a", "#8fb36a", "#c7779a", "#f0f0e8", "#a7745a"];
const folk = (i) => ({ jacket: TUNICS[i % TUNICS.length], pants: ["#d9a27a", "#c99067", "#f5c9a0"][i % 3], boots: "#7a4a2a", hat: "hair",
  hair: ["#2e2018", "#5a3b2a", "#1d1a18", "#8a5a30"][i % 4], skin: ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#c99067"][i % 4], buttons: TUNICS[i % TUNICS.length], build: i % 5 === 0 ? "stout" : "adult" });

const SX = 0, SZ = 75, GX = 70, GZ = 40; // stadium and modern gym live far from the village so their sets never meet
let P = null, F = null, END = 0;
const blinkAt = (f, seed) => { const per = 45 + ((seed * 37) % 40); return ((f + seed * 13) % per) < 4 ? 1 : 0; };

export default {
  frames: 900,
  async build(E) {
    P = await (await fetch("./stories/milo/phrases.json")).json();
    F = P.phrases.map((p) => Math.round(p.start * E.FPS));
    END = Math.round((P.duration + 0.9) * E.FPS); // 0.9 s tail for the MOO
    this.frames = END;
    const root = new THREE.Group(); E.scene.add(root);
    // village + field
    S.ground(E, root, E.PAINT.grass(), 1400, 0.22);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 120), E.toon("#ffffff", (() => { const t = E.PAINT.sand().clone(); t.needsUpdate = true; t.repeat.set(1, 30); return t; })()));
    path.rotation.x = -Math.PI / 2; path.rotation.z = Math.PI / 2; path.position.set(0, 0.02, 1.5); path.receiveShadow = true; root.add(path);
    S.backdrop(E, root);
    S.temple(E, root, 0, -42, 0, 1.1);
    const r = E.prng(11);
    for (let i = 0; i < 14; i++) {
      const x = -38 + (i % 7) * 12 + (r() - 0.5) * 4, z = -18 - Math.floor(i / 7) * 14 - r() * 5;
      if (Math.abs(x) < 9 && z < -30) continue;
      S.house(E, root, x, z, (r() - 0.5) * 0.5, 4.5 + r() * 2, 4 + r() * 1.5, 3 + r() * 1.2, { roof: r() < 0.5 ? "#c4583a" : "#b8643f", wall: r() < 0.5 ? "#f3e6cc" : "#efe0d0" });
    }
    for (let i = 0; i < 18; i++) { const x = -40 + r() * 80, z = -8 - r() * 30; if (Math.abs(x) < 4) continue; S.olive(E, root, x, z, 0.9 + r() * 0.5, i); }
    for (let i = 0; i < 10; i++) S.cypress(E, root, -60 + i * 13 + r() * 4, -60 - r() * 10, 7 + r() * 4, i);
    // stone wall lining the field
    for (let i = 0; i < 12; i++) E.tbox(root, 3, 0.8 + r() * 0.2, 0.7, E.toon("#ffffff", E.PAINT.stone()), -18 + i * 3, 0, -5.5);
    // dinner table (shot 9)
    E.tbox(root, 2.4, 0.08, 1.2, E.toon("#ffffff", E.PAINT.wood()), 6, 0.86, 3);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.tbox(root, 0.1, 0.86, 0.1, E.toon("#6b4429"), 6 + sx * 1.05, 0, 3 + sz * 0.45);
    // stadium
    const st = new THREE.Group(); st.position.set(SX, 0, SZ); root.add(st);
    S.ground(E, st, E.PAINT.sand(), 80, 0.3).position.y = 0.01;
    S.stadium(E, st, { radius: 20 });
    for (let i = 0; i < 2; i++) { const p = S.temple(E, st, (i ? 1 : -1) * 26, 14, i ? -0.6 : 0.6, 0.45, { cols: 4 }); }
    this.seats = S.stadiumSeats({ radius: 20 }).filter((s, i) => s.row < 4 && (s.i % 3 === 0));
    // modern gym
    const gy = new THREE.Group(); gy.position.set(GX, 0, GZ); root.add(gy);
    S.gym(E, gy, { accent: "#e2453c" });
    // clouds
    this.clouds = S.clouds(E, 8);
  },

  frame(E, f) {
    const t = f / E.FPS, T = (i) => F[i];
    const shot = f < T(1) ? 1 : f < T(2) ? 2 : f < T(4) ? 3 : f < T(5) ? 4 : f < T(6) ? 5 : f < T(7) ? 6 : f < T(8) ? 7 : f < T(9) ? 8 : f < T(10) ? 9 : f < T(12) ? 10 : f < T(13) ? 11 : 12;
    const k = (i) => Math.min(9, i) * 0; // placeholder (unused)
    const clouds = () => this.clouds.forEach((c, i) => E.card({ id: "cloud" + i, key: "c" + i, res: 0.35, draw: (p) => fxCloud(p, c.seed), x: c.x, y: c.y, z: c.z, s: c.s, blob: 0, bright: 1.05 }));
    const milo = (o) => {
      const expr = o.expr ?? "grin", pose = o.pose ?? null, mode = o.mode ?? "stand", ph = o.phase ?? 0, bl = blinkAt(f, 3);
      const extra = o.extra ?? null;
      const key = ["milo", expr, pose, mode, Math.round(ph * 24), bl, o.liftY ?? 0, extra ? extra.key : ""].join("|");
      E.card({ id: o.id ?? "milo", key, x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0, s: o.s ?? 1, flip: o.flip, lean: o.lean,
        draw: (p, g) => { bodyFront(p, MILO, { expr, pose, mode: pose ? "stand" : mode, phase: ph, blink: bl, seed: 3, liftY: o.liftY ?? 0, headTilt: o.headTilt ?? 0 }); if (extra) extra.draw(g, p.hands || []); } });
    };
    const calf = (o) => {
      const kk = Math.round((o.k ?? 0.45) * 40) / 40, bl = blinkAt(f, 9);
      E.card({ id: o.id ?? "calf", key: ["calf", kk, o.expr, bl, Math.round((o.phase ?? 0) * 12), o.dangle, o.bull].join("|"), x: o.x, y: o.y ?? 0, z: o.z ?? 0, s: o.s ?? 1, flip: o.flip ?? true,
        blob: o.blob, lean: o.lean, draw: (p, g) => cow(g, { k: kk, expr: o.expr ?? "calm", blink: bl, phase: o.phase ?? 0, dangle: o.dangle, bull: o.bull, body: o.bull ? "#7a4a32" : undefined, spots: o.bull ? "#3a2418" : undefined }) });
    };
    let cam, light = "day", lightB = null, lightT = 0, focus = E.V(0, 0, 0), kicks = [];

    if (shot <= 3) {
      // ---- shots 1-3: field + village, one continuous camera
      cam = E.camFromKeys([
        { f: 0, pos: [0.15, 1.95, 3.0], look: [0, 1.7, 0], fov: 36, roll: -2 },
        { f: T(1) + 4, from: T(1) - 2, pos: [0.6, 1.3, 4.8], look: [0.45, 1.05, 0], fov: 38, ease: "out" },
        { f: T(3) - 6, from: T(2) - 3, pos: [6, 8.5, 22], look: [0, 3, -22], fov: 42 },
        { f: T(4) - 2, from: T(3) - 2, pos: [1.6, 1.6, 5.4], look: [0.2, 1.3, 0], fov: 38, ease: "out" },
      ], f, { creep: 0.0018 });
      const hop = E.back(E.prog(f, T(1) - 3, T(1) + 9), 2.2), hopY = Math.sin(E.prog(f, T(1) - 3, T(1) + 9) * Math.PI) * 0.5;
      let expr = f < T(1) + 4 ? "grin" : f < T(1) + 16 ? "shock" : "smile";
      let pose = f < T(1) ? "flex" : shot === 3 && f > T(3) ? "flex" : null;
      if (shot === 3 && f > T(3)) expr = "grin";
      milo({ expr, pose, headTilt: f > T(1) + 4 && f < T(2) ? 0.15 : 0 });
      if (f >= T(1) - 3) calf({ x: E.lerp(2.2, 0.95, hop), y: hopY, z: 0.35, k: 0.42, expr: f < T(1) + 10 ? "calm" : "happy" });
      // villagers strolling in the distance
      for (let i = 0; i < 6; i++) { const dir = i % 2 ? 1 : -1, x = -22 + i * 8 + dir * t * 0.9, z = -12 - (i % 3) * 3;
        E.card({ id: "v" + i, key: "v" + i + "|" + Math.round(((t * 1.2 + i * 0.3) % 1) * 12), res: 0.4, x, z, flip: dir < 0, s: 1,
          draw: (p) => bodyFront(p, folk(i), { mode: "stroll", phase: (t * 1.2 + i * 0.3) % 1, expr: "neutral", seed: 20 + i, facing: dir }) }); }
      clouds();
    } else if (shot <= 6) {
      // ---- shots 4-6: the carry montage, days flying by, then growth
      const a = T(4), b = T(5);
      if (shot === 4) {
        const cyc = E.prog(f, a, b) * 3; // three day/night cycles
        const ph = cyc % 1, seq = ["day", "golden", "night", "day"], idx = Math.min(2, Math.floor(ph * 3));
        light = seq[idx]; lightB = seq[idx + 1]; lightT = E.smooth((ph * 3) % 1);
        const x = E.lerp(-3, 3, E.prog(f, a, b));
        focus = E.V(x, 0, 0);
        cam = { pos: E.V(x * 0.7 + 0.5, 1.7, 6.2), look: E.V(x * 0.85, 1.5, 0), fov: 38, roll: 0 };
        const wph = (t * 1.6) % 1;
        milo({ x, expr: "grin", pose: "carry", mode: "stroll", phase: wph });
        calf({ x: x + 0.12, y: 1.42 + Math.abs(Math.sin(wph * Math.PI * 2)) * 0.03, z: -0.08, k: 0.5 + 0.12 * E.prog(f, a, b), dangle: true, blob: 0, expr: "happy" });
      } else {
        const g1 = E.back(E.prog(f, T(5), T(5) + 14), 1.5), g2 = E.back(E.prog(f, T(6), T(6) + 16), 2.2);
        const ms = 1 + 0.32 * (shot === 6 ? g2 : 0), ck = 0.62 + 0.26 * g1;
        cam = E.camFromKeys([
          { f: T(5), pos: [0.4, 1.9, 5.0], look: [0, 1.75, 0], fov: 38 },
          { f: T(6) + 14, from: T(6) - 2, pos: [0.6, 2.4, 7.2], look: [0, 2.1, 0], fov: 40, ease: "out" },
        ], f);
        const strain = shot === 5 && f > T(5) + 6;
        milo({ s: ms, expr: strain ? "pained" : "laugh", pose: "carry", extra: strain ? { key: "sw" + Math.round(t * 10), draw: (g) => sweat(g, 300, 260, t) } : null });
        calf({ x: 0.12 * ms, y: 1.42 * ms - (ck - 0.62) * 0.5, z: -0.08, k: ck, s: 1, dangle: true, blob: 0, expr: shot === 6 ? "shock" : "calm" });
        if (shot === 6) kicks = [{ f: T(6) + 5, amp: 0.05 }];
      }
      clouds();
    } else if (shot <= 8) {
      // ---- shots 7-8: Olympic stadium, golden light, the bull
      light = "golden"; focus = E.V(SX, 0, SZ);
      cam = E.camFromKeys([
        { f: T(7), pos: [SX + 2, 13, SZ + 30], look: [SX, 1, SZ], fov: 44 },
        { f: T(8) - 4, from: T(7) + 6, pos: [SX + 2.2, 2.4, SZ + 7.4], look: [SX, 2.3, SZ], fov: 40 },
        { f: T(9), from: T(8), pos: [SX + 2.0, 2.6, SZ + 6.4], look: [SX, 2.5, SZ], fov: 40, roll: 3 },
      ], f, { kicks: shot === 8 ? [{ f: T(8) + 2, amp: 0.08 }, { f: T(8) + 12, amp: 0.05 }] : [] });
      const walk = E.prog(f, T(7), T(8) - 6), x = SX + E.lerp(-7, 0, E.smooth(walk)), wph = (t * 1.3) % 1;
      const cheer = shot === 8;
      milo({ x, z: SZ, s: 1.32, expr: cheer ? "laugh" : "grin", pose: cheer ? "cheer" : "carry", mode: walk < 1 ? "stroll" : "stand", phase: wph });
      calf({ id: "bull", x: x + 0.2, y: 1.55 + (cheer ? 0.3 * Math.abs(Math.sin(t * 7)) : 0), z: SZ - 0.12, k: 1, s: 1.15, bull: true, dangle: true, blob: 0, expr: cheer ? "happy" : "calm" });
      this.seats.forEach((sp, i) => {
        const jump = cheer ? Math.abs(Math.sin(t * 9 + i)) * 0.25 : 0;
        E.card({ id: "c" + i, key: "c" + i + (cheer ? "|ch" + Math.round(((t * 4 + i * 0.37) % 1) * 4) : "|sit"), res: 0.33, x: SX + sp.x, y: sp.y + jump, z: SZ + sp.z, s: 0.95, blob: 0.4,
          draw: (p) => bodyFront(p, folk(i), { mode: "stand", expr: cheer ? (i % 3 ? "laugh" : "grin") : (i % 4 ? "neutral" : "nervous"), pose: cheer ? (i % 2 ? "cheer" : "up") : null, seed: 40 + i }) });
      });
      if (cheer) for (let i = 0; i < 2; i++) E.card({ id: "conf" + i, key: "cf" + i + Math.round((t - T(8) / 30) * 30), res: 0.6, x: SX + (i ? 1.4 : -1.2), y: 1.5, z: SZ + 1.6, s: 1.6, blob: 0,
        draw: (p, g) => confetti(g, Math.max(0, t - T(8) / 30) * 0.9, i + 1) });
    } else if (shot === 9) {
      // ---- shot 9: "Then he ate it." sting: hard cut, push-in with roll
      light = "golden"; focus = E.V(6, 0, 3);
      cam = E.camFromKeys([{ f: T(9), pos: [6.5, 2.0, 8.2], look: [6.2, 1.6, 2.6], fov: 36, roll: 0 }, { f: T(10) - 1, pos: [6.4, 1.95, 6.6], look: [6.2, 1.7, 2.6], fov: 34, roll: 4.5, ease: "in" }], f);
      milo({ x: 6.1, z: 2.2, s: 1.32, expr: f < T(9) + 10 ? "relief" : "relief_open", pose: "belly" });
      E.card({ id: "bones", key: "bones", x: 6.35, y: 0.9, z: 3.25, s: 0.62, blob: 0, draw: (p, g) => bonePile(g) });
      kicks = [{ f: T(9), amp: 0.04 }];
      clouds();
    } else if (shot === 10) {
      // ---- shot 10: progressive overload: one more plate every beat (night-blue explanation light)
      light = "night"; focus = E.V(0, 0, 0);
      const beats = [T(10) + 10, T(11), Math.round((T(11) + T(12)) / 2)];
      const plates = beats.filter((b) => f >= b).length;
      const liftY = 0.25 * Math.abs(Math.sin(E.prog(f, T(10), T(12)) * Math.PI * 4));
      cam = E.camFromKeys([{ f: T(10), pos: [0.8, 2.0, 5.6], look: [0, 1.9, 0], fov: 40 }, { f: T(12), pos: [0.4, 2.1, 4.4], look: [0, 2.0, 0], fov: 38 }], f,
        { kicks: beats.map((b) => ({ f: b, amp: 0.03 })) });
      milo({ s: 1.2, expr: plates >= 3 ? "grin" : "stern", pose: "up",
        extra: { key: "bb" + plates, draw: (g, hands) => { // barbell overhead, plates stack up beat by beat
          const by = hands.length ? Math.min(...hands.map((h) => h[1])) : 125; g.save(); g.translate(0, by - 125);
          g.lineCap = "round"; g.lineWidth = 16; g.strokeStyle = INK; g.beginPath(); g.moveTo(80, 125); g.lineTo(520, 125); g.stroke();
          g.lineWidth = 9; g.strokeStyle = "#a9b0b8"; g.beginPath(); g.moveTo(80, 125); g.lineTo(520, 125); g.stroke();
          for (const s of [-1, 1]) for (let i = 0; i < plates; i++) {
            const x = 300 + s * (175 + i * 26), h = 120 - i * 14;
            g.beginPath(); g.roundRect(x - 12, 125 - h / 2, 24, h, 6); g.fillStyle = ["#2f3338", "#3c5a8a", "#a33b2e"][i]; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
          }
          g.restore();
        } } });
      for (const [i, b] of beats.entries()) if (f >= b && f < b + 10) E.card({ id: "pop" + i, key: "pop" + i + (f - b), res: 0.5, x: (i % 2 ? 1 : -1) * 0.9, y: 2.2, z: 0.3, s: 0.8, blob: 0,
        draw: (p) => fxBurst(p, (f - b) / 10, "#fff3b0") });
      clouds();
    } else {
      // ---- shots 11-12: modern gym, one rep, then the calf shows up
      light = "gym"; focus = E.V(GX, 0, GZ);
      const rep = E.prog(f, T(12) + 3, T(13) - 3), liftY = 0.55 * Math.sin(rep * Math.PI);
      const turn = shot === 12 && f > T(13) + 10;
      cam = E.camFromKeys([
        { f: T(12), pos: [GX + 0.3, 1.75, GZ + 3.6], look: [GX, 1.45, GZ], fov: 38 },
        { f: T(13) + 8, from: T(13) - 2, pos: [GX + 0.8, 1.5, GZ + 4.6], look: [GX + 0.5, 1.2, GZ], fov: 38, ease: "out" },
        { f: END - 1, from: T(13) + 20, pos: [GX + 0.75, 1.45, GZ + 3.9], look: [GX + 0.55, 1.15, GZ], fov: 37, roll: -2.5 },
      ], f);
      const bl = blinkAt(f, 5), expr = shot === 11 ? (rep > 0.2 && rep < 0.8 ? "stern" : "smile") : turn ? "shock" : "smile";
      E.card({ id: "bro", key: ["bro", expr, Math.round(liftY * 20), bl, turn].join("|"), x: GX, z: GZ,
        draw: (p, g) => { bodyFront(p, BRO, { expr, pose: "lift", liftY, blink: bl, seed: 8, look: turn ? 1 : 0, facing: turn ? 1 : 0 });
          for (const h of p.hands || []) dumbbell2D(g, h[0], h[1], 0.6); } });
      if (shot === 12) {
        const pk = E.back(E.prog(f, T(13), T(13) + 10), 1.8);
        calf({ x: GX + E.lerp(2.6, 1.0, pk), z: GZ + 0.5, k: 0.5, expr: f > END - 20 ? "happy" : "smug" });
        if (f > END - 26) E.card({ id: "moo", key: "moo" + Math.min(10, f - (END - 26)), res: 0.5, x: GX + 0.85, y: 0.55, z: GZ + 0.9, s: 0.5, blob: 0,
          draw: (p, g) => mooBubble(g, E.back(Math.min(1, (f - (END - 26)) / 8))) });
      }
    }

    // white flash on the time jump into the stadium
    if (f >= T(7) && f < T(7) + 6) E.post.flash.value = 1 - (f - T(7)) / 6;
    if (f < 4) E.post.fade.value = 0;
    E.applyLight(light, focus, lightB, lightT);
    cam.kx = cam.kx ?? 0; if (kicks.length) { const kk = kicks.reduce((a, k) => { const d = f - k.f; return d >= 0 && d < 8 ? a + k.amp * (1 - d / 8) * (d % 2 ? -1 : 1) : a; }, 0); cam.kx += kk; cam.ky = (cam.ky ?? 0) + kk * 0.6; }
    E.setCam(cam);
  },
};
