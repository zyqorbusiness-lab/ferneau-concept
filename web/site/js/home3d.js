/* Ferneau home: one fixed WebGL stage, scroll-driven camera keys anchored to the DOM copy of each chapter,
 * continuous time motion (orbiting botanicals, rising bubbles), copy guard so text never sits on the object.
 * Concept project by Zyqor Studio — fictional brand. */
import { THREE, makeRenderer, studio, buildProduct, contactShadow, fontsReady, makeLeaf, makeSprig, makeDroplet, makeBubbles, stepBubbles, webglOK, reduced } from './ferneau3d.js';
import CAT from './catalog.js';

const canvas = document.getElementById('stage');
const RM = reduced();
await fontsReady();
const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
let renderer;
try { renderer = makeRenderer(canvas, { coarse }); } catch (e) { document.documentElement.classList.add('no-3d'); throw e; }
document.documentElement.classList.add('is-3d');
renderer.setClearColor(0xF4F1E8, 1); // opaque page colour: transmission samples the paper, not an empty buffer
const scene = new THREE.Scene(); studio(renderer, scene, coarse);
const cam = new THREE.PerspectiveCamera(28, innerWidth / innerHeight, 0.05, 80);
const P = (id) => CAT.products.find((p) => p.id === id);

/* hero bottle + ground */
const world = new THREE.Group(); scene.add(world);
const hero = buildProduct(P('p01')); const H = hero.userData.height; world.add(hero);
const shadow = contactShadow(0.95, 0.55); world.add(shadow);

/* botanical ring */
const ring = new THREE.Group(); ring.position.y = H * 0.5; world.add(ring);
const items = [];
const kinds = ['sprig', 'leaf', 'drop', 'leaf', 'sprig', 'drop', 'leaf', 'drop', 'leaf', 'sprig', 'drop', 'leaf'];
kinds.forEach((k, i) => {
  let m; if (k === 'sprig') m = makeSprig(0.9 + (i % 3) * 0.12); else if (k === 'leaf') m = makeLeaf(['#4E8A5E', '#6E9C5A', '#3E7A55'][i % 3], 0.42 + (i % 2) * 0.12); else m = makeDroplet(0.055 + (i % 3) * 0.02);
  const a = (i / kinds.length) * Math.PI * 2; const holder = new THREE.Group(); holder.add(m);
  holder.userData = { a, k, yo: Math.sin(i * 1.7) * 0.35, rs: 1 + Math.sin(i * 2.3) * 0.12, spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.4), phase: Math.random() * 6 };
  if (k === 'sprig') m.position.y = -0.45; if (k === 'leaf') m.position.x = -0.22;
  ring.add(holder); items.push(holder);
});
const bubbles = makeBubbles(coarse ? 38 : 64, coarse); world.add(bubbles);

/* the range: rises in chapter 3 */
const lineupIds = ['p03', 'p02', 'p06', 'p05', 'p08'];
const PHL = innerWidth < 760; const sx = PHL ? 0.6 : 1;
const lineSlots = [[-1.32 * sx, -0.35, -0.2], [1.3 * sx, -0.35, 0.25], [-2.45 * sx, PHL ? -1.25 : -0.95, 0.3], [2.45 * sx, PHL ? -1.25 : -0.95, -0.35], [0, -1.6, 0]];
const lineup = lineupIds.map((id, i) => { const g = buildProduct(P(id)); g.visible = false; const s = contactShadow(id === 'p06' ? 1.1 : 0.8, 0.45); g.add(s); g.userData.slot = lineSlots[i]; world.add(g); return g; });

