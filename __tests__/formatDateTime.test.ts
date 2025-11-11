// Mock react-native-localization
jest.mock('react-native-localization', () => {
  return jest.fn().mockImplementation(() => ({
    language: 'en',
    getInterfaceLanguage: () => 'en',
  }));
});

import {formatInTimeZone} from 'date-fns-tz';
import {format} from 'date-fns';
import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import {DEFAULT_TIME_ZONE} from '@utils/Constants';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';

// Mocking the getAuthValue function to return a specific time zone
jest.mock('@modules/AuthModule/Hooks/useAuthValue');
const mockGetAuthValue = getAuthValue as jest.Mock;

describe('formatDateTime', () => {
  const date = new Date('2024-09-25T14:30:00Z');
  const hospitalTimeZone = 'Asia/Dubai';

  beforeEach(() => {
    mockGetAuthValue.mockClear();
  });

  it('should return an empty string when no date is provided', () => {
    const result = formatDateTime();
    expect(result).toBe('');
  });

  it('should return an empty string when null date is provided', () => {
    const result = formatDateTime(null);
    expect(result).toBe('');
  });

  it('should format date using hospital time zone when FORMAT_DATE_TYPE.LOCAL is used', () => {
    mockGetAuthValue.mockReturnValue({hospitalTimeZone});

    const result = formatDateTime(
      date,
      FORMAT_DATE_TYPE.LOCAL,
      'yyyy-MM-dd HH:mm:ss',
    );
    const expected = formatInTimeZone(
      date,
      hospitalTimeZone,
      'yyyy-MM-dd HH:mm:ss',
    );

    expect(result).toBe(expected);
  });

  it('should format date using DEFAULT_TIME_ZONE when hospitalTimeZone is undefined and FORMAT_DATE_TYPE.LOCAL is used', () => {
    mockGetAuthValue.mockReturnValue({hospitalTimeZone: undefined});

    const result = formatDateTime(
      date,
      FORMAT_DATE_TYPE.LOCAL,
      'yyyy-MM-dd HH:mm:ss',
    );
    const expected = formatInTimeZone(
      date,
      DEFAULT_TIME_ZONE,
      'yyyy-MM-dd HH:mm:ss',
    );

    expect(result).toBe(expected);
  });

  it('should format date using UTC time zone when FORMAT_DATE_TYPE.UTC is used', () => {
    const result = formatDateTime(
      date,
      FORMAT_DATE_TYPE.UTC,
      'yyyy-MM-dd HH:mm:ss',
    );
    const expected = formatInTimeZone(date, 'UTC', 'yyyy-MM-dd HH:mm:ss');

    expect(result).toBe(expected);
  });

  it('should format date without time zone when FORMAT_DATE_TYPE.NONE is used', () => {
    const result = formatDateTime(
      date,
      FORMAT_DATE_TYPE.NONE,
      'yyyy-MM-dd HH:mm:ss',
    );
    const expected = format(date, 'yyyy-MM-dd HH:mm:ss');

    expect(result).toBe(expected);
  });

  it('should format date using custom IANA timezone string when provided', () => {
    const customTimeZone = 'America/New_York';
    const result = formatDateTime(date, customTimeZone, 'yyyy-MM-dd HH:mm:ss');
    const expected = formatInTimeZone(
      date,
      customTimeZone,
      'yyyy-MM-dd HH:mm:ss',
    );

    expect(result).toBe(expected);
  });

  it('should use the default format string when none is provided', () => {
    mockGetAuthValue.mockReturnValue({hospitalTimeZone});

    const result = formatDateTime(date);
    const expected = formatInTimeZone(date, hospitalTimeZone, 'HH:mm');

    expect(result).toBe(expected);
  });

  it('should use FORMAT_DATE_TYPE.LOCAL as default timezone when none is provided', () => {
    mockGetAuthValue.mockReturnValue({hospitalTimeZone});

    const result = formatDateTime(date, undefined, 'HH:mm');
    const expected = formatInTimeZone(date, hospitalTimeZone, 'HH:mm');

    expect(result).toBe(expected);
  });

  it('should handle invalid date gracefully and return empty string', () => {
    const invalidDate = new Date('invalid-date');
    const result = formatDateTime(invalidDate, FORMAT_DATE_TYPE.UTC);
    expect(result).toBe('');
  });
});
