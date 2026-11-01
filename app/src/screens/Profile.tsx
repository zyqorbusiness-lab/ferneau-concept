import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import { C, F, R, shadow } from '../theme';
import { Btn, Card, Field, T, IconName } from '../ui';
import { useApp } from '../store';

export default function Profile({ navigation }: any) {
  const ins = useSafeAreaInsets(); const app = useApp(); const u = app.user;
  const [edit, setEdit] = useState(false); const [f, setF] = useState({ name: '', phone: '', address: '' }); const [confirm, setConfirm] = useState(false);
  const [orders, setOrders] = useState(0);
  useEffect(() => { if (u) setF({ name: u.name || '', phone: u.phone || '', address: u.address || '' }); }, [u]);
  useEffect(() => { if (app.ordersEmail) api.listOrders(app.ordersEmail).then((l) => setOrders(l.length)); else setOrders(0); }, [app.ordersEmail, app.cart]);
  const initials = (u?.name || 'Guest').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  const item = (icon: IconName, label: string, onPress: () => void, sub?: string, testID?: string, danger?: boolean) => (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, opacity: pressed ? 0.6 : 1 }]}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: danger ? '#F6E3DA' : C.mist, alignItems: 'center', justifyContent: 'center' }}><Feather name={icon} size={17} color={danger ? C.danger : C.fern} /></View>
      <View style={{ flex: 1 }}><Text style={{ fontFamily: F.semi, fontSize: 15, color: danger ? C.danger : C.ink }}>{label}</Text>{sub ? <T v="small" style={{ fontSize: 12.5 }}>{sub}</T> : null}</View>
      <Feather name="chevron-right" size={18} color={C.faint} />
    </Pressable>
  );
  return (
    <ScrollView testID="profile" style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 20, paddingBottom: 36 }} keyboardShouldPersistTaps="handled">
      <T v="h1" style={{ fontSize: 30 }}>Profile</T>
      <View style={[{ marginTop: 18, backgroundColor: C.sage, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
        <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: C.fern, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: F.display, fontSize: 21, color: C.paper }}>{initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.display, fontSize: 20, color: C.ink }}>{u?.name || 'Guest shopper'}</Text>
          <Text style={{ fontFamily: F.body, fontSize: 13.5, color: C.fernSoft }}>{u?.email || 'Log in to sync orders and wishlist'}</Text>
        </View>
        {u ? <Pressable testID="edit-profile" onPress={() => setEdit(!edit)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}><Feather name={edit ? 'x' : 'edit-2'} size={16} color={C.fern} /></Pressable> : null}
      </View>
      {!u ? <Btn testID="login-cta" title="Log in or sign up" icon="log-in" onPress={() => navigation.navigate('Auth')} style={{ marginTop: 14 }} /> : null}
      {u && edit ? (
        <Card style={{ marginTop: 14 }}>
          <Field label="Name" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
          <Field label="Mobile" value={f.phone} onChangeText={(v) => setF({ ...f, phone: v })} keyboardType="phone-pad" />
          <Field label="Saved address" value={f.address} onChangeText={(v) => setF({ ...f, address: v })} multiline />
          <Btn testID="save-profile" title="Save changes" onPress={async () => { await api.updateProfile({ name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim() }); await app.refresh(); setEdit(false); app.toast('Profile updated'); }} />
        </Card>
      ) : null}
      {u && !edit ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          {[{ k: 'Orders', v: orders }, { k: 'Wishlist', v: app.wish.length }, { k: 'In bag', v: app.cart.count }].map((x) => (
            <View key={x.k} style={[{ flex: 1, backgroundColor: C.card, borderRadius: R.md, padding: 14, alignItems: 'center' }, shadow]}>
              <Text style={{ fontFamily: F.display, fontSize: 22, color: C.ink }}>{x.v}</Text><T v="small" style={{ fontSize: 12.5 }}>{x.k}</T>
            </View>
          ))}
        </View>
      ) : null}
      {u && !edit ? (
        <Card style={{ marginTop: 14, flexDirection: 'row', gap: 12 }}>
          <Feather name="map-pin" size={17} color={C.fern} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}><T v="label">Saved address</T><T v="small">{u.address || 'No address yet — add one at checkout.'}</T>{u.phone ? <T v="small">{u.phone}</T> : null}</View>
        </Card>
      ) : null}
      <Card style={{ marginTop: 14, paddingVertical: 6 }}>
        {item('package', 'My orders', () => navigation.navigate('Orders'), 'History and live tracking', 'menu-orders')}
        <View style={{ height: 1, backgroundColor: C.line }} />
        {item('heart', 'Wishlist', () => navigation.navigate('Wishlist'), `${app.wish.length} saved`)}
        <View style={{ height: 1, backgroundColor: C.line }} />
        {item('rotate-ccw', confirm ? 'Tap again to reset everything' : 'Reset demo data', async () => {
          if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3500); return; }
          setConfirm(false); await api.resetDemo(); app.setCoupon(''); await app.refresh(); app.toast('Demo data reset');
        }, 'Restores the catalogue, orders, bag and wishlist', 'reset-demo', confirm)}
        {u ? <><View style={{ height: 1, backgroundColor: C.line }} />{item('log-out', 'Log out', async () => { await app.signOut(); app.toast('Logged out'); }, undefined, 'logout', true)}</> : null}
      </Card>
      <View style={{ alignItems: 'center', marginTop: 28, gap: 4 }}>
        <Text style={{ fontFamily: F.displayBold, fontSize: 18, color: C.fern }}>Ferneau</Text>
        <T v="small" style={{ fontSize: 12.5, textAlign: 'center' }}>Concept project by Zyqor Studio — fictional brand</T>
        <T v="small" style={{ fontSize: 11.5, color: C.faint }}>React Native · Expo · TypeScript — v1.0 demo</T>
      </View>
    </ScrollView>
  );
}
