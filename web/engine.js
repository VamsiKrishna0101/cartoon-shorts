// Cartoon short engine: toon-shaded 3D world + black ink outlines + 2D billboard "card" characters.
// Every frame is a pure function of the frame number: story.frame(E, f) poses the world, then E.render().
import * as THREE from "three";
import { Pen } from "./toon.js";

export const W = 1080, H = 1920, FPS = 30;
export const CARD_LAYER = 1;
export const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
export const easeOut = (x) => { x = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - x, 3); };
export const easeIn = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x; };
export const back = (x, s = 1.7) => { x = Math.min(1, Math.max(0, x)); const c = s + 1; return 1 + c * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
export const spring = (x) => { if (x <= 0) return 0; if (x >= 1.2) return 1; return 1 - Math.exp(-6 * x) * Math.cos(12 * x); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const prog = (f, a, b) => clamp01((f - a) / (b - a));
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const rnd = (seed, k = 0) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- renderer
const canvas = document.createElement("canvas");
canvas.width = W; canvas.height = H;
document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 900);
camera.layers.enable(CARD_LAYER);

const colorRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const ndRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
ndRT.depthTexture = new THREE.DepthTexture(W, H);

// ---------------------------------------------------------------- toon materials
const grad = (() => {
  const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const matCache = new Map();
/** toon material; colour hex, optional painted texture */
export const toon = (color, map = null, extra = {}) => {
  const key = color + (map ? map.uuid : "") + JSON.stringify(extra);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, map, gradientMap: grad, ...extra });
  matCache.set(key, m); return m;
};
export const flat = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });

/** add a mesh to a parent with shadows on */
export const add = (parent, geo, mat, x = 0, y = 0, z = 0, ry = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
};
/** box with its base on y, world-scale UVs (texel density constant) */
export const tbox = (parent, w, h, d, mat, x, y, z, ry = 0, tile = 2) => {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv, n = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    const sx = nx > 0.5 ? d : w, sy = ny > 0.5 ? d : h;
    uv.setXY(i, (uv.getX(i) * sx) / tile, (uv.getY(i) * sy) / tile);
  }
  g.translate(0, h / 2, 0);
  return add(parent, g, mat, x, y, z, ry);
};
export const cyl = (parent, rt, rb, h, mat, x, y, z, seg = 24) => {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg); g.translate(0, h / 2, 0);
  return add(parent, g, mat, x, y, z);
};

