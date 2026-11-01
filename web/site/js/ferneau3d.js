/* Ferneau 3D product kit — every bottle, tube, jar and leaf is modelled in code with three.js (no downloaded models,
 * no generated images). Concept project by Zyqor Studio — fictional brand. MIT. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const PALETTE = { paper: '#F4F1E8', fern: '#234A3A', ink: '#1F3A2F', sage: '#CFE1D3', mist: '#E7EFE8', clay: '#D9764A' };

export async function fontsReady() {
  try { await Promise.all([document.fonts.load('600 64px Fraunces'), document.fonts.load('italic 400 40px Fraunces'), document.fonts.load('500 20px "DM Sans"'), document.fonts.load('700 20px "DM Sans"')]); } catch (e) {}
}

export function makeRenderer(canvas, { coarse = matchMedia('(pointer: coarse)').matches } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.setClearColor(0x000000, 0);
  return r;
}

export function studio(renderer, scene, coarse) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environment = env; pmrem.dispose();
  scene.environmentIntensity = 0.8;
  const key = new THREE.DirectionalLight(0xfff1df, 2.5); key.position.set(3.5, 5, 3.2);
  const rim = new THREE.DirectionalLight(0xdcefe6, 1.5); rim.position.set(-4, 2.5, -3);
  const fill = new THREE.HemisphereLight(0xf7f3ea, 0x9fb9a6, 0.55);
  scene.add(key, rim, fill);
  return { key, rim, fill };
}

/* soft contact shadow (baked radial gradient, zero runtime cost) */
let shadowTex = null;
export function contactShadow(radius = 0.8, opacity = 0.5) {
  if (!shadowTex) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(31,58,47,0.55)'); gr.addColorStop(0.45, 'rgba(31,58,47,0.22)'); gr.addColorStop(1, 'rgba(31,58,47,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); shadowTex = new THREE.CanvasTexture(c); shadowTex.colorSpace = THREE.SRGBColorSpace;
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.002; m.renderOrder = -1; return m;
}

const spline = (pts, n = 90) => new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y))).getSpacedPoints(n);

/* ---------- label artwork (canvas) ---------- */
function labelCanvas(p, { w = 1400, h = 640, clear = false } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const col = p.colors;
  if (!clear) { g.fillStyle = col.label; g.fillRect(0, 0, w, h); }
  // faint paper grain
  if (!clear) for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(35,74,58,${Math.random() * 0.035})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
  const cx = w / 2; const ink = PALETTE.fern;
  g.textAlign = 'center'; g.fillStyle = ink;
  g.font = `600 ${h * 0.085}px "DM Sans"`; g.letterSpacing = `${h * 0.03}px`;
  g.fillText('FERNEAU', cx + h * 0.015, h * 0.2);
  g.letterSpacing = '0px';
  // leaf mark
  g.save(); g.translate(cx, h * 0.3); g.strokeStyle = col.accent; g.lineWidth = h * 0.008; g.beginPath();
  g.moveTo(-h * 0.06, 0); g.quadraticCurveTo(0, -h * 0.05, h * 0.06, 0); g.quadraticCurveTo(0, h * 0.05, -h * 0.06, 0); g.moveTo(-h * 0.08, 0); g.lineTo(h * 0.08, 0); g.stroke(); g.restore();
  const words = p.name.split(' ');
  const main = words.slice(0, -1).join(' ') || p.name; const last = words.length > 1 ? words[words.length - 1] : '';
  let fs = h * 0.17; g.font = `600 ${fs}px Fraunces`;
  while (g.measureText(main).width > w * 0.62 && fs > h * 0.07) { fs *= 0.94; g.font = `600 ${fs}px Fraunces`; }
  g.fillText(main, cx, h * 0.52);
  g.font = `italic 400 ${h * 0.1}px Fraunces`; g.fillStyle = col.accent; g.fillText(last.toLowerCase(), cx, h * 0.66);
  g.fillStyle = ink; g.font = `500 ${h * 0.048}px "DM Sans"`; g.letterSpacing = `${h * 0.008}px`;
  g.fillText((p.ingredients[0] + ' · ' + p.size).toUpperCase(), cx, h * 0.82);
  g.letterSpacing = '0px';
  g.globalAlpha = 0.55; g.font = `400 ${h * 0.036}px "DM Sans"`; g.fillText('concept · fictional brand', cx, h * 0.92); g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* ---------- materials ---------- */
function plastic(color, o = {}) { return new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.12, ...o }); }
function bottleMat(color, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.07, metalness: 0, transmission: 0.94, thickness: 0.3, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, attenuationColor: new THREE.Color(color), attenuationDistance: 0.9, side: THREE.FrontSide, ...o });
}
function liquidMat(color) { return new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, sheen: 0.3, sheenColor: new THREE.Color('#ffffff'), clearcoat: 0.3 }); }

