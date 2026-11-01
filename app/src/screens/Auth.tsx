import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import { C, F, R } from '../theme';
import { Btn, Field, ProductImage, T } from '../ui';
import { useApp } from '../store';

export default function Auth({ navigation }: any) {
  const ins = useSafeAreaInsets(); const app = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const go = () => (navigation.canGoBack() ? navigation.goBack() : navigation.reset({ index: 0, routes: [{ name: 'Main' }] }));
  const submit = async () => {
    setErr(''); setBusy(true);
    try { if (mode === 'login') await api.login(email, pw); else await api.signup({ name, email, password: pw }); await app.refresh(); app.toast(mode === 'login' ? 'Welcome back' : 'Account created'); go(); }
    catch (e: any) { setErr(e.message || 'Something went wrong.'); }
    setBusy(false);
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView testID="auth" contentContainerStyle={{ paddingTop: ins.top + 14, paddingBottom: ins.bottom + 28, paddingHorizontal: 22 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ProductImage id="p01" tint={C.sage} style={{ width: 64, height: 76, borderRadius: 18 }} pad={4} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.displayBold, fontSize: 22, color: C.fern }}>Ferneau</Text>
            <T v="small">Botanical hair care</T>
          </View>
        </View>
        <T v="h1" style={{ marginTop: 26 }}>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</T>
        <T v="small" style={{ fontSize: 15, marginTop: 6 }}>{mode === 'login' ? 'Log in to see your orders, wishlist and saved address.' : 'Save your address, wishlist and order history.'}</T>
        <View style={{ flexDirection: 'row', backgroundColor: C.mist, borderRadius: R.pill, padding: 4, marginTop: 22, marginBottom: 20 }}>
          {(['login', 'signup'] as const).map((m) => (
            <Pressable key={m} testID={'tab-' + m} onPress={() => { setMode(m); setErr(''); }} style={{ flex: 1, height: 42, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === m ? C.card : 'transparent' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14.5, color: mode === m ? C.ink : C.muted }}>{m === 'login' ? 'Log in' : 'Sign up'}</Text>
            </Pressable>
          ))}
        </View>
        {mode === 'signup' ? <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" /> : null}
        <Field testID="email" label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field testID="password" label="Password" value={pw} onChangeText={setPw} placeholder="••••••••" secureTextEntry onSubmitEditing={submit} />
        {err ? <View style={{ flexDirection: 'row', gap: 8, backgroundColor: '#F6E3DA', padding: 12, borderRadius: 12, marginBottom: 12 }}><Feather name="alert-circle" size={16} color={C.danger} /><Text style={{ flex: 1, fontFamily: F.medium, fontSize: 13.5, color: C.danger }}>{err}</Text></View> : null}
        <Btn testID="auth-submit" title={mode === 'login' ? 'Log in' : 'Create account'} onPress={submit} loading={busy} />
        {mode === 'login' ? (
          <Pressable testID="demo-fill" onPress={() => { setEmail('demo@ferneau.example'); setPw('demo1234'); setErr(''); }} style={({ pressed }) => [{ marginTop: 16, backgroundColor: C.sage, borderRadius: R.md, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}>
            <Feather name="key" size={18} color={C.fern} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: C.ink }}>Demo login — tap to fill</Text>
              <Text style={{ fontFamily: F.body, fontSize: 13, color: C.fernSoft, marginTop: 2 }}>demo@ferneau.example · demo1234</Text>
            </View>
          </Pressable>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.line }} /><T v="small">or</T><View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        </View>
        <Btn testID="guest" kind="outline" title="Continue as guest" onPress={async () => { await app.continueAsGuest(); go(); }} />
        <T v="small" style={{ textAlign: 'center', marginTop: 22, fontSize: 12 }}>Concept project by Zyqor Studio — fictional brand. Demo data only.</T>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
