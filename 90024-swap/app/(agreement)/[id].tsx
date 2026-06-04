import { Calendar } from '@/components/Calendar';
import { Agreement, AgreementEditable } from '@/components/Agreement.types';
import {
  acceptPendingEdit,
  cancelCompletion,
  confirmCompletion,
  proposeEdit,
  rejectPendingEdit,
  requestCompletion,
  setAgreementStatus,
  subscribeToAgreement,
} from '@/constants/agreements';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Detail screen for an existing agreement.
// - Either party can Accept (lock the agreement)
// - Either party can Propose an Edit, which puts the agreement into
//   'edit-requested' state. The other party then sees Accept / Reject.
// - The party who proposed the edit cannot accept their own proposal.

export default function AgreementDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const myUid = user?.uid ?? '';

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    const unsub = subscribeToAgreement(params.id, (a) => {
      setAgreement(a);
      setLoading(false);
    });
    return unsub;
  }, [params.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!agreement) {
    return (
      <View style={styles.centered}>
        <Text>Agreement not found.</Text>
      </View>
    );
  }

  const isParty =
    myUid === agreement.providerUid || myUid === agreement.buyerUid;
  const myRole: 'provider' | 'buyer' | 'observer' =
    myUid === agreement.providerUid
      ? 'provider'
      : myUid === agreement.buyerUid
      ? 'buyer'
      : 'observer';

  const pending = agreement.pendingEdit ?? null;
  const iProposedEdit = !!pending && pending.proposerUid === myUid;
  const iRequestedCompletion = agreement.completionRequestedBy === myUid;

  async function handleAccept() {
    try {
      await setAgreementStatus(agreement!.id, 'accepted');
    } catch (e: any) {
      Alert.alert('Could not accept', e?.message ?? String(e));
    }
  }

  async function handleAcceptPendingEdit() {
    if (!pending) return;
    try {
      await acceptPendingEdit(agreement!.id, pending.changes);
    } catch (e: any) {
      Alert.alert('Could not accept edit', e?.message ?? String(e));
    }
  }

  async function handleRejectPendingEdit() {
    try {
      await rejectPendingEdit(agreement!.id);
    } catch (e: any) {
      Alert.alert('Could not reject edit', e?.message ?? String(e));
    }
  }

  async function handleRequestCompletion() {
    try {
      await requestCompletion(agreement!.id, myUid);
    } catch (e: any) {
      Alert.alert('Could not mark completed', e?.message ?? String(e));
    }
  }

  async function handleConfirmCompletion() {
    try {
      await confirmCompletion(agreement!.id);
    } catch (e: any) {
      Alert.alert('Could not confirm completion', e?.message ?? String(e));
    }
  }

  async function handleCancelCompletion() {
    try {
      await cancelCompletion(agreement!.id);
    } catch (e: any) {
      Alert.alert('Could not cancel', e?.message ?? String(e));
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agreement</Text>
        <View style={styles.headerBtn} />
      </View>

      {editing ? (
        <EditView
          base={agreement}
          onCancel={() => setEditing(false)}
          onSubmit={async (changes) => {
            try {
              await proposeEdit(agreement.id, myUid, changes);
              setEditing(false);
            } catch (e: any) {
              Alert.alert('Could not propose edit', e?.message ?? String(e));
            }
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <StatusBanner status={agreement.status} />

          {pending && (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingTitle}>Edit proposed</Text>
              <Text style={styles.pendingSub}>
                {iProposedEdit
                  ? 'Waiting for the other party to accept or reject.'
                  : 'The other party proposed changes. Review and decide.'}
              </Text>
              <PendingEditDiff base={agreement} pending={pending.changes} />
              {!iProposedEdit && (
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={handleRejectPendingEdit}
                  >
                    <Text style={styles.cancelText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.primaryBtn]}
                    onPress={handleAcceptPendingEdit}
                  >
                    <Text style={styles.primaryText}>Accept edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <Section label="For listing">
            <Text style={styles.value}>{agreement.listingTitle}</Text>
          </Section>

          <View style={styles.row}>
            <Section label="Provider" style={{ flex: 1 }}>
              <Text style={styles.value}>{agreement.providerName}</Text>
            </Section>
            <Section label="Buyer" style={{ flex: 1 }}>
              <Text style={styles.value}>{agreement.buyerName}</Text>
            </Section>
          </View>

          <Section
            label={agreement.isMultiDay ? 'Service dates' : 'Service date'}
          >
            <Text style={styles.value}>
              {agreement.dates.length === 0
                ? '—'
                : agreement.dates.join(', ')}
            </Text>
          </Section>

          <View style={styles.row}>
            <Section label="Price" style={{ flex: 1 }}>
              <Text style={styles.value}>
                ${agreement.price.toFixed(2)}
                {agreement.unit ? `/${agreement.unit}` : ''}
              </Text>
            </Section>
          </View>

          {agreement.otherDetails ? (
            <Section label="Other details">
              <Text style={styles.value}>{agreement.otherDetails}</Text>
            </Section>
          ) : null}

          {isParty &&
            (agreement.status === 'sent' || agreement.status === 'draft') &&
            !pending && (
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => setEditing(true)}
                >
                  <Text style={styles.cancelText}>Propose edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.primaryBtn]}
                  onPress={handleAccept}
                >
                  <Text style={styles.primaryText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}

          {isParty && agreement.status === 'accepted' && (
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.cancelText}>Propose edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.primaryBtn]}
                onPress={handleRequestCompletion}
              >
                <Text style={styles.primaryText}>Mark as completed</Text>
              </TouchableOpacity>
            </View>
          )}

          {isParty && agreement.status === 'completion-requested' && (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingTitle}>Completion pending</Text>
              <Text style={styles.pendingSub}>
                {iRequestedCompletion
                  ? 'Waiting for the other party to confirm the service is completed.'
                  : 'The other party marked this service completed. Confirm to close it out.'}
              </Text>
              {iRequestedCompletion ? (
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={handleCancelCompletion}
                  >
                    <Text style={styles.cancelText}>Cancel request</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={handleCancelCompletion}
                  >
                    <Text style={styles.cancelText}>Not yet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.primaryBtn]}
                    onPress={handleConfirmCompletion}
                  >
                    <Text style={styles.primaryText}>Confirm completed</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {agreement.status === 'completed' && (
            <Text style={styles.observerNote}>
              This service has been marked completed.
            </Text>
          )}

          {myRole === 'observer' && (
            <Text style={styles.observerNote}>
              You are viewing this agreement as an observer.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Section({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function StatusBanner({ status }: { status: Agreement['status'] }) {
  const map: Record<Agreement['status'], { text: string; bg: string; fg: string }> = {
    draft: { text: 'Draft', bg: '#f3f4f6', fg: '#374151' },
    sent: { text: 'Awaiting acceptance', bg: '#eef2ff', fg: '#1e40af' },
    accepted: { text: 'Accepted by both parties', bg: '#dcfce7', fg: '#166534' },
    'edit-requested': { text: 'Edit proposed', bg: '#fef3c7', fg: '#92400e' },
    'completion-requested': {
      text: 'Completion pending — awaiting confirmation',
      bg: '#e0f2fe',
      fg: '#075985',
    },
    completed: { text: 'Completed', bg: '#e5e7eb', fg: '#374151' },
  };
  const s = map[status];
  return (
    <View style={[styles.banner, { backgroundColor: s.bg }]}>
      <Text style={[styles.bannerText, { color: s.fg }]}>{s.text}</Text>
    </View>
  );
}

function PendingEditDiff({
  base,
  pending,
}: {
  base: Agreement;
  pending: AgreementEditable;
}) {
  const rows: { label: string; before: string; after: string }[] = [];
  const datesBefore = base.dates.join(', ') || '—';
  const datesAfter = pending.dates.join(', ') || '—';
  if (datesBefore !== datesAfter) {
    rows.push({ label: 'Dates', before: datesBefore, after: datesAfter });
  }
  if (base.price !== pending.price) {
    rows.push({
      label: 'Price',
      before: `$${base.price.toFixed(2)}`,
      after: `$${pending.price.toFixed(2)}`,
    });
  }
  if ((base.unit || '') !== (pending.unit || '')) {
    rows.push({ label: 'Unit', before: base.unit || '—', after: pending.unit || '—' });
  }
  if ((base.otherDetails || '') !== (pending.otherDetails || '')) {
    rows.push({
      label: 'Other details',
      before: base.otherDetails || '—',
      after: pending.otherDetails || '—',
    });
  }
  if (rows.length === 0) {
    return <Text style={styles.value}>No field changes.</Text>;
  }
  return (
    <View style={{ gap: 6 }}>
      {rows.map((r) => (
        <View key={r.label} style={styles.diffRow}>
          <Text style={styles.diffLabel}>{r.label}</Text>
          <Text style={styles.diffBefore}>{r.before}</Text>
          <Text style={styles.diffArrow}>→</Text>
          <Text style={styles.diffAfter}>{r.after}</Text>
        </View>
      ))}
    </View>
  );
}

function EditView({
  base,
  onCancel,
  onSubmit,
}: {
  base: Agreement;
  onCancel: () => void;
  onSubmit: (changes: AgreementEditable) => Promise<void>;
}) {
  const [isMultiDay, setIsMultiDay] = useState(base.isMultiDay);
  const [dates, setDates] = useState<string[]>(base.dates);
  const [price, setPrice] = useState<string>(String(base.price ?? ''));
  const [unit, setUnit] = useState<string>(base.unit ?? '');
  const [otherDetails, setOtherDetails] = useState<string>(base.otherDetails ?? '');

  function setMulti(next: boolean) {
    setIsMultiDay(next);
    if (!next && dates.length > 1) setDates(dates.slice(0, 1));
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>Multi-day service</Text>
        <Switch value={isMultiDay} onValueChange={setMulti} />

        <Text style={styles.label}>Dates</Text>
        <Calendar selected={dates} onChange={setDates} multiSelect={isMultiDay} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Unit</Text>
            <TextInput style={styles.input} value={unit} onChangeText={setUnit} />
          </View>
        </View>

        <Text style={styles.label}>Other details</Text>
        <TextInput
          style={styles.textarea}
          multiline
          value={otherDetails}
          onChangeText={setOtherDetails}
        />

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={() =>
              onSubmit({
                dates,
                price: parseFloat(price) || 0,
                unit,
                otherDetails,
              })
            }
          >
            <Text style={styles.primaryText}>Propose changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f9fb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },

  body: { padding: 16, gap: 12, paddingBottom: 60 },

  banner: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  bannerText: { fontWeight: '700', fontSize: 13 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 4 },
  value: { fontSize: 14, color: '#111', fontWeight: '500', marginTop: 2 },

  row: { flexDirection: 'row', gap: 12 },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: '#111',
    marginTop: 6,
  },
  textarea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    color: '#111',
    textAlignVertical: 'top',
    marginTop: 6,
  },

  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff' },
  primaryBtn: { backgroundColor: '#2563eb' },
  cancelText: { color: '#334155', fontWeight: '700' },
  primaryText: { color: '#fff', fontWeight: '700' },

  pendingBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  pendingTitle: { fontWeight: '700', color: '#92400e' },
  pendingSub: { color: '#92400e', fontSize: 12 },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  diffLabel: { fontWeight: '700', color: '#374151', minWidth: 84 },
  diffBefore: { color: '#6b7280', textDecorationLine: 'line-through' },
  diffArrow: { color: '#6b7280' },
  diffAfter: { color: '#166534', fontWeight: '600' },

  observerNote: { color: '#6b7280', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
});
