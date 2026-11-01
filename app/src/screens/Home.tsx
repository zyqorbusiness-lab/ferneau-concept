import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import type { Product } from '../api/db';
import { C, F, R, shadow } from '../theme';
import { Btn, Chip, IconBtn, ProductCard, ProductImage, T, useW, IconName } from '../ui';
import { useApp } from '../store';

const HAIR: { t: string; icon: IconName; note: string; bg: string }[] = [
  { t: 'Oily', icon: 'droplet', note: 'Light, clarifying', bg: C.mist },
  { t: 'Dry', icon: 'sun', note: 'Deep moisture', bg: '#EFE6D6' },
  { t: 'Curly', icon: 'wind', note: 'Define + hold', bg: '#F3E1D8' },
  { t: 'Fine', icon: 'feather', note: 'Weightless volume', bg: C.sage },
];

export default function Home({ navigation }: any) {
  const ins = useSafeAreaInsets(); const app = useApp(); const W = useW();
  const [best, setBest] = useState<Product[]>([]); const [hero, setHero] = useState<Product | null>(null);
  useEffect(() => { api.listProducts({ sort: 'popular' }).then((r) => setBest(r.slice(0, 6))); api.getProduct('p01').then(setHero); }, []);
  const shop = (params: any) => navigation.navigate('Shop', { ...params, ts: Date.now() });
  const first = (app.user?.name || '').split(' ')[0];
  const cw = Math.round((W - 40 - 12) / 2.15);
  return (
    <ScrollView testID="home" style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ paddingTop: ins.top + 10, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 10 }}>
        <View style={{ flex: 1 }}>
          <T v="small">{first ? `Hi ${first},` : 'Hello there,'}</T>
          <Text style={{ fontFamily: F.displayBold, fontSize: 25, color: C.fern, letterSpacing: -0.5 }}>Ferneau</Text>
        </View>
        <IconBtn icon="search" label="Search" onPress={() => shop({ focus: true })} />
        <IconBtn icon="shopping-bag" label="Bag" badge={app.cart.count} onPress={() => navigation.navigate('Bag')} />
      </View>

      {hero ? (
        <Pressable testID="hero" onPress={() => navigation.navigate('Product', { id: hero.id, p: hero })} style={({ pressed }) => [{ marginHorizontal: 20, marginTop: 18, borderRadius: 28, backgroundColor: C.sage, overflow: 'hidden', height: 300, transform: [{ scale: pressed ? 0.99 : 1 }] }]}>
          <View style={{ position: 'absolute', right: -60, top: -40, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(244,241,232,0.55)' }} />
          <ProductImage id={hero.id} tint="transparent" style={{ position: 'absolute', right: -22, top: -6, bottom: -18, width: '60%' }} pad={0} />
          <View style={{ padding: 22, width: '58%', flex: 1 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: C.terra, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontFamily: F.semi, fontSize: 11, color: C.paper }}>Bestseller</Text></View>
            <T v="h2" style={{ marginTop: 14, fontSize: 26, lineHeight: 30 }}>Roots first.{'\n'}Shine follows.</T>
            <T v="small" style={{ marginTop: 8, color: C.fernSoft }} numberOfLines={3}>{hero.name} with rosemary leaf and pea sprout.</T>
            <View style={{ flex: 1 }} />
            <Btn small title="Shop now" iconRight="arrow-right" onPress={() => navigation.navigate('Product', { id: hero.id })} style={{ alignSelf: 'flex-start' }} />
          </View>
        </Pressable>
      ) : <View style={{ height: 318 }} />}

      <View style={{ marginTop: 26 }}>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T v="h3">Categories</T>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginTop: 12 }}>
          {api.FILTERS.categories.filter((c) => c !== 'All').map((c) => <Chip key={c} label={c} testID={'cat-' + c} onPress={() => shop({ category: c })} />)}
        </ScrollView>
      </View>

      <View style={{ marginTop: 28 }}>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T v="h3">Bestsellers</T>
          <Pressable onPress={() => shop({ sort: 'popular' })} hitSlop={8}><Text style={{ fontFamily: F.semi, fontSize: 14, color: C.fernSoft }}>See all</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, marginTop: 14 }} snapToInterval={cw + 12} decelerationRate="fast">
          {best.map((p) => <ProductCard key={p.id} p={p} width={cw} />)}
        </ScrollView>
      </View>

      <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
        <T v="h3">Shop by hair type</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
          {HAIR.map((h) => (
            <Pressable key={h.t} testID={'hair-' + h.t} onPress={() => shop({ hairType: h.t })} style={({ pressed }) => [{ width: (W - 52) / 2, backgroundColor: h.bg, borderRadius: R.lg, padding: 16, height: 104, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}><Feather name={h.icon} size={17} color={C.fern} /></View>
              <Text style={{ fontFamily: F.display, fontSize: 18, color: C.ink, marginTop: 10 }}>{h.t}</Text>
              <T v="small" style={{ fontSize: 12.5 }}>{h.note}</T>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[{ marginTop: 26, marginHorizontal: 20, backgroundColor: C.fern, borderRadius: R.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }, shadow]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.display, fontSize: 19, color: C.paper }}>10% off your first ritual</Text>
          <Text style={{ fontFamily: F.body, fontSize: 13.5, color: C.sage, marginTop: 4 }}>Use code ROOTS10 at checkout · free shipping over ₹999</Text>
        </View>
        <Feather name="gift" size={26} color="#F2B392" />
      </View>
      <T v="small" style={{ textAlign: 'center', marginTop: 24, fontSize: 12 }}>Concept project by Zyqor Studio — fictional brand</T>
    </ScrollView>
  );
}
