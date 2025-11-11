import stringToNumber from '../src/helpers/stringToNumber';

describe('stringToNumber', () => {
  describe('number inputs', () => {
    it('should return the same number when input is a number', () => {
      expect(stringToNumber(42)).toBe(42);
      expect(stringToNumber(0)).toBe(0);
      expect(stringToNumber(-123)).toBe(-123);
      expect(stringToNumber(3.14)).toBe(3.14);
      expect(stringToNumber(Infinity)).toBe(Infinity);
      expect(stringToNumber(-Infinity)).toBe(-Infinity);
    });

    it('should handle special number values', () => {
      expect(stringToNumber(NaN)).toBe(0);
      expect(stringToNumber(Number.MAX_SAFE_INTEGER)).toBe(
        Number.MAX_SAFE_INTEGER,
      );
      expect(stringToNumber(Number.MIN_SAFE_INTEGER)).toBe(
        Number.MIN_SAFE_INTEGER,
      );
    });
  });

  describe('null and undefined inputs', () => {
    it('should return 0 for null input', () => {
      expect(stringToNumber(null)).toBe(0);
    });

    it('should return 0 for undefined input', () => {
      expect(stringToNumber(undefined)).toBe(0);
    });

    it('should return 0 when no argument is passed', () => {
      expect(stringToNumber()).toBe(0);
    });
  });

  describe('valid string number inputs', () => {
    it('should convert valid string numbers to numbers', () => {
      expect(stringToNumber('42')).toBe(42);
      expect(stringToNumber('0')).toBe(0);
      expect(stringToNumber('-123')).toBe(-123);
      expect(stringToNumber('3.14')).toBe(3.14);
      expect(stringToNumber('123.456')).toBe(123.456);
    });

    it('should handle string numbers with leading/trailing spaces', () => {
      expect(stringToNumber('  42  ')).toBe(42);
      expect(stringToNumber('  -123  ')).toBe(-123);
      expect(stringToNumber('  3.14  ')).toBe(3.14);
    });

    it('should handle scientific notation strings', () => {
      expect(stringToNumber('1e2')).toBe(100);
      expect(stringToNumber('1.5e3')).toBe(1500);
      expect(stringToNumber('-2e-2')).toBe(-0.02);
    });

    it('should handle hexadecimal strings', () => {
      expect(stringToNumber('0xFF')).toBe(255);
      expect(stringToNumber('0x1A')).toBe(26);
    });

    it('should handle binary and octal strings', () => {
      expect(stringToNumber('0b1010')).toBe(10);
      expect(stringToNumber('0o755')).toBe(493);
    });
  });

  describe('invalid string inputs', () => {
    it('should return 0 for non-numeric strings', () => {
      expect(stringToNumber('hello')).toBe(0);
      expect(stringToNumber('abc123')).toBe(0);
      expect(stringToNumber('123abc')).toBe(0);
      expect(stringToNumber('not a number')).toBe(0);
    });

    it('should return 0 for empty strings', () => {
      expect(stringToNumber('')).toBe(0);
    });

    it('should return 0 for strings with only spaces', () => {
      expect(stringToNumber('   ')).toBe(0);
      expect(stringToNumber('\t\n')).toBe(0);
    });

    it('should return 0 for special string values', () => {
      expect(stringToNumber('undefined')).toBe(0);
      expect(stringToNumber('null')).toBe(0);
      expect(stringToNumber('NaN')).toBe(0);
    });

    it('should return 0 for strings with invalid characters', () => {
      expect(stringToNumber('12.34.56')).toBe(0);
      expect(stringToNumber('1,234')).toBe(0);
      expect(stringToNumber('$123')).toBe(0);
      expect(stringToNumber('123%')).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      expect(stringToNumber('999999999999999')).toBe(999999999999999);
      expect(stringToNumber('-999999999999999')).toBe(-999999999999999);
    });

    it('should handle very small decimal numbers', () => {
      expect(stringToNumber('0.0000001')).toBe(0.0000001);
      expect(stringToNumber('-0.0000001')).toBe(-0.0000001);
    });

    it('should handle zero in different formats', () => {
      expect(stringToNumber('0')).toBe(0);
      expect(stringToNumber('0.0')).toBe(0);
      expect(stringToNumber('00')).toBe(0);
      expect(stringToNumber('000')).toBe(0);
    });
  });
});
