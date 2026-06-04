import {
  Agreement,
  AgreementStatus,
  AGREEMENT_STATUS_LABEL,
  roleOf,
} from '@/components/Agreement.types';
import { subscribeToAgreementsForUser, toMillis } from '@/constants/agreements';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Labels live in AGREEMENT_STATUS_LABEL (shared); only the pill colors are
// specific to this screen.
const STATUS_COLORS: Record<AgreementStatus, { bg: string; fg: string }> = {
  draft: { bg: '#f3f4f6', fg: '#374151' },
  sent: { bg: '#eef2ff', fg: '#1e40af' },
  accepted: { bg: '#dcfce7', fg: '#166534' },
  'edit-requested': { bg: '#fef3c7', fg: '#92400e' },
  'completion-requested': { bg: '#e0f2fe', fg: '#075985' },
  completed: { bg: '#e5e7eb', fg: '#374151' },
};

// Agreements still needing attention sort above settled (accepted) ones.
const STATUS_RANK: Record<Agreement['status'], number> = {
  'edit-requested': 0,
  'completion-requested': 1,
  sent: 2,
  draft: 3,
  accepted: 4,
  completed: 5,
};

type RoleFilter = 'all' | 'providing' | 'buying' | 'completed';

const FILTERS: { key: RoleFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'providing', label: 'Providing' },
  { key: 'buying', label: 'Buying' },
  { key: 'completed', label: 'Completed' },
];

const isCompleted = (a: Agreement) => a.status === 'completed';

export default function AgreementsTab() {
  const router = useRouter();
  const { user } = useAuth();
  const uid = user?.uid ?? '';

  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RoleFilter>('all');

  useEffect(() => {
    if (!uid) {
      setAgreements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const unsub = subscribeToAgreementsForUser(
      uid,
      (list) => {
        setAgreements(list);
        setError(null);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [uid]);

  const isProviding = (a: Agreement) => roleOf(a, uid) === 'provider';
  const isBuying = (a: Agreement) => roleOf(a, uid) === 'buyer';

  // The role filters (All / Providing / Buying) show only active agreements;
  // completed ones live under their own filter so they stay viewable.
  const counts = useMemo(() => {
    const active = agreements.filter((a) => !isCompleted(a));
    return {
      all: active.length,
      providing: active.filter(isProviding).length,
      buying: active.filter(isBuying).length,
      completed: agreements.filter(isCompleted).length,
    };
  }, [agreements, uid]);

  const visible = useMemo(() => {
    let filtered: Agreement[];
    if (filter === 'completed') {
      filtered = agreements.filter(isCompleted);
    } else {
      const active = agreements.filter((a) => !isCompleted(a));
      filtered =
        filter === 'providing'
          ? active.filter(isProviding)
          : filter === 'buying'
          ? active.filter(isBuying)
          : active;
    }
    return [...filtered].sort((a, b) => {
      const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (rank !== 0) return rank;
      return toMillis(b.updatedAt) - toMillis(a.updatedAt);
    });
  }, [agreements, filter, uid]);

  function renderItem({ item }: { item: Agreement }) {
    const colors = STATUS_COLORS[item.status];
    const statusLabel = AGREEMENT_STATUS_LABEL[item.status];
    const youAre = isProviding(item) ? 'Provider' : isBuying(item) ? 'Buyer' : 'Observer';
    const otherName = isProviding(item) ? item.buyerName : item.providerName;
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
          <View style={[styles.statusPill, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.fg }]}>{statusLabel}</Text>
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

  function SegmentedFilter() {
    return (
      <View style={styles.segmentRow}>
        {FILTERS.map(({ key, label }) => {
          const selected = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[styles.segment, selected && styles.segmentActive]}
            >
              <Text
                style={[styles.segmentText, selected && styles.segmentTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {label} ({counts[key]})
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={42} color="#dc2626" />
        <Text style={styles.emptyTitle}>Couldn’t load agreements</Text>
        <Text style={styles.emptySub}>{error}</Text>
      </View>
    );
  }

  const emptyText =
    filter === 'providing'
      ? "You don't have any active agreements where you're providing a service."
      : filter === 'buying'
      ? "You don't have any active agreements where you're buying a service."
      : filter === 'completed'
      ? 'No completed agreements yet. Mark an agreement completed once the service is done.'
      : 'Send an agreement from a listing or a conversation and it will show up here.';

  return (
    <View style={styles.screen}>
      <SegmentedFilter />
      {visible.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="document-text-outline" size={42} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No agreements here</Text>
          <Text style={styles.emptySub}>{emptyText}</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(a) => a.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
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

  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#eef0f4',
    borderRadius: 10,
    padding: 4,
    margin: 12,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  segmentTextActive: { color: '#111' },

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
