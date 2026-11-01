export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitRecord {
  requestCount: number;
  resetTimestamp: number;
}

export interface RateLimitResult {
  isAllowed: boolean;
  remainingRequests: number;
  resetTimestamp: number;
}

const PRUNE_INTERVAL_MILLISECONDS = 60 * 1000;
let lastPruneTimestamp = Date.now();

const getGlobalRateLimitStore = (): Map<string, RateLimitRecord> => {
  const globalContext = globalThis as unknown as {
    rateLimitStore?: Map<string, RateLimitRecord>;
  };

  if (!globalContext.rateLimitStore) {
    globalContext.rateLimitStore = new Map<string, RateLimitRecord>();
  }

  return globalContext.rateLimitStore;
};

export const rateLimitStore: Map<string, RateLimitRecord> = getGlobalRateLimitStore();

export const pruneExpiredEntries = (currentTimestamp: number = Date.now()): number => {
  let prunedRecordCount = 0;

  rateLimitStore.forEach((record, storeIdentifier) => {
    const isRecordExpired = currentTimestamp >= record.resetTimestamp;
    if (isRecordExpired) {
      rateLimitStore.delete(storeIdentifier);
      prunedRecordCount += 1;
    }
  });

  lastPruneTimestamp = currentTimestamp;
  return prunedRecordCount;
};

export const resetRateLimitStore = (): void => {
  rateLimitStore.clear();
  lastPruneTimestamp = Date.now();
};

export const getClientIpAddress = (
  headersSource?: { get: (headerName: string) => string | null } | null,
  fallbackIpAddress: string = '127.0.0.1'
): string => {
  if (!headersSource) {
    return fallbackIpAddress;
  }

  const forwardedForHeader = headersSource.get('x-forwarded-for');
  if (forwardedForHeader) {
    const candidateIpAddress = forwardedForHeader.split(',')[0].trim();
    if (candidateIpAddress.length > 0) {
      return candidateIpAddress;
    }
  }

  const realIpHeader = headersSource.get('x-real-ip');
  if (realIpHeader && realIpHeader.trim().length > 0) {
    return realIpHeader.trim();
  }

  return fallbackIpAddress;
};

export const checkRateLimit = (identifier: string, config: RateLimitConfig): RateLimitResult => {
  const currentTimestamp = Date.now();

  const shouldPruneStore =
    currentTimestamp - lastPruneTimestamp >= PRUNE_INTERVAL_MILLISECONDS ||
    rateLimitStore.size > 1000;

  if (shouldPruneStore) {
    pruneExpiredEntries(currentTimestamp);
  }

  const existingRecord = rateLimitStore.get(identifier);
  const isWindowExpired = !existingRecord || currentTimestamp >= existingRecord.resetTimestamp;

  if (isWindowExpired) {
    const resetTimestamp = currentTimestamp + config.windowMs;
    const isAllowed = config.maxRequests > 0;
    const initialRequestCount = isAllowed ? 1 : 0;
    const remainingRequests = isAllowed ? Math.max(0, config.maxRequests - 1) : 0;

    rateLimitStore.set(identifier, {
      requestCount: initialRequestCount,
      resetTimestamp,
    });

    return {
      isAllowed,
      remainingRequests,
      resetTimestamp,
    };
  }

  const hasRemainingCapacity = existingRecord.requestCount < config.maxRequests;

  if (hasRemainingCapacity) {
    const updatedRequestCount = existingRecord.requestCount + 1;
    existingRecord.requestCount = updatedRequestCount;
    rateLimitStore.set(identifier, existingRecord);

    const remainingRequests = Math.max(0, config.maxRequests - updatedRequestCount);

    return {
      isAllowed: true,
      remainingRequests,
      resetTimestamp: existingRecord.resetTimestamp,
    };
  }

  return {
    isAllowed: false,
    remainingRequests: 0,
    resetTimestamp: existingRecord.resetTimestamp,
  };
};
