import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import {DEFAULT_TIME_ZONE} from '@utils/Constants';
import {DATE_TYPE} from '@utils/Types';
import {format} from 'date-fns';
import {formatInTimeZone} from 'date-fns-tz';

export enum FORMAT_DATE_TYPE {
  NONE = 'NONE',
  UTC = 'UTC',
  LOCAL = 'LOCAL',
}

export default function formatDateTime(
  date?: DATE_TYPE | null,
  timeZone: FORMAT_DATE_TYPE | string = FORMAT_DATE_TYPE.LOCAL,
  formatStr: string = 'HH:mm',
) {
  try {
    if (!date) {
      return '';
    }
    if (timeZone === FORMAT_DATE_TYPE.LOCAL) {
      const {hospitalTimeZone} = getAuthValue();
      return formatInTimeZone(
        date,
        hospitalTimeZone ?? DEFAULT_TIME_ZONE,
        formatStr,
      );
    }
    if (timeZone === FORMAT_DATE_TYPE.UTC) {
      return formatInTimeZone(date, 'UTC', formatStr);
    }
    if (timeZone === FORMAT_DATE_TYPE.NONE) {
      return format(date, formatStr);
    }
    // If a specific IANA timezone string is provided, format using that timezone
    if (typeof timeZone === 'string') {
      return formatInTimeZone(date, timeZone, formatStr);
    }
  } catch (error) {
    console.log(error);
  }
  return '';
}
