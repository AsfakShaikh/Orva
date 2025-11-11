import durationToTimestamp from '../src/helpers/durationToTimestamp';

describe('durationToTimestamp', () => {
  describe('Basic functionality', () => {
    it('should convert duration with all values to timestamp', () => {
      const duration = {
        hours: '2',
        mins: '30',
        secs: '45',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(2);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });

    it('should convert duration with zero values to timestamp', () => {
      const duration = {
        hours: '0',
        mins: '0',
        secs: '0',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should convert duration with single digit values to timestamp', () => {
      const duration = {
        hours: '1',
        mins: '5',
        secs: '9',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(1);
      expect(result.getMinutes()).toBe(5);
      expect(result.getSeconds()).toBe(9);
    });

    it('should convert duration with large hour values to timestamp', () => {
      const duration = {
        hours: '23',
        mins: '59',
        secs: '59',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });

    it('should handle string numbers correctly', () => {
      const duration = {
        hours: '12',
        mins: '34',
        secs: '56',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(34);
      expect(result.getSeconds()).toBe(56);
    });
  });

  describe('Edge cases with empty and null values', () => {
    it('should handle empty string values by converting to 0', () => {
      const duration = {
        hours: '',
        mins: '',
        secs: '',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle mixed empty and non-empty values', () => {
      const duration = {
        hours: '5',
        mins: '',
        secs: '30',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(5);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(30);
    });

    it('should handle undefined values by converting to 0', () => {
      const duration = {
        hours: undefined as any,
        mins: undefined as any,
        secs: undefined as any,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle null values by converting to 0', () => {
      const duration = {
        hours: null as any,
        mins: null as any,
        secs: null as any,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle mixed undefined and defined values', () => {
      const duration = {
        hours: 10,
        mins: undefined as any,
        secs: '45',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(10);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(45);
    });
  });

  describe('Number type inputs', () => {
    it('should handle number type inputs correctly', () => {
      const duration = {
        hours: 15,
        mins: 30,
        secs: 45,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(15);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });

    it('should handle zero number values', () => {
      const duration = {
        hours: 0,
        mins: 0,
        secs: 0,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle mixed string and number inputs', () => {
      const duration = {
        hours: '8',
        mins: 15,
        secs: '30',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(8);
      expect(result.getMinutes()).toBe(15);
      expect(result.getSeconds()).toBe(30);
    });
  });

  describe('Decimal and floating point values', () => {
    it('should handle decimal string values by truncating', () => {
      const duration = {
        hours: '2.5',
        mins: '30.7',
        secs: '45.9',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(2);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });

    it('should handle decimal number values by truncating', () => {
      const duration = {
        hours: 3.7,
        mins: 25.3,
        secs: 40.8,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(3);
      expect(result.getMinutes()).toBe(25);
      expect(result.getSeconds()).toBe(40);
    });

    it('should handle very small decimal values', () => {
      const duration = {
        hours: 0.1,
        mins: 0.5,
        secs: 0.9,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('Invalid input handling', () => {
    it('should handle invalid string values by converting to 0', () => {
      const duration = {
        hours: 'invalid',
        mins: 'abc',
        secs: 'xyz',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle mixed valid and invalid values', () => {
      const duration = {
        hours: '10',
        mins: 'invalid',
        secs: '30',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(10);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(30);
    });

    it('should handle special characters in strings', () => {
      const duration = {
        hours: '12@#$',
        mins: '30%^&',
        secs: '45*()',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('Boundary values and overflow', () => {
    it('should handle very large hour values with overflow', () => {
      const duration = {
        hours: '999',
        mins: '59',
        secs: '59',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      // Large values overflow: 999 hours = 15 hours (999 % 24 = 15)
      expect(result.getHours()).toBe(15);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });

    it('should handle very large minute values with overflow', () => {
      const duration = {
        hours: '0',
        mins: '999',
        secs: '0',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      // Large values overflow: 999 minutes = 16 hours and 39 minutes
      expect(result.getHours()).toBe(16);
      expect(result.getMinutes()).toBe(39);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle very large second values with overflow', () => {
      const duration = {
        hours: '0',
        mins: '0',
        secs: '999',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      // Large values overflow: 999 seconds = 16 minutes and 39 seconds
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(16);
      expect(result.getSeconds()).toBe(39);
    });

    it('should handle negative string values with wrapping', () => {
      const duration = {
        hours: '-1',
        mins: '-5',
        secs: '-10',
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      // Negative values wrap around: -1 hour = 22 hours, -5 minutes = 54 minutes, -10 seconds = 50 seconds
      expect(result.getHours()).toBe(22);
      expect(result.getMinutes()).toBe(54);
      expect(result.getSeconds()).toBe(50);
    });

    it('should handle negative number values with wrapping', () => {
      const duration = {
        hours: -5,
        mins: -10,
        secs: -15,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      // Negative values wrap around: -5 hours = 18 hours, -10 minutes = 49 minutes, -15 seconds = 45 seconds
      expect(result.getHours()).toBe(18);
      expect(result.getMinutes()).toBe(49);
      expect(result.getSeconds()).toBe(45);
    });
  });

  describe('Date object properties', () => {
    it('should set date to today with specified time', () => {
      const duration = {
        hours: '15',
        mins: '30',
        secs: '45',
      };

      const result = durationToTimestamp(duration);
      const today = new Date();

      expect(result.getFullYear()).toBe(today.getFullYear());
      expect(result.getMonth()).toBe(today.getMonth());
      expect(result.getDate()).toBe(today.getDate());
      expect(result.getHours()).toBe(15);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });

    it('should set date to today with zero time', () => {
      const duration = {
        hours: '0',
        mins: '0',
        secs: '0',
      };

      const result = durationToTimestamp(duration);
      const today = new Date();

      expect(result.getFullYear()).toBe(today.getFullYear());
      expect(result.getMonth()).toBe(today.getMonth());
      expect(result.getDate()).toBe(today.getDate());
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should set milliseconds to 0', () => {
      const duration = {
        hours: '12',
        mins: '30',
        secs: '45',
      };

      const result = durationToTimestamp(duration);

      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('Object behavior', () => {
    it('should return a new Date object each time', () => {
      const duration = {
        hours: '1',
        mins: '30',
        secs: '45',
      };

      const result1 = durationToTimestamp(duration);
      const result2 = durationToTimestamp(duration);

      expect(result1).not.toBe(result2);
      expect(result1.getTime()).toBe(result2.getTime());
    });

    it('should not mutate the input object', () => {
      const duration = {
        hours: '10',
        mins: '20',
        secs: '30',
      };

      const originalDuration = {...duration};
      durationToTimestamp(duration);

      expect(duration).toEqual(originalDuration);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical work hours', () => {
      const duration = {
        hours: '8',
        mins: '30',
        secs: '0',
      };

      const result = durationToTimestamp(duration);

      expect(result.getHours()).toBe(8);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle lunch break duration', () => {
      const duration = {
        hours: '0',
        mins: '45',
        secs: '0',
      };

      const result = durationToTimestamp(duration);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(45);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle short meeting duration', () => {
      const duration = {
        hours: '0',
        mins: '15',
        secs: '30',
      };

      const result = durationToTimestamp(duration);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(15);
      expect(result.getSeconds()).toBe(30);
    });

    it('should handle overnight duration', () => {
      const duration = {
        hours: '12',
        mins: '0',
        secs: '0',
      };

      const result = durationToTimestamp(duration);

      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('Type safety and edge cases', () => {
    it('should handle boolean values by converting to numbers', () => {
      const duration = {
        hours: true as any,
        mins: false as any,
        secs: true as any,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      // Boolean true converts to 1, false to 0
      expect(result.getHours()).toBe(1);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(1);
    });

    it('should handle object values by converting to 0', () => {
      const duration = {
        hours: {} as any,
        mins: [] as any,
        secs: {key: 'value'} as any,
      };

      const result = durationToTimestamp(duration);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle function values by converting to 0', () => {
      const duration = {
        hours: (() => {}) as any,
        mins: function () {} as any,
        secs: () => 'test' as any,
      };

      const result = durationToTimestamp(duration as any);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });
});
