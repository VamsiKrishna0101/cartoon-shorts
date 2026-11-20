// "Four Times. Total." — the burpee was a 1939 four-rep fitness test (Royal H. Burpee); we turned it into a punishment.
// Timed to phrases.json (phrase start/end seconds from the voiceover).
import * as THREE from "three";
import { bodyFront, fxCloud, fxBurst } from "../../toon.js";
import { sweat, flame, burpeeGuy, burpeeCycle, board2D, clipboard2D, stopwatch2D, heart2D, hotSauce2D, sauceDrops, plate2D, smoke, impact, speedLines } from "../../lib/props.js";
import * as S from "../../lib/sets.js";

// people
const SCI = { jacket: "#f4f4f0", pants: "#4a4a52", boots: "#2a1d18", hat: "hair", hair: "#3a2a1e", skin: "#f1c9a5", buttons: "#9aa1aa", moustache: "#3a2a1e" };
const VOL = { jacket: "#e8e2d0", pants: "#3a3a5a", boots: "#f4f1ea", hat: "hair", hair: "#8a5a30", skin: "#ffe2c2" };
const SARGE = { jacket: "#6b7a4a", pants: "#5a6040", boots: "#3a2a1a", hat: "cap", cap: "#55663a", skin: "#c99067", buttons: "#d9b44a", build: "stout" };
const SOLDIER = (i) => ({ jacket: "#6b7a4a", pants: "#5a6040", boots: "#3a2a1a", hat: "helmet", cap: "#55663a", skin: ["#f1c9a5", "#c99067", "#ffe2c2"][i % 3] });
const COACH = { jacket: "#ff9f1c", pants: "#2a2d33", boots: "#f4f1ea", hat: "cap", cap: "#2a2d33", skin: "#f1c9a5", buttons: "#ff9f1c", build: "stout" };
const ATH = { jacket: "#2f6fd6", pants: "#2a2d33", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", skin: "#c99067" };
const GIRL = { jacket: "#ff6f91", pants: "#2a2d33", boots: "#f4f1ea", hat: "hair", hair: "#2a1d18", skin: "#f1c9a5" };
const OLD = { jacket: "#3bceac", pants: "#5a5f6e", boots: "#f4f1ea", hat: "hair", hair: "#d9d9d9", skin: "#ecd0b6" };
const DAD = { jacket: "#ffd23f", pants: "#3b5b9a", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: "#ffe2c2", buttons: "#d9a92a" };
const FOLK = (i) => ({ jacket: ["#5a4a7a", "#8a3a3a", "#3a5a6a", "#7a6a4a"][i % 4], pants: "#3a3a42", boots: "#2a1d18", hat: i % 2 ? "bonnet" : "hair",
  hair: ["#2a1d18", "#c9a46a", "#5a3b2a", "#1d1a18"][i % 4], skin: ["#ffe2c2", "#c99067", "#f1c9a5", "#ecd0b6"][i % 4], buttons: "#d9b44a" });

// sets (kept far apart so they never meet)
const AX = 0, AZ = 0;      // army camp (centre, the hills ring it)
const CX = -90, CZ = 0;    // New York street, 1939
const LX = 0, LZ = 90;     // Burpee's lab
const GX = 90, GZ = 0;     // modern gym
const KX = 60, KZ = 60;    // kitchen
const BS = 1.25;           // burpee card scale
let P = null, F = null, END = 0;
const blinkAt = (f, seed) => { const per = 45 + ((seed * 37) % 40); return ((f + seed * 13) % per) < 4 ? 1 : 0; };

export default {
  frames: 1000,
  async build(E) {
    P = await (await fetch("./stories/burpee/phrases.json")).json();
    F = P.phrases.map((p) => Math.round(p.start * E.FPS));
    END = Math.round((P.duration + 0.8) * E.FPS);
    this.frames = END;
    const root = new THREE.Group(); E.scene.add(root);
    S.ground(E, root, E.PAINT.grass(), 1400, 0.22);
    S.backdrop(E, root, { hill: "#8fb35a" });
    this.clouds = S.clouds(E, 8);
    S.armyCamp(E, root, { x: AX, z: AZ });
    S.cityStreet(E, root, { x: CX, z: CZ });
    S.room(E, root, { x: LX, z: LZ, w: 10, d: 8, wall: "#e4ecef", trim: "#5a6a7a", art: "#9fb3d0" });
    S.labDesk(E, root, LX - 2.6, LZ - 2.6);
    const gy = new THREE.Group(); gy.position.set(GX, 0, GZ); root.add(gy);
    S.gym(E, gy, { accent: "#ff9f1c" });
    S.room(E, root, { x: KX, z: KZ, wall: "#f3dcc0", trim: "#8a5a3a", glass: "#1d2a5a", glow: "#1d2a5a", art: "#e2453c" });
    this.tbl = S.table(E, root, KX, KZ - 0.9);
  },

  frame(E, f) {
    const t = f / E.FPS, T = (i) => F[i];
    const shot = f < T(2) ? 1 : f < T(3) ? 2 : f < T(4) ? 3 : f < T(8) ? 4 : f < T(9) ? 5 : f < T(10) ? 6 : f < T(11) ? 7 : f < T(12) ? 8 : f < T(13) ? 9
      : f < T(16) ? 10 : f < T(17) ? 11 : f < T(18) ? 12 : 13;
    const clouds = () => this.clouds.forEach((c, i) => E.card({ id: "cloud" + i, key: "c" + i, res: 0.35, draw: (p) => fxCloud(p, c.seed), x: c.x, y: c.y, z: c.z, s: c.s, blob: 0, bright: 1.05 }));
    const front = (id, look, o) => {
      const bl = blinkAt(f, o.seed ?? 3) || (o.sleep ? 1 : 0), ex = o.extra ?? null;
      const key = [id, o.expr, o.pose, o.mode, Math.round((o.phase ?? 0) * 24), bl, o.facing ?? 0, o.headTilt ?? 0, Math.round((o.liftY ?? 0) * 40), ex ? ex.key : ""].join("|");
      return E.card({ id, key, res: o.res ?? 1, x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0, s: o.s ?? 1, flip: o.flip, lean: o.lean, blob: o.blob,
        draw: (p, g) => { bodyFront(p, look, { expr: o.expr ?? "neutral", pose: o.pose ?? null, mode: o.mode ?? "stand", phase: o.phase ?? 0, blink: bl, seed: o.seed ?? 3,
          facing: o.facing ?? 0, headTilt: o.headTilt ?? 0, liftY: o.liftY ?? 0 });
          if (ex) ex.draw(g, p.hands || []); } });
    };
    // side-view burpee athlete card; st = {a, b, u}
    const bguy = (id, look, st, o = {}) => {
      const bl = blinkAt(f, o.seed ?? 5);
      const key = [id, st.a, st.b, Math.round(st.u * 40), o.expr, bl, o.sweat ? Math.round(t * 12) : 0, o.expr === "dazed" ? Math.round(t * 10) : 0, o.extraKey ?? ""].join("|");
      return E.card({ id, key, res: o.res ?? 0.9, x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0, s: o.s ?? BS, flip: o.flip, blob: o.blob ?? 0.5,
        draw: (p, g) => { const r = burpeeGuy(g, look, { ...st, expr: o.expr, blink: bl, t, sweat: o.sweat }); if (o.extra) o.extra(g, r); } });
    };
    const fx = (id, x, y, z, s, k, col = "#fff3b0") => E.card({ id, key: id + Math.round(k * 12), res: 0.5, x, y, z, s, blob: 0, draw: (p) => fxBurst(p, k, col) });
    const board = (lines, o = {}) => E.card({ id: "board", key: "bd" + lines.join() + (o.strike ? 1 : 0) + Math.round((o.pop ?? 1) * 10), res: 0.6, x: GX - 1.2, y: 1.0, z: GZ - 5.75,
      s: 1.5 * Math.max(0.01, o.pop ?? 1), yaw: 0, blob: 0, idle: false, draw: (p, g) => board2D(g, lines, o) });
    const hold = (s) => { const k = Math.max(0, s); return k; };
    let cam, light = "day", focus = E.V(0, 0, 0);
    const flashAt = [T(2), T(3), T(9), T(10), T(13), T(16), T(17), T(18)];

    if (shot === 1) {
      // ---- hook: gym guy grinding burpees under a "x 100" board; "Total." -> he freezes, shocked
      light = "gym"; focus = E.V(GX, 0, GZ);
      board(["BURPEES", "x 100"]);
      const frozen = f >= T(1);
      const st = frozen ? { a: "stand", b: "stand", u: 0 } : burpeeCycle(t / 1.15, { push: true, jump: true });
      bguy("ath", ATH, st, { x: GX + 0.05, z: GZ + 0.2, expr: frozen ? "shock" : "pained", sweat: true, seed: 8 });
      front("girl", { ...GIRL, buttons: "#ff6f91" }, { x: GX + 2.3, z: GZ - 3.0, expr: frozen ? "shock" : "smile", seed: 21 });
      cam = frozen
        ? E.camFromKeys([{ f: T(1), pos: [GX + 0.2, 1.45, GZ + 4.2], look: [GX + 0.1, 1.15, GZ], fov: 40 },
          { f: T(1) + 6, pos: [GX + 0.25, 1.75, GZ + 2.9], look: [GX + 0.15, 1.55, GZ], fov: 36, ease: "out" }], f, { kicks: [{ f: T(1), amp: 0.08 }] })
        : E.camFromKeys([{ f: 0, pos: [GX - 0.4, 1.3, GZ + 5.4], look: [GX - 0.2, 1.05, GZ], fov: 42, roll: -2 },
          { f: T(1), pos: [GX - 0.1, 1.35, GZ + 4.6], look: [GX - 0.05, 1.05, GZ], fov: 41, roll: 1, ease: "lin" }], f);
      if (frozen && f < T(1) + 12) fx("pop", GX + 0.3, 1.9, GZ + 0.4, 1.4, (f - T(1)) / 12);
    } else if (shot === 2) {
      // ---- New York, 1939: crane down over a brick street, people strolling
      light = "golden"; focus = E.V(CX, 0, CZ);
      cam = E.camFromKeys([{ f: T(2), pos: [CX + 1.5, 14, CZ + 9], look: [CX, 10, CZ - 10], fov: 46 },
        { f: T(3), pos: [CX + 0.6, 2.0, CZ + 7.5], look: [CX, 2.2, CZ - 6], fov: 44, ease: "out" }], f);
      for (let i = 0; i < 4; i++) {
        const dir = i % 2 ? -1 : 1, x = CX + dir * (-3 + ((t * 1.1 + i * 1.7) % 6)) + (i - 1.5) * 0.4;
        front("folk" + i, FOLK(i), { x, z: CZ - 3.2 - (i % 2) * 1.6, mode: "stroll", phase: (t * 1.4 + i * 0.3) % 1, expr: "neutral", seed: 30 + i, facing: dir, flip: dir < 0 });
      }
      clouds();
    } else if (shot === 3 || shot === 4 || shot === 5 || shot === 12) {
      // ---- Burpee's lab: the scientist with clipboard + stopwatch, the volunteer does ONE burpee, heart check, done
      light = "golden"; focus = E.V(LX, 0, LZ);
      const vx = LX + 0.2, vz = LZ + 0.1;
      let st = { a: "stand", b: "stand", u: 0 }, vexpr = "smile", sciExpr = "grin", tick = 0, heart = 0;
      if (shot === 4) {
        const seg = [[T(4), "stand", "squat"], [T(5), "squat", "hands"], [T(6), "hands", "plank"], [T(7), "plank", "stand"]];
        for (const [s0, a, b] of seg) if (f >= s0) st = { a, b, u: E.smooth(E.prog(f, s0, s0 + 9)) };
        if (f >= T(7)) { const k = E.prog(f, T(7), T(7) + 14); st = k < 0.5 ? { a: "plank", b: "squat", u: E.smooth(k * 2) } : { a: "squat", b: "stand", u: E.smooth(k * 2 - 1) }; }
        vexpr = f >= T(6) && f < T(7) + 8 ? "stern" : "smile"; sciExpr = "smile_closed";
      } else if (shot === 5) {
        const rep = E.prog(f, T(8), T(8) + 18); // "four reps" in a blink
        st = rep < 1 ? burpeeCycle(rep * 4) : { a: "stand", b: "stand", u: 0 };
        heart = f > T(8) + 22 ? E.back(E.prog(f, T(8) + 22, T(8) + 32), 2) : 0;
        tick = E.prog(f, T(8) + 52, T(8) + 60);
        vexpr = rep < 1 ? "pained" : "smile"; sciExpr = tick > 0 ? "laugh" : "neutral";
      } else if (shot === 12) { sciExpr = "grin"; tick = 1; }
      const sw = shot === 3 || shot === 4 || shot === 12 ? 0.3 : 0;
      bguy("vol", VOL, st, { x: vx, z: vz, expr: vexpr, seed: 12, extraKey: Math.round(heart * 10) + "|" + Math.round(t * 8 * (heart > 0)), sweat: shot === 5 && st.a !== "stand",
        extra: (g, r) => { if (heart > 0) heart2D(g, r.chest[0] - 10, r.chest[1] - 40, 0.8 * heart, Math.max(0, Math.sin(t * 14))); } });
      if (shot === 5 && f < T(8) + 18) E.card({ id: "speed", key: "sp" + (f % 4), res: 0.5, x: vx, y: 0, z: vz + 0.2, s: 1.3, blob: 0, draw: (p, g) => speedLines(g, t) });
      front("sci", SCI, { x: LX - 0.5, z: LZ - 1.4, expr: sciExpr, pose: "lift", liftY: -0.3, seed: 7, facing: 1,
        extra: { key: "cb" + Math.round(tick * 10) + Math.round(t * sw * 10), draw: (g, h) => { if (h[1]) clipboard2D(g, h[1][0], h[1][1] + 40, 0.9, tick); if (h[0]) stopwatch2D(g, h[0][0], h[0][1] + 30, 0.7, t * sw); } } });
      if (shot === 3) {
        cam = E.camFromKeys([{ f: T(3), pos: [LX - 0.5, 1.6, LZ + 5.2], look: [LX - 0.2, 1.2, LZ - 1], fov: 42 },
          { f: T(4), pos: [LX - 0.25, 1.45, LZ + 4.4], look: [LX - 0.1, 1.15, LZ - 1], fov: 40, ease: "lin" }], f);
      } else if (shot === 4) {
        cam = E.camFromKeys([{ f: T(4), pos: [LX + 0.15, 1.25, LZ + 4.8], look: [LX + 0.15, 0.9, LZ - 0.5], fov: 41 },
          { f: T(8), pos: [LX + 0.15, 1.15, LZ + 4.4], look: [LX + 0.15, 0.85, LZ - 0.5], fov: 41, ease: "lin" }], f,
          { kicks: [T(4), T(5), T(6), T(7)].map((k) => ({ f: k + 6, amp: 0.03 })) });
      } else if (shot === 5) {
        cam = E.camFromKeys([{ f: T(8), pos: [LX + 0.2, 1.3, LZ + 4.4], look: [LX + 0.1, 1.0, LZ - 0.5], fov: 40 },
          { f: T(8) + 30, from: T(8) + 20, pos: [LX + 0.0, 1.5, LZ + 3.7], look: [LX - 0.05, 1.25, LZ - 0.6], fov: 39, ease: "out" },
          { f: T(9), from: T(8) + 44, pos: [LX - 0.1, 1.45, LZ + 4.6], look: [LX - 0.1, 1.15, LZ - 0.6], fov: 41 }], f,
          { kicks: [{ f: T(8) + 54, amp: 0.04 }] });
        if (f >= T(8) + 52 && f < T(8) + 64) fx("pop", LX - 0.5, 1.6, LZ - 0.6, 1.4, (f - T(8) - 52) / 12, "#bff2c8");
      } else {
        // twist A: hard cut + push-in with roll. A neat little test, four reps, everybody happy.
        cam = E.camFromKeys([{ f: T(17), pos: [LX - 0.2, 1.5, LZ + 4.8], look: [LX - 0.2, 1.2, LZ - 0.8], fov: 42, roll: 0 },
          { f: T(18) - 1, pos: [LX - 0.4, 1.55, LZ + 3.0], look: [LX - 0.55, 1.35, LZ - 0.8], fov: 38, roll: 4.5, ease: "in" }], f);
      }
    } else if (shot === 6) {
      // ---- the army grabbed it: the sergeant holds the clipboard now, a squad does burpees in sync
      light = "day"; focus = E.V(AX, 0, AZ);
      const sync = burpeeCycle((f - T(9)) / 30);
      for (let i = 0; i < 3; i++)
        bguy("sol" + i, SOLDIER(i), sync, { x: AX - 0.5 + i * 0.6, z: AZ - 0.2 - i * 1.6, expr: sync.a === "plank" || sync.b === "plank" ? "pained" : "stern", seed: 40 + i });
      const grab = E.back(E.prog(f, T(9) + 2, T(9) + 12), 1.8);
      front("sarge", SARGE, { x: AX + 1.0, z: AZ - 2.5, expr: "stern", pose: "lift", liftY: -0.3, seed: 9, facing: -1, flip: true,
        extra: { key: "cb" + Math.round(grab * 10), draw: (g, h) => { if (h[1]) clipboard2D(g, h[1][0], h[1][1] + 40, 0.9 * Math.max(0.01, grab), 1); } } });
      cam = E.camFromKeys([{ f: T(9), pos: [AX + 0.3, 1.7, AZ + 6.4], look: [AX + 0.2, 1.0, AZ - 1.2], fov: 44 },
        { f: T(10), pos: [AX + 0.2, 1.5, AZ + 5.6], look: [AX + 0.15, 0.95, AZ - 1.2], fov: 43, ease: "lin" }], f);
      clouds();
    } else if (shot >= 7 && shot <= 9 || shot === 11) {
      // ---- modern gym: the coach adds a push-up, a jump, fifty more. Later: short clean sets.
      light = "gym"; focus = E.V(GX, 0, GZ);
      let st, ex = "stern", y = 0, sw = false, coachPose = "point", coachExpr = "stern", lines = ["BURPEES", "x 4"], pop = 1, strike = false;
      if (shot === 7) { st = burpeeCycle(0.3 + (f - T(10)) / 36, { push: true }); if (st.a === "push" || st.b === "push") ex = "pained"; lines = ["BURPEES", "+ PUSH-UP"]; }
      else if (shot === 8) {
        const k = E.prog(f, T(11), T(11) + 12), air = E.prog(f, T(11) + 12, T(12) - 4);
        st = k < 1 ? { a: "squat", b: "jump", u: E.smooth(k) } : air < 1 ? { a: "jump", b: "jump", u: 0 } : { a: "jump", b: "stand", u: E.smooth(E.prog(f, T(12) - 4, T(12))) };
        y = 1.1 * Math.sin(Math.PI * Math.min(1, E.prog(f, T(11) + 6, T(12) - 2)));
        ex = y > 0.6 ? "shock" : "grin"; coachPose = "cheer"; coachExpr = "grin"; lines = ["BURPEES", "+ JUMP"];
      } else if (shot === 9) {
        const k = E.prog(f, T(12) + 8, T(12) + 18);
        st = k < 1 ? { a: "stand", b: "flat", u: E.easeIn(k) } : { a: "flat", b: "flat", u: 0 };
        ex = k < 0.5 ? "shock" : "dazed"; sw = true; coachPose = "point"; coachExpr = "laugh"; lines = ["BURPEES", "x 50"];
        pop = E.back(E.prog(f, T(12), T(12) + 8), 2);
      } else { st = burpeeCycle((f - T(16)) / 34); ex = "smile"; coachPose = "cheer"; coachExpr = "grin"; lines = ["SHORT SETS", "x 5"]; }
      board(lines, { pop, strike, col: shot === 11 ? "#2a9a50" : "#e2453c" });
      bguy("ath", ATH, st, { x: GX - 0.15, y, z: GZ + 0.2, expr: ex, sweat: sw || shot === 7, seed: 8, blob: y > 0.2 ? 0.25 : 0.5 });
      front("coach", COACH, { x: GX - 1.1, z: GZ - 1.9, expr: coachExpr, pose: coachPose, seed: 15, facing: 1 });
      const s0 = shot === 7 ? T(10) : shot === 8 ? T(11) : shot === 9 ? T(12) : T(16), s1 = shot === 7 ? T(11) : shot === 8 ? T(12) : shot === 9 ? T(13) : T(17);
      if (shot === 8) cam = E.camFromKeys([{ f: s0, pos: [GX + 0.1, 1.2, GZ + 4.6], look: [GX + 0.05, 1.0, GZ], fov: 42 },
        { f: s0 + 16, pos: [GX + 0.1, 1.6, GZ + 4.8], look: [GX + 0.1, 1.9, GZ], fov: 44, ease: "out" },
        { f: s1, from: s1 - 8, pos: [GX + 0.1, 1.3, GZ + 4.6], look: [GX + 0.05, 1.1, GZ], fov: 42 }], f);
      else if (shot === 9) cam = E.camFromKeys([{ f: s0, pos: [GX - 0.6, 1.5, GZ + 4.4], look: [GX - 0.9, 1.4, GZ - 5], fov: 40 },
        { f: s0 + 10, pos: [GX - 0.1, 1.2, GZ + 4.4], look: [GX + 0.05, 0.75, GZ], fov: 40, ease: "out" },
        { f: s1, pos: [GX + 0.0, 1.05, GZ + 3.9], look: [GX + 0.1, 0.6, GZ], fov: 40, ease: "lin" }], f, { kicks: [{ f: T(12) + 18, amp: 0.1 }] });
      else cam = E.camFromKeys([{ f: s0, pos: [GX - 0.1, 1.3, GZ + 5.0], look: [GX - 0.1, 1.0, GZ], fov: 44, roll: shot === 7 ? -1.5 : 0 },
        { f: s1, pos: [GX - 0.05, 1.25, GZ + 4.6], look: [GX - 0.05, 0.95, GZ], fov: 43, roll: shot === 7 ? 1 : 0, ease: "lin" }], f);
      if (shot === 9 && f >= T(12) + 18 && f < T(12) + 36) E.card({ id: "imp", key: "im" + (f - T(12)), res: 0.5, x: GX + 0.2, y: 0, z: GZ + 0.4, s: 1.3, blob: 0, draw: (p, g) => impact(g, (f - T(12) - 18) / 18) });
    } else if (shot === 10) {
      // ---- hot sauce: a little wakes you up, a whole bottle ruins dinner
      light = "golden"; focus = E.V(KX, 0, KZ);
      const top = this.tbl.topY, bx = KX + 0.45, bz = KZ - 0.55;
      const awake = f >= T(14) + 16, ruin = f >= T(15);
      const appear = E.back(E.prog(f, T(13) + 4, T(13) + 16), 1.8);
      const tilt = ruin ? E.smooth(E.prog(f, T(15), T(15) + 8)) * 2.4 : f >= T(14) ? Math.sin(Math.PI * E.prog(f, T(14), T(14) + 18)) * 1.6 : 0;
      const red = ruin ? E.prog(f, T(15) + 6, T(15) + 26) : 0;
      E.card({ id: "plate", key: "pl" + Math.round(red * 10), res: 0.5, x: KX, y: top - 0.05, z: KZ - 0.55, s: 0.45, blob: 0, draw: (p, g) => plate2D(g, 300, 900, 1.3, red) });
      E.card({ id: "sauce", key: "hs" + Math.round(tilt * 20) + "|" + Math.round(appear * 10) + "|" + (ruin ? Math.round(t * 15) : f >= T(14) ? Math.round(E.prog(f, T(14) + 6, T(14) + 18) * 12) : 0), res: 0.5,
        x: bx, y: top + 0.05, z: bz + 0.05, s: 0.42 * Math.max(0.01, appear), blob: 0,
        draw: (p, g) => { hotSauce2D(g, 300, 520, 1.4, -tilt);
          if (ruin) sauceDrops(g, 150, 650, (t % 0.3), 4, 30);
          else if (f >= T(14) + 6 && f < T(14) + 18) sauceDrops(g, 170, 620, (f - T(14) - 6) / 30, 1); } });
      const dExpr = ruin ? (f < T(15) + 14 ? "shock" : "pained") : awake ? (f < T(14) + 26 ? "shock" : "grin") : "neutral";
      const heat = ruin ? E.back(E.prog(f, T(15) + 12, T(15) + 24), 1.6) : awake ? 0.35 * E.back(E.prog(f, T(14) + 18, T(14) + 28), 2) : 0;
      front("dad", DAD, { x: KX - 0.05, z: KZ - 1.55, expr: dExpr, sleep: !awake && !ruin, pose: ruin ? "up" : awake ? "flex" : null, seed: 11,
        y: ruin ? 0.06 * Math.abs(Math.sin(t * 22)) : 0,
        extra: { key: "ht" + Math.round(heat * 10) + (heat > 0 ? Math.round(t * 15) : 0), draw: (g) => {
          if (heat > 0) { flame(g, 300, 240, 0.7 * heat + 0.15 * (ruin ? 1 : 0), t); if (ruin) { sweat(g, 300, 300, t); smoke(g, 300, 180, t); } } } } });
      if (f >= T(14) + 16 && f < T(14) + 28) fx("pop", KX - 0.05, 1.9, KZ - 1.4, 1.2, (f - T(14) - 16) / 12);
      if (f < T(14)) cam = E.camFromKeys([{ f: T(13), pos: [KX + 0.1, 1.55, KZ + 3.6], look: [KX + 0.05, 1.2, KZ - 1.2], fov: 40 },
        { f: T(14), pos: [KX + 0.25, 1.45, KZ + 2.9], look: [KX + 0.15, 1.1, KZ - 1.0], fov: 39, ease: "lin" }], f);
      else if (f < T(15)) cam = E.camFromKeys([{ f: T(14), pos: [KX + 0.2, 1.5, KZ + 2.8], look: [KX + 0.1, 1.2, KZ - 1.2], fov: 39 },
        { f: T(15), pos: [KX + 0.1, 1.6, KZ + 2.3], look: [KX + 0.0, 1.45, KZ - 1.2], fov: 38, ease: "lin" }], f, { kicks: [{ f: T(14) + 16, amp: 0.05 }] });
      else cam = E.camFromKeys([{ f: T(15), pos: [KX + 0.1, 1.5, KZ + 3.4], look: [KX, 1.3, KZ - 1.2], fov: 42 },
        { f: T(16), pos: [KX + 0.05, 1.55, KZ + 2.7], look: [KX, 1.4, KZ - 1.2], fov: 40, roll: -2, ease: "lin" }], f, { kicks: [{ f: T(15) + 12, amp: 0.1 }, { f: T(15) + 20, amp: 0.06 }] });
    } else {
      // ---- we made it a punishment: the coach's whistle, a whole class grinding burpees; they all collapse on the last word
      light = "gym"; focus = E.V(GX, 0, GZ);
      board(["BURPEES", "x 100"]);
      const crash = Math.round((P.phrases[18].end - 0.45) * E.FPS), down = f >= crash;
      const cast = [[ATH, GX - 0.15, GZ + 0.3, 8], [GIRL, GX - 0.85, GZ - 1.4, 21], [OLD, GX + 0.45, GZ - 2.6, 22]];
      cast.forEach(([look, x, z, seed], i) => {
        const st = down ? { a: "plank", b: "flat", u: E.smooth(E.prog(f, crash, crash + 5)) } : burpeeCycle((f - T(18)) / 26 + i * 0.13, { push: true, jump: true });
        bguy("cls" + i, look, st, { x, z, expr: down ? "dazed" : "pained", sweat: true, seed });
      });
      front("coach", COACH, { x: GX - 1.05, z: GZ - 0.4, expr: down ? "laugh" : "grin", pose: down ? "cheer" : "point", seed: 15, facing: 1 });
      cam = E.camFromKeys([{ f: T(18), pos: [GX - 0.1, 1.5, GZ + 5.4], look: [GX, 1.0, GZ - 0.6], fov: 42, roll: 0 },
        { f: crash, pos: [GX + 0.0, 1.4, GZ + 5.1], look: [GX - 0.05, 0.9, GZ - 0.6], fov: 42, roll: -1, ease: "in" },
        { f: END - 1, pos: [GX + 0.0, 1.3, GZ + 4.8], look: [GX - 0.05, 0.75, GZ - 0.6], fov: 42, roll: 2.5, ease: "out" }], f,
        { kicks: [{ f: crash + 3, amp: 0.16 }, { f: crash + 10, amp: 0.06 }] });
      if (down && f < crash + 24) E.card({ id: "imp", key: "im" + (f - crash), res: 0.5, x: GX + 0.3, y: 0, z: GZ + 0.5, s: 1.4, blob: 0, draw: (p, g) => impact(g, (f - crash - 3) / 20) });
    }

    for (const c of flashAt) if (f >= c && f < c + 6) E.post.flash.value = 1 - (f - c) / 6;
    E.applyLight(light, focus);
    E.setCam(cam);
  },
};
