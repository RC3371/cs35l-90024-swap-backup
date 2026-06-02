import { ListingCard } from '@/components/listing-card';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteListing,
  getUserListings,
  Listing,
  setListingStatus,
} from '@/services/listings';
import {
  getSavedListingIds,
  getSavedListings,
  savePost,
  unsavePost,
} from '@/services/saved';
import {
  canChangeDisplayName,
  getUserProfile,
  updateDisplayName,
  updateUserProfile,
  UserProfile,
} from '@/services/users';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  uid: string;
  isOwner: boolean;
};

type Tab = 'active' | 'archived' | 'saved';

const COUNTRY_CODES = ['+1', '+44', '+91', '+61', '+86', '+81', '+49', '+33', '+52', '+55'];

// Shared profile screen used both for the current user's own profile (isOwner)
// and for a public provider profile reached from the feed (read-only).
export function ProfileView({ uid, isOwner }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const viewerUid = user?.uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('active');

  // Contact editing
  const [editingPhone, setEditingPhone] = useState(false);
  const [codeDraft, setCodeDraft] = useState('+1');
  const [numberDraft, setNumberDraft] = useState('');
  const [codeOpen, setCodeOpen] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // Display-name editing
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [photoBusy, setPhotoBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, l, ids, saved] = await Promise.all([
        getUserProfile(uid),
        getUserListings(uid),
        viewerUid ? getSavedListingIds(viewerUid) : Promise.resolve(new Set<string>()),
        isOwner ? getSavedListings(uid) : Promise.resolve<Listing[]>([]),
      ]);
      setProfile(p);
      setListings(l);
      setSavedIds(ids);
      setSavedListings(saved);
      setCodeDraft(p?.phoneCountryCode ?? '+1');
      setNumberDraft(p?.phoneNumber ?? '');
      setNameDraft(p?.displayName ?? '');
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  }, [uid, viewerUid, isOwner]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleEdit(id?: string) {
    if (!id) return;
    router.push({ pathname: '/(tabs)/addListing', params: { listingId: id } });
  }

  function setStatusLocal(id: string, status: 'active' | 'archived') {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function handleArchive(id?: string) {
    if (!id) return;
    setStatusLocal(id, 'archived');
    try {
      await setListingStatus(id, 'archived');
    } catch (err) {
      console.error('Failed to archive listing', err);
      setStatusLocal(id, 'active');
      Alert.alert('Error', 'Could not archive the listing. Please try again.');
    }
  }

  async function handleUnarchive(id?: string) {
    if (!id) return;
    setStatusLocal(id, 'active');
    try {
      await setListingStatus(id, 'active');
    } catch (err) {
      console.error('Failed to unarchive listing', err);
      setStatusLocal(id, 'archived');
      Alert.alert('Error', 'Could not unarchive the listing. Please try again.');
    }
  }

  function handleDelete(id?: string) {
    if (!id) return;
    Alert.alert('Delete listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteListing(id);
            setListings((prev) => prev.filter((l) => l.id !== id));
            setSavedListings((prev) => prev.filter((l) => l.id !== id));
          } catch (err) {
            console.error('Failed to delete listing', err);
            Alert.alert('Error', 'Could not delete the listing. Please try again.');
          }
        },
      },
    ]);
  }

  async function handleToggleSave(listing: Listing) {
    if (!viewerUid || !listing.id) return;
    const id = listing.id;
    const isSaved = savedIds.has(id);
    // optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    if (isSaved) setSavedListings((prev) => prev.filter((l) => l.id !== id));
    else setSavedListings((prev) => [listing, ...prev.filter((l) => l.id !== id)]);

    try {
      if (isSaved) await unsavePost(viewerUid, id);
      else await savePost(viewerUid, id);
    } catch (err) {
      console.error('Failed to toggle saved post', err);
      load(); // resync on failure
    }
  }

  async function handleSavePhone() {
    const digits = numberDraft.replace(/\D/g, '');
    if (digits.length !== 10) {
      Alert.alert('Invalid number', 'Please enter exactly 10 digits.');
      return;
    }
    setSavingPhone(true);
    try {
      await updateUserProfile(uid, {
        phoneCountryCode: codeDraft,
        phoneNumber: digits,
        phone: `${codeDraft} ${digits}`,
      });
      setProfile((prev) =>
        prev
          ? { ...prev, phoneCountryCode: codeDraft, phoneNumber: digits, phone: `${codeDraft} ${digits}` }
          : prev,
      );
      setEditingPhone(false);
      setCodeOpen(false);
    } catch (err) {
      console.error('Failed to update contact info', err);
      Alert.alert('Error', 'Could not save your contact info. Please try again.');
    } finally {
      setSavingPhone(false);
    }
  }

  async function handleSaveName() {
    setSavingName(true);
    try {
      await updateDisplayName(uid, nameDraft);
      setEditingName(false);
      await load();
    } catch (err: any) {
      Alert.alert('Cannot change name', err?.message ?? 'Please try again later.');
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled || !result.assets?.length) return;

    setPhotoBusy(true);
    try {
      // Resize + compress so the base64 stays well under Firestore's 1MB limit.
      const rendered = await ImageManipulator.manipulate(result.assets[0].uri)
        .resize({ width: 256 })
        .renderAsync();
      const image = await rendered.saveAsync({
        compress: 0.6,
        format: SaveFormat.JPEG,
        base64: true,
      });
      const dataUri = `data:image/jpeg;base64,${image.base64}`;
      await updateUserProfile(uid, { photo: dataUri });
      setProfile((prev) => (prev ? { ...prev, photo: dataUri } : prev));
    } catch (err) {
      console.error('Failed to update photo', err);
      Alert.alert('Error', 'Could not update your photo. Please try again.');
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleResetPhoto() {
    setPhotoBusy(true);
    try {
      await updateUserProfile(uid, { photo: null });
      setProfile((prev) => (prev ? { ...prev, photo: undefined } : prev));
    } catch (err) {
      console.error('Failed to reset photo', err);
      Alert.alert('Error', 'Could not reset your photo. Please try again.');
    } finally {
      setPhotoBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Profile not found.</Text>
      </View>
    );
  }

  const phoneDisplay =
    profile.phoneCountryCode && profile.phoneNumber
      ? `${profile.phoneCountryCode} ${profile.phoneNumber}`
      : profile.phone || '';

  const nameGate = canChangeDisplayName(profile);

  const activeListings = listings.filter((l) => l.status !== 'archived');
  const archivedListings = listings.filter((l) => l.status === 'archived');

  // Which list to render for the current tab.
  const shownListings = !isOwner
    ? activeListings
    : tab === 'active'
      ? activeListings
      : tab === 'archived'
        ? archivedListings
        : savedListings;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header / identity card */}
      <View style={styles.headerCard}>
        {profile.photo ? (
          <Image source={{ uri: profile.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.displayName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}

        {isOwner && (
          <View style={styles.photoActions}>
            <TouchableOpacity onPress={handleChangePhoto} disabled={photoBusy}>
              <Text style={styles.editLink}>{photoBusy ? '...' : 'Change photo'}</Text>
            </TouchableOpacity>
            {profile.photo && (
              <TouchableOpacity onPress={handleResetPhoto} disabled={photoBusy}>
                <Text style={styles.resetLink}>Reset to default</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Display name (editable, once / 14 days) */}
        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              placeholder="Your full name"
              placeholderTextColor="#999"
              value={nameDraft}
              onChangeText={setNameDraft}
            />
            <TouchableOpacity
              style={[styles.smallButton, styles.saveButton]}
              onPress={handleSaveName}
              disabled={savingName}
            >
              <Text style={styles.saveButtonText}>{savingName ? '...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton} onPress={() => setEditingName(false)}>
              <Text style={styles.cancelLink}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.displayName}</Text>
            {isOwner && (
              <TouchableOpacity
                onPress={() => {
                  if (!nameGate.allowed) {
                    Alert.alert(
                      'Name change limit',
                      `You can change your name again on ${nameGate.nextDate?.toLocaleDateString()}.`,
                    );
                    return;
                  }
                  setNameDraft(profile.displayName ?? '');
                  setEditingName(true);
                }}
              >
                <Text style={styles.editLink}> Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {isOwner && !nameGate.allowed && !editingName && (
          <Text style={styles.gateNote}>
            Name can be changed again on {nameGate.nextDate?.toLocaleDateString()}
          </Text>
        )}

        <Text style={styles.handle}>@{profile.userId}</Text>

        <View style={styles.contactBlock}>
          <Text style={styles.contactRow}>Email: {profile.email}</Text>

          {editingPhone ? (
            <View>
              <View style={styles.phoneEditRow}>
                <TouchableOpacity
                  style={styles.codeBox}
                  onPress={() => setCodeOpen((o) => !o)}
                >
                  <Text style={styles.codeText}>{codeDraft}</Text>
                  <Text style={styles.chevron}>{codeOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="3108254321"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={numberDraft}
                  onChangeText={(t) => setNumberDraft(t.replace(/\D/g, ''))}
                />
                <TouchableOpacity
                  style={[styles.smallButton, styles.saveButton]}
                  onPress={handleSavePhone}
                  disabled={savingPhone}
                >
                  <Text style={styles.saveButtonText}>{savingPhone ? '...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
              {codeOpen && (
                <View style={styles.codeDropdown}>
                  {COUNTRY_CODES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={styles.codeItem}
                      onPress={() => {
                        setCodeDraft(c);
                        setCodeOpen(false);
                      }}
                    >
                      <Text style={styles.codeItemText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.phoneRow}>
              <Text style={styles.contactRow}>
                Phone: {phoneDisplay ? phoneDisplay : 'Not provided'}
              </Text>
              {isOwner && (
                <TouchableOpacity onPress={() => setEditingPhone(true)}>
                  <Text style={styles.editLink}>{phoneDisplay ? 'Edit' : 'Add'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Segmented control (owner only) */}
      {isOwner && (
        <View style={styles.segment}>
          {(['active', 'archived', 'saved'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.segmentItem, tab === t && styles.segmentItemActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
                {t === 'active' ? 'Active' : t === 'archived' ? 'Archived' : 'Saved'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!isOwner && (
        <Text style={styles.sectionTitle}>Active Listings ({activeListings.length})</Text>
      )}

      {shownListings.length === 0 ? (
        <Text style={styles.emptyText}>
          {!isOwner
            ? 'This user has no active listings.'
            : tab === 'active'
              ? 'You have no active listings yet.'
              : tab === 'archived'
                ? 'No archived listings.'
                : 'You have not saved any posts yet.'}
        </Text>
      ) : (
        shownListings.map((listing) => {
          const ownerActions = isOwner && tab !== 'saved';
          return (
            <ListingCard
              key={listing.id}
              {...listing}
              version="compact"
              onEdit={ownerActions && tab === 'active' ? () => handleEdit(listing.id) : undefined}
              onArchive={ownerActions && tab === 'active' ? () => handleArchive(listing.id) : undefined}
              onUnarchive={ownerActions && tab === 'archived' ? () => handleUnarchive(listing.id) : undefined}
              onDelete={ownerActions ? () => handleDelete(listing.id) : undefined}
              // Saved-toggle: on the Saved tab and on public profiles a logged-in viewer can (un)save.
              isSaved={listing.id ? savedIds.has(listing.id) : false}
              onToggleSave={
                viewerUid && (!isOwner || tab === 'saved')
                  ? () => handleToggleSave(listing)
                  : undefined
              }
            />
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fb',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  resetLink: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  nameInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#111',
    backgroundColor: '#fff',
  },
  gateNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  cancelLink: {
    color: '#6b7280',
    fontWeight: '600',
  },
  handle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  contactBlock: {
    marginTop: 16,
    width: '100%',
    gap: 6,
  },
  contactRow: {
    fontSize: 14,
    color: '#374151',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBox: {
    height: 40,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  codeText: {
    color: '#111',
    fontWeight: '600',
    marginRight: 4,
  },
  chevron: {
    color: '#6b7280',
    fontSize: 12,
  },
  codeDropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  codeItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  codeItemText: {
    color: '#111',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#111',
    backgroundColor: '#fff',
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  editLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#eef2f7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentItemActive: {
    backgroundColor: '#fff',
  },
  segmentText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 14,
  },
  segmentTextActive: {
    color: '#111',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
