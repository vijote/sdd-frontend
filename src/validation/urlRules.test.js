import { describe, expect, it } from 'vitest';
import { validateLongUrl } from './urlRules';

describe('validateLongUrl', () => {
  it('accepts http and https URLs', () => {
    expect(validateLongUrl('http://example.com')).toBeNull();
    expect(
      validateLongUrl('https://example.com/very/long/path?q=1'),
    ).toBeNull();
  });

  it('rejects empty or whitespace-only input', () => {
    expect(validateLongUrl('')).toBe('URL is required.');
    expect(validateLongUrl('   ')).toBe('URL is required.');
    expect(validateLongUrl(null)).toBe('URL is required.');
    expect(validateLongUrl(undefined)).toBe('URL is required.');
  });

  it('rejects unparseable input', () => {
    expect(validateLongUrl('not a url')).toBe('Enter a valid URL.');
    expect(validateLongUrl('http://')).toBe('Enter a valid URL.');
  });

  it('rejects schemes outside the http/https allowlist', () => {
    expect(validateLongUrl('ftp://example.com/file')).toBe(
      'Only http and https URLs are supported.',
    );
    expect(validateLongUrl('javascript:alert(1)')).toBe(
      'Only http and https URLs are supported.',
    );
    expect(validateLongUrl('file:///etc/passwd')).toBe(
      'Only http and https URLs are supported.',
    );
  });

  it('trims surrounding whitespace before validating', () => {
    expect(validateLongUrl('  https://example.com  ')).toBeNull();
  });
});
