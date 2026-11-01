// Ferneau reference API (Node.js, no dependencies): the same data layer the apps use, exposed as REST.
// Concept project by Zyqor Studio — fictional brand, demo data. Run: node server/index.mjs  (port 8790 by default)
// Production plan: swap the JSON file store for Postgres, add JWT auth, and a real payment gateway webhook.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as db from '../shared/db.js';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data.json');
let mem = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
db.useStorage({ getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; fs.writeFileSync(FILE, JSON.stringify(mem)); }, removeItem: (k) => { delete mem[k]; } });

const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS' }); res.end(JSON.stringify(body)); };
const body = (req) => new Promise((ok) => { let s = ''; req.on('data', (c) => (s += c)); req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch { ok({}); } }); });

const routes = [
  ['GET', /^\/api\/health$/, async () => ({ ok: true })],
  ['GET', /^\/api\/products$/, async (q) => db.listProducts({ search: q.get('search') || '', category: q.get('category') || 'All', hairType: q.get('hairType') || 'All', concern: q.get('concern') || 'All', sort: q.get('sort') || '', inStock: q.get('inStock') === '1' })],
  ['GET', /^\/api\/products\/([\w-]+)$/, async (q, m) => db.getProduct(m[1]) ],
  ['POST', /^\/api\/products$/, async (q, m, b) => db.saveProduct({ ...b, id: 'new' })],
  ['PUT', /^\/api\/products\/(\w+)$/, async (q, m, b) => db.saveProduct({ ...b, id: m[1] })],
  ['DELETE', /^\/api\/products\/(\w+)$/, async (q, m) => db.deleteProduct(m[1])],
  ['PATCH', /^\/api\/products\/(\w+)\/stock$/, async (q, m, b) => db.adjustStock(m[1], +b.delta || 0)],
  ['POST', /^\/api\/auth\/login$/, async (q, m, b) => db.login(b.email, b.password)],
  ['POST', /^\/api\/auth\/signup$/, async (q, m, b) => db.signup(b)],
  ['GET', /^\/api\/cart$/, async () => db.cartDetail()],
  ['POST', /^\/api\/cart$/, async (q, m, b) => { await db.addToCart(b.id, b.qty || 1); return db.cartDetail(); }],
  ['GET', /^\/api\/orders$/, async (q) => db.listOrders(q.get('email') || '')],
  ['GET', /^\/api\/orders\/(\w+)$/, async (q, m) => db.getOrder(m[1])],
  ['POST', /^\/api\/orders$/, async (q, m, b) => db.placeOrder(b)],
  ['PATCH', /^\/api\/orders\/(\w+)\/status$/, async (q, m, b) => db.setOrderStatus(m[1], b.status)],
];
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const u = new URL(req.url, 'http://x');
  for (const [meth, re, fn] of routes) { const m = u.pathname.match(re); if (m && meth === req.method) { try { const r = await fn(u.searchParams, m, ['POST', 'PUT', 'PATCH'].includes(meth) ? await body(req) : {}); return r == null ? send(res, 404, { error: 'not found' }) : send(res, 200, r); } catch (e) { return send(res, 400, { error: e.message }); } } }
  send(res, 404, { error: 'no route' });
});
server.listen(+process.env.PORT || 8790, () => console.log('Ferneau API on :' + (+process.env.PORT || 8790)));
