/* product viewer: the same code-built bottle as the home page, drag to turn (OrbitControls, no zoom on phone). */
import { THREE, makeRenderer, studio, buildProduct, contactShadow, fontsReady, webglOK, reduced, fitDistance, makeBubbles, stepBubbles } from './ferneau3d.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export async function mount(box, canvas, p) {
  if (!webglOK()) { box.querySelector('.hint').textContent = 'Photo view (3D needs WebGL)'; return; }
  await fontsReady();
  const coarse = matchMedia('(pointer: coarse)').matches; const RM = reduced();
  const r = makeRenderer(canvas, { coarse }); const scene = new THREE.Scene(); studio(r, scene, coarse);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.05, 50);
  const g = buildProduct(p); const H = g.userData.height; scene.add(g); scene.add(contactShadow(p.form === 'jar' ? 1.15 : 0.85, 0.5));
  const bub = makeBubbles(coarse ? 14 : 22, coarse); bub.scale.setScalar(0.7); scene.add(bub);
  const ctl = new OrbitControls(cam, canvas); ctl.enableZoom = !coarse; ctl.enablePan = false; ctl.minDistance = 2; ctl.maxDistance = 12; ctl.minPolarAngle = 0.6; ctl.maxPolarAngle = 1.75; ctl.enableDamping = true; ctl.autoRotate = !RM; ctl.autoRotateSpeed = 1.2;
  ctl.target.set(0, H * 0.47, 0);
  function size() { const w = box.clientWidth, h = box.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); const d = fitDistance(cam, Math.max(H * 0.56, p.form === 'jar' ? 0.95 : 0.6), 0.8); const dir = cam.position.clone().sub(ctl.target); if (dir.lengthSq() < 0.01) dir.set(Math.sin(-0.5), 0.25, Math.cos(-0.5)); dir.setLength(d); cam.position.copy(ctl.target).add(dir); }
  size(); new ResizeObserver(size).observe(box);
  ctl.addEventListener('start', () => { ctl.autoRotate = false; });
  let vis = true; new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(box);
  const clock = new THREE.Clock(); let T = 0;
  (function loop() { requestAnimationFrame(loop); if (!vis) return; const dt = clock.getDelta(); if (!RM) T += dt; stepBubbles(bub, T, { spread: 1.1, rise: 0.7 }); ctl.update(); r.render(scene, cam); })();
  box.classList.add('live'); window.__stage = { ok: true };
}
