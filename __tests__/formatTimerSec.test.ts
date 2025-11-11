import formatTimerSec from '@helpers/formatTimerSec';

describe('formatTimerSec', () => {
  // Basic formatting
  test('formats 0 seconds', () => {
    expect(formatTimerSec(0).formattedTime).toBe('00:00:00');
  });

  test('formats less than a minute', () => {
    expect(formatTimerSec(59).formattedTime).toBe('00:00:59');
  });

  test('formats exactly one minute', () => {
    expect(formatTimerSec(60).formattedTime).toBe('00:01:00');
  });

  test('formats exactly one hour', () => {
    expect(formatTimerSec(3600).formattedTime).toBe('01:00:00');
  });

  test('formats more than an hour', () => {
    expect(formatTimerSec(3661).formattedTime).toBe('01:01:01');
  });

  test('formats just before 24 hours', () => {
    expect(formatTimerSec(86399).formattedTime).toBe('23:59:59');
  });

  test('formats exactly 24 hours', () => {
    expect(formatTimerSec(86400).formattedTime).toBe('24:00:00');
  });

  test('formats more than 24 hours', () => {
    expect(formatTimerSec(90061).formattedTime).toBe('25:01:01');
  });

  // Negative values
  test('formats negative seconds', () => {
    expect(formatTimerSec(-1).formattedTime).toBe('- 00:00:01');
    expect(formatTimerSec(-3661).formattedTime).toBe('- 01:01:01');
  });

  // Short format
  test('short format with hours = 0', () => {
    expect(formatTimerSec(59, true).formattedTime).toBe('00:59');
  });

  test('short format with hours > 0', () => {
    expect(formatTimerSec(3661, true).formattedTime).toBe('01:01:01');
  });

  test('short format with negative and hours = 0', () => {
    expect(formatTimerSec(-59, true).formattedTime).toBe('- 00:59');
  });

  // Return object properties
  test('returns all properties correctly for positive', () => {
    const result = formatTimerSec(3661);
    expect(result.isNegative).toBe(false);
    expect(result.formattedHours).toBe('01');
    expect(result.formattedMinutes).toBe('01');
    expect(result.formattedSeconds).toBe('01');
  });

  test('returns all properties correctly for negative', () => {
    const result = formatTimerSec(-3661);
    expect(result.isNegative).toBe(true);
    expect(result.formattedHours).toBe('01');
    expect(result.formattedMinutes).toBe('01');
    expect(result.formattedSeconds).toBe('01');
  });

  // Edge cases
  test('defaults to 0 when no argument is passed', () => {
    expect(formatTimerSec().formattedTime).toBe('00:00:00');
  });

  test('handles large numbers', () => {
    expect(formatTimerSec(1000000).formattedTime).toBe('277:46:40');
  });

  test('handles floating point input', () => {
    expect(formatTimerSec(3661.9).formattedTime).toBe('01:01:01');
    expect(formatTimerSec(59.7).formattedTime).toBe('00:00:59');
    expect(formatTimerSec(3600.5).formattedTime).toBe('01:00:00');
    expect(formatTimerSec(3661.1).formattedTime).toBe('01:01:01');
  });
});
