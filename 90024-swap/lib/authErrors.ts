import { AuthErrorCode } from '@/services/authService';

export function authErrorMessage(code: AuthErrorCode | string | undefined): string {
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
    case 'auth/permission-denied':
      return "Couldn't reach the database (permissions). Please try again or contact support.";
    default:
      return 'Something went wrong. Please try again.';
  }
}