// ---------------------------------------------------------------- painted textures
const texCache = new Map();
export const prng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
export const ctex = (key, w, h, draw, rx = 1, ry = 1) => {
  const k = key + rx + "x" + ry;
  if (texCache.has(k)) return texCache.get(k);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); draw(g, prng(key.length * 977 + w));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.anisotropy = 4; texCache.set(k, t); return t;
};
const jitter = (r, hex, dv = 0.08) => {
  const c = new THREE.Color(hex); const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h + (r() - 0.5) * 0.02, hsl.s, Math.min(1, Math.max(0, hsl.l + (r() - 0.5) * dv)));
  return "#" + c.getHexString();
};
export const PAINT = {
  marble: () => ctex("marble", 512, 512, (g, r) => {
    g.fillStyle = "#efe6d6"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 6; i++) { g.fillStyle = jitter(r, "#e6dcc8", 0.05); g.fillRect(0, i * 85, 512, 85); g.fillStyle = "rgba(60,40,30,.35)"; g.fillRect(0, i * 85, 512, 3); }
    g.strokeStyle = "rgba(150,135,120,.35)"; g.lineWidth = 2;
    for (let i = 0; i < 9; i++) { g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 120; y += r() * 60; g.lineTo(x, y); } g.stroke(); }
  }),
  stone: () => ctex("stone", 512, 512, (g, r) => {
    g.fillStyle = "#2b2420"; g.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 8; row++) { let x = row % 2 ? -32 : 0; while (x < 512) { const w = 70 + r() * 50; g.fillStyle = jitter(r, "#cbb99a", 0.1); g.fillRect(x + 3, row * 64 + 3, w - 6, 58); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(x + 3, row * 64 + 3, w - 6, 8); x += w; } }
  }),
  sand: () => ctex("sand", 512, 512, (g, r) => {
    g.fillStyle = "#e3c590"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? "rgba(160,110,60,.18)" : "rgba(255,240,200,.22)"; g.fillRect(r() * 512, r() * 512, 2 + r() * 4, 2 + r() * 3); }
  }),
  grass: () => ctex("grass", 512, 512, (g, r) => {
    g.fillStyle = "#7fae4a"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1800; i++) { g.strokeStyle = r() < 0.5 ? "rgba(50,100,30,.45)" : "rgba(190,220,110,.4)"; g.lineWidth = 2; const x = r() * 512, y = r() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 6 - r() * 8); g.stroke(); }
  }),
  plaster: (col = "#f1e2c6") => ctex("plaster" + col, 512, 512, (g, r) => {
    g.fillStyle = col; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(120,90,60,${0.04 + r() * 0.05})`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 60, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
  }),
  wood: () => ctex("wood", 512, 512, (g, r) => {
    g.fillStyle = "#1e130c"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8; i++) { g.fillStyle = jitter(r, "#a8743f", 0.1); g.fillRect(0, i * 64 + 3, 512, 58); g.strokeStyle = "rgba(60,30,10,.35)"; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(0, i * 64 + 10 + r() * 44); g.bezierCurveTo(170, i * 64 + r() * 60, 340, i * 64 + r() * 60, 512, i * 64 + 10 + r() * 44); g.stroke(); } }
  }),
  roof: (col = "#c4583a") => ctex("roof" + col, 512, 512, (g, r) => {
    g.fillStyle = "#3a1810"; g.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 8; row++) for (let i = 0; i < 9; i++) { g.fillStyle = jitter(r, col, 0.08); g.beginPath(); g.ellipse(i * 64 + (row % 2) * 32, row * 64 + 40, 30, 34, 0, 0, Math.PI); g.fill(); }
  }),
  rubber: () => ctex("rubber", 512, 512, (g, r) => {
    g.fillStyle = "#2f3236"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) { g.fillStyle = "#1c1e21"; g.fillRect(i * 128, 0, 4, 512); g.fillRect(0, i * 128, 512, 4); }
    for (let i = 0; i < 2000; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.12)"; g.fillRect(r() * 512, r() * 512, 2, 2); }
  }),
};

// ---------------------------------------------------------------- sky + lights
const skyU = { top: { value: new THREE.Color("#3e7fd2") }, hor: { value: new THREE.Color("#b8d0ec") } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
  fragmentShader: "uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float t = pow(clamp(vP.y,0.,1.), .55); gl_FragColor = vec4(mix(hor, top, t), 1.); }",
}));
sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
scene.fog = new THREE.Fog("#b8d0ec", 30, 320);

const sun = new THREE.DirectionalLight("#fff3dc", 2.4);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
const sc = sun.shadow.camera; sc.left = sc.bottom = -18; sc.right = sc.top = 18; sc.near = 1; sc.far = 160;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight("#cfe3ff", "#8a7a5a", 1.1);
scene.add(hemi);

export const LIGHTS = {
  day:    { sun: "#fff1d6", si: 2.6, az: 60, el: 50, sky: "#cfe3ff", gnd: "#8f7c58", hi: 1.15, top: "#3e7fd2", hor: "#b8d0ec", fogN: 30, fogF: 320, card: [1, 1, 1], sat: 1.08 },
  golden: { sun: "#ffb36b", si: 2.4, az: 15, el: 14, sky: "#a99be0", gnd: "#7d5a52", hi: 1.0, top: "#ffc47c", hor: "#ffd9a8", fogN: 25, fogF: 260, card: [1.04, 0.93, 0.84], sat: 1.12 },
  night:  { sun: "#9fb6ff", si: 1.1, az: 120, el: 40, sky: "#5a6fb8", gnd: "#2a2c48", hi: 0.9, top: "#16224a", hor: "#3e5490", fogN: 20, fogF: 200, card: [0.62, 0.68, 0.92], sat: 1.0 },
  gym:    { sun: "#fff7ec", si: 2.0, az: 30, el: 70, sky: "#f4f1ff", gnd: "#7e7468", hi: 1.4, top: "#cfd8e6", hor: "#e8e4dc", fogN: 30, fogF: 200, card: [1, 1, 1], sat: 1.06 },
};
let cardTint = new THREE.Color(1, 1, 1), satNow = 1.08;
/** light preset by name, or a blend {a, b, t}; focus = point the sun's shadow box follows */
export const applyLight = (name, focus = V(0, 0, 0), blendTo = null, t = 0) => {
  const A = LIGHTS[name], B = blendTo ? LIGHTS[blendTo] : A;
  const c = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), t);
  const az = THREE.MathUtils.degToRad(lerp(A.az, B.az, t)), el = THREE.MathUtils.degToRad(lerp(A.el, B.el, t));
  const dir = V(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  sun.color.copy(c(A.sun, B.sun)); sun.intensity = lerp(A.si, B.si, t);
  sun.position.copy(focus).addScaledVector(dir, 80); sun.target.position.copy(focus); sun.target.updateMatrixWorld();
  hemi.color.copy(c(A.sky, B.sky)); hemi.groundColor.copy(c(A.gnd, B.gnd)); hemi.intensity = lerp(A.hi, B.hi, t);
  skyU.top.value.copy(c(A.top, B.top)); skyU.hor.value.copy(c(A.hor, B.hor));
  scene.fog.color.copy(skyU.hor.value); scene.fog.near = lerp(A.fogN, B.fogN, t); scene.fog.far = lerp(A.fogF, B.fogF, t);
  cardTint.setRGB(lerp(A.card[0], B.card[0], t), lerp(A.card[1], B.card[1], t), lerp(A.card[2], B.card[2], t));
  satNow = lerp(A.sat, B.sat, t);
  return dir;
};
export const setShadowBox = (half) => { sc.left = sc.bottom = -half; sc.right = sc.top = half; sc.updateProjectionMatrix(); };

// ---------------------------------------------------------------- cards (2D characters as billboards)
const CARD_W = 1200, CARD_H = 2000; // design canvas 600x1000 at 2x
export const SU = 0.00225;          // metres per design unit (1000 units = 2.25 m)
const blobTex = ctex("blob", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(20,10,30,.55)"); gr.addColorStop(1, "rgba(20,10,30,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
blobTex.colorSpace = THREE.NoColorSpace;
class Card {
  constructor(id, res = 1) {
    const cw = Math.round(CARD_W * res), ch = Math.round(CARD_H * res);
    this.id = id; this.cw = cw; this.ch = ch; this.key = null;
    this.canvas = document.createElement("canvas"); this.canvas.width = cw; this.canvas.height = ch;
    this.g = this.canvas.getContext("2d");
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, alphaTest: 0.5, side: THREE.DoubleSide, fog: true });
    this.mat.userData.card = true;
    const w = 600 * SU, h = 1000 * SU;
    const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2 - 25 * SU, 0);
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.layers.set(CARD_LAYER);
    this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.layers.set(CARD_LAYER); this.blob.renderOrder = 1;
    scene.add(this.mesh, this.blob);
  }
  draw(key, fn) {
    if (key === this.key) return;
    this.key = key; const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cw, this.ch);
    g.setTransform(this.cw / 600, 0, 0, this.ch / 1000, 0, 0);
    g.lineJoin = "round"; g.lineCap = "round";
    fn(new Pen(g), g);
    this.tex.needsUpdate = true;
  }
}
const cards = new Map();
let usedCards = new Set();
/**
 * place one billboard this frame.
 * a = {id, key, draw(pen,g), x,y,z, s (scale), flip (mirror), yaw (null = face camera), blob (radius m, 0 = none), lean (rad)}
 */
export const card = (a) => {
  let c = cards.get(a.id); if (!c) { c = new Card(a.id, a.res ?? 1); cards.set(a.id, c); }
  usedCards.add(a.id);
  c.draw(a.key, a.draw);
  const s = a.s ?? 1;
  c.mesh.visible = true;
  c.mesh.position.set(a.x, a.y ?? 0, a.z);
  c.mesh.scale.set((a.flip ? -1 : 1) * s, s, s);
  c.faceCam = a.yaw == null;
  const ph = (a.id.length * 1.7 + a.id.charCodeAt(0)) % 6.28, tt = frameNow / FPS;
  const idle = a.idle === false ? 0 : 1;
  c.lean = (a.lean ?? 0) + idle * 0.012 * Math.sin(tt * 1.9 + ph);
  c.mesh.scale.y *= 1 + idle * 0.012 * Math.sin(tt * 2.6 + ph * 1.3);
  c.mesh.rotation.set(0, a.yaw ?? 0, c.lean);
  c.mat.color.copy(cardTint).multiplyScalar(a.bright ?? 1);
  const br = a.blob ?? 0.55 * s;
  c.blob.visible = br > 0; c.blob.position.set(a.x, (a.y ?? 0) + 0.015, a.z); c.blob.scale.set(br * 2, br * 1.4, 1);
  return c.mesh;
};

// ---------------------------------------------------------------- post: ink + grade
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vZ;
    #include <common>
    #include <skinning_pars_vertex>
    void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vZ = -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying vec3 vN; varying float vZ; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vZ); }`,
});
const cardNdCache = new Map();
const cardNd = (map) => {
  if (cardNdCache.has(map.uuid)) return cardNdCache.get(map.uuid);
  const m = new THREE.ShaderMaterial({
    uniforms: { map: { value: map } }, side: THREE.DoubleSide,
    vertexShader: "varying vec2 vUv; varying float vZ; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.); vZ = -mv.z; gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform sampler2D map; varying vec2 vUv; varying float vZ; void main(){ if(texture2D(map, vUv).a < .5) discard; gl_FragColor = vec4(0.,0.,0., vZ); }",
  });
  cardNdCache.set(map.uuid, m); return m;
};
const postU = {
  tCol: { value: colorRT.texture }, tND: { value: ndRT.texture }, px: { value: new THREE.Vector2(1 / W, 1 / H) },
  inkW: { value: 3.0 }, flash: { value: 0 }, sat: { value: 1.08 }, vign: { value: 0.22 }, fade: { value: 0 },
  inkFar: { value: 420 }, dof: { value: 0 }, focus: { value: 5 }, gain: { value: 1.0 },
};
const postMat = new THREE.ShaderMaterial({
  uniforms: postU, depthTest: false, depthWrite: false,
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
  fragmentShader: `
    uniform sampler2D tCol, tND; uniform vec2 px; uniform float inkW, flash, sat, vign, fade, inkFar, dof, focus, gain;
    varying vec2 vUv;
    vec4 nd(vec2 o){ return texture2D(tND, vUv + o * px); }
    bool isCard(vec4 s){ return dot(s.rgb, s.rgb) < .01 && s.a > 0.; }
    bool isSky(vec4 s){ return s.a <= 0.; }
    vec3 blurAt(vec2 uv, float r){
      vec3 acc = vec3(0.); float wsum = 0.;
      for(int i=0;i<24;i++){ float a = float(i)*2.39996; float rr = sqrt(float(i)/24.)*r;
        vec2 o = vec2(cos(a), sin(a))*rr*px; vec4 s = texture2D(tND, uv+o);
        float zc = s.a <= 0. ? 1e4 : s.a; float coc = dof * clamp(abs(zc - focus)/max(zc, .1), 0., 1.);
        float w = step(rr, coc + .5);
        acc += texture2D(tCol, uv+o).rgb * w; wsum += w; }
      return acc / max(wsum, 1.); }
    void main(){
      vec4 c = nd(vec2(0.));
      float z = isSky(c) ? 1e4 : c.a;
      vec3 col = texture2D(tCol, vUv).rgb;
      if (dof > 0.) { float coc = dof * clamp(abs(z - focus)/max(z,.1), 0., 1.); if (coc > .6) col = blurAt(vUv, coc); }
      // ink: depth jumps (near side only) + normal creases, never on/next to cards
      float ink = 0.;
      if (!isCard(c) && !isSky(c)) {
        float w = inkW * clamp(1.4 - z / 60., .75, 1.4);
        vec2 dirs[8]; dirs[0]=vec2(1,0); dirs[1]=vec2(-1,0); dirs[2]=vec2(0,1); dirs[3]=vec2(0,-1);
        dirs[4]=vec2(.7,.7); dirs[5]=vec2(-.7,.7); dirs[6]=vec2(.7,-.7); dirs[7]=vec2(-.7,-.7);
        vec3 n0 = c.rgb*2.-1.;
        for (int i=0;i<8;i++){
          vec4 s = nd(dirs[i]*w);
          if (isCard(s)) continue;
          if (isSky(s) && z > 45.) continue;
          float zs = isSky(s) ? 1e4 : s.a;
          if (zs - z > max(.04 * z, .06)) ink = 1.;
          if (!isSky(s) && abs(zs - z) < .5 * z) { vec3 ns = s.rgb*2.-1.; if (dot(n0, ns) < .72) ink = max(ink, .85); }
        }
        ink *= 1. - smoothstep(inkFar*.35, inkFar, z);
      }
      col = mix(col, vec3(.035,.03,.04), ink);
      col *= gain;
      float l = dot(col, vec3(.2126,.7152,.0722)); col = mix(vec3(l), col, sat);
      vec2 q = vUv - .5; col *= 1. - vign * dot(q*vec2(1.,.6), q*vec2(1.,.6)) * 2.2;
      col = mix(col, vec3(1.), flash); col = mix(col, vec3(0.), fade);
      gl_FragColor = vec4(col, 1.);
      #include <colorspace_fragment>
    }`,
});
const postScene = new THREE.Scene();
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat); quad.frustumCulled = false; postScene.add(quad);
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// ---------------------------------------------------------------- camera helper
/**
 * keys: [{f, pos:[x,y,z], look:[x,y,z], fov?, roll?, cut?, ease?:'smooth'|'out'|'in'|'lin'}]
 * between keys the camera glides (smootherstep) unless the later key has cut:true (hard cut at its f).
 * every hold creeps: a slow push of `creep` (fraction of distance per frame) toward the look point.
 */
