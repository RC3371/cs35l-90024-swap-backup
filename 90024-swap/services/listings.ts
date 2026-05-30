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
} from 'firebase/firestore';

const LISTINGS = 'listings';

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
  };
}

// Create a new listing owned by `owner`, displayed under `author`. Returns the new id.
export async function createListing(
  data: Partial<ListingCardProps>,
  owner: string,
  author: string,
): Promise<string> {
  const ref = await addDoc(collection(db, LISTINGS), {
    ...toListingData(data),
    owner,
    author,
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

// Every listing, newest first (discovery feed).
export async function getAllListings(): Promise<Listing[]> {
  const q = query(collection(db, LISTINGS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
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
