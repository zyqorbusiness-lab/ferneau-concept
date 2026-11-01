/* Ferneau site chrome: concept bar, header, footer, toast, product cards. Concept by Zyqor Studio — fictional brand. */
import * as db from './db.js';
export { db };
const I = {
  search: '<path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', menu: '<path d="M3 7h18M3 12h18M3 17h18"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', minus: '<path d="M5 12h14"/>', trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
};
export const icon = (n, s = 21) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const mark = '<svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 29V9" stroke="#234A3A" stroke-width="2" stroke-linecap="round"/><path d="M16 12c-5-1-8-4-9-9 5 0 8.5 3 9 9Zm0 7c5-1 8-4 9-9-5 0-8.5 3-9 9Zm0 6c-4-.6-6.5-3-7.3-7 4 0 6.8 2.4 7.3 7Z" fill="#D9764A"/></svg>';
export const money = db.money;
const here = location.pathname.replace(/index\.html$/, '');
const navItems = [['/shop.html', 'Shop'], ['/account.html#wishlist', 'Wishlist'], ['/#ritual', 'Ritual'], ['/track.html', 'Track order'], ['/#case-study', 'Case study'], ['/app/', 'Mobile app']];
export function mountChrome() {
  const bar = document.createElement('div'); bar.className = 'concept-bar';
  bar.innerHTML = 'Concept project by <a href="/#case-study">Zyqor Studio</a> — fictional brand. Demo store: no real orders or payments.';
  const h = document.createElement('header'); h.className = 'hdr';
  h.innerHTML = `<div class="wrap"><a class="logo" href="/" aria-label="Ferneau home">${mark}FERNEAU</a>
  <nav class="nav" id="nav" aria-label="Main">${navItems.filter(([u]) => innerWidth < 861 || u !== '/account.html#wishlist').map(([u, t]) => `<a href="${u}"${here === u ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <div class="icons"><a class="ib" href="/shop.html?focus=1" aria-label="Search">${icon('search')}</a><a class="ib" href="/account.html" aria-label="Account">${icon('user')}</a>
  <a class="ib" href="/account.html#wishlist" aria-label="Wishlist">${icon('heart')}<span class="badge" id="wb"></span></a>
  <a class="ib" href="/cart.html" aria-label="Bag">${icon('bag')}<span class="badge" id="cb"></span></a>
  <button class="ib menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="nav">${icon('menu')}</button></div></div>`;
  document.body.prepend(h); document.body.prepend(bar);
  const mb = h.querySelector('.menu-btn'); mb.onclick = () => { const o = h.querySelector('.nav').classList.toggle('open'); mb.setAttribute('aria-expanded', o); mb.innerHTML = icon(o ? 'x' : 'menu'); };
  const f = document.createElement('footer'); f.className = 'ftr';
  f.innerHTML = `<div class="wrap"><div class="cols">
   <div><a class="logo" href="/" style="color:#F4F1E8">FERNEAU</a><p style="margin-top:16px;max-width:34ch;font-size:14.5px;color:#C9DCCF">Botanical hair care, built around the scalp. A fictional brand designed and built by Zyqor Studio as a portfolio concept.</p></div>
   <div><h4>Shop</h4><ul><li><a href="/shop.html?category=Shampoo">Shampoo</a></li><li><a href="/shop.html?category=Conditioner">Conditioner</a></li><li><a href="/shop.html?category=Mask">Masks</a></li><li><a href="/shop.html?category=Sets">Sets</a></li></ul></div>
   <div><h4>Demo</h4><ul><li><a href="/app/">Mobile app (Expo)</a></li><li><a href="/admin/">Admin dashboard</a></li><li><a href="/track.html">Track an order</a></li><li><a href="/#case-study">Case study</a></li></ul></div>
   <div><h4>Credits</h4><ul style="font-size:13px;color:#C9DCCF"><li>Every bottle, leaf and bubble is modelled in code with three.js (MIT); product images are our own renders. No stock photos.</li><li>Fonts: Fraunces and DM Sans (SIL Open Font License).</li><li><a href="/CREDITS.md">Full credits</a></li></ul></div></div>
   <div class="legal"><span>Concept project by Zyqor Studio — fictional brand. Ratings shown are sample data, not real reviews. No payment is ever taken.</span><span>© 2026 Zyqor Studio</span></div></div>`;
  document.body.append(f);
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.id = 'toast'; document.body.append(t);
  refreshBadges(); db.subscribe(refreshBadges);
}
export async function refreshBadges() {
  const c = await db.cartDetail(); const w = await db.getWishlist();
  const cb = document.getElementById('cb'), wb = document.getElementById('wb');
  if (cb) { cb.textContent = c.count || ''; cb.dataset.n = c.count; } if (wb) { wb.textContent = w.length || ''; wb.dataset.n = w.length; }
}
let tt; export function toast(html) { const t = document.getElementById('toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600); }
export function card(p, wish = []) {
  const on = wish.includes(p.id);
  return `<article class="pc" data-id="${p.id}">
   <a class="ph" href="/product.html?id=${p.id}" aria-label="${p.name}"><img src="/${p.image}" alt="${p.name}, ${p.size} — 3D render" loading="lazy" width="600" height="733"></a>
   ${p.badge ? `<span class="tagpos tag ${p.badge === 'Low stock' ? 'clay' : ''}">${p.badge}</span>` : ''}
   <button class="heart" aria-pressed="${on}" aria-label="Save ${p.name} to wishlist" data-wish="${p.id}">${icon('heart')}</button>
   <div class="bd"><span class="meta">${p.category} · ${p.size}</span><a class="nm" href="/product.html?id=${p.id}">${p.name}</a>
   <span class="stars">★ ${p.rating} <span class="muted" style="font-weight:400">· ${p.reviews} sample ratings</span></span>
   <div class="row"><span class="price">${money(p.price)}<span class="mrp">${money(p.mrp)}</span></span><button class="add" data-add="${p.id}" aria-label="Add ${p.name} to bag">${icon('plus')}</button></div></div></article>`;
}
export function wireCards(root) {
  root.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-add]'); const w = e.target.closest('[data-wish]');
    if (a) { e.preventDefault(); await db.addToCart(a.dataset.add); const p = await db.getProduct(a.dataset.add); toast(`${icon('check', 18)} ${p.name} added to your bag · <a href="/cart.html">View bag</a>`); }
    if (w) { e.preventDefault(); const on = await db.toggleWish(w.dataset.wish); w.setAttribute('aria-pressed', on); toast(on ? `${icon('heart', 18)} Saved to wishlist` : 'Removed from wishlist'); }
  });
}
