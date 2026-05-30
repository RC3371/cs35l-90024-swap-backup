import { ListingCard } from '@/components/listing-card';
import {
  deleteListing,
  getUserListings,
  Listing,
} from '@/services/listings';
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from '@/services/users';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// Shared profile screen used both for the current user's own profile (isOwner)
// and for a public provider profile reached from the feed (read-only).
export function ProfileView({ uid, isOwner }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, l] = await Promise.all([
        getUserProfile(uid),
        getUserListings(uid),
      ]);
      setProfile(p);
      setListings(l);
      setPhoneDraft(p?.phone ?? '');
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // Refetch whenever the screen regains focus so newly added/edited/deleted
  // listings stay in sync.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleEdit(id?: string) {
    if (!id) return;
    router.push({ pathname: '/(tabs)/addListing', params: { listingId: id } });
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
          } catch (err) {
            console.error('Failed to delete listing', err);
            Alert.alert('Error', 'Could not delete the listing. Please try again.');
          }
        },
      },
    ]);
  }

  async function handleSavePhone() {
    setSavingPhone(true);
    try {
      await updateUserProfile(uid, { phone: phoneDraft.trim() });
      setProfile((prev) => (prev ? { ...prev, phone: phoneDraft.trim() } : prev));
      setEditingPhone(false);
    } catch (err) {
      console.error('Failed to update contact info', err);
      Alert.alert('Error', 'Could not save your contact info. Please try again.');
    } finally {
      setSavingPhone(false);
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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header / identity card */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.displayName?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile.displayName}</Text>
        <Text style={styles.handle}>@{profile.userId}</Text>

        <View style={styles.contactBlock}>
          <Text style={styles.contactRow}>Email: {profile.email}</Text>

          {editingPhone ? (
            <View style={styles.phoneEditRow}>
              <TextInput
                style={styles.phoneInput}
                placeholder="310-825-4321"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phoneDraft}
                onChangeText={setPhoneDraft}
              />
              <TouchableOpacity
                style={[styles.smallButton, styles.saveButton]}
                onPress={handleSavePhone}
                disabled={savingPhone}
              >
                <Text style={styles.saveButtonText}>
                  {savingPhone ? '...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.phoneRow}>
              <Text style={styles.contactRow}>
                Phone: {profile.phone ? profile.phone : 'Not provided'}
              </Text>
              {isOwner && (
                <TouchableOpacity onPress={() => setEditingPhone(true)}>
                  <Text style={styles.editLink}>
                    {profile.phone ? 'Edit' : 'Add'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Listings dashboard */}
      <Text style={styles.sectionTitle}>
        {isOwner ? 'My Listings' : 'Active Listings'} ({listings.length})
      </Text>

      {listings.length === 0 ? (
        <Text style={styles.emptyText}>
          {isOwner
            ? 'You have no active listings yet.'
            : 'This user has no active listings.'}
        </Text>
      ) : (
        listings.map((listing) => (
          <ListingCard
            key={listing.id}
            {...listing}
            version="compact"
            onEdit={isOwner ? () => handleEdit(listing.id) : undefined}
            onDelete={isOwner ? () => handleDelete(listing.id) : undefined}
          />
        ))
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
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
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