/* label wrapped on a straight wall: an open cylinder section facing +z */
function wallLabel(p, r, y0, y1, arc = 2.3) {
  const geo = new THREE.CylinderGeometry(r, r, y1 - y0, 96, 1, true, -arc / 2, arc);
  const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ map: labelCanvas(p, { w: 1400, h: Math.round(1400 * (y1 - y0) / (r * arc)) }), roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.3 }));
  m.position.y = (y0 + y1) / 2; m.name = 'label'; return m;
}

function lathe(pts, seg = 96) { const g = new THREE.LatheGeometry(pts, seg); g.computeVertexNormals(); return g; }
function shrink(pts, d, yMax) { return pts.filter((v) => v.y <= yMax).map((v) => new THREE.Vector2(Math.max(0.001, v.x - d), Math.max(d, v.y))); }

/* ---------- forms ---------- */
function bottleBody(p, profile, fill, labelY) {
  const g = new THREE.Group(); const col = p.colors; const pts = spline(profile);
  const body = new THREE.Mesh(lathe(pts), bottleMat(col.bottle)); body.name = 'body'; g.add(body);
  const top = fill; const lp = shrink(pts, 0.035, top); lp.push(new THREE.Vector2(0.001, top));
  const liquid = new THREE.Mesh(lathe(lp, 64), liquidMat(col.liquid)); liquid.name = 'liquid'; g.add(liquid);
  const rr = Math.max(...pts.filter((v) => v.y > labelY[0] && v.y < labelY[1]).map((v) => v.x));
  g.add(wallLabel(p, rr + 0.004, labelY[0], labelY[1]));
  return g;
}

function pumpTop(col, h, spray) {
  const g = new THREE.Group(); const capM = plastic(col.cap);
  const collar = new THREE.Mesh(lathe(spline([[0.001, 0], [0.2, 0], [0.215, 0.02], [0.215, 0.13], [0.2, 0.15], [0.001, 0.15]], 30), 64), capM); collar.position.y = h; g.add(collar);
  // ribs on the collar
  const rib = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 0.1, 0.012), capM, 48);
  const o = new THREE.Object3D(); for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; o.position.set(Math.cos(a) * 0.216, h + 0.075, Math.sin(a) * 0.216); o.rotation.y = -a; o.updateMatrix(); rib.setMatrixAt(i, o.matrix); } g.add(rib);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, spray ? 0.08 : 0.16, 24), plastic('#f3f1ea', { roughness: 0.2 })); stem.position.y = h + 0.15 + (spray ? 0.04 : 0.08); g.add(stem);
  const headY = h + 0.15 + (spray ? 0.08 : 0.16);
  if (spray) {
    const head = new THREE.Mesh(lathe(spline([[0.001, 0], [0.13, 0], [0.135, 0.02], [0.13, 0.2], [0.11, 0.24], [0.001, 0.25]], 30), 48), capM); head.position.y = headY; g.add(head);
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 16), plastic(PALETTE.fern)); noz.rotation.x = Math.PI / 2; noz.position.set(0, headY + 0.16, 0.13); g.add(noz);
  } else {
    const shape = new THREE.Shape(); shape.moveTo(-0.16, 0); shape.lineTo(0.16, 0); shape.quadraticCurveTo(0.2, 0, 0.2, 0.05); shape.lineTo(0.2, 0.11); shape.quadraticCurveTo(0.2, 0.15, 0.15, 0.15); shape.lineTo(-0.15, 0.15); shape.quadraticCurveTo(-0.2, 0.15, -0.2, 0.11); shape.lineTo(-0.2, 0.05); shape.quadraticCurveTo(-0.2, 0, -0.16, 0);
    const hg = new THREE.ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 4, curveSegments: 10 }); hg.translate(0, 0, -0.12); hg.rotateY(Math.PI / 2);
    const head = new THREE.Mesh(hg, capM); head.position.y = headY; g.add(head);
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.36, 20), capM); noz.rotation.x = Math.PI / 2; noz.position.set(0, headY + 0.09, 0.27); g.add(noz);
  }
  g.name = 'cap'; return g;
}

