import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import type { Order } from '../api/db';
import { C, F, R } from '../theme';
import { Btn, Card, ProductImage, Row, T, TopBar, IconName } from '../ui';
import { StatusPill } from './Orders';
import { useApp } from '../store';

const ICON: Record<string, IconName> = { placed: 'check', packed: 'package', shipped: 'truck', out_for_delivery: 'map-pin', delivered: 'home' };
const fmt = (s: string) => new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function Tracking({ route }: any) {
  const ins = useSafeAreaInsets(); const app = useApp(); const id = route.params?.id;
  const [o, setO] = useState<Order | null>(null); const [busy, setBusy] = useState(false);
  const load = useCallback(() => api.getOrder(id).then(setO), [id]);
  useEffect(() => { load(); return api.subscribe(() => { load(); }); }, [load]);
  if (!o) return <View style={{ flex: 1, backgroundColor: C.paper }}><TopBar title="Track order" /></View>;
  const cur = api.STATUSES.indexOf(o.status); const delivered = o.status === 'delivered';
  return (
    <View testID="tracking" style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title="Track order" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: ins.bottom + 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: C.fern, borderRadius: 24, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: C.sage }}>Order #{o.id}</Text>
            <View style={{ backgroundColor: 'rgba(244,241,232,0.16)', borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontFamily: F.semi, fontSize: 12, color: C.paper }}>{api.STATUS_LABEL[o.status]}</Text></View>
          </View>
          <Text style={{ fontFamily: F.display, fontSize: 26, color: C.paper, marginTop: 14 }}>{delivered ? 'Delivered' : `Arriving ${api.eta(o)}`}</Text>
          <Text style={{ fontFamily: F.body, fontSize: 13.5, color: C.sage, marginTop: 4 }}>{delivered ? 'Enjoy your ritual. Tell us how it goes.' : 'Estimated delivery · Ferneau Express (demo)'}</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 18 }}>
            {api.STATUSES.map((s, i) => <View key={s} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= cur ? '#F2B392' : 'rgba(244,241,232,0.22)' }} />)}
          </View>
        </View>

        <Card style={{ marginTop: 16, paddingVertical: 20 }}>
          {api.STATUSES.map((s, i) => {
            const h = o.history.find((x) => x.status === s); const done = i <= cur; const now = i === cur;
            return (
              <View key={s} style={{ flexDirection: 'row', gap: 14 }} testID={'step-' + s}>
                <View style={{ alignItems: 'center', width: 34 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: done ? (now ? C.terra : C.fern) : C.mist, alignItems: 'center', justifyContent: 'center', borderWidth: now ? 4 : 0, borderColor: '#F7DCCB' }}>
                    <Feather name={ICON[s]} size={now ? 13 : 15} color={done ? C.paper : C.faint} />
                  </View>
                  {i < api.STATUSES.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 22, backgroundColor: i < cur ? C.fern : C.mist, marginVertical: 3 }} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: i < api.STATUSES.length - 1 ? 16 : 0, paddingTop: 6 }}>
                  <Text style={{ fontFamily: done ? F.semi : F.medium, fontSize: 15, color: done ? C.ink : C.faint }}>{api.STATUS_LABEL[s]}</Text>
                  <Text style={{ fontFamily: F.body, fontSize: 12.5, color: now ? C.terra : C.muted, marginTop: 2 }}>{h ? fmt(h.at) : 'Pending'}</Text>
                </View>
              </View>
            );
          })}
        </Card>

        {!delivered ? (
          <View style={{ marginTop: 14 }}>
            <Btn testID="simulate" kind="outline" icon="fast-forward" title="Simulate next step (demo)" loading={busy}
              onPress={async () => { setBusy(true); const n = await api.advanceOrder(o.id); setBusy(false); if (n) { setO(n); app.toast(api.STATUS_LABEL[n.status]); } }} />
            <T v="small" style={{ textAlign: 'center', fontSize: 12, marginTop: 8 }}>Status changes made in the Ferneau admin dashboard show up here too.</T>
          </View>
        ) : null}

        <T v="h3" style={{ marginTop: 24, marginBottom: 10 }}>Items</T>
        <Card>
          {o.items.map((i) => (
            <View key={i.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <ProductImage id={i.id} style={{ width: 46, height: 54, borderRadius: 12 }} pad={2} />
              <Text numberOfLines={1} style={{ flex: 1, fontFamily: F.medium, fontSize: 14, color: C.ink }}>{i.name} × {i.qty}</Text>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: C.ink }}>{api.money(i.price * i.qty)}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 6 }} />
          <Row label="Total paid" value={api.money(o.total)} strong />
          <Row label="Payment" value={o.payment} />
        </Card>
        {o.address || o.city ? (
          <Card style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
            <Feather name="map-pin" size={18} color={C.fern} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}><T v="label">{o.name}</T><T v="small">{[o.address, o.city, o.pin].filter(Boolean).join(', ')}</T></View>
          </Card>
        ) : null}
        <View style={{ marginTop: 12, alignItems: 'center' }}><StatusPill s={o.status} /></View>
      </ScrollView>
    </View>
  );
}
