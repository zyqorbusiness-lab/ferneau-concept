import { ND } from '../theme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import type { Order } from '../api/db';
import { C, F, R } from '../theme';
import { Btn, Card, Row, T } from '../ui';

export default function Success({ route, navigation }: any) {
  const ins = useSafeAreaInsets(); const [o, setO] = useState<Order | null>(null);
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { api.getOrder(route.params?.id).then(setO); Animated.spring(a, { toValue: 1, friction: 6, useNativeDriver: ND }).start(); }, [route.params?.id, a]);
  return (
    <View testID="success" style={{ flex: 1, backgroundColor: C.paper, paddingTop: ins.top + 30, paddingBottom: ins.bottom + 20, paddingHorizontal: 22 }}>
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center', transform: [{ scale: a }] }}>
          <View style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: C.fern, alignItems: 'center', justifyContent: 'center' }}><Feather name="check" size={38} color={C.paper} /></View>
        </Animated.View>
        <T v="eyebrow" style={{ marginTop: 26 }}>Order placed</T>
        <T v="h1" style={{ textAlign: 'center', marginTop: 8 }}>Thank you{o?.name ? `, ${o.name.split(' ')[0]}` : ''}!</T>
        <T v="small" style={{ textAlign: 'center', fontSize: 15, marginTop: 8, lineHeight: 22 }}>Your ritual is being packed with care.{'\n'}This is a demo order — nothing was charged.</T>
      </View>
      {o ? (
        <Card style={{ marginTop: 26 }}>
          <Row label="Order ID" value={o.id} strong />
          <Row label="Arriving by" value={api.eta(o)} />
          <Row label="Payment" value={o.payment} />
          <Row label="Total" value={api.money(o.total)} />
          {o.paymentRef ? <Text style={{ fontFamily: F.body, fontSize: 12, color: C.faint, marginTop: 6 }}>Ref {o.paymentRef}</Text> : null}
        </Card>
      ) : null}
      <View style={{ flex: 1 }} />
      <Btn testID="track-order" title="Track order" icon="map-pin" onPress={() => o && navigation.replace('Tracking', { id: o.id })} />
      <Btn kind="ghost" title="Continue shopping" onPress={() => navigation.navigate('Main', { screen: 'Shop' })} style={{ marginTop: 6 }} />
    </View>
  );
}
