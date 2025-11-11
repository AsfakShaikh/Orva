import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import {DEFAULT_TIME_ZONE} from '@utils/Constants';
import {toZonedTime} from 'date-fns-tz';

export default function convertToZonedTime(
  date?: Date | string | number | null,
) {
  try {
    const {hospitalTimeZone} = getAuthValue();
    let now;
    if (date && date !== null) {
      now = date;
    } else {
      now = new Date();
    }
    return toZonedTime(now, hospitalTimeZone ?? DEFAULT_TIME_ZONE);
  } catch (error) {
    return new Date();
  }
}
