import durationToSeconds from '@helpers/durationToSeconds';

describe('durationToSeconds', () => {
  test('should convert hours, minutes, and seconds to total seconds', () => {
    expect(durationToSeconds({hours: 1, mins: 30, secs: 45})).toBe('5445');
    expect(durationToSeconds({hours: 2, mins: 15, secs: 30})).toBe('8130');
    expect(durationToSeconds({hours: 0, mins: 5, secs: 10})).toBe('310');
  });

  test('should handle only hours', () => {
    expect(durationToSeconds({hours: 1, mins: 0, secs: 0})).toBe('3600');
    expect(durationToSeconds({hours: 2, mins: 0, secs: 0})).toBe('7200');
    expect(durationToSeconds({hours: 24, mins: 0, secs: 0})).toBe('86400');
  });

  test('should handle only minutes', () => {
    expect(durationToSeconds({hours: 0, mins: 1, secs: 0})).toBe('60');
    expect(durationToSeconds({hours: 0, mins: 30, secs: 0})).toBe('1800');
    expect(durationToSeconds({hours: 0, mins: 59, secs: 0})).toBe('3540');
  });

  test('should handle only seconds', () => {
    expect(durationToSeconds({hours: 0, mins: 0, secs: 30})).toBe('30');
    expect(durationToSeconds({hours: 0, mins: 0, secs: 59})).toBe('59');
    expect(durationToSeconds({hours: 0, mins: 0, secs: 1})).toBe('1');
  });

  test('should handle string inputs by converting them to numbers', () => {
    expect(durationToSeconds({hours: '1', mins: '30', secs: '45'})).toBe(
      '5445',
    );
    expect(durationToSeconds({hours: '2', mins: '15', secs: '30'})).toBe(
      '8130',
    );
    expect(durationToSeconds({hours: '0', mins: '5', secs: '10'})).toBe('310');
  });

  test('should handle zero values', () => {
    expect(durationToSeconds({hours: 0, mins: 0, secs: 0})).toBe('');
    expect(durationToSeconds({hours: '0', mins: '0', secs: '0'})).toBe('');
  });

  test('should handle mixed zero and non-zero values', () => {
    expect(durationToSeconds({hours: 1, mins: 0, secs: 0})).toBe('3600');
    expect(durationToSeconds({hours: 0, mins: 30, secs: 0})).toBe('1800');
    expect(durationToSeconds({hours: 0, mins: 0, secs: 45})).toBe('45');
    expect(durationToSeconds({hours: 1, mins: 0, secs: 30})).toBe('3630');
    expect(durationToSeconds({hours: 0, mins: 30, secs: 45})).toBe('1845');
  });

  test('should handle large values', () => {
    expect(durationToSeconds({hours: 23, mins: 59, secs: 59})).toBe('86399');
    expect(durationToSeconds({hours: 24, mins: 0, secs: 0})).toBe('86400');
    expect(durationToSeconds({hours: 100, mins: 0, secs: 0})).toBe('360000');
    expect(durationToSeconds({hours: 999, mins: 59, secs: 59})).toBe('3599999');
  });

  test('should handle decimal values correctly', () => {
    expect(durationToSeconds({hours: 1.5, mins: 30.7, secs: 45.9})).toBe(
      '7287.9',
    );
    expect(durationToSeconds({hours: 2.9, mins: 15.2, secs: 30.8})).toBe(
      '11382.8',
    );
    expect(durationToSeconds({hours: 0.5, mins: 0, secs: 0})).toBe('1800');
    expect(durationToSeconds({hours: 0, mins: 0.5, secs: 0})).toBe('30');
  });

  test('should handle empty string and falsy values', () => {
    expect(durationToSeconds({hours: '', mins: 30, secs: 45})).toBe('1845');
    expect(durationToSeconds({hours: 1, mins: '', secs: 45})).toBe('3645');
    expect(durationToSeconds({hours: 1, mins: 30, secs: ''})).toBe('5400');
    expect(durationToSeconds({hours: '', mins: '', secs: ''})).toBe('');
    expect(durationToSeconds({hours: 0, mins: 30, secs: 45})).toBe('1845');
    expect(durationToSeconds({hours: 1, mins: 0, secs: 45})).toBe('3645');
    expect(durationToSeconds({hours: 1, mins: 30, secs: 0})).toBe('5400');
  });

  test('should handle invalid string inputs', () => {
    expect(durationToSeconds({hours: 'abc', mins: 30, secs: 45})).toBe('1845');
    expect(durationToSeconds({hours: 1, mins: 'xyz', secs: 45})).toBe('3645');
    expect(durationToSeconds({hours: 1, mins: 30, secs: 'invalid'})).toBe(
      '5400',
    );
    expect(
      durationToSeconds({hours: 'abc', mins: 'xyz', secs: 'invalid'}),
    ).toBe('');
  });

  test('should handle negative values', () => {
    expect(durationToSeconds({hours: -1, mins: 30, secs: 45})).toBe('-1755');
    expect(durationToSeconds({hours: 1, mins: -30, secs: 45})).toBe('1845');
    expect(durationToSeconds({hours: 1, mins: 30, secs: -45})).toBe('5355');
    expect(durationToSeconds({hours: -1, mins: -30, secs: -45})).toBe('-5445');
  });

  test('should handle edge cases with very small values', () => {
    expect(durationToSeconds({hours: 0.001, mins: 0, secs: 0})).toBe('3.6');
    expect(durationToSeconds({hours: 0, mins: 0.001, secs: 0})).toBe('0.06');
    expect(durationToSeconds({hours: 0, mins: 0, secs: 0.001})).toBe('0.001');
  });

  test('should handle mixed data types', () => {
    expect(durationToSeconds({hours: 1, mins: '30', secs: 45})).toBe('5445');
    expect(durationToSeconds({hours: '2', mins: 15, secs: '30'})).toBe('8130');
    expect(durationToSeconds({hours: 0, mins: '5', secs: 10})).toBe('310');
  });

  test('should handle boundary values', () => {
    expect(durationToSeconds({hours: 0, mins: 59, secs: 59})).toBe('3599');
    expect(durationToSeconds({hours: 1, mins: 0, secs: 0})).toBe('3600');
    expect(durationToSeconds({hours: 0, mins: 0, secs: 0})).toBe('');
    expect(durationToSeconds({hours: 1, mins: 1, secs: 1})).toBe('3661');
  });
});
