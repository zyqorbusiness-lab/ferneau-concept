import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as api from '../api/db';
import type { Product } from '../api/db';
import { C, F, R } from '../theme';
import { Btn, HeartBtn, Price, ProductImage, Stepper, T, TopBar, Badge, useW, IconBtn } from '../ui';
import { useApp } from '../store';

export default function ProductScreen({ route, navigation }: any) {
  const ins = useSafeAreaInsets(); const app = useApp(); const W = useW();
  const [p, setP] = useState<Product | null>(route.params?.p || null); const [qty, setQty] = useState(1); const [busy, setBusy] = useState(false); const [solid, setSolid] = useState(false);
  useEffect(() => { api.getProduct(route.params?.id).then(setP); }, [route.params?.id]);
  if (!p) return <View style={{ flex: 1, backgroundColor: C.paper }}><TopBar /></View>;
  const on = app.wish.includes(p.id); const out = p.stock <= 0;
  const add = async () => { setBusy(true); await api.addToCart(p.id, qty); setBusy(false); app.toast(`${qty} × ${p.name.split(' ').slice(0, 2).join(' ')} added`, { label: 'View bag', onPress: () => navigation.navigate('Main', { screen: 'Bag' }) }); };
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }} testID="product">
      <ScrollView contentContainerStyle={{ paddingBottom: 130 + ins.bottom }} showsVerticalScrollIndicator={false} scrollEventThrottle={16} onScroll={(e) => { const s = e.nativeEvent.contentOffset.y > Math.min(W * 1.08, 470) - 90; if (s !== solid) setSolid(s); }}>
        <View>
          <ProductImage id={p.id} tint={C.sage} style={{ width: W, height: Math.min(W * 1.08, 470), borderRadius: 0, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 }} pad={36} />
          <View style={{ position: 'absolute', left: 22, bottom: 20 }}><Badge text={p.badge} /></View>
        </View>
        <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
          <T v="eyebrow">{p.category} · {p.form}</T>
          <T v="h1" style={{ marginTop: 8, fontSize: 29, lineHeight: 34 }}>{p.name}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <Ionicons name="star" size={15} color={C.terra} />
            <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: C.ink }}>{p.rating.toFixed(1)}</Text>
            <Text style={{ fontFamily: F.body, fontSize: 13, color: C.muted }}>· {p.reviews} sample ratings (demo data)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 }}>
            <View><Price p={p} big /><T v="small" style={{ fontSize: 12, marginTop: 2 }}>Inclusive of all taxes</T></View>
            <View style={{ borderWidth: 1.5, borderColor: C.fern, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 7 }}><Text style={{ fontFamily: F.semi, fontSize: 13.5, color: C.fern }}>{p.size}</Text></View>
          </View>
          <T style={{ marginTop: 16, fontSize: 15.5, lineHeight: 23, color: C.fernSoft }}>{p.desc}</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {[...p.hairTypes.map((h) => h + ' hair'), ...p.concerns].map((t) => <View key={t} style={{ backgroundColor: C.mist, borderRadius: R.pill, paddingHorizontal: 11, paddingVertical: 6 }}><Text style={{ fontFamily: F.medium, fontSize: 12.5, color: C.fern }}>{t}</Text></View>)}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            {[{ i: 'truck', t: p.price >= 999 ? 'Free delivery' : 'Free over ₹999' }, { i: 'package', t: out ? 'Sold out' : p.stock < 15 ? `Only ${p.stock} left` : 'In stock' }, { i: 'refresh-ccw', t: '7-day returns' }].map((x) => (
              <View key={x.t} style={{ flex: 1, backgroundColor: C.card, borderRadius: R.md, paddingVertical: 12, alignItems: 'center', gap: 6 }}>
                <Feather name={x.i as any} size={17} color={x.t.startsWith('Only') ? C.terra : C.fern} />
                <Text style={{ fontFamily: F.medium, fontSize: 12, color: C.ink, textAlign: 'center' }}>{x.t}</Text>
              </View>
            ))}
          </View>
          <T v="h3" style={{ marginTop: 26 }}>Key ingredients</T>
          <View style={{ marginTop: 10, backgroundColor: C.card, borderRadius: R.lg, paddingHorizontal: 16 }}>
            {p.ingredients.map((g, k) => (
              <View key={g} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderTopWidth: k ? 1 : 0, borderColor: C.line }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center' }}><Feather name="feather" size={14} color={C.fern} /></View>
                <Text style={{ fontFamily: F.medium, fontSize: 14.5, color: C.ink }}>{g}</Text>
              </View>
            ))}
          </View>
          <T v="h3" style={{ marginTop: 24 }}>How to use</T>
          <View style={{ marginTop: 10, backgroundColor: C.mist, borderRadius: R.lg, padding: 16, flexDirection: 'row', gap: 12 }}>
            <Feather name="info" size={18} color={C.fern} style={{ marginTop: 2 }} />
            <T style={{ flex: 1, color: C.fernSoft }}>{p.howto}</T>
          </View>
        </View>
      </ScrollView>
      <TopBar transparent solid={solid} title={p.name} right={<View style={{ flexDirection: 'row', gap: 10 }}>
          <HeartBtn testID="wish-toggle" on={on} onPress={async () => { const now = await app.toggleWish(p.id); app.toast(now ? 'Saved to wishlist' : 'Removed from wishlist'); }} />
          <IconBtn icon="shopping-bag" label="Bag" badge={app.cart.count} onPress={() => navigation.navigate('Main', { screen: 'Bag' })} />
        </View>} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.card, paddingHorizontal: 20, paddingTop: 14, paddingBottom: ins.bottom + 14, borderTopLeftRadius: 24, borderTopRightRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 14, boxShadow: '0px -6px 24px rgba(35,74,58,0.10)' }}>
        <Stepper testID="qty" value={qty} onChange={(n) => setQty(Math.max(1, n))} />
        <Btn testID="add-to-bag" title={out ? 'Sold out' : `Add to bag · ${api.money(p.price * qty)}`} icon="shopping-bag" disabled={out} loading={busy} onPress={add} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
