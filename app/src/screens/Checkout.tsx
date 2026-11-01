import { ND } from '../theme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import { C, F, R, shadow } from '../theme';
import { Btn, Card, Field, ProductImage, Row, Spinner, T, TopBar, IconName } from '../ui';
import { useApp } from '../store';

const PAY: { k: 'upi' | 'card' | 'cod'; t: string; s: string; icon: IconName }[] = [
  { k: 'upi', t: 'UPI', s: 'GPay, PhonePe, Paytm or any UPI app', icon: 'smartphone' },
  { k: 'card', t: 'Credit / debit card', s: 'Visa, Mastercard, RuPay', icon: 'credit-card' },
  { k: 'cod', t: 'Cash on delivery', s: 'Pay when it arrives', icon: 'home' },
];
const onlyDigits = (s: string) => s.replace(/\D/g, '');

export default function Checkout({ navigation }: any) {
  const ins = useSafeAreaInsets(); const app = useApp(); const { cart, user } = app;
  const [f, setF] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: '', city: '', pin: '' });
  const [err, setErr] = useState<Record<string, string>>({}); const [pay, setPay] = useState<'upi' | 'card' | 'cod'>('upi'); const [sheet, setSheet] = useState(false);
  useEffect(() => {
    if (!user?.address) return; const m = user.address.match(/^(.*),\s*([^,]+?)\s+(\d{6})$/);
    setF((x) => ({ ...x, address: m ? m[1] : user.address || '', city: m ? m[2] : x.city, pin: m ? m[3] : x.pin }));
  }, [user?.address]);
  const set = (k: keyof typeof f) => (v: string) => { setF({ ...f, [k]: v }); if (err[k]) setErr({ ...err, [k]: '' }); };
  const validate = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email for order updates.';
    if (onlyDigits(f.phone).replace(/^91/, '').length !== 10) e.phone = 'Enter a 10-digit mobile number.';
    if (f.address.trim().length < 6) e.address = 'Add house number, street and area.';
    if (f.city.trim().length < 2) e.city = 'Enter your city.';
    if (!/^\d{6}$/.test(f.pin.trim())) e.pin = 'PIN code is 6 digits.';
    setErr(e); return !Object.keys(e).length;
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }} testID="checkout-screen">
      <TopBar title="Checkout" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Steps n={1} />
          <T v="h3" style={{ marginTop: 18, marginBottom: 12 }}>Contact</T>
          <Field testID="f-name" label="Full name" value={f.name} onChangeText={set('name')} error={err.name} placeholder="Your name" autoComplete="name" />
          <Field testID="f-email" label="Email" value={f.email} onChangeText={set('email')} error={err.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field testID="f-phone" label="Mobile" value={f.phone} onChangeText={set('phone')} error={err.phone} placeholder="98765 43210" keyboardType="phone-pad" />
          <T v="h3" style={{ marginTop: 10, marginBottom: 12 }}>Delivery address</T>
          <Field testID="f-address" label="House no., street, area" value={f.address} onChangeText={set('address')} error={err.address} placeholder="12 Lake Road, Ballygunge" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Field testID="f-city" style={{ flex: 1.3 }} label="City" value={f.city} onChangeText={set('city')} error={err.city} placeholder="Kolkata" />
            <Field testID="f-pin" style={{ flex: 1 }} label="PIN code" value={f.pin} onChangeText={(v) => set('pin')(onlyDigits(v).slice(0, 6))} error={err.pin} placeholder="700029" keyboardType="number-pad" />
          </View>
          <T v="h3" style={{ marginTop: 10, marginBottom: 12 }}>Payment</T>
          <View style={{ gap: 10 }}>
            {PAY.map((p) => (
              <Pressable key={p.k} testID={'pay-' + p.k} onPress={() => setPay(p.k)} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1.5, borderColor: pay === p.k ? C.fern : 'transparent', transform: [{ scale: pressed ? 0.99 : 1 }] }, shadow]}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: pay === p.k ? C.sage : C.mist, alignItems: 'center', justifyContent: 'center' }}><Feather name={p.icon} size={18} color={C.fern} /></View>
                <View style={{ flex: 1 }}><T v="label">{p.t}</T><T v="small" style={{ fontSize: 12.5 }}>{p.s}</T></View>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: pay === p.k ? C.fern : C.faint, alignItems: 'center', justifyContent: 'center' }}>{pay === p.k ? <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: C.fern }} /> : null}</View>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <Feather name="shield" size={14} color={C.fernSoft} />
            <T v="small" style={{ fontSize: 12.5, flex: 1 }}>Demo payment — no real charge. Nothing you enter here is sent anywhere.</T>
          </View>
          <T v="h3" style={{ marginTop: 22, marginBottom: 10 }}>Order summary</T>
          <Card>
            {cart.lines.map((l) => (
              <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <ProductImage id={l.id} style={{ width: 44, height: 52, borderRadius: 10 }} pad={2} />
                <Text numberOfLines={1} style={{ flex: 1, fontFamily: F.medium, fontSize: 14, color: C.ink }}>{l.product.name} × {l.qty}</Text>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: C.ink }}>{api.money(l.product.price * l.qty)}</Text>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: C.line, marginVertical: 6 }} />
            <Row label="Subtotal" value={api.money(cart.subtotal)} />
            {cart.discount ? <Row label="Discount (ROOTS10)" value={'− ' + api.money(cart.discount)} color={C.terra} /> : null}
            <Row label="Shipping" value={cart.shipping ? api.money(cart.shipping) : 'Free'} />
            <Row label="Total" value={api.money(cart.total)} strong />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: ins.bottom + 14, backgroundColor: C.paper, borderTopWidth: 1, borderColor: C.line }}>
        <Btn testID="place-order" title={pay === 'cod' ? `Place order · ${api.money(cart.total)}` : `Pay ${api.money(cart.total)}`} icon="lock" disabled={!cart.lines.length}
          onPress={() => { if (validate()) setSheet(true); }} />
      </View>
      <PaySheet visible={sheet} method={pay} total={cart.total} onClose={() => setSheet(false)}
        onPaid={async (label) => {
          const order = await api.placeOrder({ ...f, phone: f.phone.trim(), payment: label, coupon: app.coupon });
          if (!user) await app.setGuestEmail(f.email.trim());
          if (user && !user.address) await api.updateProfile({ address: `${f.address.trim()}, ${f.city.trim()} ${f.pin.trim()}`, phone: user.phone || f.phone.trim() });
          app.setCoupon('');
          return order;
        }}
        onDone={(order) => { setSheet(false); navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: 'Home' } }, { name: 'Success', params: { id: order.id } }] }); }} />
    </View>
  );
}

