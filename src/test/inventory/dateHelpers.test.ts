import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isExpired, isExpiringSoon } from '../../features/inventory/useInventory';

// Freeze time to 2026-04-24 so boundary tests are deterministic
const FROZEN_DATE = new Date('2026-04-24T12:00:00.000Z');

describe('isExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for null input', () => {
    expect(isExpired(null)).toBe(false);
  });

  it('returns true for a clearly past date', () => {
    expect(isExpired('2020-01-01')).toBe(true);
  });

  it('returns false for a clearly future date', () => {
    expect(isExpired('2099-12-31')).toBe(false);
  });

  it('returns true for yesterday', () => {
    // 2026-04-23 is yesterday relative to our frozen "today" 2026-04-24
    expect(isExpired('2026-04-23')).toBe(true);
  });

  it('returns false for tomorrow', () => {
    expect(isExpired('2026-04-25')).toBe(false);
  });
});

describe('isExpiringSoon', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for null input', () => {
    expect(isExpiringSoon(null)).toBe(false);
  });

  it('returns true when expiration is within the default 7-day window', () => {
    // 2026-04-27 is 3 days ahead — within the default 7-day window
    expect(isExpiringSoon('2026-04-27')).toBe(true);
  });

  it('returns false when expiration is beyond the default 7-day window', () => {
    // 2026-05-02 is 8 days ahead — outside the 7-day window
    expect(isExpiringSoon('2026-05-02')).toBe(false);
  });

  it('returns false when expiration is within default window but custom window is smaller', () => {
    // 3 days ahead but custom window is only 2 days
    expect(isExpiringSoon('2026-04-27', 2)).toBe(false);
  });

  it('returns false for an already-expired date (diffDays is negative)', () => {
    expect(isExpiringSoon('2020-01-01')).toBe(false);
  });

  it('returns true for today (boundary)', () => {
    expect(isExpiringSoon('2026-04-24')).toBe(true);
  });

  it('returns true exactly on the upper bound (today + 7)', () => {
    expect(isExpiringSoon('2026-05-01')).toBe(true);
  });

  it('returns false for an invalid format', () => {
    expect(isExpiringSoon('garbage')).toBe(false);
  });
});

describe('isExpired — casos de borde adicionales', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for today (boundary)', () => {
    expect(isExpired('2026-04-24')).toBe(false);
  });

  it('returns false for an invalid format', () => {
    expect(isExpired('not-a-date')).toBe(false);
  });
});

describe('sin solapamiento entre isExpired e isExpiringSoon', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ningún offset produce true en ambas funciones a la vez', () => {
    // offsets en días respecto a FROZEN_DATE (2026-04-24)
    const offsets = [-2, -1, 0, 1, 7, 8];
    for (const offset of offsets) {
      const base = new Date('2026-04-24T00:00:00.000');
      base.setDate(base.getDate() + offset);
      const dateStr = base.toISOString().slice(0, 10);
      expect(
        isExpired(dateStr) && isExpiringSoon(dateStr),
        `solapamiento detectado para offset=${offset} (${dateStr})`
      ).toBe(false);
    }
  });
});
