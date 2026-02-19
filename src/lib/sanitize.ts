/**
 * Security utilities for input sanitization and validation.
 */

/**
 * Sanitize search query for safe use in PostgREST `.or()` filters.
 * Escapes characters that have special meaning in PostgREST filter syntax.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  
  // Remove characters that could manipulate PostgREST filter syntax
  // These characters have special meaning: , . ( ) % * 
  return query
    .replace(/[,.()*%\\]/g, '')  // Strip filter-breaking characters
    .replace(/'/g, "''")         // Escape single quotes for SQL safety
    .trim()
    .slice(0, 100);              // Limit length to prevent abuse
}

/**
 * Password validation result.
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'strong';
}

/**
 * Validate password strength.
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At least 1 uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('At least 1 lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('At least 1 number');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('At least 1 special character (!@#$%^&*...)');
  }

  let strength: 'weak' | 'fair' | 'strong' = 'weak';
  if (errors.length === 0) {
    strength = password.length >= 12 ? 'strong' : 'fair';
  } else if (errors.length <= 2) {
    strength = 'fair';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Sanitize generic text input — strips HTML tags and trims.
 */
export function sanitizeTextInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .trim();
}
