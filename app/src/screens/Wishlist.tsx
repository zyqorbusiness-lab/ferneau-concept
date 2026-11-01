import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '../api/db';
import type { Product } from '../api/db';
import { C } from '../theme';
import { Empty, ProductCard, T, useW } from '../ui';
import { useApp } from '../store';

export default function Wishlist({ navigation }: any) {
  const ins = useSafeAreaInsets(); const app = useApp(); const W = useW();
  const [all, setAll] = useState<Product[]>([]);
  useEffect(() => { api.listProducts({}).then(setAll); }, [app.wish]);
  const items = app.wish.map((id) => all.find((p) => p.id === id)).filter(Boolean) as Product[];
  const cw = (W - 40 - 14) / 2;
  return (
    <ScrollView testID="wishlist" style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 20, paddingBottom: 30 }}>
      <T v="h1" style={{ fontSize: 30 }}>Wishlist</T>
      <T v="small" style={{ marginTop: 4, marginBottom: 18 }}>{items.length ? `${items.length} saved ${items.length === 1 ? 'item' : 'items'}` : 'Tap the heart on anything you love.'}</T>
      {!items.length ? <Empty icon="heart" title="Nothing saved yet" text="Save products to compare them later. Your wishlist stays on this device and your account." cta="Browse the shop" onPress={() => navigation.navigate('Shop')} /> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 22 }}>
        {items.map((p) => <ProductCard key={p.id} p={p} width={cw} />)}
      </View>
    </ScrollView>
  );
}
