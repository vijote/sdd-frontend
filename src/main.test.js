import { describe, expect, it } from 'vitest';
import { apiBaseUrl } from './config.js';

describe('frontend scaffold bootstrap', () => {
  it('exports a non-empty apiBaseUrl from config', () => {
    expect(typeof apiBaseUrl).toBe('string');
    expect(apiBaseUrl.length).toBeGreaterThan(0);
  });

  it('mounts the #app element in the DOM', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = document.querySelector('#app');
    expect(app).not.toBeNull();
  });
});
