import { describe, expect, it } from 'vitest';
import { apiBaseUrl } from './config.js';

describe('frontend scaffold bootstrap', () => {
  it('exports a string apiBaseUrl from config (empty = same origin)', () => {
    expect(typeof apiBaseUrl).toBe('string');
    // Deployed default must be same-origin: no hardcoded absolute backend URL.
    expect(apiBaseUrl).toBe('');
  });

  it('mounts the #app element in the DOM', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = document.querySelector('#app');
    expect(app).not.toBeNull();
  });
});
