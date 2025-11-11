import {DURATION} from '@components/DurationPickerModal';
import stringToNumber from './stringToNumber';

export default function durationToTimestamp({
  hours,
  mins,
  secs,
}: DURATION): string {
  const hr = stringToNumber(hours);
  const min = stringToNumber(mins);
  const sec = stringToNumber(secs);

  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hr,
    min,
    sec,
  ).toISOString();
}
