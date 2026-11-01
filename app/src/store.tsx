import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from './api/db';
import type { CartDetail, User } from './api/db';

// iOS/Android persist through AsyncStorage. On the web build the data layer keeps its default
// (localStorage), which the Ferneau website and /admin share on the same origin.
if (Platform.OS !== 'web') api.useStorage(AsyncStorage);

const EMPTY: CartDetail = { lines: [], count: 0, subtotal: 0, discount: 0, shipping: 0, total: 0 };
const APPK = { onboarded: 'ferneau.app.onboarded', guest: 'ferneau.app.guest', guestEmail: 'ferneau.app.guestEmail' };

type Ctx = {
  ready: boolean; onboarded: boolean; user: User | null; guest: boolean; cart: CartDetail; wish: string[];
  coupon: string; setCoupon: (c: string) => void; ordersEmail: string;
  finishOnboarding: () => Promise<void>; continueAsGuest: () => Promise<void>; setGuestEmail: (e: string) => Promise<void>;
  signOut: () => Promise<void>; refresh: () => Promise<void>; toggleWish: (id: string) => Promise<boolean>;
  toast: (msg: string, action?: { label: string; onPress: () => void }) => void;
  toastState: { msg: string; action?: { label: string; onPress: () => void }; key: number } | null;
};
const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => { const c = useContext(AppCtx); if (!c) throw new Error('no ctx'); return c; };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState(false);
  const [guestEmail, setGE] = useState('');
  const [cart, setCart] = useState<CartDetail>(EMPTY);
  const [wish, setWish] = useState<string[]>([]);
  const [coupon, setCouponS] = useState('');
  const couponRef = useRef('');
  const [toastState, setToast] = useState<Ctx['toastState']>(null);

  const refresh = useCallback(async () => {
    const [u, c, w] = await Promise.all([api.currentUser(), api.cartDetail(couponRef.current), api.getWishlist()]);
    setUser(u); setCart(c); setWish(w);
  }, []);

  useEffect(() => {
    (async () => {
      const [ob, g, ge] = await Promise.all([AsyncStorage.getItem(APPK.onboarded), AsyncStorage.getItem(APPK.guest), AsyncStorage.getItem(APPK.guestEmail)]);
      setOnboarded(ob === '1'); setGuest(g === '1'); setGE(ge || '');
      await refresh(); setReady(true);
    })();
    const un = api.subscribe(() => { refresh(); });
    return () => { un(); };
  }, [refresh]);

  const setCoupon = useCallback((c: string) => { couponRef.current = c; setCouponS(c); refresh(); }, [refresh]);
  const toastKey = useRef(0);
  const value: Ctx = useMemo(() => ({
    ready, onboarded, user, guest, cart, wish, coupon, setCoupon, toastState,
    ordersEmail: user?.email || guestEmail,
    finishOnboarding: async () => { await AsyncStorage.setItem(APPK.onboarded, '1'); setOnboarded(true); },
    continueAsGuest: async () => { await AsyncStorage.setItem(APPK.guest, '1'); setGuest(true); },
    setGuestEmail: async (e: string) => { await AsyncStorage.setItem(APPK.guestEmail, e); setGE(e); },
    signOut: async () => { await api.logout(); await AsyncStorage.setItem(APPK.guest, '0'); setGuest(false); await refresh(); },
    refresh,
    toggleWish: async (id: string) => { const on = await api.toggleWish(id); await refresh(); return on; },
    toast: (msg, action) => { toastKey.current += 1; setToast({ msg, action, key: toastKey.current }); },
  }), [ready, onboarded, user, guest, cart, wish, coupon, setCoupon, toastState, guestEmail, refresh]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
