import { ListingCard } from '@/components/listing-card';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteListing,
  getUserDrafts,
  Listing,
  setListingStatus,
} from '@/services/listings';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Drafts() {
  const router = useRouter();
  const { user } = useAuth();
  const uid = user?.uid;

  const [drafts, setDrafts] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) {
      setDrafts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setDrafts(await getUserDrafts(uid));
    } catch (err) {
      console.error('Failed to load drafts', err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // Reload whenever the tab regains focus (e.g. after saving/publishing on the form).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleNew() {
    router.push('/(tabs)/addListing');
  }

  function handleEdit(id?: string) {
    if (!id) return;
    router.push({ pathname: '/(tabs)/addListing', params: { listingId: id } });
  }

  async function handlePublish(id?: string) {
    if (!id) return;
    // optimistic: drop it from the drafts list right away
    setDrafts((prev) => prev.filter((l) => l.id !== id));
    try {
      await setListingStatus(id, 'active');
    } catch (err) {
      console.error('Failed to publish draft', err);
      Alert.alert('Error', 'Could not publish this draft. Please try again.');
      load();
    }
  }

  function handleDelete(id?: string) {
    if (!id) return;
    Alert.alert('Delete draft', 'Are you sure you want to delete this draft?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteListing(id);
            setDrafts((prev) => prev.filter((l) => l.id !== id));
          } catch (err) {
            console.error('Failed to delete draft', err);
            Alert.alert('Error', 'Could not delete this draft. Please try again.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Drafts</Text>
        <TouchableOpacity style={styles.newButton} onPress={handleNew}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : drafts.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="document-outline" size={42} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No drafts yet</Text>
          <Text style={styles.emptySub}>
            Tap “New” to start a listing and save it as a draft. Publish it whenever you’re ready.
          </Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ListingCard
              {...item}
              version="compact"
              viewerUid={uid}
              onEdit={() => handleEdit(item.id)}
              onPublish={() => handlePublish(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f9fb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  newButtonText: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, paddingTop: 8 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginTop: 4 },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 19 },
});
