// Public auth contract — the rest of the app depends on this, not on Firebase.
// Swapping providers (Supabase, custom backend, …) means writing a new
// implementation of AuthService without touching the UI or contexts.

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
};

// Stable error codes the AuthService promises to throw. Firebase happens to
// emit these natively; another backend would translate to the same vocabulary.
export type AuthErrorCode =
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/invalid-credential'
  | 'auth/email-already-in-use'
  | 'auth/userid-taken'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/too-many-requests'
  | 'auth/permission-denied'
  | 'auth/unknown';

export type AuthError = { code: AuthErrorCode };

export interface AuthService {
  signIn(identifier: string, password: string): Promise<void>;
  signUp(
    email: string,
    password: string,
    displayName: string,
    userId: string,
    phoneCountryCode: string,
    phoneNumber: string,
    firstName?: string,
    lastName?: string,
  ): Promise<void>;
  signOut(): Promise<void>;
  resendVerification(identifier: string, password: string): Promise<void>;
  getCurrentUser(): AppUser | null;
  observeAuthState(callback: (user: AppUser | null) => void): () => void;
}
