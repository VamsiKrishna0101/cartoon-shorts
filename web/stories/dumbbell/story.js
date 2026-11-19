// "The Quiet Bell" — dumbbells are named after Joseph Addison's 1711 silent bell-ringing machine. Timed to phrases.json.
import * as THREE from "three";
import { bodyFront, fxCloud, fxBurst } from "../../toon.js";
import { dumbbell2D, sweat, flame, bell2D, soundRings, baby, zzz, impact } from "../../lib/props.js";
import * as S from "../../lib/sets.js";

const ADDISON = { jacket: "#7a2e3a", pants: "#efe3c4", boots: "#2a1d18", hat: "hair", hair: "#eeeae0", skin: "#f1c9a5", buttons: "#d9b44a" };
const RINGER = { jacket: "#6b4f3a", pants: "#4a4a52", boots: "#2a1d18", hat: "cap", cap: "#3e3a36", skin: "#ecd0b6", buttons: "#3e3a36", build: "stout" };
const FOLK = (i) => ({ jacket: ["#3d6b8a", "#8a7a3a", "#5a3a6b"][i % 3], pants: "#4a4640", boots: "#2a1d18", hat: i % 2 ? "bonnet" : "hair",
  hair: ["#5a3b2a", "#c9a46a", "#2a1d18"][i % 3], skin: ["#ffe2c2", "#c99067", "#f1c9a5"][i % 3], buttons: "#d9b44a" });
