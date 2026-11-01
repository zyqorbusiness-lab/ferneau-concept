import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as api from '../api/db';
import type { Product, ProductQuery } from '../api/db';
import { C, F, R, shadow } from '../theme';
import { Btn, Chip, Empty, ProductCard, T, useW } from '../ui';

const SORTS = [{ k: '', t: 'Featured' }, { k: 'popular', t: 'Most loved' }, { k: 'rating', t: 'Top rated' }, { k: 'price_asc', t: 'Price: low to high' }, { k: 'price_desc', t: 'Price: high to low' }];
type Q = Required<Pick<ProductQuery, 'category' | 'hairType' | 'concern' | 'sort'>> & { inStock: boolean };
const BASE: Q = { category: 'All', hairType: 'All', concern: 'All', sort: '', inStock: false };

export default function Shop({ route, navigation }: any) {
  const ins = useSafeAreaInsets(); const W = useW();
  const [search, setSearch] = useState(''); const [q, setQ] = useState<Q>(BASE); const [draft, setDraft] = useState<Q>(BASE);
  const [items, setItems] = useState<Product[] | null>(null); const [sheet, setSheet] = useState(false);
  const inputRef = useRef<any>(null);
  useEffect(() => {
    const p = route.params || {}; if (!p.ts) return;
    setQ({ ...BASE, category: p.category || 'All', hairType: p.hairType || 'All', sort: p.sort || '' });
    if (p.focus) setTimeout(() => inputRef.current?.focus(), 250);
  }, [route.params]);
  useEffect(() => { let live = true; const t = setTimeout(() => api.listProducts({ ...q, search: search.trim() }).then((r) => live && setItems(r)), 120); return () => { live = false; clearTimeout(t); }; }, [q, search]);
  const active = (q.category !== 'All' ? 1 : 0) + (q.hairType !== 'All' ? 1 : 0) + (q.concern !== 'All' ? 1 : 0) + (q.sort ? 1 : 0) + (q.inStock ? 1 : 0);
  const cw = (W - 40 - 14) / 2;
  const pills = [q.category !== 'All' && q.category, q.hairType !== 'All' && q.hairType + ' hair', q.concern !== 'All' && q.concern, q.sort && SORTS.find((s) => s.k === q.sort)?.t, q.inStock && 'In stock'].filter(Boolean) as string[];
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }} testID="shop">
      <View style={{ paddingTop: ins.top + 10, paddingHorizontal: 20, paddingBottom: 12 }}>
        <T v="h1" style={{ fontSize: 30 }}>Shop</T>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={[{ flex: 1, height: 50, borderRadius: R.pill, backgroundColor: C.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 }, shadow]}>
            <Feather name="search" size={18} color={C.muted} />
            <TextInput ref={inputRef} testID="search" value={search} onChangeText={setSearch} placeholder="Search rosemary, frizz, mask…" placeholderTextColor={C.faint} returnKeyType="search"
              style={{ flex: 1, fontFamily: F.body, fontSize: 15, color: C.ink, height: 48, outlineStyle: 'none' } as any} />
            {search ? <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel="Clear search"><Feather name="x-circle" size={17} color={C.faint} /></Pressable> : null}
          </View>
          <Pressable testID="filter-btn" accessibilityLabel="Filters" onPress={() => { setDraft(q); setSheet(true); }} style={({ pressed }) => [{ width: 50, height: 50, borderRadius: 25, backgroundColor: C.fern, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.93 : 1 }] }]}>
            <Feather name="sliders" size={19} color={C.paper} />
            {active ? <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 19, height: 19, borderRadius: 10, backgroundColor: C.terra, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 11, color: C.paper }}>{active}</Text></View> : null}
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {api.FILTERS.categories.map((c) => <Chip key={c} label={c} active={q.category === c} onPress={() => setQ({ ...q, category: c })} />)}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, minHeight: 24 }}>
          <Text testID="result-count" style={{ fontFamily: F.semi, fontSize: 14, color: C.muted }}>{items ? `${items.length} ${items.length === 1 ? 'product' : 'products'}${search.trim() ? ` for “${search.trim()}”` : ''}` : 'Loading…'}</Text>
          {active ? <Pressable onPress={() => setQ(BASE)} hitSlop={8}><Text style={{ fontFamily: F.semi, fontSize: 14, color: C.terra }}>Clear all</Text></Pressable> : null}
        </View>
        {pills.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>{pills.map((p) => <View key={p} style={{ backgroundColor: C.sage, borderRadius: R.pill, paddingHorizontal: 11, paddingVertical: 5 }}><Text style={{ fontFamily: F.medium, fontSize: 12.5, color: C.fern }}>{p}</Text></View>)}</View> : null}
        {items && !items.length ? <Empty icon="search" title="Nothing matches yet" text="Try a different word or clear a filter." cta="Clear filters" onPress={() => { setQ(BASE); setSearch(''); }} /> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 22 }}>
          {(items || []).map((p) => <ProductCard key={p.id} p={p} width={cw} testID={'card-' + p.id} />)}
        </View>
      </ScrollView>

      <Modal visible={sheet} transparent animationType="fade" onRequestClose={() => setSheet(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(31,58,47,0.38)', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => setSheet(false)} accessibilityLabel="Close filters" />
          <View testID="filter-sheet" style={{ width: '100%', maxWidth: 480, maxHeight: '86%', backgroundColor: C.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: ins.bottom + 16 }}>
            <View style={{ alignItems: 'center', paddingTop: 10 }}><View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: C.sage }} /></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 6 }}>
              <T v="h2">Filters</T>
              <Pressable onPress={() => setDraft(BASE)} hitSlop={8}><Text style={{ fontFamily: F.semi, fontSize: 14.5, color: C.terra }}>Reset</Text></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 10 }}>
              <Group title="Category" opts={api.FILTERS.categories} val={draft.category} set={(v) => setDraft({ ...draft, category: v })} id="fc" />
              <Group title="Hair type" opts={api.FILTERS.hairTypes} val={draft.hairType} set={(v) => setDraft({ ...draft, hairType: v })} id="fh" />
              <Group title="Concern" opts={api.FILTERS.concerns} val={draft.concern} set={(v) => setDraft({ ...draft, concern: v })} id="fn" />
              <T v="label" style={{ marginTop: 18, marginBottom: 10 }}>Sort by</T>
              {SORTS.map((s) => (
                <Pressable key={s.k} testID={'sort-' + (s.k || 'featured')} onPress={() => setDraft({ ...draft, sort: s.k })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: draft.sort === s.k ? C.fern : C.faint, alignItems: 'center', justifyContent: 'center' }}>{draft.sort === s.k ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.fern }} /> : null}</View>
                  <Text style={{ fontFamily: F.medium, fontSize: 15, color: C.ink }}>{s.t}</Text>
                </Pressable>
              ))}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, backgroundColor: C.card, borderRadius: R.md, padding: 14 }}>
                <View><T v="label">In stock only</T><T v="small">Hide items that are sold out</T></View>
                <Switch testID="instock" value={draft.inStock} onValueChange={(v) => setDraft({ ...draft, inStock: v })} trackColor={{ true: C.fern, false: C.sage }} thumbColor={C.card} {...({ activeThumbColor: C.card } as any)} />
              </View>
            </ScrollView>
            <View style={{ paddingHorizontal: 22, paddingTop: 10 }}>
              <Btn testID="apply-filters" title="Show results" onPress={() => { setQ(draft); setSheet(false); }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Group({ title, opts, val, set, id }: { title: string; opts: string[]; val: string; set: (v: string) => void; id: string }) {
  return (
    <View style={{ marginTop: 14 }}>
      <T v="label" style={{ marginBottom: 10 }}>{title}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{opts.map((o) => <Chip key={o} testID={id + '-' + o} label={o} active={val === o} onPress={() => set(o)} />)}</View>
    </View>
  );
}
