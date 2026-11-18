// "The Punishment Machine" — the treadmill began as an 1818 prison treadwheel. Timed to phrases.json.
import * as THREE from "three";
import { bodyFront, bodySide, fxCloud, fxBurst } from "../../toon.js";
import { ballChain, groceryBag, flame, wallet, clock, sweat } from "../../lib/props.js";
import * as S from "../../lib/sets.js";

const PRIS = (i) => ({ jacket: ["#8a8577", "#7d7466", "#958c78", "#6f6a62"][i % 4], pants: ["#6f6a5e", "#5e584c", "#7a7262"][i % 3], boots: "#3a2a20", hat: "cap",
  cap: ["#4a4640", "#57504a", "#3e3a36"][i % 3], skin: ["#f5c9a0", "#ecd0b6", "#ffe2c2", "#c99067"][i % 4], buttons: "#55504a", build: i === 2 ? "stout" : "adult" });
const CUBITT = { jacket: "#2b2f45", pants: "#c9b48a", boots: "#1d1a18", hat: "tophat", skin: "#f1c9a5", moustache: "#5a3b2a", buttons: "#d9b44a", build: "stout" };
const BRO = { jacket: "#4a5260", pants: "#2a2d33", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", skin: "#f1c9a5", buttons: "#4a5260" };
const SHOPPER = { jacket: "#3bceac", pants: "#3b5b9a", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: "#ecd0b6", buttons: "#2a9a80" };
const STROLLER = { jacket: "#ffd23f", pants: "#5a5f6e", boots: "#f4f1ea", hat: "hair", hair: "#1d1a18", skin: "#c99067", buttons: "#d9a92a" };

const GX = 60, GZ = 0, SX = -60, SZ = 0, WZ = -2; // gym, staircase room, treadwheel z inside the prison yard
const STALL = [-2.625, -0.875, 0.875, 2.625], TH = 0.32;
let P = null, F = null, END = 0;
const blinkAt = (f, seed) => { const per = 45 + ((seed * 37) % 40); return ((f + seed * 13) % per) < 4 ? 1 : 0; };

export default {
  frames: 900,
  async build(E) {
    P = await (await fetch("./stories/treadmill/phrases.json")).json();
    F = P.phrases.map((p) => Math.round(p.start * E.FPS));
    END = Math.round((P.duration + 0.8) * E.FPS);
    this.frames = END;
    const root = new THREE.Group(); E.scene.add(root);
    S.ground(E, root, E.PAINT.sand(), 1400, 0.22, "#c9b9a0");
    S.prisonYard(E, root, { z: 0 });
    this.wheel = S.treadwheel(E, root, { z: WZ });
    S.bigMountain(E, root, 10, -170, 95);
    S.bigMountain(E, root, -70, -200, 60, { col: "#9a9fc2" });
    // gym with treadmill
    const gy = new THREE.Group(); gy.position.set(GX, 0, GZ); root.add(gy);
    S.gym(E, gy, { accent: "#e2453c" });
    this.tm = S.treadmill(E, gy, 0, 0.5);
    // staircase room for the explanation
    const sr = new THREE.Group(); sr.position.set(SX, 0, SZ); root.add(sr);
    const fl = S.ground(E, sr, E.PAINT.wood(), 30, 0.5); fl.position.y = 0.02;
    this.st = S.staircase(E, sr, -1.8, -0.6, { n: 12, rise: 0.18, run: 0.3, w: 1.6 });
    this.clouds = S.clouds(E, 8);
  },

  frame(E, f) {
    const t = f / E.FPS, T = (i) => F[i];
    const shot = f < T(1) ? 1 : f < T(3) ? 2 : f < T(4) ? 3 : f < T(7) ? 4 : f < T(8) ? 5 : f < T(9) ? 6 : f < T(10) ? 7 : f < T(11) ? 8 : f < T(12) ? 9 : f < T(13) ? 10 : 11;
    const clouds = () => this.clouds.forEach((c, i) => E.card({ id: "cloud" + i, key: "c" + i, res: 0.35, draw: (p) => fxCloud(p, c.seed), x: c.x, y: c.y, z: c.z, s: c.s, blob: 0, bright: 1.05 }));
    const front = (id, look, o) => {
      const bl = blinkAt(f, o.seed ?? 3), ex = o.extra ?? null;
      const key = [id, o.expr, o.pose, o.mode, Math.round((o.phase ?? 0) * 24), bl, o.facing ?? 0, o.headTilt ?? 0, ex ? ex.key : ""].join("|");
      return E.card({ id, key, res: o.res ?? 1, x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0, s: o.s ?? 1, flip: o.flip, lean: o.lean, blob: o.blob,
        draw: (p, g) => { bodyFront(p, look, { expr: o.expr ?? "neutral", pose: o.pose ?? null, mode: o.mode ?? "stand", phase: o.phase ?? 0, blink: bl, seed: o.seed ?? 3, facing: o.facing ?? 0, headTilt: o.headTilt ?? 0 });
          if (ex) ex.draw(g, p.hands || []); } });
    };
    const side = (id, look, o) => {
      const bl = blinkAt(f, o.seed ?? 3), ex = o.extra ?? null;
      const key = [id, o.expr, Math.round((o.phase ?? 0) * 24), bl, ex ? ex.key : ""].join("|");
      return E.card({ id, key, res: o.res ?? 1, x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0, s: o.s ?? 1, flip: o.flip, blob: o.blob ?? 0,
        draw: (p, g) => { bodySide(p, look, { expr: o.expr ?? "neutral", mode: "march", phase: o.phase ?? 0, blink: bl, seed: o.seed ?? 3, stride: o.stride ?? 0.55, stomp: 0.8 }); if (ex) ex.draw(g); } });
    };
    // prisoners stepping on the wheel
    const wheelSpin = (speed = 1) => { this.wheel.drum.rotation.x = t * 0.55 * speed; };
    const climbers = (expr, opt = {}) => {
      const [fy, fz] = this.wheel.stand(TH);
      STALL.forEach((x, i) => {
        const ph = (t * 0.9 * (opt.speed ?? 1) + i * 0.27) % 1;
        const e = typeof expr === "function" ? expr(i) : expr;
        side("pr" + i, PRIS(i), { x, y: fy, z: WZ + fz, phase: ph, expr: e, seed: 30 + i, res: 0.6,
          extra: opt.sweat ? { key: "sw" + Math.round(t * 10), draw: (g) => sweat(g, 330, 250, t + i) } : null });
      });
    };
    let cam, light = "day", lightB = null, lightT = 0, focus = E.V(0, 0, 0), kicks = [];
    this.wheel.g.visible = shot >= 3 && shot <= 6 || shot === 10;
    this.wheel.g.scale.setScalar(1);

    if (shot === 1) {
      // ---- the hook: a prisoner, ball and chain, on a modern treadmill
      light = "gym"; focus = E.V(GX, 0, GZ);
      this.tm.setIncline(0);
      cam = E.camFromKeys([{ f: 0, pos: [GX + 0.2, 1.5, GZ + 5.0], look: [GX, 1.25, GZ + 0.5], fov: 40, roll: -2 },
        { f: T(1), from: 8, pos: [GX + 0.1, 1.55, GZ + 3.6], look: [GX, 1.3, GZ + 0.5], fov: 38, roll: 1, ease: "lin" }], f);
      const ph = (t * 1.5) % 1;
      side("hookpr", PRIS(0), { x: GX - 0.15, y: this.tm.footY(-0.15), z: GZ + 0.5, phase: ph, expr: f < T(0) + 30 ? "pained" : "dazed", seed: 30,
        extra: { key: "bc" + Math.round(ph * 12), draw: (g) => ballChain(g, 300 + Math.sin(ph * 6.28) * 40, 950, t) } });
    } else if (shot === 2) {
      // ---- England, 1818: prison yard, Cubitt sees idle prisoners
      light = "day"; focus = E.V(0, 0, -2);
      cam = E.camFromKeys([
        { f: T(1), pos: [0, 9, 14], look: [0, 2, -4], fov: 46 },
        { f: T(2) - 4, pos: [0.8, 7.2, 11.5], look: [0, 1.8, -4.2], fov: 45, ease: "lin" },
        { f: T(2) + 20, from: T(2) - 4, pos: [1.0, 1.7, 0.2], look: [-0.6, 1.1, -5.3], fov: 40 },
        { f: T(2) + 72, from: T(2) + 46, pos: [3.6, 1.75, 2.4], look: [2.3, 1.45, -1.8], fov: 40, ease: "out" },
      ], f);
      for (let i = 0; i < 5; i++) {
        const e = ["dazed", "relief", "smile_closed", "neutral", "whistle"][i];
        front("sit" + i, PRIS(i), { x: -4 + i * 1.6, y: 0.45, z: -5.35, mode: "sit", expr: e, seed: 50 + i, res: 0.6, headTilt: i % 2 ? 0.15 : -0.1 });
      }
      const sees = f > T(2) + 60;
      front("cubitt", CUBITT, { x: 2.5, z: -1.5, expr: sees ? (f > T(2) + 110 ? "stern" : "shock") : "neutral", facing: -1, seed: 7 });
      clouds();
    } else if (shot === 3) {
      // ---- he builds a giant wheel with steps (pops up)
      light = "day"; focus = E.V(0, 0, WZ);
      const pop = E.back(E.prog(f, T(3) + 8, T(3) + 26), 1.8);
      this.wheel.g.scale.setScalar(Math.max(0.001, pop));
      wheelSpin(0.4);
      cam = E.camFromKeys([{ f: T(3), pos: [3.0, 1.8, 6.5], look: [1.4, 1.7, WZ], fov: 40 },
        { f: T(4), from: T(3) + 10, pos: [3.8, 2.6, 9.6], look: [0.6, 2.0, WZ], fov: 44, ease: "out" }], f, { kicks: [{ f: T(3) + 20, amp: 0.05 }] });
      front("cubitt", CUBITT, { x: 2.1, z: 1.0, expr: pop > 0.5 ? "grin" : "smile", pose: pop > 0.3 ? "point" : null, flip: true, facing: -1, seed: 7 });
      if (f >= T(3) + 18 && f < T(3) + 30) E.card({ id: "pop", key: "pop" + (f - T(3) - 18), res: 0.5, x: 0, y: 2.6, z: WZ + 1.8, s: 2.2, blob: 0, draw: (p) => fxBurst(p, (f - T(3) - 18) / 12, "#fff3b0") });
      clouds();
    } else if (shot <= 6) {
      // ---- climbing for hours / up up up / going nowhere / mountain / again tomorrow
      focus = E.V(0, 0, WZ);
      if (shot === 6) { // day -> night -> day, twice
        const cyc = E.prog(f, T(8), T(9)) * 2, ph = cyc % 1, seq = ["day", "golden", "night", "day"], idx = Math.min(2, Math.floor(ph * 3));
        light = seq[idx]; lightB = seq[idx + 1]; lightT = E.smooth((ph * 3) % 1);
      }
      const ups = [T(5), T(5) + 9, T(5) + 18];
      wheelSpin(shot === 4 && f >= T(5) && f < T(6) ? 2.2 : 1);
      cam = E.camFromKeys([
        { f: T(4), pos: [5.2, 3.0, 6.4], look: [0, 3.0, WZ], fov: 42 },
        { f: T(5) + 2, from: T(5) - 4, pos: [1.9, 3.7, 2.4], look: [0.7, 3.6, WZ + 0.4], fov: 38, ease: "out" },
        { f: T(6) + 6, from: T(6) - 3, pos: [3.4, 3.4, 5.2], look: [0.9, 3.5, WZ], fov: 40, ease: "out" },
        { f: T(7) + 4, from: T(7) - 2, pos: [1.5, 1.4, 7.5], look: [0.5, 4.0, WZ], fov: 50 },
        { f: T(8) - 4, from: T(7) + 10, pos: [1.2, 1.2, 8.0], look: [8, 92, -170], fov: 52 },
        { f: T(8) + 8, from: T(8) - 3, pos: [4.6, 3.1, 5.8], look: [0, 3.0, WZ], fov: 42, ease: "out" },
      ], f, { kicks: shot === 4 ? ups.map((u) => ({ f: u, amp: 0.05 })) : [] });
      const e = shot === 4 ? (f < T(5) ? (i) => ["neutral", "pained", "dazed", "nervous"][i] : f < T(6) ? "pained" : "dazed") : shot === 5 ? "dazed" : (i) => (i % 2 ? "pained" : "dazed");
      climbers(e, { speed: shot === 4 && f >= T(5) && f < T(6) ? 2.2 : 1, sweat: (shot === 4 && f >= T(5)) || shot === 6 });
      if (shot === 4 && f < T(5)) E.card({ id: "clock", key: "clk" + f, res: 0.4, x: -5.5, y: 3.3, z: -6.6, s: 0.9, blob: 0, yaw: 0, idle: false, draw: (p, g) => clock(g, (t - T(4) / 30) * 2.2) });
      if (shot === 4) for (const [i, u] of ups.entries()) if (f >= u && f < u + 8) E.card({ id: "up" + i, key: "up" + i + (f - u), res: 0.5, x: STALL[i + 1] - 0.3, y: 4.6, z: WZ + 0.8, s: 0.8, blob: 0, draw: (p) => fxBurst(p, (f - u) / 8, "#fff3b0") });
      clouds();
    } else if (shot <= 8) {
      // ---- explanation (night-blue): groceries up the stairs, then flat vs uphill
      light = "night"; focus = E.V(SX, 0, SZ);
      const st = this.st, x0 = SX - 1.8;
      if (shot === 7) {
        const k = E.prog(f, T(9), T(10)), lx = E.lerp(-0.6, 2.6, k), ph = (t * 1.4) % 1;
        const y = Math.max(0, st.top(lx)) , x = x0 + lx;
        cam = { pos: E.V(x + 0.6, y + 1.7, SZ + 4.4), look: E.V(x + 0.2, y + 1.15, SZ - 0.6), fov: 40, roll: 0 };
        front("shopper", SHOPPER, { x, y, z: SZ - 0.6, mode: "stroll", phase: ph, expr: k > 0.5 ? "pained" : "nervous", facing: 1, seed: 11,
          extra: { key: "bags" + Math.round(ph * 24) + (k > 0.5), draw: (g, hands) => { hands.forEach((h, i) => groceryBag(g, h[0], h[1], 0.75, i)); if (k > 0.5) sweat(g, 300, 250, t); } } });
      } else {
        const k = E.prog(f, T(10), T(11)), ph = (t * 1.4) % 1, lx = E.lerp(1.8, 2.8, k), y = st.top(lx);
        const cx = SX - 0.45 + k * 1.0; cam = { pos: E.V(cx + 0.1, 2.1, SZ + E.lerp(7.2, 6.6, k)), look: E.V(cx, 1.6, SZ), fov: 42, roll: 0 };
        front("shopper", SHOPPER, { x: x0 + lx, y, z: SZ - 0.6, mode: "stroll", phase: ph, expr: "pained", facing: 1, seed: 11,
          extra: { key: "sw" + Math.round(t * 10), draw: (g) => sweat(g, 300, 250, t) } });
        front("stroll", STROLLER, { x: SX - 1.0 + k * 1.0, z: SZ + 1.1, mode: "stroll", phase: (ph + 0.5) % 1, expr: "whistle", facing: 1, seed: 12 });
        const fl = E.back(E.prog(f, T(10) + 6, T(10) + 18), 2);
        if (fl > 0.01) E.card({ id: "flame", key: "fl" + (f % 20) + Math.round(fl * 10), res: 0.5, x: x0 + lx + 0.55, y: y + 1.75, z: SZ - 0.4, s: 0.55 * fl, blob: 0,
          draw: (p, g) => flame(g, 300, 900, 2.6, t) });
      }
    } else if (shot === 9 || shot === 11) {
      // ---- modern gym: incline up / we pay for it
      light = "gym"; focus = E.V(GX, 0, GZ);
      const inc = shot === 11 ? 12 : 12 * E.back(E.prog(f, T(11) + 22, T(11) + 38), 1.6);
      this.tm.setIncline(inc);
      const ph = (t * 1.5) % 1;
      if (shot === 9) {
        cam = E.camFromKeys([{ f: T(11), pos: [GX + 0.3, 1.6, GZ + 4.6], look: [GX, 1.3, GZ + 0.5], fov: 40 },
          { f: T(12), from: T(11) + 20, pos: [GX + 1.2, 1.4, GZ + 4.4], look: [GX + 0.1, 1.35, GZ + 0.5], fov: 40 }], f, { kicks: [{ f: T(11) + 32, amp: 0.03 }] });
        side("bro", BRO, { x: GX - 0.15, y: this.tm.footY(-0.15), z: GZ + 0.5, phase: ph, expr: inc > 6 ? "stern" : "smile", seed: 8 });
      } else {
        const open = Math.max(0, t - (T(13) + 22) / 30);
        cam = E.camFromKeys([{ f: T(13), pos: [GX + 0.2, 1.7, GZ + 4.4], look: [GX, 1.35, GZ + 0.5], fov: 40, roll: 0 },
          { f: END - 1, pos: [GX + 0.2, 1.65, GZ + 3.3], look: [GX + 0.05, 1.45, GZ + 0.5], fov: 37, roll: -4, ease: "out" }], f, { kicks: [{ f: T(13) + 22, amp: 0.04 }] });
        side("bro", BRO, { x: GX - 0.15, y: this.tm.footY(-0.15), z: GZ + 0.5, phase: ph, expr: open > 0 ? "laugh" : "grin", seed: 8 });
        E.card({ id: "wallet", key: "w" + Math.round(open * 30), res: 0.6, x: GX + 0.45, y: 0.6, z: GZ + 1.25, s: 0.75, blob: 0, draw: (p, g) => wallet(g, open) });
      }
    } else {
      // ---- the twist: "Prisoners hated it." hard cut + push-in with roll
      light = "golden"; focus = E.V(0, 0, WZ);
      wheelSpin(1);
      cam = E.camFromKeys([{ f: T(12), pos: [1.4, 3.5, 3.8], look: [0.6, 3.6, WZ], fov: 40, roll: 0 },
        { f: T(13) - 1, pos: [1.1, 3.6, 2.2], look: [0.7, 3.7, WZ], fov: 36, roll: 4.5, ease: "in" }], f, { kicks: [{ f: T(12), amp: 0.05 }] });
      climbers((i) => (i % 2 ? "stern" : "pained"), { sweat: true });
    }

    for (const c of [T(1), T(9), T(11)]) if (f >= c && f < c + 6) E.post.flash.value = 1 - (f - c) / 6;
    E.applyLight(light, focus, lightB, lightT);
    cam.kx = cam.kx ?? 0; if (kicks.length) { const kk = kicks.reduce((a, k) => { const d = f - k.f; return d >= 0 && d < 8 ? a + k.amp * (1 - d / 8) * (d % 2 ? -1 : 1) : a; }, 0); cam.kx += kk; cam.ky = (cam.ky ?? 0) + kk * 0.6; }
    E.setCam(cam);
  },
};