export function buildProduct(p, opts = {}) {
  const col = p.colors; const root = new THREE.Group(); root.name = p.id; let height = 2.2;
  const form = p.form;
  if (form === 'pump' || form === 'spray') {
    const prof = [[0.001, 0], [0.38, 0], [0.45, 0.025], [0.475, 0.09], [0.48, 0.5], [0.48, 1.4], [0.47, 1.52], [0.4, 1.63], [0.26, 1.72], [0.19, 1.77], [0.185, 1.86]];
    root.add(bottleBody(p, prof, 1.38, [0.32, 1.22]));
    const top = pumpTop(col, 1.84, form === 'spray'); root.add(top); height = form === 'spray' ? 2.35 : 2.42;
  } else if (form === 'flip') {
    const prof = [[0.001, 0], [0.36, 0], [0.43, 0.03], [0.45, 0.1], [0.45, 1.25], [0.43, 1.42], [0.36, 1.55], [0.3, 1.6], [0.29, 1.64]];
    root.add(bottleBody(p, prof, 1.3, [0.28, 1.16]));
    const capM = plastic(col.cap); const cap = new THREE.Group(); cap.name = 'cap';
    const c1 = new THREE.Mesh(lathe(spline([[0.001, 0], [0.33, 0], [0.345, 0.03], [0.345, 0.3], [0.32, 0.36], [0.2, 0.39], [0.001, 0.395]], 40), 72), capM); c1.position.y = 1.62; cap.add(c1);
    const seam = new THREE.Mesh(new THREE.TorusGeometry(0.346, 0.006, 8, 96), plastic(PALETTE.ink, { roughness: 0.6 })); seam.rotation.x = Math.PI / 2; seam.position.y = 1.62 + 0.24; cap.add(seam);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), capM); lip.position.set(0, 1.62 + 0.25, 0.35); cap.add(lip);
    root.add(cap); height = 2.02;
  } else if (form === 'tube') {
    const capM = plastic(col.cap); const cap = new THREE.Mesh(lathe(spline([[0.001, 0], [0.3, 0], [0.32, 0.03], [0.32, 0.3], [0.25, 0.36], [0.16, 0.38], [0.15, 0.42]], 30), 64), capM); cap.name = 'cap'; root.add(cap);
    const H = 1.75, y0 = 0.4; const geo = new THREE.CylinderGeometry(0.44, 0.44, H, 96, 60, true); geo.rotateY(Math.PI); geo.translate(0, H / 2 + y0, 0);
    const pos = geo.attributes.position; const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const t = (v.y - y0) / H; const sh = Math.min(1, t * 0.18); const flat = Math.pow(t, 1.6); const neck = t < 0.06 ? 0.55 + 0.45 * Math.sin((t / 0.06) * Math.PI / 2) : 1; v.x *= neck * (1 + 0.32 * flat); v.z *= neck * (1 - 0.94 * flat) ; v.y += sh * 0; pos.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals();
    const tubeM = new THREE.MeshPhysicalMaterial({ color: col.bottle, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2, sheen: 0.2 });
    const body = new THREE.Mesh(geo, tubeM); body.name = 'body'; root.add(body);
    // label = same skin, slightly larger, label artwork on the front half only
    const lc = document.createElement('canvas'); lc.width = 2048; lc.height = 1100; const g = lc.getContext('2d');
    const art = labelCanvas(p, { w: 640, h: 700, clear: true }).image; g.clearRect(0, 0, 2048, 1100);
    g.drawImage(art, 1024 - 320, 330, 640, 700); // centred on u = 0.5, which faces +z after the rotateY(PI)
    const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = 8;
    const lg = geo.clone(); lg.scale(1.006, 1, 1.02);
    const label = new THREE.Mesh(lg, new THREE.MeshPhysicalMaterial({ map: lt, transparent: true, alphaTest: 0.5, roughness: 0.45, clearcoat: 0.5, polygonOffset: true, polygonOffsetFactor: -2 })); label.name = 'label'; root.add(label);
    const crimp = new THREE.Mesh(new THREE.BoxGeometry(0.44 * 2 * 1.32, 0.16, 0.05), tubeM); crimp.position.y = y0 + H + 0.06; root.add(crimp);
    for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.008, 0.056), plastic(col.accent, { roughness: 0.5 })); l.position.y = y0 + H + 0.0 + i * 0.02; root.add(l); }
    height = y0 + H + 0.15;
  } else if (form === 'jar') {
    const prof = [[0.001, 0], [0.62, 0], [0.68, 0.03], [0.7, 0.1], [0.7, 0.52], [0.66, 0.56], [0.6, 0.58], [0.6, 0.64]];
    const pts = spline(prof); const body = new THREE.Mesh(lathe(pts), new THREE.MeshPhysicalMaterial({ color: col.bottle, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06, transmission: 0.25, thickness: 0.8, ior: 1.5 })); body.name = 'body'; root.add(body);
    const cream = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 72), liquidMat(col.liquid)); cream.position.y = 0.3; cream.name = 'liquid'; root.add(cream);
    root.add(wallLabel(p, 0.705, 0.13, 0.5, 2.6));
    const lid = new THREE.Mesh(lathe(spline([[0.001, 0], [0.7, 0], [0.72, 0.025], [0.72, 0.24], [0.69, 0.29], [0.5, 0.31], [0.001, 0.31]], 40), 96), plastic(col.cap, { roughness: 0.28, clearcoat: 0.9 })); lid.position.y = 0.555; lid.name = 'cap'; root.add(lid);
    height = 0.92;
  } else if (form === 'dropper') {
    const prof = [[0.001, 0], [0.34, 0], [0.4, 0.03], [0.42, 0.1], [0.42, 0.95], [0.38, 1.06], [0.24, 1.14], [0.16, 1.18], [0.155, 1.25]];
    root.add(bottleBody(p, prof, 0.92, [0.2, 0.86]));
    const capM = plastic(col.cap, { roughness: 0.25, metalness: 0.1 }); const cap = new THREE.Group(); cap.name = 'cap';
    const collar = new THREE.Mesh(lathe(spline([[0.001, 0], [0.2, 0], [0.21, 0.02], [0.21, 0.3], [0.19, 0.32], [0.001, 0.32]], 30), 64), capM); collar.position.y = 1.2; cap.add(collar);
    const bulb = new THREE.Mesh(lathe(spline([[0.001, 0], [0.14, 0], [0.15, 0.08], [0.15, 0.3], [0.12, 0.42], [0.06, 0.47], [0.001, 0.48]], 30), 48), new THREE.MeshPhysicalMaterial({ color: '#F4F1E8', roughness: 0.55, sheen: 0.4 })); bulb.position.y = 1.52; cap.add(bulb);
    root.add(cap); height = 2.0;
  }
  root.userData.height = height; root.userData.product = p;
  root.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  return root;
}

