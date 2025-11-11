// Mock react-native-localization
jest.mock('react-native-localization', () => {
  return jest.fn().mockImplementation(() => ({
    language: 'en',
    getInterfaceLanguage: () => 'en',
  }));
});

import secondsToDuration from '@helpers/secondsToDuration';
import {defaultDuration} from '@utils/Constants';

describe('secondsToDuration', () => {
  describe('Basic functionality', () => {
    test('should convert seconds to hours, minutes, and seconds with proper padding', () => {
      expect(secondsToDuration(3661)).toEqual({
        hours: '01',
        mins: '01',
        secs: '01',
      });

      expect(secondsToDuration(7325)).toEqual({
        hours: '02',
        mins: '02',
        secs: '05',
      });

      expect(secondsToDuration(3660)).toEqual({
        hours: '01',
        mins: '01',
        secs: '00',
      });
    });

    test('should handle only hours', () => {
      expect(secondsToDuration(3600)).toEqual({
        hours: '01',
        mins: '00',
        secs: '00',
      });

      expect(secondsToDuration(7200)).toEqual({
        hours: '02',
        mins: '00',
        secs: '00',
      });

      expect(secondsToDuration(86400)).toEqual({
        hours: '24',
        mins: '00',
        secs: '00',
      });
    });

    test('should handle only minutes', () => {
      expect(secondsToDuration(60)).toEqual({
        hours: '00',
        mins: '01',
        secs: '00',
      });

      expect(secondsToDuration(1800)).toEqual({
        hours: '00',
        mins: '30',
        secs: '00',
      });

      expect(secondsToDuration(3540)).toEqual({
        hours: '00',
        mins: '59',
        secs: '00',
      });
    });

    test('should handle only seconds', () => {
      expect(secondsToDuration(30)).toEqual({
        hours: '00',
        mins: '00',
        secs: '30',
      });

      expect(secondsToDuration(59)).toEqual({
        hours: '00',
        mins: '00',
        secs: '59',
      });

      expect(secondsToDuration(1)).toEqual({
        hours: '00',
        mins: '00',
        secs: '01',
      });
    });

    test('should ensure all values are properly padded with leading zeros', () => {
      expect(secondsToDuration(5)).toEqual({
        hours: '00',
        mins: '00',
        secs: '05',
      });

      expect(secondsToDuration(305)).toEqual({
        hours: '00',
        mins: '05',
        secs: '05',
      });

      expect(secondsToDuration(3605)).toEqual({
        hours: '01',
        mins: '00',
        secs: '05',
      });
    });
  });

  describe('Edge cases and boundary values', () => {
    test('should handle zero seconds (returns defaultDuration since 0 is falsy)', () => {
      expect(secondsToDuration(0)).toEqual(defaultDuration);
    });

    test('should handle very small positive values', () => {
      expect(secondsToDuration(1)).toEqual({
        hours: '00',
        mins: '00',
        secs: '01',
      });

      expect(secondsToDuration(0.1)).toEqual({
        hours: '00',
        mins: '00',
        secs: '00',
      });

      expect(secondsToDuration(0.9)).toEqual({
        hours: '00',
        mins: '00',
        secs: '00',
      });
    });

    test('should handle large numbers correctly', () => {
      expect(secondsToDuration(99999)).toEqual({
        hours: '27',
        mins: '46',
        secs: '39',
      });

      expect(secondsToDuration(100000)).toEqual({
        hours: '27',
        mins: '46',
        secs: '40',
      });

      expect(secondsToDuration(999999)).toEqual({
        hours: '277',
        mins: '46',
        secs: '39',
      });
    });

    test('should handle decimal numbers by truncating', () => {
      expect(secondsToDuration(3661.7)).toEqual({
        hours: '01',
        mins: '01',
        secs: '01',
      });

      expect(secondsToDuration(3661.9)).toEqual({
        hours: '01',
        mins: '01',
        secs: '01',
      });

      expect(secondsToDuration(3661.1)).toEqual({
        hours: '01',
        mins: '01',
        secs: '01',
      });

      expect(secondsToDuration(3661.99)).toEqual({
        hours: '01',
        mins: '01',
        secs: '01',
      });
    });

    test('should handle negative numbers correctly (returns defaultDuration)', () => {
      expect(secondsToDuration(-3661)).toEqual(defaultDuration);
      expect(secondsToDuration(-60)).toEqual(defaultDuration);
      expect(secondsToDuration(-1)).toEqual(defaultDuration);
      expect(secondsToDuration(-3600)).toEqual(defaultDuration);
    });

    test('should handle exact minute boundaries', () => {
      expect(secondsToDuration(3599)).toEqual({
        hours: '00',
        mins: '59',
        secs: '59',
      });

      expect(secondsToDuration(3600)).toEqual({
        hours: '01',
        mins: '00',
        secs: '00',
      });

      expect(secondsToDuration(3601)).toEqual({
        hours: '01',
        mins: '00',
        secs: '01',
      });
    });

    test('should handle exact hour boundaries', () => {
      expect(secondsToDuration(86399)).toEqual({
        hours: '23',
        mins: '59',
        secs: '59',
      });

      expect(secondsToDuration(86400)).toEqual({
        hours: '24',
        mins: '00',
        secs: '00',
      });

      expect(secondsToDuration(86401)).toEqual({
        hours: '24',
        mins: '00',
        secs: '01',
      });
    });
  });

  describe('String input handling', () => {
    test('should handle string inputs by converting them to numbers', () => {
      expect(secondsToDuration('3661')).toEqual({
        hours: '01',
        mins: '01',
        secs: '01',
      });

      expect(secondsToDuration('7325')).toEqual({
        hours: '02',
        mins: '02',
        secs: '05',
      });

      expect(secondsToDuration('3600')).toEqual({
        hours: '01',
        mins: '00',
        secs: '00',
      });
    });

    test('should handle string inputs with decimals', () => {
      expect(secondsToDuration('3661.7')).toEqual({
        hours: '01',
        mins: '01',
        secs: '01',
      });

      expect(secondsToDuration('3661.9')).toEqual({
        hours: '01',
        mins: '01',
        secs: '01',
      });
    });

    test('should handle string inputs with negative values (returns defaultDuration)', () => {
      expect(secondsToDuration('-3661')).toEqual(defaultDuration);
      expect(secondsToDuration('-60')).toEqual(defaultDuration);
    });

    test('should handle invalid string inputs', () => {
      expect(secondsToDuration('invalid')).toEqual(defaultDuration);
      expect(secondsToDuration('abc123')).toEqual(defaultDuration);
      expect(secondsToDuration('12.34.56')).toEqual(defaultDuration);
    });
  });

  describe('Falsy input handling', () => {
    test('should handle undefined input and return defaultDuration', () => {
      expect(secondsToDuration(undefined)).toEqual(defaultDuration);
    });

    test('should handle null input and return defaultDuration', () => {
      expect(secondsToDuration(null as any)).toEqual(defaultDuration);
    });

    test('should handle empty string input and return defaultDuration', () => {
      expect(secondsToDuration('')).toEqual(defaultDuration);
    });

    test('should handle false input and return defaultDuration', () => {
      expect(secondsToDuration(false as any)).toEqual(defaultDuration);
    });

    test('should handle NaN input and return defaultDuration', () => {
      expect(secondsToDuration(NaN)).toEqual(defaultDuration);
    });
  });

  describe('Performance and stress testing', () => {
    test('should handle very large numbers efficiently', () => {
      expect(secondsToDuration(999999999)).toEqual({
        hours: '277777',
        mins: '46',
        secs: '39',
      });
    });

    test('should handle multiple consecutive calls consistently', () => {
      const input = 3661;
      const expected = {
        hours: '01',
        mins: '01',
        secs: '01',
      };

      expect(secondsToDuration(input)).toEqual(expected);
      expect(secondsToDuration(input)).toEqual(expected);
      expect(secondsToDuration(input)).toEqual(expected);
    });
  });

  describe('Integration with stringToNumber helper', () => {
    test('should work correctly with stringToNumber conversion', () => {
      // Test that the function properly uses stringToNumber internally
      expect(secondsToDuration('0')).toEqual(defaultDuration);

      expect(secondsToDuration('0.5')).toEqual({
        hours: '00',
        mins: '00',
        secs: '00',
      });

      expect(secondsToDuration('1.9')).toEqual({
        hours: '00',
        mins: '00',
        secs: '01',
      });
    });
  });
});
