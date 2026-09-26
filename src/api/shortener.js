import { apiBaseUrl } from '../config';

/**
 * Error thrown by the shortener API client.
 * `userMessage` is safe to display in the UI.
 */
export class ShortenerApiError extends Error {
  /**
   * @param {string} userMessage user-facing message
   * @param {number|null} status HTTP status code, null for network failures
   */
  constructor(userMessage, status = null) {
    super(userMessage);
    this.name = 'ShortenerApiError';
    this.status = status;
  }
}

/**
 * Shorten a long URL via the backend.
 * Contract (live endpoint): POST /api/shorten {"url"} → 201 {"code", "long_url"}.
 * The full short URL is derived by the caller from its own origin.
 * @param {string} longUrl
 * @returns {Promise<{code: string, longUrl: string}>}
 * @throws {ShortenerApiError} on 400 (backend validation) or 5xx/network failures
 */
export async function shortenUrl(longUrl) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl }),
    });
  } catch {
    throw new ShortenerApiError(
      'Could not reach the server. Please try again.',
    );
  }

  if (response.status === 201) {
    const payload = await response.json();
    return { code: payload.code, longUrl: payload.long_url };
  }

  if (response.status === 400) {
    let message = 'The URL was rejected. Please check it and try again.';
    try {
      const payload = await response.json();
      if (typeof payload.error === 'string' && payload.error !== '') {
        message = payload.error;
      } else if (
        typeof payload.message === 'string' &&
        payload.message !== ''
      ) {
        message = payload.message;
      }
    } catch {
      // keep default message
    }
    throw new ShortenerApiError(message, 400);
  }

  throw new ShortenerApiError(
    'Something went wrong. Please try again later.',
    response.status,
  );
}
