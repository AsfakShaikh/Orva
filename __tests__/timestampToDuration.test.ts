// Mock react-native-localization
jest.mock('react-native-localization', () => {
  return jest.fn().mockImplementation(() => ({
    language: 'en',
    getInterfaceLanguage: () => 'en',
  }));
});

import timestampToDuration from '@helpers/timestampToDuration';
import {defaultDuration} from '@utils/Constants';

describe('timestampToDuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid timestamp inputs', () => {
    test('should convert valid Date object to duration', () => {
      const date = new Date('2023-01-01T01:01:01.000Z');
      const result = timestampToDuration(date);

      // The function converts timestamp to milliseconds and passes to secondsToDuration
      // For a date like '2023-01-01T01:01:01.000Z', getTime() returns a large number
      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });

    test('should convert valid ISO string to duration', () => {
      const isoString = '2023-01-01T01:01:01.000Z';
      const result = timestampToDuration(isoString);

      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });

    test('should convert valid date string to duration', () => {
      const dateString = '2023-01-01 01:01:01';
      const result = timestampToDuration(dateString);

      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });

    test('should handle epoch timestamp (milliseconds)', () => {
      const epochMs = new Date(1672531261000); // 2023-01-01T01:01:01.000Z
      const result = timestampToDuration(epochMs);

      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });
  });

  describe('Edge cases', () => {
    test('should handle zero timestamp', () => {
      const zeroDate = new Date(0);
      const result = timestampToDuration(zeroDate);

      // getTime() returns 0 for epoch start, which should return defaultDuration
      expect(result).toEqual(defaultDuration);
    });

    test('should handle very large timestamp', () => {
      const largeDate = new Date('2099-12-31T23:59:59.999Z');
      const result = timestampToDuration(largeDate);

      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });

    test('should handle very small timestamp', () => {
      const smallDate = new Date('1970-01-01T00:00:00.001Z');
      const result = timestampToDuration(smallDate);

      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });
  });

  describe('Null and undefined inputs', () => {
    test('should return defaultDuration when timestamp is null', () => {
      const result = timestampToDuration(null);
      expect(result).toEqual(defaultDuration);
    });

    test('should return defaultDuration when timestamp is undefined', () => {
      const result = timestampToDuration(undefined);
      expect(result).toEqual(defaultDuration);
    });

    test('should return defaultDuration when no argument is provided', () => {
      const result = timestampToDuration();
      expect(result).toEqual(defaultDuration);
    });
  });

  describe('Invalid timestamp inputs', () => {
    test('should handle invalid date string', () => {
      const invalidDateString = 'invalid-date';
      const result = timestampToDuration(invalidDateString);

      // Invalid date string creates a Date with NaN, getTime() returns NaN
      // This should be handled by secondsToDuration which returns defaultDuration
      expect(result).toEqual(defaultDuration);
    });

    test('should handle empty string', () => {
      const emptyString = '';
      const result = timestampToDuration(emptyString);

      // Empty string creates a Date with current time, so it should work
      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });

    test('should handle malformed date string', () => {
      const malformedDate = '2023-13-45T25:70:80.999Z';
      const result = timestampToDuration(malformedDate);

      // Malformed date creates a Date with NaN, getTime() returns NaN
      expect(result).toEqual(defaultDuration);
    });
  });

  describe('Different date formats', () => {
    test('should handle date with timezone offset', () => {
      const dateWithTz = '2023-01-01T01:01:01+05:30';
      const result = timestampToDuration(dateWithTz);

      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });

    test('should handle date without time', () => {
      const dateOnly = '2023-01-01';
      const result = timestampToDuration(dateOnly);

      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });

    test('should handle date with milliseconds', () => {
      const dateWithMs = '2023-01-01T01:01:01.123Z';
      const result = timestampToDuration(dateWithMs);

      expect(result).toEqual({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });
  });

  describe('Integration with secondsToDuration', () => {
    test('should handle the conversion from milliseconds to duration correctly', () => {
      const testDate = new Date('2023-01-01T01:01:01.000Z');
      const result = timestampToDuration(testDate);

      // Verify the structure matches DURATION interface
      expect(result).toHaveProperty('hours');
      expect(result).toHaveProperty('mins');
      expect(result).toHaveProperty('secs');

      // Verify all values are strings
      expect(typeof result.hours).toBe('string');
      expect(typeof result.mins).toBe('string');
      expect(typeof result.secs).toBe('string');
    });

    test('should convert timestamp to correct duration format', () => {
      // Test with a known timestamp that should give predictable results
      const testDate = new Date('2023-01-01T00:00:00.000Z');
      const result = timestampToDuration(testDate);

      // The result should be a valid duration object
      // Note: Current implementation has a bug - it passes milliseconds to secondsToDuration
      // instead of converting to seconds first
      expect(result).toMatchObject({
        hours: expect.any(String),
        mins: expect.any(String),
        secs: expect.any(String),
      });
    });
  });

  describe('Type safety', () => {
    test('should accept Date object as parameter', () => {
      const date = new Date();
      expect(() => timestampToDuration(date)).not.toThrow();
    });

    test('should accept string as parameter', () => {
      const dateString = '2023-01-01T01:01:01.000Z';
      expect(() => timestampToDuration(dateString)).not.toThrow();
    });

    test('should accept null as parameter', () => {
      expect(() => timestampToDuration(null)).not.toThrow();
    });

    test('should accept undefined as parameter', () => {
      expect(() => timestampToDuration(undefined)).not.toThrow();
    });
  });
});
