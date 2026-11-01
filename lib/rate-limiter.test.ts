import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkRateLimit,
  pruneExpiredEntries,
  resetRateLimitStore,
  getClientIpAddress,
  rateLimitStore,
  RateLimitConfig,
} from './rate-limiter';

describe('Rate Limiting Engine (lib/rate-limiter.ts)', () => {
  const testRateLimitConfig: RateLimitConfig = {
    maxRequests: 3,
    windowMs: 10 * 1000, // 10 seconds
  };

  beforeEach(() => {
    resetRateLimitStore();
    vi.useRealTimers();
  });

  afterEach(() => {
    resetRateLimitStore();
    vi.useRealTimers();
  });

  it('allows requests within the configured maximum threshold and decrements remaining quota', () => {
    const clientIdentifier = 'user:alpha';

    const firstAttemptResult = checkRateLimit(clientIdentifier, testRateLimitConfig);
    expect(firstAttemptResult.isAllowed).toBe(true);
    expect(firstAttemptResult.remainingRequests).toBe(2);

    const secondAttemptResult = checkRateLimit(clientIdentifier, testRateLimitConfig);
    expect(secondAttemptResult.isAllowed).toBe(true);
    expect(secondAttemptResult.remainingRequests).toBe(1);

    const thirdAttemptResult = checkRateLimit(clientIdentifier, testRateLimitConfig);
    expect(thirdAttemptResult.isAllowed).toBe(true);
    expect(thirdAttemptResult.remainingRequests).toBe(0);
  });

  it('throttles when requestCount exceeds maxRequests with isAllowed: false and 0 remaining quota', () => {
    const clientIdentifier = 'user:bravo';

    // Consume all 3 requests
    checkRateLimit(clientIdentifier, testRateLimitConfig);
    checkRateLimit(clientIdentifier, testRateLimitConfig);
    checkRateLimit(clientIdentifier, testRateLimitConfig);

    // 4th and 5th attempts should be throttled
    const fourthAttemptResult = checkRateLimit(clientIdentifier, testRateLimitConfig);
    expect(fourthAttemptResult.isAllowed).toBe(false);
    expect(fourthAttemptResult.remainingRequests).toBe(0);

    const fifthAttemptResult = checkRateLimit(clientIdentifier, testRateLimitConfig);
    expect(fifthAttemptResult.isAllowed).toBe(false);
    expect(fifthAttemptResult.remainingRequests).toBe(0);
  });

  it('maintains independent quotas for distinct identifiers', () => {
    const primaryClientIdentifier = 'ip:192.168.1.100';
    const secondaryClientIdentifier = 'ip:192.168.1.200';

    // Exhaust quota for primary client
    checkRateLimit(primaryClientIdentifier, testRateLimitConfig);
    checkRateLimit(primaryClientIdentifier, testRateLimitConfig);
    checkRateLimit(primaryClientIdentifier, testRateLimitConfig);

    const primaryThrottledResult = checkRateLimit(primaryClientIdentifier, testRateLimitConfig);
    expect(primaryThrottledResult.isAllowed).toBe(false);

    // Secondary client should still have full quota
    const secondaryFirstAttemptResult = checkRateLimit(
      secondaryClientIdentifier,
      testRateLimitConfig
    );
    expect(secondaryFirstAttemptResult.isAllowed).toBe(true);
    expect(secondaryFirstAttemptResult.remainingRequests).toBe(2);
  });

  it('resets quota and allows requests after windowMs elapses', () => {
    vi.useFakeTimers();
    const mockInitialTimestamp = 1000000;
    vi.setSystemTime(mockInitialTimestamp);

    const clientIdentifier = 'user:charlie';

    // Consume quota
    checkRateLimit(clientIdentifier, testRateLimitConfig);
    checkRateLimit(clientIdentifier, testRateLimitConfig);
    const lastAllowedResult = checkRateLimit(clientIdentifier, testRateLimitConfig);
    expect(lastAllowedResult.isAllowed).toBe(true);
    expect(lastAllowedResult.remainingRequests).toBe(0);

    // Blocked before window expiration
    const throttledResult = checkRateLimit(clientIdentifier, testRateLimitConfig);
    expect(throttledResult.isAllowed).toBe(false);

    // Fast-forward past window expiration (10s + 1ms)
    vi.advanceTimersByTime(testRateLimitConfig.windowMs + 1);

    const postWindowResult = checkRateLimit(clientIdentifier, testRateLimitConfig);
    expect(postWindowResult.isAllowed).toBe(true);
    expect(postWindowResult.remainingRequests).toBe(2);
  });

  it('prunes expired entries to prevent memory leaks', () => {
    vi.useFakeTimers();
    const currentBaseTimestamp = 5000000;
    vi.setSystemTime(currentBaseTimestamp);

    const expiredClientIdentifier = 'client:expired';
    const activeClientIdentifier = 'client:active';

    checkRateLimit(expiredClientIdentifier, { maxRequests: 2, windowMs: 5000 });
    checkRateLimit(activeClientIdentifier, { maxRequests: 2, windowMs: 20000 });

    expect(rateLimitStore.has(expiredClientIdentifier)).toBe(true);
    expect(rateLimitStore.has(activeClientIdentifier)).toBe(true);

    // Advance 6 seconds: expired client should be past resetTimestamp
    vi.advanceTimersByTime(6000);
    const prunedRecordCount = pruneExpiredEntries(Date.now());

    expect(prunedRecordCount).toBe(1);
    expect(rateLimitStore.has(expiredClientIdentifier)).toBe(false);
    expect(rateLimitStore.has(activeClientIdentifier)).toBe(true);
  });

  it('extracts client IP address correctly from headers or fallbacks', () => {
    const mockHeadersWithForwardedFor = {
      get: (headerKey: string): string | null => {
        if (headerKey === 'x-forwarded-for') {
          return '203.0.113.195, 70.41.3.18';
        }
        return null;
      },
    };

    const extractedForwardedIp = getClientIpAddress(mockHeadersWithForwardedFor);
    expect(extractedForwardedIp).toBe('203.0.113.195');

    const mockHeadersWithRealIp = {
      get: (headerKey: string): string | null => {
        if (headerKey === 'x-real-ip') {
          return '198.51.100.42';
        }
        return null;
      },
    };

    const extractedRealIp = getClientIpAddress(mockHeadersWithRealIp);
    expect(extractedRealIp).toBe('198.51.100.42');

    const mockEmptyHeaders = {
      get: (): string | null => null,
    };

    const fallbackIpResult = getClientIpAddress(mockEmptyHeaders, '10.0.0.1');
    expect(fallbackIpResult).toBe('10.0.0.1');

    const defaultFallbackIpResult = getClientIpAddress(null);
    expect(defaultFallbackIpResult).toBe('127.0.0.1');
  });
});

