import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShortenerApiError, shortenUrl } from './shortener';

describe('shortenUrl', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST /api/shorten with JSON body and resolves the 201 payload', async () => {
    global.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({ code: 'aB3xK9m', long_url: 'https://example.com/x' }),
        {
          status: 201,
        },
      ),
    );

    const result = await shortenUrl('https://example.com/x');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/shorten',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ url: 'https://example.com/x' }),
      }),
    );
    expect(result).toEqual({
      code: 'aB3xK9m',
      longUrl: 'https://example.com/x',
    });
  });

  it('throws with the backend message on 400', async () => {
    global.fetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400 }),
    );

    const error = await shortenUrl('https://example.com/x').catch((e) => e);

    expect(error).toBeInstanceOf(ShortenerApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Invalid URL');
  });

  it('uses a default message when 400 has no usable payload', async () => {
    global.fetch.mockResolvedValue(
      new Response('bad request', { status: 400 }),
    );

    const error = await shortenUrl('https://example.com/x').catch((e) => e);

    expect(error.status).toBe(400);
    expect(error.message).toBe(
      'The URL was rejected. Please check it and try again.',
    );
  });

  it('throws a generic message on 500', async () => {
    global.fetch.mockResolvedValue(new Response('oops', { status: 500 }));

    const error = await shortenUrl('https://example.com/x').catch((e) => e);

    expect(error).toBeInstanceOf(ShortenerApiError);
    expect(error.status).toBe(500);
    expect(error.message).toBe('Something went wrong. Please try again later.');
  });

  it('throws a network-failure message when fetch rejects', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await shortenUrl('https://example.com/x').catch((e) => e);

    expect(error).toBeInstanceOf(ShortenerApiError);
    expect(error.status).toBeNull();
    expect(error.message).toBe('Could not reach the server. Please try again.');
  });
});
