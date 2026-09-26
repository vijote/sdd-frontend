import Alpine from 'alpinejs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shortenerStore } from './stores/shortener';

vi.mock('./api/shortener', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    shortenUrl: vi.fn(),
  };
});

import { ShortenerApiError, shortenUrl } from './api/shortener';

const renderApp = () => {
  document.body.innerHTML = `
    <div id="app" x-data>
      <form @submit.prevent="$store.shortener.submit()" data-testid="shorten-form">
        <input
          type="text"
          x-model="$store.shortener.longUrl"
          @input="$store.shortener.onInput()"
          data-testid="url-input"
        />
        <button type="submit" :disabled="$store.shortener.isSubmitting" data-testid="submit-button">
          Shorten
        </button>
      </form>
      <p
        x-show="$store.shortener.error !== null"
        x-text="$store.shortener.error"
        data-testid="error-message"
      ></p>
      <div x-show="$store.shortener.shortUrl !== null" data-testid="result-card">
        <a
          :href="$store.shortener.shortUrl"
          x-text="$store.shortener.shortUrl"
          data-testid="short-url-link"
        ></a>
        <button type="button" @click="$store.shortener.copy()" data-testid="copy-button">Copy</button>
      </div>
    </div>
  `;
  window.Alpine = Alpine;
  Alpine.store('shortener', { ...shortenerStore });
  Alpine.start();
};

const getByTestId = (testId) =>
  document.querySelector(`[data-testid="${testId}"]`);

describe('shortener form (DOM)', () => {
  beforeEach(() => {
    shortenUrl.mockReset();
    Alpine.store('shortener', undefined);
    delete window.Alpine;
  });

  it('renders the form with input and submit button', () => {
    renderApp();

    expect(getByTestId('shorten-form')).not.toBeNull();
    expect(getByTestId('url-input')).not.toBeNull();
    expect(getByTestId('submit-button')).not.toBeNull();
  });

  it('shows a validation error for invalid input and clears it on edit', async () => {
    renderApp();

    const input = getByTestId('url-input');
    input.value = 'not a url';
    input.dispatchEvent(new Event('input'));
    await Alpine.nextTick();
    getByTestId('shorten-form').dispatchEvent(new Event('submit'));
    await Alpine.nextTick();

    const error = getByTestId('error-message');
    expect(error.textContent).toBe('Enter a valid URL.');

    input.value = 'https://example.com/x';
    input.dispatchEvent(new Event('input'));
    await Alpine.nextTick();
    expect(error.textContent).toBe('');
  });

  it('renders the derived short URL on mocked 201 success', async () => {
    shortenUrl.mockResolvedValue({
      code: 'aB3xK9m',
      longUrl: 'https://example.com/x',
    });
    renderApp();

    const input = getByTestId('url-input');
    input.value = 'https://example.com/x';
    input.dispatchEvent(new Event('input'));
    await Alpine.nextTick();
    getByTestId('shorten-form').dispatchEvent(new Event('submit'));
    await Alpine.nextTick();
    await Promise.resolve();

    const link = getByTestId('short-url-link');
    expect(link.getAttribute('href')).toBe(
      `${window.location.origin}/api/aB3xK9m`,
    );
    expect(link.textContent).toBe(`${window.location.origin}/api/aB3xK9m`);
  });

  it('renders the backend error message on mocked 400', async () => {
    shortenUrl.mockRejectedValue(new ShortenerApiError('Invalid URL', 400));
    renderApp();

    const input = getByTestId('url-input');
    input.value = 'https://example.com/x';
    input.dispatchEvent(new Event('input'));
    await Alpine.nextTick();
    getByTestId('shorten-form').dispatchEvent(new Event('submit'));
    await Alpine.nextTick();
    await Promise.resolve();

    expect(getByTestId('error-message').textContent).toBe('Invalid URL');
  });

  it('disables the submit button while submitting', async () => {
    let resolveSubmit;
    shortenUrl.mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      }),
    );
    renderApp();

    const input = getByTestId('url-input');
    input.value = 'https://example.com/x';
    input.dispatchEvent(new Event('input'));
    await Alpine.nextTick();
    getByTestId('shorten-form').dispatchEvent(new Event('submit'));
    await Alpine.nextTick();

    expect(getByTestId('submit-button').disabled).toBe(true);

    resolveSubmit({ code: 'aB3xK9m', longUrl: 'https://example.com/x' });
    await Alpine.nextTick();
    await Promise.resolve();
    await Alpine.nextTick();

    expect(getByTestId('submit-button').disabled).toBe(false);
  });
});
