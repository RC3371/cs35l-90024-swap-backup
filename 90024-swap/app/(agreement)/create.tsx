import { Calendar } from '@/components/Calendar';
import { makeDraftAgreement } from '@/components/Agreement.types';
import { createAgreement } from '@/constants/agreements';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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

// Params we expect the listing card / conversation to pass when navigating here.
type CreateParams = {
  listingId?: string;
  listingTitle?: string;
  unit?: string;
  price?: string;
  // The other party in the deal. The current user is one side; this is the other.
  otherUid?: string;
  otherName?: string;
  // Which side the current user is on for this listing.
  currentUserRole?: 'provider' | 'buyer';
};

export default function CreateAgreement() {
  const router = useRouter();
  const params = useLocalSearchParams<CreateParams>();
  const { user } = useAuth();

  const currentUid = user?.uid ?? 'me';
  const currentName = user?.displayName ?? user?.email ?? 'You';

  // For now we let the form work even without auth so the screen is usable
  // before firebase-setup lands fully merged. Real submission needs a uid.
  const role: 'provider' | 'buyer' =
    (params.currentUserRole as 'provider' | 'buyer') ?? 'provider';

  const initial = useMemo(
    () =>
      makeDraftAgreement({
        providerUid: role === 'provider' ? currentUid : params.otherUid ?? '',
        providerName: role === 'provider' ? currentName : params.otherName ?? 'Provider',
        buyerUid: role === 'buyer' ? currentUid : params.otherUid ?? '',
        buyerName: role === 'buyer' ? currentName : params.otherName ?? 'Buyer',
        listingId: params.listingId,
        listingTitle: params.listingTitle ?? 'Untitled listing',
        unit: params.unit,
        price: params.price ? parseFloat(params.price) || 0 : 0,
      }),
    [
      currentName,
      currentUid,
      params.listingId,
      params.listingTitle,
      params.otherName,
      params.otherUid,
      params.price,
      params.unit,
      role,
    ],
  );

  const [isMultiDay, setIsMultiDay] = useState(initial.isMultiDay);
  const [dates, setDates] = useState<string[]>(initial.dates);
  const [price, setPrice] = useState<string>(
    initial.price ? String(initial.price) : '',
  );
  const [unit, setUnit] = useState<string>(initial.unit);
  const [otherDetails, setOtherDetails] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  // Shown inline so it works on web too (react-native-web's Alert is a no-op).
  const [formError, setFormError] = useState<string | null>(null);

  function setMultiDay(next: boolean) {
    setIsMultiDay(next);
    // Single-day mode keeps only the first date; multi-day keeps all.
    if (!next && dates.length > 1) setDates(dates.slice(0, 1));
  }

  async function handleSend() {
    setFormError(null);
    if (dates.length === 0) {
      setFormError('Choose at least one date for the agreement.');
      return;
    }
    const priceValue = parseFloat(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setFormError('Enter a price greater than 0.');
      return;
    }
    if (unit.trim() === '') {
      setFormError('Enter a unit (e.g., hour, total).');
      return;
    }
    if (initial.providerUid !== '' && initial.providerUid === initial.buyerUid) {
      setFormError("You can't create an agreement with yourself.");
      return;
    }
    const draft = {
      ...initial,
      isMultiDay,
      dates,
      price: priceValue,
      unit: unit.trim(),
      otherDetails,
      status: 'sent' as const,
    };
    try {
      setSubmitting(true);
      await createAgreement(draft);
      router.replace('/(tabs)/agreements');
    } catch (e: any) {
      console.error('[create agreement] send failed', e);
      setFormError(e?.message ?? 'Could not send agreement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Agreement</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.parties}>
          <Text style={styles.partyLabel}>For listing</Text>
          <Text style={styles.partyValue}>{initial.listingTitle}</Text>

          <View style={styles.partyRow}>
            <View style={styles.partyCol}>
              <Text style={styles.partyLabel}>Provider</Text>
              <Text style={styles.partyValue}>{initial.providerName}</Text>
            </View>
            <View style={styles.partyCol}>
              <Text style={styles.partyLabel}>Buyer</Text>
              <Text style={styles.partyValue}>{initial.buyerName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Multi-day service</Text>
          </View>
          <Switch value={isMultiDay} onValueChange={setMultiDay} />
        </View>

        <Text style={styles.label}>
          {isMultiDay ? 'Service dates' : 'Service date'}
          <Text style={styles.required}> *</Text>
        </Text>
        <Calendar
          selected={dates}
          onChange={setDates}
          multiSelect={isMultiDay}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>
              Price<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#999"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>
              Unit<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., hour / total"
              placeholderTextColor="#999"
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        <Text style={styles.label}>Other details</Text>
        <TextInput
          style={styles.textarea}
          multiline
          placeholder="Anything else both parties should agree to (deposit, location, cancellation policy, etc.)"
          placeholderTextColor="#999"
          value={otherDetails}
          onChangeText={setOtherDetails}
        />
      </ScrollView>

      <View style={styles.footer}>
        {formError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={submitting}
          >
            <Text style={styles.primaryText}>
              {submitting ? 'Sending…' : 'Send Agreement'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f9fb' },
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
  form: { padding: 16, gap: 12, paddingBottom: 120 },
  parties: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  partyRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  partyCol: { flex: 1 },
  partyLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  partyValue: { fontSize: 14, color: '#111', fontWeight: '600' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },

  label: { fontSize: 14, fontWeight: '600', color: '#222', marginTop: 4 },
  required: { color: '#d32f2f' },

  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },

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
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    color: '#111',
    textAlignVertical: 'top',
    marginTop: 6,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 10,
    padding: 16,
    backgroundColor: '#f8f9fb',
    borderTopWidth: 1,
    borderTopColor: '#eef2ff',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
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
});
