import {DURATION} from '@components/DurationPickerModal';
import stringToNumber from './stringToNumber';

export default function durationToSeconds({
  hours,
  mins,
  secs,
}: DURATION): string {
  const hr = stringToNumber(hours);
  const min = stringToNumber(mins);
  const sec = stringToNumber(secs);
  let secVal = '';

  if (hr || min || sec) {
    secVal = (hr * 3600 + min * 60 + Number(sec)).toString();
  }

  return secVal;
}