const BRO = { jacket: "#2f6fd6", pants: "#2a2d33", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", skin: "#c99067", buttons: "#2f6fd6" };
const GIRL = { jacket: "#ff6f91", pants: "#2a2d33", boots: "#f4f1ea", hat: "hair", hair: "#2a1d18", skin: "#f1c9a5", buttons: "#ff6f91" };
const OLD = { jacket: "#3bceac", pants: "#5a5f6e", boots: "#f4f1ea", hat: "hair", hair: "#d9d9d9", skin: "#ecd0b6", buttons: "#2a9a80", moustache: "#d9d9d9" };
const DAD = { jacket: "#ffd23f", pants: "#3b5b9a", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: "#ffe2c2", buttons: "#d9a92a" };

const TX = 0, TZ = -7, RX = 40, NX = -40, GX = 80;
let P = null, F = null, END = 0;
const blinkAt = (f, seed) => { const per = 45 + ((seed * 37) % 40); return ((f + seed * 13) % per) < 4 ? 1 : 0; };

export default {
  frames: 900,
  async build(E) {
    P = await (await fetch("./stories/dumbbell/phrases.json")).json();
    F = P.phrases.map((p) => Math.round(p.start * E.FPS));
    END = Math.round((P.duration + 0.8) * E.FPS);
    this.frames = END;
    const root = new THREE.Group(); E.scene.add(root);
    S.ground(E, root, E.PAINT.stone(), 1400, 0.3, "#c9c0b0");
    // London street 1711
    this.tower = S.bellTower(E, root, TX, TZ);
    S.house(E, root, -5.2, -7.5, 0, 4.5, 4, 3.6, { roof: "#7a4a3a", wall: "#e9dcc0" });
    S.house(E, root, 5.4, -7.2, 0, 4.8, 4, 3.2, { roof: "#5a6378", wall: "#f0e3cc" });
    S.house(E, root, -10, -6, 0.3, 4.2, 4, 3.0, { roof: "#c4583a" });
    S.house(E, root, 10.5, -5.8, -0.3, 4.2, 4, 3.4, { roof: "#8a5a3a", wall: "#e3d2b0" });
    S.backdrop(E, root, { hill: "#8fb35a" });
    this.clouds = S.clouds(E, 8);
    // Addison's room
    S.room(E, root, { x: RX, z: 0, w: 10, d: 8 });
    this.rig = S.dumbBellRig(E, root, RX, -1.6);
    this.crib = S.crib(E, root, RX + 2.4, -2.6);
    // nursery (explanation, night)
    S.room(E, root, { x: NX, z: 0, wall: "#cfd8f0", trim: "#5a6a9a", glass: "#1d2a5a", glow: "#1d2a5a", art: "#ffd23f" });
    this.crib2 = S.crib(E, root, NX + 0.3, -1.2);
    // modern gym
    const gy = new THREE.Group(); gy.position.set(GX, 0, 0); root.add(gy);
    S.gym(E, gy, { accent: "#2f6fd6" });
  },

  frame(E, f) {
    const t = f / E.FPS, T = (i) => F[i];
    const shot = f < T(1) ? 1 : f < T(3) ? 2 : f < T(4) ? 3 : f < T(6) ? 4 : f < T(10) ? 5 : f < T(12) ? 6 : f < T(14) ? 7 : f < T(15) ? 8 : f < T(16) ? 9 : 10;
    const clouds = () => this.clouds.forEach((c, i) => E.card({ id: "cloud" + i, key: "c" + i, res: 0.35, draw: (p) => fxCloud(p, c.seed), x: c.x, y: c.y, z: c.z, s: c.s, blob: 0, bright: 1.05 }));
    const front = (id, look, o) => {
      const bl = blinkAt(f, o.seed ?? 3), ex = o.extra ?? null;
      const key = [id, o.expr, o.pose, o.mode, Math.round((o.phase ?? 0) * 24), bl, o.facing ?? 0, o.headTilt ?? 0, Math.round((o.liftY ?? 0) * 40), ex ? ex.key : ""].join("|");
      return E.card({ id, key, res: o.res ?? 1, x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0, s: o.s ?? 1, flip: o.flip, lean: o.lean, blob: o.blob,
        draw: (p, g) => { bodyFront(p, look, { expr: o.expr ?? "neutral", pose: o.pose ?? null, mode: o.mode ?? "stand", phase: o.phase ?? 0, blink: bl, seed: o.seed ?? 3,
          facing: o.facing ?? 0, headTilt: o.headTilt ?? 0, liftY: o.liftY ?? 0 });
          if (ex) ex.draw(g, p.hands || []); } });
    };
    const fx = (id, x, y, z, s, k, col = "#fff3b0") => E.card({ id, key: id + Math.round(k * 12), res: 0.5, x, y, z, s, blob: 0, draw: (p) => fxBurst(p, k, col) });
    // gym-goers in the background
    const gymExtras = (scared = 0) => {
      front("girl", GIRL, { x: GX + 2.4, z: -2.6, expr: scared ? "shock" : "smile", pose: scared ? "up" : "lift", liftY: scared ? 0 : 0.3 + 0.25 * Math.sin(t * 3), seed: 21,
        lean: scared ? -0.08 : 0, extra: scared ? null : { key: "db", draw: (g, h) => h.forEach((q) => dumbbell2D(g, q[0], q[1], 0.45, "#ff6f91")) } });
      front("old", OLD, { x: GX - 2.2, z: -3.2, expr: scared ? "shock" : "whistle", pose: scared ? "cheer" : null, seed: 22, y: scared ? 0.12 * Math.abs(Math.sin(t * 20)) : 0 });
    };
    let cam, light = "day", focus = E.V(0, 0, 0), flashAt = [T(1), T(4), T(12), T(14), T(15), T(16)];
    this.tower.swing(0);

    if (shot === 1) {
      // ---- hook: a bro curls his dumbbells in total silence
      light = "gym"; focus = E.V(GX, 0, 0);
      cam = E.camFromKeys([{ f: 0, pos: [GX + 0.15, 1.35, 4.6], look: [GX, 1.25, 0.2], fov: 40, roll: -2 },
        { f: T(1), from: 4, pos: [GX + 0.05, 1.45, 3.4], look: [GX, 1.3, 0.2], fov: 38, roll: 1, ease: "lin" }], f);
      const liftY = 0.5 * (0.5 - 0.5 * Math.cos(t * 3.2));
      front("bro", BRO, { x: GX, z: 0.2, expr: "smile_closed", pose: "lift", liftY, seed: 8, extra: { key: "db", draw: (g, h) => h.forEach((q) => dumbbell2D(g, q[0], q[1], 0.6)) } });
      gymExtras(0);
    } else if (shot === 2 || shot === 3) {
      // ---- London, 1711: a church bell ringer; Addison wants that workout. Then: bells are LOUD.
      light = "day"; focus = E.V(TX, 0, TZ);
      const pullK = 0.5 - 0.5 * Math.cos(t * 3.0);
      const loud = shot === 3, amp = loud ? 0.75 : 0.35;
      this.tower.swing(Math.sin(t * 3.0) * amp);
      const rz = TZ + 1.6 + 0.35;
      this.tower.setRope(1.25 + pullK * 0.5);
      front("ringer", RINGER, { x: TX + 0.05, z: TZ + 2.15, pose: pullK > 0.5 ? "up" : "lift", liftY: 0.4, expr: loud ? "pained" : "grin", seed: 15,
        extra: { key: "sw" + (loud ? Math.round(t * 10) : 0), draw: (g) => { if (loud) sweat(g, 300, 260, t); } } });
      const flex = f > T(2) + 50;
      if (!loud) {
        cam = E.camFromKeys([
          { f: T(1), pos: [TX + 2.0, 11.0, TZ + 17], look: [TX, 6.5, TZ], fov: 46 },
          { f: T(2) + 6, pos: [TX + 2.2, 4.0, TZ + 11], look: [TX + 0.8, 3.0, TZ + 1], fov: 44 },
          { f: T(2) + 40, from: T(2) + 10, pos: [TX + 0.7, 1.7, TZ + 7.0], look: [TX + 0.5, 1.25, TZ + 2.4], fov: 40, ease: "out" },
        ], f);
        front("addison", ADDISON, { x: TX + 0.95, z: TZ + 2.8, expr: flex ? "grin" : f > T(2) + 20 ? "shock" : "neutral", pose: flex ? "flex" : null, facing: flex ? 0 : -1, seed: 7 });
        clouds();
      } else {
        // bells are loud
        cam = E.camFromKeys([{ f: T(3), pos: [TX + 1.6, 6.6, TZ + 6.2], look: [TX, 7.4, TZ], fov: 42 },
          { f: T(4), pos: [TX + 1.9, 6.0, TZ + 7.2], look: [TX + 0.3, 6.4, TZ], fov: 46 }], f, { kicks: [0, 10, 20, 30].map((d) => ({ f: T(3) + d, amp: 0.12 })) });
        const k = ((t * 3.0) / (Math.PI * 2) * 2) % 1;
        E.card({ id: "rings", key: "r" + Math.round(k * 20), res: 0.5, x: TX, y: 6.2, z: TZ + 1.8, s: 2.6, blob: 0, draw: (p, g) => soundRings(g, k, 300, 500) });
        front("addison", ADDISON, { x: TX + 0.95, z: TZ + 2.8, expr: "pained", pose: "up", seed: 7, y: 0.08 * Math.abs(Math.sin(t * 18)) });
        clouds();
      }
    } else if (shot === 4 || shot === 5 || shot === 6) {
      // ---- Addison's room: the bell with no bell; pull... silence... ; it's a "dumb bell"
      light = "golden"; focus = E.V(RX, 0, -1);
      const rig = this.rig;
      const pop = shot === 4 ? E.back(E.prog(f, T(4) + 6, T(4) + 24), 1.8) : 1;
      rig.g.scale.setScalar(Math.max(0.001, pop));
      const pulls = [T(6), T(8)];
      let k = 0;
      if (shot === 5) for (const pu of pulls) { const a = E.prog(f, pu - 2, pu + 8), r = E.prog(f, pu + 22, pu + 30); k = Math.max(k, E.smooth(a) * (1 - E.smooth(r))); }
      if (shot === 4 && f > T(5)) k = 0.3 * (0.5 - 0.5 * Math.cos((f - T(5)) * 0.15));
      if (shot === 6) k = 0.5 - 0.5 * Math.cos(t * 2.2);
      rig.set(k);
      const ax = RX + 0.42, az = -1.0;
      front("addison", ADDISON, { x: ax, z: az, expr: shot === 4 ? (pop > 0.5 ? "grin" : "smile") : shot === 5 ? (k > 0.5 ? "stern" : "smile_closed") : "laugh",
        pose: k > 0.35 ? "lift" : "up", liftY: 0.2, seed: 7, flip: true });
      // the sleeping baby in the crib: never wakes
      const [cx, , cz] = [RX + 2.4, 0, -2.6];
      E.card({ id: "baby", key: "b" + Math.round(t * 8), res: 0.6, x: cx, y: this.crib.mattressY, z: cz + 0.05, s: 0.75, blob: 0,
        draw: (p, g) => { baby(g, 300, 890, 1.15); zzz(g, t, 400, 760); } });
      if (shot === 4) {
        cam = E.camFromKeys([{ f: T(4), pos: [RX + 1.0, 2.0, 4.6], look: [RX + 0.2, 2.0, -1.4], fov: 42 },
          { f: T(5) + 2, from: T(5) - 6, pos: [RX + 0.8, 3.0, 3.0], look: [RX + 0.1, 2.6, -1.4], fov: 40 },
          { f: T(6) - 2, from: T(5) + 14, pos: [RX + 0.05, 1.15, 3.6], look: [RX - 0.02, 0.95, -1.4], fov: 40, ease: "out" }], f,
          { kicks: [{ f: T(4) + 18, amp: 0.05 }] });
        if (f >= T(4) + 16 && f < T(4) + 28) fx("pop", RX, 2.4, -0.4, 2.0, (f - T(4) - 16) / 12);
      } else if (shot === 5) {
        // whip between the puller and the peaceful crib
        const A = { pos: [RX + 0.55, 1.6, 2.9], look: [RX + 0.3, 1.45, -1.0], fov: 40 }, B = { pos: [RX + 2.3, 1.2, 0.4], look: [RX + 2.4, 0.55, -2.6], fov: 38 };
        const K = (fr, s, from) => ({ f: fr, from, ...s });
        cam = E.camFromKeys([K(T(6), A), K(T(7) + 5, B, T(7) - 2), K(T(8) + 3, A, T(8) - 4), K(T(9) + 5, B, T(9) - 2),
          K(T(10), { pos: [RX + 2.1, 1.0, -0.4], look: [RX + 2.4, 0.5, -2.6], fov: 36 }, T(9) + 8)], f,
          { kicks: pulls.map((pu) => ({ f: pu + 6, amp: 0.05 })) });
      } else {
        // "a bell that can't ring is a dumb bell" -> the name sticks
        const stick = f >= T(11) + 4, sq = stick ? E.back(E.prog(f, T(11) + 4, T(11) + 14), 2.2) : 0;
        cam = E.camFromKeys([{ f: T(10), pos: [RX + 0.3, 2.3, 5.4], look: [RX + 0.1, 2.3, -1.4], fov: 42 },
          { f: T(12), from: T(11), pos: [RX + 0.2, 2.5, 4.4], look: [RX + 0.05, 2.6, -1.4], fov: 40, roll: -2 }], f, { kicks: [{ f: T(11) + 6, amp: 0.06 }] });
        const appear = E.back(E.prog(f, T(10) + 4, T(10) + 18), 1.8), muted = f > T(10) + 34;
        if (!stick) E.card({ id: "bellcard", key: "bc" + Math.round(appear * 10) + muted + Math.round(Math.sin(t * 6) * 4), res: 0.6, x: RX - 0.2, y: 2.2, z: -1.3, s: 0.9 * Math.max(0.01, appear), blob: 0,
          draw: (p, g) => bell2D(g, { y: 520, rot: Math.sin(t * 6) * 0.06, tape: muted, t }) });
        else E.card({ id: "dbcard", key: "dc" + Math.round(sq * 20), res: 0.6, x: RX - 0.2, y: 2.2, z: -1.3, s: 0.9 * Math.max(0.01, sq), blob: 0,
          draw: (p, g) => dumbbell2D(g, 300, 430, 3.2, "#3b3f46") });
        if (f >= T(11) + 4 && f < T(11) + 16) fx("pop2", RX - 0.2, 2.6, -1.1, 1.8, (f - T(11) - 4) / 12);
      }
    } else if (shot === 7) {
      // ---- explanation (night): lowering a weight = putting down a sleeping baby. Slow builds muscle.
      light = "night"; focus = E.V(NX, 0, -1);
      const lower = E.smooth(E.prog(f, T(12) + 20, T(13) - 4)), flexing = f >= T(13);
      const dx = NX + 0.3, dz = -0.6;
      if (!flexing) {
        const by = E.lerp(1.0, this.crib2.mattressY, lower);
        front("dad", DAD, { x: NX + 0.3, z: -1.75, expr: lower < 0.95 ? "nervous" : "relief", pose: "lift", liftY: 0, seed: 11, headTilt: 0.12 });
        E.card({ id: "babyc", key: "bc" + Math.round(t * 8), res: 0.6, x: NX + 0.3, y: by, z: -1.15, s: 0.7, blob: 0,
          draw: (p, g) => { baby(g, 300, 890, 1.15); if (f > T(12) + 40) zzz(g, t, 400, 760); } });
        cam = E.camFromKeys([{ f: T(12), pos: [NX + 0.35, 1.9, 3.0], look: [NX + 0.3, 1.25, -1.4], fov: 40 },
          { f: T(13), pos: [NX + 0.35, 1.6, 2.2], look: [NX + 0.3, 0.95, -1.4], fov: 38, ease: "lin" }], f);
      } else {
        const fl = E.back(E.prog(f, T(13) + 8, T(13) + 20), 2);
        E.card({ id: "baby2", key: "bb" + Math.round(t * 8), res: 0.6, x: NX + 0.3, y: this.crib2.mattressY, z: -1.15, s: 0.7, blob: 0, draw: (p, g) => { baby(g, 300, 890, 1.15); zzz(g, t, 400, 760); } });
        front("dad", DAD, { x: dx - 0.25, z: dz + 0.4, expr: "grin", pose: "flex", seed: 11 });
        if (fl > 0.01) E.card({ id: "flame", key: "fl" + (f % 20) + Math.round(fl * 10), res: 0.5, x: dx - 0.25, y: 1.45, z: dz + 0.5, s: 0.45 * fl, blob: 0, draw: (p, g) => flame(g, 300, 900, 2.6, t) });
        cam = E.camFromKeys([{ f: T(13), pos: [NX + 0.2, 1.6, 4.0], look: [NX + 0.1, 1.15, -0.6], fov: 42 },
          { f: T(14), pos: [NX + 0.15, 1.55, 3.6], look: [NX + 0.1, 1.2, -0.6], fov: 41, ease: "lin" }], f, { kicks: [{ f: T(13) + 12, amp: 0.04 }] });
      }
    } else if (shot === 8) {
      // ---- takeaway: lower your dumbbells slowly
      light = "gym"; focus = E.V(GX, 0, 0);
      const rep = ((f - T(14)) / 54) % 1, liftY = rep < 0.25 ? 0.55 * E.smooth(rep / 0.25) : 0.55 * (1 - E.smooth((rep - 0.25) / 0.75));
      front("bro", BRO, { x: GX, z: 0.2, expr: rep < 0.25 ? "stern" : "pained", pose: "lift", liftY, seed: 8,
        extra: { key: "db" + Math.round(t * 10), draw: (g, h) => { h.forEach((q) => dumbbell2D(g, q[0], q[1], 0.6)); sweat(g, 300, 250, t); } } });
      gymExtras(0);
      cam = E.camFromKeys([{ f: T(14), pos: [GX + 0.9, 1.5, 4.2], look: [GX + 0.1, 1.3, 0.2], fov: 40 },
        { f: T(15), pos: [GX + 0.3, 1.45, 3.5], look: [GX, 1.3, 0.2], fov: 39, ease: "lin" }], f);
    } else if (shot === 9) {
      // ---- twist A (hard cut + push-in with roll): born silent. Addison pulls, the baby sleeps.
      light = "golden"; focus = E.V(RX, 0, -1);
      this.rig.g.scale.setScalar(1);
      const k = 0.5 - 0.5 * Math.cos((f - T(15)) * 0.12);
      this.rig.set(k);
      front("addison", ADDISON, { x: RX + 0.42, z: -1.0, expr: "smile_closed", pose: k > 0.35 ? "lift" : "up", liftY: 0.2, seed: 7, flip: true });
      E.card({ id: "baby", key: "b" + Math.round(t * 8), res: 0.6, x: RX + 2.4, y: this.crib.mattressY, z: -2.55, s: 0.75, blob: 0, draw: (p, g) => { baby(g, 300, 890, 1.15); zzz(g, t, 400, 760); } });
      cam = E.camFromKeys([{ f: T(15), pos: [RX + 0.5, 1.75, 4.6], look: [RX + 0.4, 1.45, -1.0], fov: 42, roll: 0 },
        { f: T(16) - 1, pos: [RX + 0.45, 1.6, 3.0], look: [RX + 0.42, 1.4, -1.0], fov: 38, roll: 4.5, ease: "in" }], f);
    } else {
      // ---- twist B: then gym guys started dropping them. CRASH on the last word.
      light = "gym"; focus = E.V(GX, 0, 0);
      const drop = T(16) + 25, hit = drop + 9, since = f - drop, scared = f >= hit;
      const liftY = since < 0 ? 0.55 * E.smooth(E.prog(f, T(16), T(16) + 14)) : 0.55;
      front("bro", BRO, { x: GX, z: 0.2, expr: since < 0 ? "grin" : scared ? "laugh" : "shock", pose: since < 0 ? "lift" : "cheer", liftY, seed: 8,
        extra: { key: "fall" + Math.min(30, Math.max(-1, since)) + Math.round(liftY * 20), draw: (g, h) => {
          if (since < 0) h.forEach((q) => dumbbell2D(g, q[0], q[1], 0.6));
          else { const fy = Math.min(1, since / 9); h.forEach((q, i) => dumbbell2D(g, q[0] + (i ? 40 : -40) * fy, Math.min(940, q[1] + (940 - q[1]) * fy * fy), 0.6)); }
          if (scared && since < 30) impact(g, (since - 9) / 18, 300, 950); } } });
      gymExtras(scared ? 1 : 0);
      cam = E.camFromKeys([{ f: T(16), pos: [GX + 0.1, 1.4, 4.6], look: [GX, 1.2, 0.2], fov: 42, roll: 0 },
        { f: hit, pos: [GX + 0.1, 1.2, 3.9], look: [GX, 1.0, 0.2], fov: 40, roll: -1, ease: "in" },
        { f: END - 1, pos: [GX + 0.2, 1.15, 3.6], look: [GX, 1.0, 0.2], fov: 39, roll: 3, ease: "out" }], f, { kicks: [{ f: hit, amp: 0.16 }, { f: hit + 8, amp: 0.06 }] });
    }

    for (const c of flashAt) if (f >= c && f < c + 6) E.post.flash.value = 1 - (f - c) / 6;
    E.applyLight(light, focus);
    E.setCam(cam);
  },
};
