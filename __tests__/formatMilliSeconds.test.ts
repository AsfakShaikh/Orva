import formatMilliSeconds from '@helpers/formatMilliSeconds';

describe('formatMilliSeconds', () => {
  // Basic formatting tests
  describe('basic formatting', () => {
    test('returns "0 seconds" for 0 milliseconds', () => {
      expect(formatMilliSeconds(0)).toBe('0 seconds');
    });

    test('returns "0 seconds" for null input', () => {
      expect(formatMilliSeconds(null)).toBe('0 seconds');
    });

    test('returns "0 seconds" for undefined input', () => {
      expect(formatMilliSeconds(undefined)).toBe('0 seconds');
    });

    test('formats seconds only when less than a minute', () => {
      expect(formatMilliSeconds(1000)).toBe('1 second');
      expect(formatMilliSeconds(30000)).toBe('30 seconds');
      expect(formatMilliSeconds(59000)).toBe('59 seconds');
    });

    test('formats minutes and seconds when less than an hour', () => {
      expect(formatMilliSeconds(60000)).toBe('1 minute');
      expect(formatMilliSeconds(90000)).toBe('1 minute 30 seconds');
      expect(formatMilliSeconds(120000)).toBe('2 minutes');
      expect(formatMilliSeconds(3540000)).toBe('59 minutes');
    });

    test('formats hours, minutes and seconds when more than an hour', () => {
      expect(formatMilliSeconds(3600000)).toBe('1 hour');
      expect(formatMilliSeconds(3660000)).toBe('1 hour 1 minute');
      expect(formatMilliSeconds(7320000)).toBe('2 hours 2 minutes');
      expect(formatMilliSeconds(7323000)).toBe('2 hours 2 minutes 3 seconds');
    });
  });

  // Short format tests
  describe('short format', () => {
    test('formats seconds only in short format when less than a minute', () => {
      expect(formatMilliSeconds(1000, true)).toBe('1 sec');
      expect(formatMilliSeconds(30000, true)).toBe('30 sec');
      expect(formatMilliSeconds(59000, true)).toBe('59 sec');
    });

    test('formats minutes and seconds in short format when less than an hour', () => {
      expect(formatMilliSeconds(60000, true)).toBe('1 min');
      expect(formatMilliSeconds(90000, true)).toBe('1 min 30 sec');
      expect(formatMilliSeconds(120000, true)).toBe('2 min');
      expect(formatMilliSeconds(3540000, true)).toBe('59 min');
    });

    test('formats hours, minutes and seconds in short format when more than an hour', () => {
      expect(formatMilliSeconds(3600000, true)).toBe('1 hr');
      expect(formatMilliSeconds(3660000, true)).toBe('1 hr 1 min');
      expect(formatMilliSeconds(7320000, true)).toBe('2 hr 2 min');
      expect(formatMilliSeconds(7323000, true)).toBe('2 hr 2 min 3 sec');
    });
  });

  // Edge cases
  describe('edge cases', () => {
    test('handles very small millisecond values', () => {
      expect(formatMilliSeconds(1)).toBe('');
      expect(formatMilliSeconds(999)).toBe('');
    });

    test('handles large millisecond values', () => {
      expect(formatMilliSeconds(86400000)).toBe('1 day');
      expect(formatMilliSeconds(90000000)).toBe('1 day 1 hour');
    });

    test('handles fractional millisecond values', () => {
      expect(formatMilliSeconds(1000.5)).toBe('1 second');
      expect(formatMilliSeconds(60000.7)).toBe('1 minute');
    });
  });

  // Boundary tests
  describe('boundary tests', () => {
    test('boundary between seconds and minutes', () => {
      expect(formatMilliSeconds(59999)).toBe('59 seconds');
      expect(formatMilliSeconds(60000)).toBe('1 minute');
      expect(formatMilliSeconds(60001)).toBe('1 minute');
    });

    test('boundary between minutes and hours', () => {
      expect(formatMilliSeconds(3599999)).toBe('59 minutes 59 seconds');
      expect(formatMilliSeconds(3600000)).toBe('1 hour');
      expect(formatMilliSeconds(3600001)).toBe('1 hour');
    });
  });

  // Comparison with long format
  describe('format comparison', () => {
    test('short format vs long format for same duration', () => {
      const duration = 7323000; // 2 hours 2 minutes 3 seconds
      expect(formatMilliSeconds(duration, false)).toBe(
        '2 hours 2 minutes 3 seconds',
      );
      expect(formatMilliSeconds(duration, true)).toBe('2 hr 2 min 3 sec');
    });

    test('short format vs long format for seconds only', () => {
      const duration = 30000; // 30 seconds
      expect(formatMilliSeconds(duration, false)).toBe('30 seconds');
      expect(formatMilliSeconds(duration, true)).toBe('30 sec');
    });

    test('short format vs long format for minutes only', () => {
      const duration = 120000; // 2 minutes
      expect(formatMilliSeconds(duration, false)).toBe('2 minutes');
      expect(formatMilliSeconds(duration, true)).toBe('2 min');
    });
  });

  // Real-world duration examples
  describe('real-world examples', () => {
    test('surgical procedure durations', () => {
      // 15 minutes
      expect(formatMilliSeconds(900000)).toBe('15 minutes');
      expect(formatMilliSeconds(900000, true)).toBe('15 min');

      // 2 hours 30 minutes
      expect(formatMilliSeconds(9000000)).toBe('2 hours 30 minutes');
      expect(formatMilliSeconds(9000000, true)).toBe('2 hr 30 min');
    });

    test('medical timing scenarios', () => {
      // 5 seconds (quick procedure)
      expect(formatMilliSeconds(5000)).toBe('5 seconds');
      expect(formatMilliSeconds(5000, true)).toBe('5 sec');

      // 45 minutes (medium procedure)
      expect(formatMilliSeconds(2700000)).toBe('45 minutes');
      expect(formatMilliSeconds(2700000, true)).toBe('45 min');
    });
  });

  // Error handling
  describe('error handling', () => {
    test('handles negative values gracefully', () => {
      expect(formatMilliSeconds(-1000)).toBe('-1 seconds');
      expect(formatMilliSeconds(-60000)).toBe('-1 minutes');
    });

    test('handles extremely large values', () => {
      const largeValue = Number.MAX_SAFE_INTEGER;
      expect(() => formatMilliSeconds(largeValue)).not.toThrow();
    });
  });
});
