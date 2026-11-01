import { ND } from './theme';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextProps, TextStyle, View, ViewStyle, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { C, F, R, shadow, MAXW } from './theme';
import { productImage } from './images';
import { money, addToCart } from './api/db';
import type { Product } from './api/db';
import { useApp } from './store';

export type IconName = React.ComponentProps<typeof Feather>['name'];
export const useW = () => Math.min(useWindowDimensions().width, MAXW);

export function T({ style, v = 'body', ...p }: TextProps & { v?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label' | 'eyebrow' | 'price' }) {
  return <Text {...p} style={[ts[v], style]} />;
}
const ts = StyleSheet.create({
  h1: { fontFamily: F.display, fontSize: 32, lineHeight: 37, color: C.ink, letterSpacing: -0.6 },
  h2: { fontFamily: F.display, fontSize: 24, lineHeight: 29, color: C.ink, letterSpacing: -0.3 },
  h3: { fontFamily: F.display, fontSize: 19, lineHeight: 24, color: C.ink },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: C.ink },
  small: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: C.muted },
  label: { fontFamily: F.semi, fontSize: 14, color: C.ink },
  eyebrow: { fontFamily: F.semi, fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase', color: C.fernSoft },
  price: { fontFamily: F.bold, fontSize: 16, color: C.ink },
});

export function Btn({ title, onPress, kind = 'primary', icon, iconRight, style, disabled, loading, testID, small }: {
  title: string; onPress?: () => void; kind?: 'primary' | 'soft' | 'ghost' | 'outline' | 'terra'; icon?: IconName; style?: StyleProp<ViewStyle>;
  disabled?: boolean; loading?: boolean; testID?: string; small?: boolean; iconRight?: IconName;
}) {
  const bg = { primary: C.fern, soft: C.sage, ghost: 'transparent', outline: 'transparent', terra: C.terra }[kind];
  const fg = kind === 'primary' || kind === 'terra' ? C.paper : C.fern;
  return (
    <Pressable testID={testID} accessibilityRole="button" disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [{ height: small ? 40 : 54, paddingHorizontal: small ? 16 : 22, borderRadius: R.pill, backgroundColor: bg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: disabled ? 0.45 : 1,
        borderWidth: kind === 'outline' ? 1.5 : 0, borderColor: C.fern, transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}>
      {loading ? <Spinner color={fg} /> : <>
        {icon ? <Feather name={icon} size={small ? 15 : 18} color={fg} /> : null}
        <Text style={{ fontFamily: F.semi, fontSize: small ? 14 : 16, color: fg }}>{title}</Text>
        {iconRight ? <Feather name={iconRight} size={small ? 15 : 18} color={fg} /> : null}
      </>}
    </Pressable>
  );
}

export function Spinner({ color = C.fern, size = 18 }: { color?: string; size?: number }) {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = Animated.loop(Animated.timing(r, { toValue: 1, duration: 800, useNativeDriver: ND })); a.start(); return () => a.stop(); }, [r]);
  const rot = r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={{ width: size, height: size, borderRadius: size, borderWidth: 2.4, borderColor: color, borderTopColor: 'transparent', transform: [{ rotate: rot }] }} />;
}

export function IconBtn({ icon, onPress, color = C.ink, bg = C.card, size = 42, testID, badge, label }: { icon: IconName; onPress?: () => void; color?: string; bg?: string; size?: number; testID?: string; badge?: number; label?: string }) {
  return (
    <Pressable testID={testID} accessibilityLabel={label || icon} onPress={onPress} hitSlop={6}
      style={({ pressed }) => [{ width: size, height: size, borderRadius: size, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.92 : 1 }] }, bg !== 'transparent' && shadow]}>
      <Feather name={icon} size={size * 0.45} color={color} />
      {badge ? <View style={st.badge}><Text style={st.badgeT}>{badge}</Text></View> : null}
    </Pressable>
  );
}

export function HeartBtn({ on, onPress, size = 42, testID }: { on: boolean; onPress: () => void; size?: number; testID?: string }) {
  return (
    <Pressable testID={testID} accessibilityLabel={on ? 'Remove from wishlist' : 'Save to wishlist'} onPress={onPress} hitSlop={6}
      style={({ pressed }) => [{ width: size, height: size, borderRadius: size, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.88 : 1 }] }, shadow]}>
      <Ionicons name={on ? 'heart' : 'heart-outline'} size={size * 0.5} color={on ? C.terra : C.fern} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress, testID, icon }: { label: string; active?: boolean; onPress?: () => void; testID?: string; icon?: IconName }) {
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [st.chip, active && st.chipOn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
      {icon ? <Feather name={icon} size={14} color={active ? C.paper : C.fern} /> : null}
      <Text style={[st.chipT, active && { color: C.paper }]}>{label}</Text>
    </Pressable>
  );
}

