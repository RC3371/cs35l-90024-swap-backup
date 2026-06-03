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

function rethrow(e: unknown): never {
  const code = (e as { code?: string })?.code;
  const normalized: AuthErrorCode =
    code && KNOWN_CODES.has(code as AuthErrorCode) ? (code as AuthErrorCode) : 'auth/unknown';
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

  async signUp(email, password, displayName, userId) {
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
