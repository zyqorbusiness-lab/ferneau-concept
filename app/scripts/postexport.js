// Post-export step for static hosting: some static hosts drop any folder named node_modules,
// so move dist/assets/node_modules -> dist/assets/nm and rewrite the bundle's asset URLs.
const fs = require('fs'); const path = require('path');
const dist = path.join(__dirname, '..', 'dist');
const from = path.join(dist, 'assets', 'node_modules'), to = path.join(dist, 'assets', 'nm');
if (fs.existsSync(from)) { fs.rmSync(to, { recursive: true, force: true }); fs.renameSync(from, to); }
const jsDir = path.join(dist, '_expo', 'static', 'js', 'web');
for (const f of fs.readdirSync(jsDir)) {
  const p = path.join(jsDir, f); const s = fs.readFileSync(p, 'utf8'); const n = s.split('/assets/node_modules/').join('/assets/nm/');
  if (n !== s) { fs.writeFileSync(p, n); console.log('rewrote', f); }
}
