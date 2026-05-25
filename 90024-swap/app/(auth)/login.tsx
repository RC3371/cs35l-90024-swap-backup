import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/constants/firebaseConfig';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function firebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid credentials. Check your email/user ID and password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/userid-taken':
      return 'That user ID is already taken. Please pick another.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const USER_ID_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export default function LoginScreen() {
  const { signIn, signUp, signOut, resendVerification } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  // in sign-in mode this holds an email OR a user ID; in sign-up mode it must be an email
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // when sign-in succeeds but email isn't verified, surface a "resend" affordance
  const [showResend, setShowResend] = useState(false);

  const clearMessages = () => {
    setError(null);
    setInfo(null);
    setShowResend(false);
  };

  const validate = () => {
    const trimmedIdentifier = identifier.trim().toLowerCase();
    if (!trimmedIdentifier) {
      setError(isSignUp ? 'Please enter your UCLA email.' : 'Please enter your email or user ID.');
      return false;
    }
    if (isSignUp) {
      if (!trimmedIdentifier.endsWith('@ucla.edu')) {
        setError('Please use your UCLA email (must end in @ucla.edu).');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedIdentifier)) {
        setError('Please enter a valid email address.');
        return false;
      }
    } else if (trimmedIdentifier.includes('@')) {
      // signing in with an email — still require it to be a valid email shape
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedIdentifier)) {
        setError('Please enter a valid email address.');
        return false;
      }
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (isSignUp) {
      if (!displayName.trim()) {
        setError('Please enter your name.');
        return false;
      }
      if (!USER_ID_REGEX.test(userId.trim())) {
        setError('User ID must be 3-20 characters: letters, numbers, or underscores.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    clearMessages();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(
          identifier.trim().toLowerCase(),
          password,
          displayName.trim(),
          userId.trim(),
        );
        // signUp signs the user out; bring them back to the sign-in form with a message
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setUserId('');
        setInfo('Account created! Check your email for a verification link, then sign in.');
      } else {
        await signIn(identifier.trim().toLowerCase(), password);
        // signIn succeeded — check verification status; bounce back out if not verified
        if (auth.currentUser && !auth.currentUser.emailVerified) {
          await signOut();
          setError('Please verify your email before signing in.');
          setShowResend(true);
        }
      }
    } catch (e: any) {
      setError(firebaseErrorMessage(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    clearMessages();
    setLoading(true);
    try {
      await resendVerification(identifier.trim().toLowerCase(), password);
      setInfo('Verification email sent. Check your inbox.');
    } catch (e: any) {
      setError(firebaseErrorMessage(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={styles.title}>90024-Swap</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create an account' : 'Sign in to continue'}
          </Text>

          {isSignUp && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  autoCapitalize="words"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Bruin Bear"
                  placeholderTextColor="#AAA"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>User ID</Text>
                <TextInput
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={userId}
                  onChangeText={setUserId}
                  placeholder="bruinbear"
                  placeholderTextColor="#AAA"
                />
              </View>
            </>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>{isSignUp ? 'Email' : 'Email or User ID'}</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isSignUp ? 'email' : 'username'}
              keyboardType={isSignUp ? 'email-address' : 'default'}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={isSignUp ? 'you@ucla.edu' : 'you@ucla.edu or bruinbear'}
              placeholderTextColor="#AAA"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#AAA"
            />
          </View>

          {isSignUp && (
            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#AAA"
              />
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? 'Create account' : 'Sign in'}
              </Text>
            )}
          </Pressable>

          {showResend && (
            <Pressable style={styles.linkButton} onPress={handleResend} disabled={loading}>
              <Text style={styles.linkText}>Resend verification email</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.linkButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              clearMessages();
            }}
          >
            <Text style={styles.linkText}>
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  error: {
    color: '#D8000C',
    fontSize: 13,
    marginBottom: 12,
  },
  info: {
    color: '#2B7A0B',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#666', fontSize: 14 },
});
