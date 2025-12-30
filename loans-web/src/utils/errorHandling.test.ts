import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './errorHandling';

describe('getErrorMessage', () => {
  it('should extract message from Error object', () => {
    const error = new Error('Test error message');
    const result = getErrorMessage(error);
    expect(result).toBe('Test error message');
  });

  it('should return string as-is if error is a string', () => {
    const error = 'String error message';
    const result = getErrorMessage(error);
    expect(result).toBe('String error message');
  });

  it('should return default message for unknown error types', () => {
    const error = { code: 500 };
    const result = getErrorMessage(error);
    expect(result).toBe('An unknown error occurred');
  });

  it('should handle null error', () => {
    const result = getErrorMessage(null);
    expect(result).toBe('An unknown error occurred');
  });

  it('should handle undefined error', () => {
    const result = getErrorMessage(undefined);
    expect(result).toBe('An unknown error occurred');
  });

  it('should handle number error', () => {
    const result = getErrorMessage(404);
    expect(result).toBe('An unknown error occurred');
  });

  it('should handle boolean error', () => {
    const result = getErrorMessage(false);
    expect(result).toBe('An unknown error occurred');
  });

  it('should handle object with toString method', () => {
    const error = {
      toString: () => 'Custom toString message'
    };
    const result = getErrorMessage(error);
    expect(result).toBe('An unknown error occurred');
  });
});
