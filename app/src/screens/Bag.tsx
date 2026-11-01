import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import { C, F, R, shadow } from '../theme';
import { Btn, Card, Empty, ProductImage, Row, Stepper, T } from '../ui';
import { useApp } from '../store';

export default function Bag({ navigation }: any) {
  const ins = useSafeAreaInsets(); const app = useApp(); const { cart } = app;
  const [code, setCode] = useState(app.coupon); const [cerr, setCerr] = useState('');
  const apply = () => { const c = code.trim().toUpperCase(); if (c === 'ROOTS10') { app.setCoupon(c); setCerr(''); app.toast('ROOTS10 applied · 10% off'); } else { setCerr(c ? 'That code is not valid. Try ROOTS10.' : 'Enter a code.'); } };
  const left = Math.max(0, 999 - (cart.subtotal - cart.discount));
  if (!cart.lines.length) return (
    <View style={{ flex: 1, backgroundColor: C.paper, paddingTop: ins.top + 10, paddingHorizontal: 20 }} testID="bag">
      <T v="h1" style={{ fontSize: 30 }}>Bag</T>
      <Empty icon="shopping-bag" title="Your bag is empty" text="Add a shampoo, mask or oil and it will wait here for you." cta="Start shopping" onPress={() => navigation.navigate('Shop')} />
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }} testID="bag">
      <ScrollView contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <T v="h1" style={{ fontSize: 30 }}>Bag</T>
        <T v="small" style={{ marginTop: 4 }}>{cart.count} {cart.count === 1 ? 'item' : 'items'}</T>
        <View style={{ marginTop: 16, backgroundColor: C.mist, borderRadius: R.md, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="truck" size={16} color={C.fern} />
            <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: C.ink }}>{left ? `Add ${api.money(left)} more for free shipping` : 'You unlocked free shipping'}</Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: C.card, marginTop: 10, overflow: 'hidden' }}><View style={{ height: 6, borderRadius: 3, backgroundColor: left ? C.fern : C.terra, width: `${Math.min(100, ((cart.subtotal - cart.discount) / 999) * 100)}%` }} /></View>
        </View>
        <View style={{ marginTop: 16, gap: 12 }}>
          {cart.lines.map((l) => (
            <View key={l.id} style={[{ flexDirection: 'row', gap: 14, backgroundColor: C.card, borderRadius: R.lg, padding: 12 }, shadow]} testID={'line-' + l.id}>
              <Pressable onPress={() => navigation.navigate('Product', { id: l.id })}><ProductImage id={l.id} style={{ width: 84, height: 100, borderRadius: 14 }} pad={6} /></Pressable>
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={2} style={{ fontFamily: F.semi, fontSize: 14.5, color: C.ink, lineHeight: 19 }}>{l.product.name}</Text>
                    <T v="small" style={{ fontSize: 12.5 }}>{l.product.size}</T>
                  </View>
                  <Pressable accessibilityLabel="Remove" hitSlop={8} onPress={() => api.setQty(l.id, 0)}><Feather name="trash-2" size={16} color={C.faint} /></Pressable>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 15.5, color: C.ink }}>{api.money(l.product.price * l.qty)}</Text>
                  <Stepper testID={'qty-' + l.id} value={l.qty} onChange={(n) => api.setQty(l.id, n)} />
                </View>
              </View>
            </View>
          ))}
        </View>
        <T v="h3" style={{ marginTop: 24, marginBottom: 10 }}>Coupon</T>
        {app.coupon ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.sage, borderRadius: R.md, padding: 14 }}>
            <Feather name="tag" size={17} color={C.fern} />
            <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 14.5, color: C.ink }}>{app.coupon} applied · 10% off</Text>
            <Pressable onPress={() => { app.setCoupon(''); setCode(''); }} hitSlop={8}><Text style={{ fontFamily: F.semi, fontSize: 14, color: C.terra }}>Remove</Text></Pressable>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput testID="coupon" value={code} onChangeText={(t) => { setCode(t); setCerr(''); }} autoCapitalize="characters" placeholder="Enter code" placeholderTextColor={C.faint}
                style={{ flex: 1, height: 50, borderRadius: 14, backgroundColor: C.card, borderWidth: 1.2, borderColor: cerr ? C.danger : C.line, paddingHorizontal: 15, fontFamily: F.medium, fontSize: 15, color: C.ink, outlineStyle: 'none' } as any} />
              <Btn testID="apply-coupon" title="Apply" kind="soft" onPress={apply} style={{ height: 50 }} />
            </View>
            <Text style={{ fontFamily: F.medium, fontSize: 12.5, color: cerr ? C.danger : C.muted, marginTop: 7 }}>{cerr || 'Demo hint: ROOTS10 takes 10% off.'}</Text>
          </>
        )}
        <Card style={{ marginTop: 20 }}>
          <Row label="Subtotal" value={api.money(cart.subtotal)} />
          {cart.discount ? <Row label="Discount (ROOTS10)" value={'− ' + api.money(cart.discount)} color={C.terra} /> : null}
          <Row label="Shipping" value={cart.shipping ? api.money(cart.shipping) : 'Free'} color={cart.shipping ? undefined : C.fernSoft} />
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 8 }} />
          <Row label="Total" value={api.money(cart.total)} strong />
        </Card>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, backgroundColor: C.paper, borderTopWidth: 1, borderColor: C.line }}>
        <Btn testID="checkout" title={`Checkout · ${api.money(cart.total)}`} icon="lock" onPress={() => navigation.navigate('Checkout')} />
      </View>
    </View>
  );
}
