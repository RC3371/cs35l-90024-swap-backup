import { Agreement, AGREEMENT_STATUS_LABEL } from '@/components/Agreement.types';
import { subscribeToAgreement } from '@/constants/agreements';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Rendered inside the conversation when a message has type === 'agreement'.
// Shows a compact summary + an Open button that routes to the detail screen.
interface AgreementCardProps {
  agreementId: string;
  fallbackTitle?: string;
  alignRight?: boolean;
}

export const AgreementCard: React.FC<AgreementCardProps> = ({
  agreementId,
  fallbackTitle,
  alignRight,
}) => {
  const router = useRouter();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAgreement(agreementId, (a) => {
      setAgreement(a);
      setLoading(false);
    });
    return unsub;
  }, [agreementId]);

  return (
    <TouchableOpacity
      style={[styles.card, alignRight ? styles.right : styles.left]}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: '/(agreement)/[id]',
          params: { id: agreementId },
        })
      }
    >
      <Text style={styles.kicker}>Agreement</Text>
      <Text style={styles.title} numberOfLines={1}>
        {agreement?.listingTitle ?? fallbackTitle ?? 'Service agreement'}
      </Text>

      {loading ? (
        <Text style={styles.meta}>Loading…</Text>
      ) : agreement ? (
        <>
          <Text style={styles.meta}>
            {agreement.dates.length === 0
              ? 'No dates set'
              : agreement.isMultiDay
              ? `${agreement.dates.length} day${agreement.dates.length === 1 ? '' : 's'}`
              : agreement.dates[0]}
            {' · '}${agreement.price.toFixed(2)}
            {agreement.unit ? `/${agreement.unit}` : ''}
          </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {AGREEMENT_STATUS_LABEL[agreement.status]}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.meta}>Agreement unavailable.</Text>
      )}

      <Text style={styles.openLink}>Open ›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    maxWidth: '85%',
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe2ec',
    padding: 12,
    marginVertical: 4,
    gap: 4,
  },
  right: { alignSelf: 'flex-end' },
  left: { alignSelf: 'flex-start' },
  kicker: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: { fontSize: 15, fontWeight: '700', color: '#111' },
  meta: { fontSize: 13, color: '#374151', marginTop: 2 },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
  },
  statusText: { fontSize: 11, color: '#1e40af', fontWeight: '700' },
  openLink: { fontSize: 13, color: '#2563eb', fontWeight: '600', marginTop: 6 },
});