export const camFromKeys = (keys, f, opts = {}) => {
  const creep = opts.creep ?? 0.0022;
  let i = 0; while (i < keys.length - 1 && keys[i + 1].f <= f) i++;
  const A = keys[i], B = keys[i + 1];
  let pos = V(...A.pos), look = V(...A.look), fov = A.fov ?? 40, roll = A.roll ?? 0, e = 0, holdA = f - A.f, holdB = 0;
  if (B && !B.cut && B.f > A.f) {
    const start = B.from ?? A.f; // glide starts at B.from (default immediately)
    const raw = prog(f, start, B.f);
    e = B.ease === "out" ? easeOut(raw) : B.ease === "in" ? easeIn(raw) : B.ease === "lin" ? raw : smooth(raw);
    holdA = Math.min(f, start) - A.f;
    const bpos = V(...B.pos), blook = V(...B.look);
    pos.lerp(bpos, e); look.lerp(blook, e); fov = lerp(fov, B.fov ?? 40, e); roll = lerp(roll, B.roll ?? 0, e);
  }
  // every hold creeps toward the look point; the creep fades out smoothly as a glide takes over (no pops)
  const d = look.clone().sub(pos);
  pos.addScaledVector(d, Math.min(0.12, creep * Math.max(0, holdA)) * (1 - e));
  // kicks: [{f, amp}] flip-sign shake decaying over 7 frames
  let kx = 0, ky = 0;
  for (const k of opts.kicks ?? []) { const t = f - k.f; if (t >= 0 && t < 8) { const a = k.amp * (1 - t / 8) * (t % 2 ? -1 : 1); kx += a; ky += a * 0.6; } }
  return { pos, look, fov, roll, kx, ky };
};
export const setCam = ({ pos, look, fov, roll, kx = 0, ky = 0 }) => {
  camera.position.copy(pos); camera.fov = fov; camera.up.set(0, 1, 0);
  camera.lookAt(look); camera.rotateZ(THREE.MathUtils.degToRad(roll));
  if (kx || ky) { camera.translateX(kx); camera.translateY(ky); }
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
};

