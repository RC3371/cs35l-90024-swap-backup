import { db } from '@/constants/firebaseConfig';
import { Categories, ListingCardProps, Topics } from '@/components/Listing.types';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

const LISTINGS = 'listings';

export type ListingStatus = 'active' | 'archived' | 'draft';

// The persisted shape of a listing. Mirrors the fields collected by the
// Add Listing form, plus ownership/identity metadata.
export type ListingData = {
  title: string;
  price: number;
  unit: string;
  topic: Topics[];
  category: Categories;
  description?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
};

// A listing read back from Firestore, ready to spread into a ListingCard.
export type Listing = ListingData & {
  id: string;
  owner: string;
  author: string;
  status: ListingStatus;
};

// Pull only the persisted fields off a form/card object so we never write
// transient UI props (version, callbacks, etc.) to Firestore.
function toListingData(data: Partial<ListingCardProps>): ListingData {
  return {
    title: data.title ?? '',
    price: data.price ?? 0,
    unit: data.unit ?? '',
    topic: data.topic ?? [],
    category: data.category ?? Categories.Skills,
    description: data.description ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    imageUrl: data.imageUrl ?? '',
  };
}

function mapDoc(id: string, data: any): Listing {
  return {
    id,
    owner: data.owner,
    author: data.author,
    title: data.title,
    price: data.price,
    unit: data.unit,
    topic: data.topic ?? [],
    category: data.category,
    description: data.description,
    email: data.email,
    phone: data.phone,
    imageUrl: data.imageUrl,
    // Listings created before the archive feature have no status -> treat as active.
    status:
      data.status === 'archived'
        ? 'archived'
        : data.status === 'draft'
          ? 'draft'
          : 'active',
  };
}

// Create a new listing owned by `owner`, displayed under `author`. Returns the new id.
export async function createListing(
  data: Partial<ListingCardProps>,
  owner: string,
  author: string,
  status: ListingStatus = 'active',
): Promise<string> {
  const ref = await addDoc(collection(db, LISTINGS), {
    ...toListingData(data),
    owner,
    author,
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// Fetch a single listing (used to prefill the edit form).
export async function getListing(id: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, LISTINGS, id));
  if (!snap.exists()) return null;
  return mapDoc(snap.id, snap.data());
}

// All listings owned by a user, newest first (profile dashboard).
// Sorted client-side so we don't need a composite Firestore index for the
// owner-equality + createdAt-order combination.
export async function getUserListings(uid: string): Promise<Listing[]> {
  const q = query(collection(db, LISTINGS), where('owner', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .sort(
      (a, b) =>
        (b.data().createdAt?.toMillis?.() ?? 0) -
        (a.data().createdAt?.toMillis?.() ?? 0),
    )
    .map((d) => mapDoc(d.id, d.data()));
}

// Active listings only, newest first (discovery feed). Archived listings are
// filtered out client-side so we don't need a composite index alongside orderBy.
export async function getAllListings(): Promise<Listing[]> {
  const q = query(collection(db, LISTINGS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => mapDoc(d.id, d.data()))
    .filter((l) => l.status === 'active');
}

// Draft listings owned by a user, newest first (the Drafts tab). Filtered
// client-side off getUserListings so we don't need a composite owner+status
// index.
export async function getUserDrafts(uid: string): Promise<Listing[]> {
  const listings = await getUserListings(uid);
  return listings.filter((l) => l.status === 'draft');
}

// Update an existing listing's editable fields.
export async function updateListing(
  id: string,
  data: Partial<ListingCardProps>,
): Promise<void> {
  await updateDoc(doc(db, LISTINGS, id), {
    ...toListingData(data),
    updatedAt: serverTimestamp(),
  });
}

// Permanently remove a listing.
export async function deleteListing(id: string): Promise<void> {
  await deleteDoc(doc(db, LISTINGS, id));
}

// Archive or unarchive a listing (archived ones leave the feed/public profile).
export async function setListingStatus(
  id: string,
  status: ListingStatus,
): Promise<void> {
  await updateDoc(doc(db, LISTINGS, id), { status, updatedAt: serverTimestamp() });
}

// Re-stamp the denormalized author on every listing a user owns. Called when a
// user changes their display name so "By {author}" stays consistent.
export async function setAuthorForUserListings(
  uid: string,
  author: string,
): Promise<void> {
  const q = query(collection(db, LISTINGS), where('owner', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { author }));
  await batch.commit();
}
