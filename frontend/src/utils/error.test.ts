import { describe, expect, it } from 'vitest';

import { getErrorMessage } from './error';

describe('getErrorMessage', () => {
  it('returns the error message when given an Error with a message', () => {
    expect(getErrorMessage(new Error('Request failed'))).toBe('Request failed');
  });

  it('returns the fallback when the value is not an Error', () => {
    expect(getErrorMessage('oops', 'Custom fallback')).toBe('Custom fallback');
  });

  it('returns the default fallback when no custom fallback is provided', () => {
    expect(getErrorMessage({ reason: 'unknown' })).toBe('Something went wrong');
  });

  it('returns the fallback when Error has an empty message', () => {
    expect(getErrorMessage(new Error(''), 'Try again')).toBe('Try again');
  });
});