/* ---------- keys (per chapter) ---------- */
const PH = innerWidth < 760;
const KEYS = [
  { az: -0.12, el: 0.1, rad: PH ? 1.5 : 1.95, fill: 0.92, ty: 0.5, tilt: 0, spin: -0.35, ring: 1, ringR: PH ? 1.0 : 1.3, bub: 0.9, line: 0 },
  { az: 0.75, el: 0.02, rad: 1.35, fill: 0.95, ty: 0.55, tilt: 0, spin: 0.6, ring: 0.85, ringR: 1.0, bub: 0.5, line: 0 },
  { az: -0.55, el: 0.3, rad: 1.95, fill: 0.92, ty: 0.48, tilt: -0.32, spin: -0.2, ring: 0.25, ringR: 1.9, bub: 1.9, line: 0 },
  { az: 0.0, el: 0.16, rad: PH ? 2.25 : 2.85, fill: 0.98, ty: 0.42, tilt: 0, spin: -0.3, ring: 0, ringR: 2.4, bub: 0.6, line: 1 },
];
const scenes = [...document.querySelectorAll('[data-k]')];
let anchors = []; // scroll position + band per key
const vh = () => window.innerHeight;
function layout() {
  const w = innerWidth, h = vh(); const hdr = document.querySelector('.hdr').getBoundingClientRect().height;
  const phone = w < 760; const y0 = scrollY;
  anchors = scenes.map((sec, i) => {
    const st = sec.getBoundingClientRect().top + y0; const s = i === 0 ? 0 : st - hdr;
    const copy = sec.querySelector('.copy').getBoundingClientRect();
    const top = copy.top + y0 - s, bottom = copy.bottom + y0 - s; // copy rect in the viewport at the key
    let band;
    if (phone) { // largest free vertical gap between the copy lines (absolute children included)
      const occ = [...sec.querySelectorAll('.copy > *')].map((el) => { const r = el.getBoundingClientRect(); return [r.top + y0 - s, r.bottom + y0 - s]; });
      const card = sec.querySelector('.copy'); const cs = getComputedStyle(card); if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') occ.push([top, bottom]);
      occ.push([-1e4, hdr + 6]); occ.push([h - 6, 1e4]); occ.sort((a, b) => a[0] - b[0]);
      let best = [hdr, h], gmax = 0, end = occ[0][1];
      for (let k = 1; k < occ.length; k++) { const g = occ[k][0] - end; if (g > gmax) { gmax = g; best = [end, occ[k][0]]; } end = Math.max(end, occ[k][1]); }
      return { s, band: { x0: 6, x1: w - 6, y0: best[0] + 6, y1: best[1] - 6 } };
    }
    if (!phone) { const left = Math.min(copy.right, w * 0.62) + 24; band = { x0: left, x1: w - 24, y0: hdr + 8, y1: h - 8 }; if (i === 3) band = { x0: copy.right + 10, x1: w - 10, y0: hdr, y1: h - 4 }; }
    else if ((top + bottom) / 2 < h * 0.5) band = { x0: 6, x1: w - 6, y0: bottom + 8, y1: h - 8 };
    else band = { x0: 6, x1: w - 6, y0: hdr + 6, y1: top - 10 };
    return { s, band };
  });
  window.__anchors = anchors.map((a) => a.s);
}
const ss = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
function stateAt(y) {
  let i = 0; while (i < anchors.length - 2 && y >= anchors[i + 1].s) i++;
  const A = anchors[i], B = anchors[i + 1] || A; let t = B === A ? 0 : Math.min(1, Math.max(0, (y - A.s) / (B.s - A.s)));
  if (RM) t = t < 0.5 ? 0 : 1; t = ss(t);
  const ka = KEYS[i], kb = KEYS[Math.min(i + 1, KEYS.length - 1)]; const o = {};
  for (const k in ka) o[k] = lerp(ka[k], kb[k], t);
  const b = {}; for (const k in A.band) b[k] = lerp(A.band[k], B.band[k], t); o.band = b; o.i = i; o.t = t;
  return o;
}

/* copy guard: fade any copy line that enters the object's screen circle (transitions on phone) */
const guarded = PH ? [...document.querySelectorAll('.hero .copy > *'), ...document.querySelectorAll('[data-k]:not(.hero) .copy')] : [...document.querySelectorAll('[data-k] .copy > *')];
let objBox = null; window.__guard = () => objBox;
function guard() {
  if (!objBox) return;
  for (const el of guarded) {
    const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh()) { el.style.opacity = ''; continue; }
    const dx = Math.max(objBox.x0 - r.right, r.left - objBox.x1, 0), dy = Math.max(objBox.y0 - r.bottom, r.top - objBox.y1, 0);
    const inside = dx === 0 && dy === 0; let pen = 0;
    if (inside) pen = Math.min(r.bottom - objBox.y0, objBox.y1 - r.top, r.right - objBox.x0, objBox.x1 - r.left);
    const op = inside ? Math.max(0, 1 - pen / 56) : 1; el.style.opacity = op < 1 ? op.toFixed(3) : ''; el.style.visibility = op <= 0.01 ? 'hidden' : '';
  }
}