export function TopBar({ title, back = true, right, transparent, solid }: { title?: string; back?: boolean; right?: React.ReactNode; transparent?: boolean; solid?: boolean }) {
  const nav = useNavigation<any>(); const ins = useSafeAreaInsets();
  return (
    <View style={[st.top, { paddingTop: ins.top + 8 }, transparent && { position: 'absolute', left: 0, right: 0, zIndex: 5, backgroundColor: solid ? C.paper : 'transparent', borderBottomWidth: solid ? 1 : 0, borderColor: C.line }]}>
      <View style={{ width: 42 }}>{back ? <IconBtn icon="arrow-left" label="Back" testID="back" onPress={() => (nav.canGoBack() ? nav.goBack() : nav.navigate('Main'))} /> : null}</View>
      <Text numberOfLines={1} style={[st.topT, transparent && { fontSize: 16 }]}>{transparent && !solid ? '' : title}</Text>
      <View style={{ minWidth: 42, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function Field({ label, error, style, ...p }: React.ComponentProps<typeof TextInput> & { label: string; error?: string }) {
  return (
    <View style={[{ marginBottom: 14 }, style as any]}>
      <Text style={st.fieldL}>{label}</Text>
      <TextInput placeholderTextColor={C.faint} {...p} style={[st.input, error ? { borderColor: C.danger } : null]} />
      {error ? <Text style={st.err}>{error}</Text> : null}
    </View>
  );
}

export function Stepper({ value, onChange, testID }: { value: number; onChange: (n: number) => void; testID?: string }) {
  return (
    <View style={st.step} testID={testID}>
      <Pressable accessibilityLabel="Decrease" testID={testID ? testID + '-minus' : undefined} hitSlop={6} onPress={() => onChange(value - 1)} style={st.stepB}><Feather name="minus" size={15} color={C.fern} /></Pressable>
      <Text style={st.stepN}>{value}</Text>
      <Pressable accessibilityLabel="Increase" testID={testID ? testID + '-plus' : undefined} hitSlop={6} onPress={() => onChange(Math.min(9, value + 1))} style={st.stepB}><Feather name="plus" size={15} color={C.fern} /></Pressable>
    </View>
  );
}

export function ProductImage({ id, style, tint = C.mist, pad = 10 }: { id: string; style?: StyleProp<ViewStyle>; tint?: string; pad?: number }) {
  return (
    <View style={[{ backgroundColor: tint, borderRadius: R.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, style]}>
      <Image source={productImage(id)} resizeMode="contain" style={{ width: '100%', height: '100%', padding: pad }} />
    </View>
  );
}

export function Badge({ text }: { text: string }) {
  if (!text) return null;
  const terra = text === 'Bestseller' || text === 'Low stock';
  return <View style={[st.pbadge, { backgroundColor: terra ? C.terra : C.fern }]}><Text style={st.pbadgeT}>{text}</Text></View>;
}

export function Price({ p, big }: { p: Product; big?: boolean }) {
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
      <Text style={{ fontFamily: F.bold, fontSize: big ? 26 : 15.5, color: C.ink }}>{money(p.price)}</Text>
      {off ? <Text style={{ fontFamily: F.body, fontSize: big ? 15 : 12.5, color: C.faint, textDecorationLine: 'line-through' }}>{money(p.mrp)}</Text> : null}
      {off && big ? <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.terra }}>{off}% off</Text> : null}
    </View>
  );
}

export function ProductCard({ p, width, testID }: { p: Product; width: number; testID?: string }) {
  const nav = useNavigation<any>(); const app = useApp(); const on = app.wish.includes(p.id);
  return (
    <Pressable testID={testID} onPress={() => nav.navigate('Product', { id: p.id, p })}
      style={({ pressed }) => [{ width, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      <View>
        <ProductImage id={p.id} style={{ width, height: width * 1.18 }} pad={14} />
        <View style={{ position: 'absolute', top: 10, left: 10 }}><Badge text={p.badge} /></View>
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <HeartBtn on={on} size={34} onPress={async () => { const now = await app.toggleWish(p.id); app.toast(now ? 'Saved to wishlist' : 'Removed from wishlist'); }} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 4, paddingTop: 10 }}>
        <Text style={{ fontFamily: F.body, fontSize: 12, color: C.muted }}>{p.category} · {p.size}</Text>
        <Text numberOfLines={2} style={{ fontFamily: F.semi, fontSize: 14.5, lineHeight: 19, color: C.ink, marginTop: 2, minHeight: 38 }}>{p.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <Price p={p} />
          <Pressable accessibilityLabel={'Add ' + p.name + ' to bag'} hitSlop={6}
            onPress={async () => { await addToCart(p.id, 1); app.toast('Added to bag', { label: 'View bag', onPress: () => nav.navigate('Main', { screen: 'Bag' }) }); }}
            style={({ pressed }) => [st.plus, { transform: [{ scale: pressed ? 0.9 : 1 }] }]}>
            <Feather name="plus" size={16} color={C.paper} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function Empty({ icon, title, text, cta, onPress }: { icon: IconName; title: string; text: string; cta?: string; onPress?: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Feather name={icon} size={32} color={C.fern} />
      </View>
      <T v="h2" style={{ textAlign: 'center' }}>{title}</T>
      <T v="small" style={{ textAlign: 'center', marginTop: 8, fontSize: 14.5, lineHeight: 21 }}>{text}</T>
      {cta ? <Btn title={cta} onPress={onPress} style={{ marginTop: 22, alignSelf: 'stretch' }} /> : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: C.card, borderRadius: R.lg, padding: 18 }, shadow, style]}>{children}</View>;
}

export function Row({ label, value, strong, color }: { label: string; value: string; strong?: boolean; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
      <Text style={{ fontFamily: strong ? F.bold : F.body, fontSize: strong ? 17 : 14.5, color: C.ink }}>{label}</Text>
      <Text style={{ fontFamily: strong ? F.bold : F.medium, fontSize: strong ? 17 : 14.5, color: color || C.ink }}>{value}</Text>
    </View>
  );
}

export function Toast() {
  const { toastState } = useApp(); const a = useRef(new Animated.Value(0)).current; const ins = useSafeAreaInsets();
  const [shown, setShown] = React.useState(toastState);
  useEffect(() => {
    if (!toastState) return; setShown(toastState); a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 220, useNativeDriver: ND }).start();
    const t = setTimeout(() => Animated.timing(a, { toValue: 0, duration: 220, useNativeDriver: ND }).start(() => setShown(null)), 2300);
    return () => clearTimeout(t);
  }, [toastState, a]);
  if (!shown) return null;
  return (
    <Animated.View pointerEvents="box-none" style={{ position: 'absolute', bottom: ins.bottom + 150, left: 16, right: 16, alignItems: 'center', zIndex: 99, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <View style={st.toast} testID="toast">
        <Feather name="check-circle" size={17} color={C.sage} />
        <Text style={{ flex: 1, fontFamily: F.medium, fontSize: 14, color: C.paper }}>{shown.msg}</Text>
        {shown.action ? <Pressable onPress={shown.action.onPress} hitSlop={8}><Text style={{ fontFamily: F.bold, fontSize: 14, color: '#F2B392' }}>{shown.action.label}</Text></Pressable> : null}
      </View>
    </Animated.View>
  );
}

export function Screen({ children, scroll = true, pad = 20, bottom = 28, style, testID }: { children: React.ReactNode; scroll?: boolean; pad?: number; bottom?: number; style?: StyleProp<ViewStyle>; testID?: string }) {
  if (!scroll) return <View testID={testID} style={[{ flex: 1, backgroundColor: C.paper, paddingHorizontal: pad }, style]}>{children}</View>;
  return (
    <ScrollView testID={testID} style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={[{ paddingHorizontal: pad, paddingBottom: bottom }, style]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export const st = StyleSheet.create({
  chip: { height: 38, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  chipOn: { backgroundColor: C.fern, borderColor: C.fern },
  chipT: { fontFamily: F.medium, fontSize: 14, color: C.ink },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: C.paper },
  topT: { flex: 1, textAlign: 'center', fontFamily: F.display, fontSize: 19, color: C.ink, marginHorizontal: 8 },
  fieldL: { fontFamily: F.semi, fontSize: 13, color: C.ink, marginBottom: 6 },
  input: { height: 50, borderRadius: 14, backgroundColor: C.card, borderWidth: 1.2, borderColor: C.line, paddingHorizontal: 15, fontFamily: F.body, fontSize: 15.5, color: C.ink, outlineStyle: 'none' } as unknown as TextStyle,
  err: { fontFamily: F.medium, fontSize: 12.5, color: C.danger, marginTop: 5 },
  step: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.mist, borderRadius: R.pill, padding: 4 },
  stepB: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  stepN: { minWidth: 30, textAlign: 'center', fontFamily: F.bold, fontSize: 15, color: C.ink },
  badge: { position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.terra, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeT: { fontFamily: F.bold, fontSize: 10.5, color: C.paper },
  pbadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: R.pill },
  pbadgeT: { fontFamily: F.semi, fontSize: 11, color: C.paper, letterSpacing: 0.2 },
  plus: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.fern, alignItems: 'center', justifyContent: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.ink, borderRadius: R.md, paddingHorizontal: 16, paddingVertical: 13, width: '100%', maxWidth: 440, ...shadow },
});
