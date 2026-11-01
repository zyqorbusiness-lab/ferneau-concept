/* Ferneau demo data layer (shared by the website, the Expo app and the admin dashboard).
 * Concept project by Zyqor Studio — fictional brand, demo data only, no real payments.
 * Mimics a REST backend: every call is async with a small latency. Storage = localStorage on the web
 * (website, /admin and the Expo web build share one origin, so an order placed in the app shows up in admin),
 * or an injected async storage (AsyncStorage) on iOS/Android. The same endpoints exist in server/index.mjs (Node).
 */
import CATALOG from './catalog.js';

const K = { db: 'ferneau.db.v1', cart: 'ferneau.cart.v1', wish: 'ferneau.wish.v1', session: 'ferneau.session.v1' };
const STATUSES = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const STATUS_LABEL = { placed: 'Order placed', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

let store = null; // { getItem, setItem } (sync or async)
const mem = {};
function defaultStore() {
  try { if (typeof localStorage !== 'undefined') { localStorage.setItem('__f', '1'); localStorage.removeItem('__f'); return localStorage; } } catch (e) {}
  return { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
}
export function useStorage(s) { store = s; }
const S = () => store || (store = defaultStore());
async function read(k, d) { try { const v = await S().getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
async function write(k, v) { await S().setItem(k, JSON.stringify(v)); emit(k); return v; }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const lat = () => wait(40 + Math.random() * 80);

const subs = new Set();
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
function emit(k) { subs.forEach((f) => { try { f(k); } catch (e) {} }); }
if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('storage', (e) => { if (e.key && e.key.startsWith('ferneau.')) emit(e.key); });

function daysAgo(d, h = 10) { const t = new Date(); t.setDate(t.getDate() - d); t.setHours(h, 12, 0, 0); return t.toISOString(); }
function seedOrders() {
  const P = CATALOG.products; const mk = (n, email, name, city, items, stepIdx, d) => {
    const lines = items.map(([id, q]) => { const p = P.find((x) => x.id === id); return { id, name: p.name, price: p.price, qty: q }; });
    const sub = lines.reduce((s, l) => s + l.price * l.qty, 0); const ship = sub >= 999 ? 0 : 79;
    const history = STATUSES.slice(0, stepIdx + 1).map((s, i) => ({ status: s, at: daysAgo(d - i * 0.6, 9 + i * 2) }));
    return { id: 'FN' + n, email, name, city, items: lines, subtotal: sub, shipping: ship, total: sub + ship, payment: 'Demo UPI', status: STATUSES[stepIdx], history, createdAt: history[0].at, demo: true };
  };
  return [
    mk(10421, 'aarav.demo@example.com', 'Aarav (demo)', 'Pune', [['p01', 1], ['p02', 1]], 4, 6),
    mk(10422, 'meera.demo@example.com', 'Meera (demo)', 'Kolkata', [['p08', 2]], 3, 3),
    mk(10423, 'kabir.demo@example.com', 'Kabir (demo)', 'Bengaluru', [['p06', 1], ['p05', 1]], 2, 2),
    mk(10424, 'sara.demo@example.com', 'Sara (demo)', 'Mumbai', [['p10', 1]], 1, 1),
    mk(10425, 'demo@ferneau.example', 'Demo shopper', 'Kolkata', [['p03', 1], ['p09', 1]], 2, 2),
    mk(10426, 'ishaan.demo@example.com', 'Ishaan (demo)', 'Delhi', [['p07', 1]], 0, 0),
  ];
}
async function db() {
  let d = await read(K.db, null);
  if (!d || d.v !== CATALOG.v) {
    d = { v: CATALOG.v, products: CATALOG.products.map((p) => ({ ...p })), orders: seedOrders(), users: [{ email: 'demo@ferneau.example', name: 'Demo shopper', password: 'demo1234', phone: '+91 90000 00000', address: '12 Lake Road, Kolkata 700029' }] };
    await write(K.db, d);
  }
  return d;
}
const saveDb = (d) => write(K.db, d);

/* ---------- products ---------- */
export async function listProducts(q = {}) {
  await lat(); const d = await db(); let r = d.products.filter((p) => !p.archived);
  if (q.search) { const s = q.search.toLowerCase(); r = r.filter((p) => (p.name + ' ' + p.category + ' ' + p.short + ' ' + p.ingredients.join(' ') + ' ' + p.concerns.join(' ')).toLowerCase().includes(s)); }
  if (q.category && q.category !== 'All') r = r.filter((p) => p.category === q.category);
  if (q.hairType && q.hairType !== 'All') r = r.filter((p) => p.hairTypes.includes(q.hairType));
  if (q.concern && q.concern !== 'All') r = r.filter((p) => p.concerns.includes(q.concern));
  if (q.maxPrice) r = r.filter((p) => p.price <= q.maxPrice);
  if (q.inStock) r = r.filter((p) => p.stock > 0);
  const sorts = { price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, popular: (a, b) => b.reviews - a.reviews };
  if (q.sort && sorts[q.sort]) r = r.slice().sort(sorts[q.sort]);
  return r;
}
export async function getProduct(idOrSlug) { await lat(); const d = await db(); return d.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null; }
export async function saveProduct(p) {
  await lat(); const d = await db(); const i = d.products.findIndex((x) => x.id === p.id);
  if (i >= 0) d.products[i] = { ...d.products[i], ...p };
  else { const n = 1 + Math.max(...d.products.map((x) => +x.id.slice(1) || 0)); const base = d.products[0]; d.products.push({ ...base, rating: 0, reviews: 0, badge: 'New', ...p, id: 'p' + String(n).padStart(2, '0') }); }
  await saveDb(d); return p;
}
export async function deleteProduct(id) { await lat(); const d = await db(); d.products = d.products.filter((p) => p.id !== id); await saveDb(d); return true; }
export async function adjustStock(id, delta) { const d = await db(); const p = d.products.find((x) => x.id === id); if (p) { p.stock = Math.max(0, p.stock + delta); await saveDb(d); } return p; }
export const FILTERS = { categories: ['All', 'Shampoo', 'Conditioner', 'Mask', 'Oil', 'Scalp', 'Styling', 'Sets'], hairTypes: ['All', 'Oily', 'Dry', 'Curly', 'Fine', 'Colour-treated'], concerns: ['All', 'Scalp care', 'Repair', 'Shine', 'Frizz', 'Volume'] };

/* ---------- session ---------- */
export async function currentUser() { return read(K.session, null); }
export async function login(email, password) {
  await lat(); const d = await db(); const u = d.users.find((x) => x.email.toLowerCase() === String(email).toLowerCase().trim());
  if (!u || u.password !== password) throw new Error('That email and password do not match. Try demo@ferneau.example / demo1234.');
  const s = { email: u.email, name: u.name, phone: u.phone, address: u.address }; await write(K.session, s); return s;
}
export async function signup({ name, email, password }) {
  await lat(); const d = await db(); email = String(email || '').trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || String(password || '').length < 6) throw new Error('Add your name, a valid email and a password of 6+ characters.');
  if (d.users.some((x) => x.email.toLowerCase() === email.toLowerCase())) throw new Error('An account with this email already exists. Log in instead.');
  d.users.push({ email, name, password, phone: '', address: '' }); await saveDb(d); return login(email, password);
}
export async function updateProfile(patch) { const s = await currentUser(); if (!s) return null; const d = await db(); const u = d.users.find((x) => x.email === s.email); Object.assign(u, patch); await saveDb(d); const n = { ...s, ...patch }; await write(K.session, n); return n; }
export async function logout() { await S().setItem(K.session, 'null'); emit(K.session); }

/* ---------- cart ---------- */
export async function getCart() { return read(K.cart, []); }
export async function addToCart(id, qty = 1) { const c = await getCart(); const l = c.find((x) => x.id === id); if (l) l.qty = Math.min(9, l.qty + qty); else c.push({ id, qty }); return write(K.cart, c); }
export async function setQty(id, qty) { let c = await getCart(); c = qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty: Math.min(9, qty) } : x)); return write(K.cart, c); }
export async function clearCart() { return write(K.cart, []); }
export async function cartDetail(coupon) {
  const c = await getCart(); const d = await db();
  const lines = c.map((l) => ({ ...l, product: d.products.find((p) => p.id === l.id) })).filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = coupon && String(coupon).toUpperCase() === 'ROOTS10' ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal === 0 || subtotal - discount >= 999 ? 0 : 79;
  return { lines, count: lines.reduce((s, l) => s + l.qty, 0), subtotal, discount, shipping, total: subtotal - discount + shipping };
}

