import {DURATION} from '@components/DurationPickerModal';
import {defaultDuration} from '@utils/Constants';
import secondsToDuration from './secondsToDuration';

export default function timestampToDuration(
  timestamp?: Date | string | null,
): DURATION {
  if (timestamp) {
    const totalSeconds = new Date(timestamp).getTime() / 1000;
    return secondsToDuration(totalSeconds);
  }
  return defaultDuration;
}
