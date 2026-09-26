import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShortenerApiError } from '../api/shortener';
import { shortenerStore } from './shortener';

const freshStore = () => ({
  ...shortenerStore,
  longUrl: '',
  shortUrl: null,
  error: null,
  isSubmitting: false,
});

vi.mock('../api/shortener', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    shortenUrl: vi.fn(),
  };
});

import { shortenUrl } from '../api/shortener';

describe('shortenerStore', () => {
  beforeEach(() => {
    shortenUrl.mockReset();
  });

  it('sets a validation error and skips the API call for invalid input', async () => {
    const store = freshStore();
    store.longUrl = 'ftp://example.com';

    await store.submit();

    expect(store.error).toBe('Only http and https URLs are supported.');
    expect(store.isSubmitting).toBe(false);
    expect(shortenUrl).not.toHaveBeenCalled();
  });

  it('derives the short URL from the origin on success', async () => {
    shortenUrl.mockResolvedValue({
      code: 'aB3xK9m',
      longUrl: 'https://example.com/x',
    });
    const store = freshStore();
    store.longUrl = '  https://example.com/x  ';

    await store.submit();

    expect(shortenUrl).toHaveBeenCalledWith('https://example.com/x');
    expect(store.shortUrl).toBe(`${window.location.origin}/api/aB3xK9m`);
    expect(store.error).toBeNull();
    expect(store.isSubmitting).toBe(false);
  });

  it('maps API errors to the user-facing message', async () => {
    shortenUrl.mockRejectedValue(new ShortenerApiError('Invalid URL', 400));
    const store = freshStore();
    store.longUrl = 'https://example.com/x';

    await store.submit();

    expect(store.error).toBe('Invalid URL');
    expect(store.shortUrl).toBeNull();
    expect(store.isSubmitting).toBe(false);
  });

  it('maps unexpected errors to a generic message', async () => {
    shortenUrl.mockRejectedValue(new Error('boom'));
    const store = freshStore();
    store.longUrl = 'https://example.com/x';

    await store.submit();

    expect(store.error).toBe('Something went wrong. Please try again later.');
  });

  it('clears the error on input', () => {
    const store = freshStore();
    store.error = 'URL is required.';

    store.onInput();

    expect(store.error).toBeNull();
  });

  it('copies the short URL when the clipboard is available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const store = freshStore();
    store.shortUrl = `${window.location.origin}/api/aB3xK9m`;

    await store.copy();

    expect(writeText).toHaveBeenCalledWith(store.shortUrl);
  });

  it('does nothing on copy when there is no short URL', async () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const store = freshStore();
    store.shortUrl = null;

    await store.copy();

    expect(writeText).not.toHaveBeenCalled();
  });
});
