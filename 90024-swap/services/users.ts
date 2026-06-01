import { auth, db } from '@/constants/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { deleteField, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { setAuthorForUserListings } from './listings';

const USERS = 'users';

// A display name may only be changed once every 14 days.
export const DISPLAY_NAME_COOLDOWN_DAYS = 14;
const COOLDOWN_MS = DISPLAY_NAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

// Public-facing user profile, as stored under users/{uid}.
export type UserProfile = {
  uid: string;
  userId: string;
  email: string;
  displayName: string;
  phone?: string; // legacy combined field (older accounts)
  phoneCountryCode?: string; // e.g. "+1"
  phoneNumber?: string; // 10 digits
  photo?: string; // data-URI of the profile picture; absent => letter avatar
  displayNameUpdatedAt?: number; // millis of the last display-name change
};

// Editable fields. `photo: null` clears the picture (reset to default).
export type UserProfileUpdate = {
  phone?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  photo?: string | null;
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
    phoneCountryCode: data.phoneCountryCode,
    phoneNumber: data.phoneNumber,
    photo: data.photo,
    displayNameUpdatedAt: data.displayNameUpdatedAt?.toMillis?.(),
  };
}

// Update editable contact fields / profile picture on a user's own profile.
export async function updateUserProfile(
  uid: string,
  data: UserProfileUpdate,
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.phoneCountryCode !== undefined) payload.phoneCountryCode = data.phoneCountryCode;
  if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber;
  if (data.photo !== undefined) {
    payload.photo = data.photo === null ? deleteField() : data.photo;
  }
  await updateDoc(doc(db, USERS, uid), payload);
}

// Whether the user is currently allowed to change their display name, and if
// not, the date they'll be able to again.
export function canChangeDisplayName(
  profile: Pick<UserProfile, 'displayNameUpdatedAt'> | null,
): { allowed: boolean; nextDate: Date | null } {
  const last = profile?.displayNameUpdatedAt;
  if (!last) return { allowed: true, nextDate: null };
  const next = last + COOLDOWN_MS;
  return next <= Date.now()
    ? { allowed: true, nextDate: null }
    : { allowed: false, nextDate: new Date(next) };
}

// Change the user's display name (full name). Enforces the 14-day cooldown,
// updates the Firebase Auth profile, and re-stamps the author on their listings.
export async function updateDisplayName(uid: string, newName: string): Promise<void> {
  const trimmed = newName.trim();
  if (!trimmed) throw new Error('Display name cannot be empty.');

  const current = await getUserProfile(uid);
  const { allowed, nextDate } = canChangeDisplayName(current);
  if (!allowed) {
    throw new Error(
      `You can change your name again on ${nextDate?.toLocaleDateString()}.`,
    );
  }

  await updateDoc(doc(db, USERS, uid), {
    displayName: trimmed,
    displayNameUpdatedAt: serverTimestamp(),
  });
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: trimmed });
  }
  await setAuthorForUserListings(uid, trimmed);
}
