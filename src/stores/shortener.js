import { ShortenerApiError, shortenUrl } from '../api/shortener';
import { validateLongUrl } from '../validation/urlRules';

/**
 * Alpine store for the shortening form.
 * Registered in src/main.js as Alpine.store('shortener').
 * Access from markup via $store.shortener.
 */
export const shortenerStore = {
  longUrl: '',
  shortUrl: null,
  error: null,
  isSubmitting: false,

  async submit() {
    const validationError = validateLongUrl(this.longUrl);
    if (validationError !== null) {
      this.error = validationError;
      return;
    }
    this.isSubmitting = true;
    this.error = null;
    this.shortUrl = null;
    try {
      const { code } = await shortenUrl(this.longUrl.trim());
      this.shortUrl = `${window.location.origin}/api/${code}`;
    } catch (err) {
      this.error =
        err instanceof ShortenerApiError
          ? err.message
          : 'Something went wrong. Please try again later.';
    } finally {
      this.isSubmitting = false;
    }
  },

  onInput() {
    this.error = null;
  },

  async copy() {
    if (this.shortUrl === null || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(this.shortUrl);
    } catch {
      // clipboard unavailable/blocked — non-fatal
    }
  },
};
