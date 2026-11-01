import { ND } from '../theme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '../theme';
import { Btn, ProductImage, T } from '../ui';
import { useApp } from '../store';

const SLIDES = [
  { id: 'p01', tint: C.sage, eyebrow: 'Botanical hair care', title: 'Roots first.\nShine follows.', text: 'Plant-led shampoos, masks and oils, made for Indian water, weather and hair.' },
  { id: 'p04', tint: C.mist, eyebrow: 'Find your ritual', title: 'Shop by hair type\nand concern.', text: 'Search, filter and save favourites. Your bag and wishlist follow you on every device.' },
  { id: 'p10', tint: '#E9E4D6', eyebrow: 'Doorstep, tracked', title: 'Checkout in a tap.\nTrack every step.', text: 'UPI, card or cash on delivery, then live order tracking from packed to delivered.' },
];

export default function Onboarding({ navigation }: any) {
  const [i, setI] = useState(0); const app = useApp(); const ins = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => { fade.setValue(0); Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: ND }).start(); }, [i, fade]);
  const done = async () => { await app.finishOnboarding(); navigation.reset({ index: 0, routes: [{ name: app.user || app.guest ? 'Main' : 'Auth' }] }); };
  const s = SLIDES[i];
  return (
    <View style={{ flex: 1, backgroundColor: C.paper, paddingTop: ins.top + 10, paddingBottom: ins.bottom + 22 }} testID="onboarding">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, height: 44 }}>
        <Text style={{ fontFamily: F.displayBold, fontSize: 22, color: C.fern, letterSpacing: -0.4 }}>Ferneau</Text>
        <Pressable testID="skip" onPress={done} hitSlop={10}><Text style={{ fontFamily: F.semi, fontSize: 15, color: C.muted }}>Skip</Text></Pressable>
      </View>
      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
        <ProductImage id={s.id} tint={s.tint} style={{ flex: 1, marginHorizontal: 22, marginTop: 12, borderRadius: 32 }} pad={30} />
        <View style={{ paddingHorizontal: 26, paddingTop: 26 }}>
          <T v="eyebrow">{s.eyebrow}</T>
          <T v="h1" style={{ marginTop: 10 }}>{s.title}</T>
          <T v="small" style={{ fontSize: 15.5, lineHeight: 23, marginTop: 10 }}>{s.text}</T>
        </View>
      </Animated.View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 26, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((_, k) => <View key={k} style={{ width: k === i ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: k === i ? C.fern : C.sage }} />)}
        </View>
        <Btn testID="onb-next" title={i < SLIDES.length - 1 ? 'Next' : 'Get started'} iconRight="arrow-right" onPress={() => (i < SLIDES.length - 1 ? setI(i + 1) : done())} style={{ minWidth: 150 }} />
      </View>
    </View>
  );
}