/* ---------- loop ---------- */
let mx = 0, my = 0, cmx = 0, cmy = 0; if (!coarse) addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
let visible = true; const endEl = document.querySelector('.after-stage');
function resize() { const w = innerWidth, h = vh(); renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); layout(); }
addEventListener('resize', resize); resize();
setTimeout(layout, 600); document.fonts && document.fonts.ready.then(layout);
const clock = new THREE.Clock(); let T = 0; const tgt = new THREE.Vector3(); const sm = { y: scrollY };
function step() {
  const dt = Math.min(0.05, clock.getDelta()); if (!RM) T += dt; if (window.__T != null) T = window.__T;
  const endTop = endEl.getBoundingClientRect().top; visible = endTop > 0;
  canvas.style.visibility = visible ? '' : 'hidden';
  if (visible) {
    sm.y = RM || window.__snap ? scrollY : lerp(sm.y, scrollY, 0.14); const s = stateAt(sm.y);
    const w = innerWidth, h = vh(); const b = s.band; const bw = b.x1 - b.x0, bh = b.y1 - b.y0; const bx = (b.x0 + b.x1) / 2, by = (b.y0 + b.y1) / 2;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const d = (s.rad * h) / (s.fill * Math.min(bw, bh) * tan);
    cmx = lerp(cmx, mx, 0.05); cmy = lerp(cmy, my, 0.05);
    const az = s.az + cmx * 0.25, el = s.el + cmy * 0.12;
    tgt.set(0, H * s.ty + (s.line > 0 ? -0.35 * s.line : 0), -0.25 * s.line);
    cam.position.set(tgt.x + Math.sin(az) * Math.cos(el) * d, tgt.y + Math.sin(el) * d, tgt.z + Math.cos(az) * Math.cos(el) * d);
    cam.lookAt(tgt); cam.setViewOffset(w, h, w / 2 - bx, h / 2 - by, w, h);
    const rpx = (s.fill * Math.min(bw, bh)) / 2 * 0.92; objBox = { x0: bx - rpx * 0.8, x1: bx + rpx * 0.8, y0: by - rpx, y1: by + rpx };
    // hero bottle
    hero.rotation.y = s.spin + (RM ? 0 : Math.sin(T * 0.45) * 0.22); hero.rotation.z = s.tilt; hero.position.y = (RM ? 0 : Math.sin(T * 0.9) * 0.03);
    shadow.material.opacity = 0.55 * (1 - Math.abs(s.tilt));
    // ring
    ring.rotation.set(0.32, T * 0.22, 0.12);
    items.forEach((it) => { const u = it.userData; const r = s.ringR * u.rs; it.position.set(Math.cos(u.a) * r, u.yo * (0.6 + s.ring * 0.4), Math.sin(u.a) * r); it.rotation.set(u.spin.x * T + u.phase, u.spin.y * T, u.spin.z * T * 0.5); const sc = Math.max(0.0001, s.ring); it.scale.setScalar(sc); it.visible = s.ring > 0.02; });
    // bubbles
    stepBubbles(bubbles, T, { spread: s.bub, rise: 0.6 + s.bub * 0.5, cy: 0 }); bubbles.visible = s.bub > 0.05;
    // lineup
    lineup.forEach((g, i) => { const k = Math.min(1, Math.max(0, (s.line - i * 0.09) / 0.6)); const e = ss(k); const [x, z, ry] = g.userData.slot; g.visible = e > 0.001; g.position.set(x, lerp(-3.2, 0, e), z); g.rotation.y = ry + (RM ? 0 : Math.sin(T * 0.4 + i) * 0.12) + (1 - e) * 1.2; g.scale.setScalar(0.92); });
    renderer.render(scene, cam); guard();
  }
}
function frame() { if (!window.__manual) step(); requestAnimationFrame(frame); }
window.__step = step; // recorder: window.__manual = 1, then call __step() once per captured frame
requestAnimationFrame(frame);
window.__stage = { ok: true, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, dpr: renderer.getPixelRatio() }) };
