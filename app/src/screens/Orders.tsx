import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import type { Order } from '../api/db';
import { C, F, R, shadow } from '../theme';
import { Empty, ProductImage, T, TopBar } from '../ui';
import { useApp } from '../store';

export function StatusPill({ s }: { s: string }) {
  const done = s === 'delivered'; const cancelled = s === 'cancelled';
  return <View style={{ backgroundColor: done ? C.sage : cancelled ? '#F6E3DA' : '#F7E7DC', borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 5 }}>
    <Text style={{ fontFamily: F.semi, fontSize: 12, color: done ? C.fern : cancelled ? C.danger : '#A5532C' }}>{api.STATUS_LABEL[s] || s}</Text>
  </View>;
}

export default function Orders({ navigation }: any) {
  const app = useApp(); const [list, setList] = useState<Order[] | null>(null);
  const load = useCallback(() => { if (!app.ordersEmail) { setList([]); return; } api.listOrders(app.ordersEmail).then(setList); }, [app.ordersEmail]);
  useEffect(() => { load(); return api.subscribe(() => load()); }, [load]);
  return (
    <View testID="orders" style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title="My orders" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30, gap: 12 }}>
        {list && !list.length ? <Empty icon="package" title="No orders yet" text={app.ordersEmail ? 'Orders you place will show up here with live tracking.' : 'Log in or place an order to see it here.'} cta="Start shopping" onPress={() => navigation.navigate('Main', { screen: 'Shop' })} /> : null}
        {(list || []).map((o) => (
          <Pressable key={o.id} testID={'order-' + o.id} onPress={() => navigation.navigate('Tracking', { id: o.id })} style={({ pressed }) => [{ backgroundColor: C.card, borderRadius: R.lg, padding: 16, transform: [{ scale: pressed ? 0.99 : 1 }] }, shadow]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View><Text style={{ fontFamily: F.bold, fontSize: 15.5, color: C.ink }}>#{o.id}</Text><T v="small" style={{ fontSize: 12.5 }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</T></View>
              <StatusPill s={o.status} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 }}>
              {o.items.slice(0, 3).map((i) => <ProductImage key={i.id} id={i.id} style={{ width: 46, height: 54, borderRadius: 12 }} pad={2} />)}
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text numberOfLines={1} style={{ fontFamily: F.medium, fontSize: 13.5, color: C.ink }}>{o.items.map((i) => i.name).join(', ')}</Text>
                <T v="small" style={{ fontSize: 12.5 }}>{o.items.reduce((s, i) => s + i.qty, 0)} items · {api.money(o.total)}</T>
              </View>
              <Feather name="chevron-right" size={18} color={C.faint} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