/* ---------- wishlist ---------- */
export async function getWishlist() { return read(K.wish, []); }
export async function toggleWish(id) { let w = await getWishlist(); w = w.includes(id) ? w.filter((x) => x !== id) : [...w, id]; await write(K.wish, w); return w.includes(id); }

/* ---------- orders ---------- */
export async function placeOrder({ name, email, phone, address, city, pin, payment, coupon }) {
  await wait(900); // "payment gateway" round trip (demo, nothing is charged)
  const cart = await cartDetail(coupon); if (!cart.lines.length) throw new Error('Your bag is empty.');
  const d = await db(); const id = 'FN' + (10427 + d.orders.filter((o) => !o.demo).length + Math.floor(Math.random() * 40));
  const now = new Date().toISOString();
  const order = { id, email, name, phone, address, city, pin, items: cart.lines.map((l) => ({ id: l.id, name: l.product.name, price: l.product.price, qty: l.qty })), subtotal: cart.subtotal, discount: cart.discount, shipping: cart.shipping, total: cart.total, payment, status: 'placed', history: [{ status: 'placed', at: now }], createdAt: now, paymentRef: 'pay_demo_' + Math.random().toString(36).slice(2, 10) };
  cart.lines.forEach((l) => { const p = d.products.find((x) => x.id === l.id); if (p) p.stock = Math.max(0, p.stock - l.qty); });
  d.orders.unshift(order); await saveDb(d); await clearCart(); return order;
}
export async function listOrders(email) { await lat(); const d = await db(); return email ? d.orders.filter((o) => o.email.toLowerCase() === email.toLowerCase()) : d.orders; }
export async function getOrder(id) { await lat(); const d = await db(); return d.orders.find((o) => o.id.toLowerCase() === String(id).trim().toLowerCase()) || null; }
export async function setOrderStatus(id, status) {
  const d = await db(); const o = d.orders.find((x) => x.id === id); if (!o) return null;
  if (status === 'cancelled') o.history.push({ status, at: new Date().toISOString() });
  else { const idx = STATUSES.indexOf(status); o.history = o.history.filter((h) => STATUSES.indexOf(h.status) <= idx && h.status !== 'cancelled'); STATUSES.slice(0, idx + 1).forEach((s) => { if (!o.history.some((h) => h.status === s)) o.history.push({ status: s, at: new Date().toISOString() }); }); }
  o.status = status; await saveDb(d); return o;
}
export async function advanceOrder(id) { const o = await getOrder(id); if (!o) return null; const i = STATUSES.indexOf(o.status); return setOrderStatus(id, STATUSES[Math.min(STATUSES.length - 1, i + 1)]); }
export async function resetDemo() { await S().setItem(K.db, 'null'); await S().setItem(K.cart, '[]'); await S().setItem(K.wish, '[]'); emit(K.db); return db(); }
export { STATUSES, STATUS_LABEL };
export const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
export function eta(o) { const t = new Date(o.createdAt); t.setDate(t.getDate() + 4); return t.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); }
