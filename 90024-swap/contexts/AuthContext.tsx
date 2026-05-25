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
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    userId: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resendVerification: (identifier: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Resolve a sign-in identifier (email or userId) to an email address.
// userIds are stored in Firestore under the lowercased id as the document key.
async function resolveIdentifierToEmail(identifier: string): Promise<string> {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) return trimmed.toLowerCase();
  const snap = await getDoc(doc(db, 'userIds', trimmed.toLowerCase()));
  if (!snap.exists()) {
    // mirror Firebase's error shape so the login screen can show a friendly message
    throw { code: 'auth/user-not-found' };
  }
  return snap.data().email as string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (identifier: string, password: string) => {
    const email = await resolveIdentifierToEmail(identifier);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    userId: string,
  ) => {
    const userIdKey = userId.trim().toLowerCase();
    const userIdRef = doc(db, 'userIds', userIdKey);
    const existing = await getDoc(userIdRef);
    if (existing.exists()) {
      throw { code: 'auth/userid-taken' };
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
    // sign back out so they have to verify before entering the app
    await firebaseSignOut(auth);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // re-send verification by signing in temporarily, sending, then signing out
  const resendVerification = async (identifier: string, password: string) => {
    const email = await resolveIdentifierToEmail(identifier);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
