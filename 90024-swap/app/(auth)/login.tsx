import { useAuth } from '@/contexts/AuthContext';
import { authErrorMessage } from '@/lib/authErrors';
import {
  validateFirstName,
  validateLastName,
  validateLoginIdentifier,
  validatePassword,
  validatePasswordConfirmation,
  validatePhoneNumber,
  validateUclaEmail,
  validateUserId,
} from '@/lib/validation';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COUNTRY_CODES = ['+1', '+44', '+91', '+61', '+86', '+81', '+49', '+33', '+52', '+55'];
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { signIn, signUp, signOut, resendVerification, getCurrentUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  // in sign-in mode this holds an email OR a user ID; in sign-up mode it must be an email
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userId, setUserId] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [codeOpen, setCodeOpen] = useState(false);
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
    const checks: (string | null)[] = isSignUp
      ? [
          validateFirstName(firstName),
          validateLastName(lastName),
          validateUserId(userId),
          validateUclaEmail(identifier),
          validatePhoneNumber(phoneNumber),
          validatePassword(password),
          validatePasswordConfirmation(password, confirmPassword),
        ]
      : [validateLoginIdentifier(identifier), validatePassword(password)];

    const firstError = checks.find((c) => c !== null);
    if (firstError) {
      setError(firstError);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    clearMessages();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isSignUp) {
        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();
        await signUp(
          identifier.trim().toLowerCase(),
          password,
          `${trimmedFirst} ${trimmedLast}`,
          userId.trim(),
          phoneCountryCode,
          phoneNumber,
          trimmedFirst,
          trimmedLast,
        );
        // signUp signs the user out; bring them back to the sign-in form with a message
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setUserId('');
        setPhoneNumber('');
        setPhoneCountryCode('+1');
        setCodeOpen(false);
        setInfo('Account created! Check your email for a verification link, then sign in.');
      } else {
        await signIn(identifier.trim().toLowerCase(), password);
        // signIn succeeded — check verification status; bounce back out if not verified
        const current = getCurrentUser();
        if (current && !current.emailVerified) {
          await signOut();
          setError('Please verify your email before signing in.');
          setShowResend(true);
        }
      }
    } catch (e: any) {
      setError(authErrorMessage(e?.code));
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
      setError(authErrorMessage(e?.code));
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
              <View style={styles.nameRow}>
                <View style={[styles.field, styles.nameField]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="words"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Bruin"
                    placeholderTextColor="#AAA"
                  />
                </View>
                <View style={[styles.field, styles.nameField]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="words"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Bear"
                    placeholderTextColor="#AAA"
                  />
                </View>
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

          {isSignUp && (
            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity
                  style={styles.codeBox}
                  onPress={() => setCodeOpen((o) => !o)}
                >
                  <Text style={styles.codeText}>{phoneCountryCode}</Text>
                  <Text style={styles.chevron}>{codeOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(t) => setPhoneNumber(t.replace(/\D/g, ''))}
                  placeholder="3108254321"
                  placeholderTextColor="#AAA"
                />
              </View>
              {codeOpen && (
                <View style={styles.codeDropdown}>
                  {COUNTRY_CODES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={styles.codeItem}
                      onPress={() => {
                        setPhoneCountryCode(c);
                        setCodeOpen(false);
                      }}
                    >
                      <Text style={styles.codeItemText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

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
  nameRow: { flexDirection: 'row', gap: 12 },
  nameField: { flex: 1 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeBox: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: { color: '#1A1A1A', fontWeight: '600', fontSize: 16, marginRight: 6 },
  chevron: { color: '#666', fontSize: 12 },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  codeDropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  codeItem: { paddingVertical: 10, paddingHorizontal: 16 },
  codeItemText: { color: '#1A1A1A', fontWeight: '600' },
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
