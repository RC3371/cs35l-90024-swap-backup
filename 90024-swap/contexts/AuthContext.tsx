import { firebaseAuthService } from '@/services/firebaseAuthService';
import { AppUser, AuthService } from '@/services/authService';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signIn: AuthService['signIn'];
  signUp: AuthService['signUp'];
  signOut: AuthService['signOut'];
  resendVerification: AuthService['resendVerification'];
  getCurrentUser: AuthService['getCurrentUser'];
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// The provider depends on the AuthService interface, not on Firebase directly.
// Swapping `firebaseAuthService` for another implementation is the only change
// needed to migrate auth providers.
export function AuthProvider({
  children,
  service = firebaseAuthService,
}: {
  children: ReactNode;
  service?: AuthService;
}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = service.observeAuthState((next) => {
      setUser(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [service]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: service.signIn,
        signUp: service.signUp,
        signOut: service.signOut,
        resendVerification: service.resendVerification,
        getCurrentUser: service.getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
