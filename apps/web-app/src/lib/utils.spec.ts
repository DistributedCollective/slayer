import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('returns a single class name', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });
  it('removes duplicate tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles arrays of class names', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('ignores falsy values', () => {
    expect(cn(null, undefined, '', false, 0, 'foo')).toBe('foo');
  });

  it('returns an empty string if no arguments', () => {
    expect(cn()).toBe('');
  });
});
