import { db } from '@/constants/firebaseConfig';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getListing, Listing } from './listings';

// Saved (bookmarked) posts live in a per-user subcollection so they are private
// to that user: users/{uid}/saved/{listingId}.
function savedCol(uid: string) {
  return collection(db, 'users', uid, 'saved');
}

// Bookmark a listing for the given user.
export async function savePost(uid: string, listingId: string): Promise<void> {
  await setDoc(doc(savedCol(uid), listingId), {
    listingId,
    savedAt: serverTimestamp(),
  });
}

// Remove a bookmark.
export async function unsavePost(uid: string, listingId: string): Promise<void> {
  await deleteDoc(doc(savedCol(uid), listingId));
}

// The set of listing ids the user has saved (used for bookmark state on the feed).
export async function getSavedListingIds(uid: string): Promise<Set<string>> {
  const snap = await getDocs(savedCol(uid));
  return new Set(snap.docs.map((d) => d.id));
}

// The user's saved listings, hydrated. Deleted listings are dropped (the saved
// reference is left in place but simply not shown).
export async function getSavedListings(uid: string): Promise<Listing[]> {
  const ids = await getSavedListingIds(uid);
  const listings = await Promise.all([...ids].map((id) => getListing(id)));
  return listings.filter((l): l is Listing => l !== null);
}