// ---------------------------------------------------------------- frame render
export const post = postU;
let frameNow = 0;
export const beginFrame = (f = 0) => {
  frameNow = f;
  usedCards = new Set();
  postU.flash.value = 0; postU.fade.value = 0; postU.dof.value = 0; postU.gain.value = 1;
};
export const render = () => {
  for (const [id, c] of cards) {
    if (!usedCards.has(id)) { c.mesh.visible = false; c.blob.visible = false; continue; }
    if (c.faceCam) { const p = c.mesh.position; c.mesh.rotation.set(0, Math.atan2(camera.position.x - p.x, camera.position.z - p.z), c.lean); }
  }
  postU.sat.value = satNow;
  // colour pass
  renderer.setRenderTarget(colorRT); renderer.setClearColor(0x000000, 1); renderer.clear();
  renderer.render(scene, camera);
  // normal + depth pass (world normals, cards as masks, sky/blobs hidden)
  const hidden = [];
  scene.traverse((o) => {
    if (o === sky || (o.material && o.material.transparent)) { if (o.visible) { o.visible = false; hidden.push(o); } }
  });
  const saved = new Map(), fog = scene.fog; scene.fog = null;
  scene.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    saved.set(o, o.material);
    o.material = o.material.userData?.card ? cardNd(o.material.map) : o.material.userData?.noInk ? cardNd(blobTex) : ndMat;
  });
  renderer.shadowMap.autoUpdate = false;
  renderer.setRenderTarget(ndRT); renderer.setClearColor(0x000000, 0); renderer.clear();
  renderer.render(scene, camera);
  renderer.shadowMap.autoUpdate = true;
  for (const [o, m] of saved) o.material = m;
  for (const o of hidden) o.visible = true;
  scene.fog = fog;
  // composite
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
};
export const renderer_ = renderer;
export const canvasEl = canvas;