function Steps({ n }: { n: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
      {['Bag', 'Details', 'Pay'].map((s, i) => (
        <React.Fragment key={s}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: i <= n ? C.fern : C.sage, alignItems: 'center', justifyContent: 'center' }}>
              {i < n ? <Feather name="check" size={12} color={C.paper} /> : <Text style={{ fontFamily: F.bold, fontSize: 11, color: i <= n ? C.paper : C.fern }}>{i + 1}</Text>}
            </View>
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: i <= n ? C.ink : C.muted }}>{s}</Text>
          </View>
          {i < 2 ? <View style={{ flex: 1, height: 1.5, backgroundColor: i < n ? C.fern : C.sage }} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

type Stage = 'form' | 'processing' | 'success' | 'error';
function PaySheet({ visible, method, total, onClose, onPaid, onDone }: { visible: boolean; method: 'upi' | 'card' | 'cod'; total: number; onClose: () => void; onPaid: (label: string) => Promise<api.Order>; onDone: (o: api.Order) => void }) {
  const ins = useSafeAreaInsets();
  const [stage, setStage] = useState<Stage>('form'); const [msg, setMsg] = useState('');
  const [card, setCard] = useState(''); const [exp, setExp] = useState(''); const [cvc, setCvc] = useState(''); const [upi, setUpi] = useState('');
  const [e, setE] = useState<Record<string, string>>({});
  const pop = useRef(new Animated.Value(0)).current;
  const [amt, setAmt] = useState(total);
  useEffect(() => { if (visible) { setStage('form'); setE({}); setMsg(''); setAmt(total); } }, [visible]); // eslint-disable-line
  useEffect(() => { if (stage === 'success') { pop.setValue(0); Animated.spring(pop, { toValue: 1, useNativeDriver: ND, friction: 5 }).start(); } }, [stage, pop]);
  const fmtCard = (v: string) => onlyDigits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  const fmtExp = (v: string) => { const d = onlyDigits(v).slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
  const submit = async () => {
    const er: Record<string, string> = {};
    if (method === 'card') {
      if (onlyDigits(card) !== '4242424242424242') er.card = 'Use the demo card 4242 4242 4242 4242.';
      const [mm, yy] = exp.split('/'); if (!(+mm >= 1 && +mm <= 12 && (yy || '').length === 2 && +yy >= 26)) er.exp = 'Any future date, e.g. 12/29.';
      if (onlyDigits(cvc).length !== 3) er.cvc = '3 digits.';
    }
    if (method === 'upi' && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.trim())) er.upi = 'Enter a UPI ID like name@okdemo.';
    setE(er); if (Object.keys(er).length) return;
    setStage('processing');
    try {
      const label = method === 'card' ? 'Demo card •••• 4242' : method === 'upi' ? 'Demo UPI' : 'Cash on delivery (demo)';
      const o = await onPaid(label); setStage('success'); setTimeout(() => onDone(o), 1300);
    } catch (x: any) { setMsg(x.message || 'Payment failed.'); setStage('error'); }
  };
  const title = method === 'card' ? 'Card payment' : method === 'upi' ? 'UPI payment' : 'Confirm cash on delivery';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (stage === 'form') onClose(); }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: 'rgba(31,58,47,0.42)', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => stage === 'form' && onClose()} />
        <View testID="pay-sheet" style={{ width: '100%', maxWidth: 480, backgroundColor: C.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12, paddingBottom: ins.bottom + 20 }}>
          <View style={{ alignItems: 'center' }}><View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: C.sage }} /></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.fern, alignItems: 'center', justifyContent: 'center' }}><Feather name="lock" size={16} color={C.paper} /></View>
            <View style={{ flex: 1 }}><Text style={{ fontFamily: F.bold, fontSize: 15, color: C.ink }}>Ferneau Pay</Text><Text style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>Secure checkout simulation</Text></View>
            <Text style={{ fontFamily: F.bold, fontSize: 17, color: C.ink }}>{api.money(amt)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F6E3DA', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, marginTop: 14 }}>
            <Feather name="info" size={14} color={C.terra} />
            <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 12.5, color: '#9A4A26' }}>Demo payment — no real charge</Text>
          </View>
          {stage === 'form' ? (
            <View style={{ marginTop: 16 }}>
              <T v="h3" style={{ marginBottom: 12 }}>{title}</T>
              {method === 'card' ? <>
                <Field testID="card-number" label="Card number" value={card} onChangeText={(v) => setCard(fmtCard(v))} error={e.card} placeholder="4242 4242 4242 4242" keyboardType="number-pad" />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Field testID="card-exp" style={{ flex: 1 }} label="Expiry" value={exp} onChangeText={(v) => setExp(fmtExp(v))} error={e.exp} placeholder="MM/YY" keyboardType="number-pad" />
                  <Field testID="card-cvc" style={{ flex: 1 }} label="CVC" value={cvc} onChangeText={(v) => setCvc(onlyDigits(v).slice(0, 3))} error={e.cvc} placeholder="123" keyboardType="number-pad" secureTextEntry />
                </View>
                <Pressable testID="fill-card" onPress={() => { setCard('4242 4242 4242 4242'); setExp('12/29'); setCvc('123'); setE({}); }}><Text style={{ fontFamily: F.semi, fontSize: 13, color: C.fernSoft, marginBottom: 14 }}>Use demo card 4242 4242 4242 4242 →</Text></Pressable>
              </> : null}
              {method === 'upi' ? <>
                <Field testID="upi-id" label="UPI ID" value={upi} onChangeText={setUpi} error={e.upi} placeholder="name@okdemo" autoCapitalize="none" />
                <Pressable onPress={() => { setUpi('ferneau@okdemo'); setE({}); }}><Text style={{ fontFamily: F.semi, fontSize: 13, color: C.fernSoft, marginBottom: 14 }}>Use demo UPI ferneau@okdemo →</Text></Pressable>
              </> : null}
              {method === 'cod' ? <T v="small" style={{ fontSize: 14.5, lineHeight: 21, marginBottom: 16 }}>Pay {api.money(amt)} in cash or UPI when your order arrives. We'll text you before delivery.</T> : null}
              <Btn testID="pay-now" title={method === 'cod' ? 'Confirm order' : `Pay ${api.money(amt)}`} onPress={submit} />
              <Pressable onPress={onClose} style={{ alignItems: 'center', paddingVertical: 14 }}><Text style={{ fontFamily: F.semi, fontSize: 14, color: C.muted }}>Cancel</Text></Pressable>
            </View>
          ) : null}
          {stage === 'processing' ? (
            <View style={{ alignItems: 'center', paddingVertical: 44 }} testID="pay-processing">
              <Spinner size={44} />
              <Text style={{ fontFamily: F.display, fontSize: 20, color: C.ink, marginTop: 20 }}>Processing payment…</Text>
              <T v="small" style={{ marginTop: 6 }}>Talking to the demo gateway</T>
            </View>
          ) : null}
          {stage === 'success' ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }} testID="pay-success">
              <Animated.View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: C.fern, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pop }] }}><Feather name="check" size={38} color={C.paper} /></Animated.View>
              <Text style={{ fontFamily: F.display, fontSize: 21, color: C.ink, marginTop: 18 }}>{method === 'cod' ? 'Order confirmed' : 'Payment successful'}</Text>
              <T v="small" style={{ marginTop: 6 }}>Demo transaction · nothing was charged</T>
            </View>
          ) : null}
          {stage === 'error' ? (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Feather name="alert-triangle" size={34} color={C.danger} />
              <Text style={{ fontFamily: F.semi, fontSize: 15, color: C.ink, marginTop: 12, textAlign: 'center' }}>{msg}</Text>
              <Btn title="Close" kind="soft" onPress={onClose} style={{ marginTop: 18, alignSelf: 'stretch' }} />
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
