// Pure validators — no React, no Firebase. Each returns null on success, or
// the user-facing error message on failure. Easy to unit-test in isolation.

export const USER_ID_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateUclaEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return 'Please enter your UCLA email.';
  if (!trimmed.endsWith('@ucla.edu')) {
    return 'Please use your UCLA email (must end in @ucla.edu).';
  }
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address.';
  return null;
}

// Sign-in identifier may be either an email or a user ID; only validate the
// email shape when an '@' is present.
export function validateLoginIdentifier(identifier: string): string | null {
  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) return 'Please enter your email or user ID.';
  if (trimmed.includes('@') && !EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function validateDisplayName(displayName: string): string | null {
  if (!displayName.trim()) return 'Please enter your name.';
  return null;
}

export function validateUserId(userId: string): string | null {
  if (!USER_ID_REGEX.test(userId.trim())) {
    return 'User ID must be 3-20 characters: letters, numbers, or underscores.';
  }
  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (password !== confirmation) return 'Passwords do not match.';
  return null;
}
