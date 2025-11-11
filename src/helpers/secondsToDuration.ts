import {DURATION} from '@components/DurationPickerModal';
import {defaultDuration} from '@utils/Constants';
import stringToNumber from './stringToNumber';

export default function secondsToDuration(seconds?: number | string): DURATION {
  if (seconds) {
    const totalSeconds = stringToNumber(seconds);
    if (totalSeconds <= 0) {
      return defaultDuration;
    }
    return {
      hours: Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, '0'),
      mins: Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0'),
      secs: Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, '0'),
    };
  }
  return defaultDuration;
}
