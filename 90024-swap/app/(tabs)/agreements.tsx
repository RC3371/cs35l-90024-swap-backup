import { Agreement } from '@/components/Agreement.types';
import { subscribeToAgreementsForUser } from '@/constants/agreements';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STATUS_META: Record<
  Agreement['status'],
  { label: string; bg: string; fg: string }
> = {
  draft: { label: 'Draft', bg: '#f3f4f6', fg: '#374151' },
  sent: { label: 'Awaiting acceptance', bg: '#eef2ff', fg: '#1e40af' },
  accepted: { label: 'Accepted', bg: '#dcfce7', fg: '#166534' },
  'edit-requested': { label: 'Edit proposed', bg: '#fef3c7', fg: '#92400e' },
};

// Agreements still needing attention sort above settled (accepted) ones.
const STATUS_RANK: Record<Agreement['status'], number> = {
  'edit-requested': 0,
  sent: 1,
  draft: 2,
  accepted: 3,
};

function toMillis(value: any): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value.toMillis === 'function') return value.toMillis();
  return 0;
}

export default function AgreementsTab() {
  const router = useRouter();
  const { user } = useAuth();
  const uid = user?.uid ?? '';

  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setAgreements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToAgreementsForUser(uid, (list) => {
      setAgreements(list);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const ordered = useMemo(
    () =>
      [...agreements].sort((a, b) => {
        const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (rank !== 0) return rank;
        return toMillis(b.updatedAt) - toMillis(a.updatedAt);
      }),
    [agreements],
  );

  function roleFor(a: Agreement): { otherName: string; youAre: string } {
    if (a.providerUid === uid) return { otherName: a.buyerName, youAre: 'Provider' };
    if (a.buyerUid === uid) return { otherName: a.providerName, youAre: 'Buyer' };
    return { otherName: '—', youAre: 'Observer' };
  }

  function renderItem({ item }: { item: Agreement }) {
    const meta = STATUS_META[item.status];
    const { otherName, youAre } = roleFor(item);
    const dateText =
      item.dates.length === 0
        ? 'No dates set'
        : item.isMultiDay
        ? `${item.dates.length} day${item.dates.length === 1 ? '' : 's'}`
        : item.dates[0];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({ pathname: '/(agreement)/[id]', params: { id: item.id } })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.listingTitle}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusText, { color: meta.fg }]}>{meta.label}</Text>
          </View>
        </View>

        <Text style={styles.cardMeta}>
          With {otherName} · You: {youAre}
        </Text>
        <Text style={styles.cardMeta}>
          {dateText} · ${item.price.toFixed(2)}
          {item.unit ? `/${item.unit}` : ''}
        </Text>

        <Text style={styles.openLink}>Open ›</Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (ordered.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="document-text-outline" size={42} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No agreements yet</Text>
        <Text style={styles.emptySub}>
          Send an agreement from a listing or a conversation and it will show up
          here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={ordered}
      keyExtractor={(a) => a.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f9fb' },
  list: { padding: 12, gap: 10 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
    backgroundColor: '#f8f9fb',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginTop: 4 },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 19 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111' },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { fontSize: 13, color: '#374151', marginTop: 2 },
  openLink: { fontSize: 13, color: '#2563eb', fontWeight: '600', marginTop: 6 },
});
