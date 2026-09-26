const ALLOWED_SCHEMES = ['http:', 'https:'];

/**
 * Validate a long URL client-side, mirroring backend rules:
 * non-empty (trimmed), parseable, scheme in ['http', 'https'].
 * @param {string} input
 * @returns {string|null} error message, or null when valid
 */
export function validateLongUrl(input) {
  const trimmed = (input ?? '').trim();
  if (trimmed === '') {
    return 'URL is required.';
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return 'Enter a valid URL.';
  }
  if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
    return 'Only http and https URLs are supported.';
  }
  return null;
}
