import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

process.env.DATABASE_URL = 'file:./test.db';
process.env.SESSION_SECRET =
  'chakribakri_default_session_secret_at_least_32_characters_long_12345';
(process.env as Record<string, string | undefined>).NODE_ENV = 'test';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((mediaQueryString: string) => ({
      matches: false,
      media: mediaQueryString,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  cleanup();
});
