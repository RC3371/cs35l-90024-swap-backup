import { auth, db } from '@/constants/firebaseConfig';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppUser, AuthError, AuthErrorCode, AuthService } from './authService';

function toAppUser(user: User | null): AppUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
  };
}

// Firebase already uses the auth/* codes we declare in AuthService. Anything
// unrecognized gets normalized to auth/unknown so callers never see a raw
// Firebase error shape.
const KNOWN_CODES: ReadonlySet<AuthErrorCode> = new Set<AuthErrorCode>([
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/email-already-in-use',
  'auth/userid-taken',
  'auth/weak-password',
  'auth/invalid-email',
  'auth/too-many-requests',
]);

// Firestore throws bare codes like `permission-denied` / `unavailable` (no
// `auth/` prefix). Map those onto our auth vocabulary so callers get a
// meaningful message instead of the catch-all "Something went wrong".
const FIRESTORE_CODE_MAP: Readonly<Record<string, AuthErrorCode>> = {
  'permission-denied': 'auth/permission-denied',
  unavailable: 'auth/permission-denied',
};

function rethrow(e: unknown): never {
  const code = (e as { code?: string })?.code;
  // Surface the real underlying error so the true cause is visible in logs
  // (the normalized code below intentionally hides backend specifics from the UI).
  console.warn('[auth] underlying error:', code, (e as { message?: string })?.message);
  let normalized: AuthErrorCode = 'auth/unknown';
  if (code && KNOWN_CODES.has(code as AuthErrorCode)) {
    normalized = code as AuthErrorCode;
  } else if (code && FIRESTORE_CODE_MAP[code]) {
    normalized = FIRESTORE_CODE_MAP[code];
  }
  const err: AuthError = { code: normalized };
  throw err;
}

async function resolveIdentifierToEmail(identifier: string): Promise<string> {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) return trimmed.toLowerCase();
  const snap = await getDoc(doc(db, 'userIds', trimmed.toLowerCase()));
  if (!snap.exists()) {
    const err: AuthError = { code: 'auth/user-not-found' };
    throw err;
  }
  return snap.data().email as string;
}

export const firebaseAuthService: AuthService = {
  async signIn(identifier, password) {
    try {
      const email = await resolveIdentifierToEmail(identifier);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      rethrow(e);
    }
  },

  async signUp(
    email,
    password,
    displayName,
    userId,
    phoneCountryCode,
    phoneNumber,
    firstName,
    lastName,
  ) {
    try {
      const userIdKey = userId.trim().toLowerCase();
      const userIdRef = doc(db, 'userIds', userIdKey);
      const existing = await getDoc(userIdRef);
      if (existing.exists()) {
        const err: AuthError = { code: 'auth/userid-taken' };
        throw err;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });

      await setDoc(userIdRef, {
        userId: userId.trim(),
        email,
        uid: cred.user.uid,
      });
      await setDoc(doc(db, 'users', cred.user.uid), {
        userId: userId.trim(),
        email,
        displayName,
        ...(firstName ? { firstName: firstName.trim() } : {}),
        ...(lastName ? { lastName: lastName.trim() } : {}),
        phoneCountryCode,
        phoneNumber,
        phone: `${phoneCountryCode} ${phoneNumber}`,
      });

      await sendEmailVerification(cred.user);
      await firebaseSignOut(auth);
    } catch (e) {
      rethrow(e);
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      rethrow(e);
    }
  },

  async resendVerification(identifier, password) {
    try {
      const email = await resolveIdentifierToEmail(identifier);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await firebaseSignOut(auth);
    } catch (e) {
      rethrow(e);
    }
  },

  getCurrentUser() {
    return toAppUser(auth.currentUser);
  },

  observeAuthState(callback) {
    return onAuthStateChanged(auth, (user) => callback(toAppUser(user)));
  },
};
