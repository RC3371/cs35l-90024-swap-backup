import { db } from '@/constants/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const USERS = 'users';

// Public-facing user profile, as stored under users/{uid}.
export type UserProfile = {
  uid: string;
  userId: string;
  email: string;
  displayName: string;
  phone?: string;
};

// Fetch a user's profile document. Returns null if it doesn't exist yet.
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    userId: data.userId,
    email: data.email,
    displayName: data.displayName,
    phone: data.phone,
  };
}

// Update editable contact fields on a user's own profile.
export async function updateUserProfile(
  uid: string,
  data: { phone?: string },
): Promise<void> {
  await updateDoc(doc(db, USERS, uid), data);
}
