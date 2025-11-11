import trim from '@helpers/trim';

describe('trim function', () => {
  it('should trim whitespace from a string', () => {
    expect(trim('  Hello Orva  ')).toBe('Hello Orva');
    expect(trim('   Test   ')).toBe('Test');
    expect(trim('')).toBe('');
  });

  it('should return an empty string for undefined', () => {
    expect(trim(undefined)).toBe('');
  });

  it('should return an empty string for non-string types', () => {
    expect(trim(123 as any)).toBe('');
    expect(trim(null as any)).toBe('');
    expect(trim(true as any)).toBe('');
  });
});