/* ---------- ingredients ---------- */
export function makeLeaf(color = '#4E8A5E', len = 0.6) {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(len * 0.25, len * 0.22, len * 0.75, len * 0.2, len, 0); s.bezierCurveTo(len * 0.75, -len * 0.2, len * 0.25, -len * 0.22, 0, 0);
  const g = new THREE.ShapeGeometry(s, 16); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -Math.pow(x / len, 2) * len * 0.25 + Math.abs(y) * 0.35); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color, roughness: 0.45, sheen: 0.6, sheenColor: new THREE.Color('#e9f5d9'), side: THREE.DoubleSide, clearcoat: 0.3 }));
  return m;
}
export function makeSprig(len = 1.1) {
  const grp = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, len * 0.35, 0.02), new THREE.Vector3(-0.02, len * 0.7, -0.03), new THREE.Vector3(0.04, len, 0)]);
  grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.014, 6), new THREE.MeshStandardMaterial({ color: '#6B5A3A', roughness: 0.8 })));
  const needle = new THREE.CylinderGeometry(0.006, 0.016, 0.2, 5); needle.translate(0, 0.1, 0);
  const n = 46; const im = new THREE.InstancedMesh(needle, new THREE.MeshPhysicalMaterial({ color: '#3F6E4C', roughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color('#bfe0c4') }), n);
  const o = new THREE.Object3D(); for (let i = 0; i < n; i++) { const t = 0.08 + (i / n) * 0.9; const pt = curve.getPoint(t); o.position.copy(pt); const side = i % 2 ? 1 : -1; o.rotation.set(0.5 * side + Math.sin(i) * 0.2, (i * 2.4) % (Math.PI * 2), side * (0.9 - t * 0.4)); const sc = 1 - t * 0.45; o.scale.set(sc, sc, sc); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
  grp.add(im); return grp;
}
export function makeDroplet(r = 0.07) {
  const g = new THREE.SphereGeometry(r, 32, 24); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > 0) { p.setY(i, y * (1 + (y / r) * 0.6)); const k = 1 - (y / r) * 0.25; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } }
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, transmission: 1, thickness: 0.15, ior: 1.33, clearcoat: 1 }));
}
export function makeBubbles(n = 60, coarse = false) {
  const g = new THREE.SphereGeometry(1, coarse ? 20 : 28, coarse ? 14 : 20);
  const m = new THREE.MeshPhysicalMaterial({ color: '#f6fbf7', roughness: 0.04, metalness: 0.0, iridescence: 1, iridescenceIOR: 1.3, iridescenceThicknessRange: [220, 680], clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.38, envMapIntensity: 2.2, depthWrite: false, specularIntensity: 1 });
  const im = new THREE.InstancedMesh(g, m, n); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.userData.seeds = Array.from({ length: n }, (_, i) => ({ a: Math.random() * Math.PI * 2, r: 0.5 + Math.random() * 1.2, y: Math.random() * 3, s: 0.025 + Math.pow(Math.random(), 2) * 0.09, sp: 0.15 + Math.random() * 0.35, w: Math.random() * 6 }));
  return im;
}
export function stepBubbles(im, t, { spread = 1, rise = 1, cy = 0 } = {}) {
  const o = new THREE.Object3D(); const S = im.userData.seeds;
  for (let i = 0; i < S.length; i++) { const s = S[i]; const y = ((s.y + t * s.sp * rise) % 3.4) - 0.6; const r = s.r * spread; o.position.set(Math.cos(s.a + t * 0.2) * r + Math.sin(t + s.w) * 0.05, y + cy, Math.sin(s.a + t * 0.2) * r * 0.7); const k = s.s * Math.min(1, (y + 0.6) * 3) * Math.min(1, (2.8 - y) * 2); o.scale.setScalar(Math.max(0.0001, k)); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
  im.instanceMatrix.needsUpdate = true;
}

export function webglOK() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* frame an object from its bounding sphere (portrait-safe) */
export function fitDistance(camera, radius, fill = 0.7) {
  const v = THREE.MathUtils.degToRad(camera.fov); const h = 2 * Math.atan(Math.tan(v / 2) * camera.aspect);
  return radius / Math.sin(Math.min(v, h) / 2) / fill;
}
export { THREE };
